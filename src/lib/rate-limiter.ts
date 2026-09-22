interface RateLimitRecord {
  attempts: number;
  firstAttempt: number;
  blockedUntil: number;
}

export class AuthRateLimiter {
  private attemptsMap: Map<string, RateLimitRecord> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;
  private readonly lockoutMs: number;

  constructor(maxAttempts = 5, windowMinutes = 15, lockoutMinutes = 15) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMinutes * 60 * 1000;
    this.lockoutMs = lockoutMinutes * 60 * 1000;

    // Limpeza periódica em segundo plano para prevenir vazamento de memória
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanup(), 10 * 60 * 1000).unref?.();
    }
  }

  /**
   * Valida sintaxe de endereço IPv4 ou IPv6 simples
   */
  private isValidIp(ip: string): boolean {
    if (!ip || ip.length > 45) return false;
    const ipv4Regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    const ipv6Regex = /^[a-fA-F0-9:]+$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  /**
   * Obtém o IP real do cliente priorizando cabeçalhos confiáveis de proxy reverso
   * e sanitizando contra header injection.
   */
  public getClientIp(request: Request): string {
    // 1. Cloudflare Connecting IP (confiável quando na borda CF)
    const cfIp = request.headers.get('cf-connecting-ip');
    if (cfIp) {
      const clean = cfIp.trim();
      if (this.isValidIp(clean)) return clean;
    }

    // 2. Traefik / Nginx Real IP
    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
      const clean = realIp.trim();
      if (this.isValidIp(clean)) return clean;
    }

    // 3. X-Forwarded-For (pega o primeiro IP válido da cadeia)
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
      const parts = forwarded.split(',').map((s) => s.trim());
      for (const part of parts) {
        if (this.isValidIp(part)) {
          return part;
        }
      }
    }

    return '127.0.0.1';
  }

  /**
   * Verifica se um identificador simples está bloqueado.
   */
  public check(identifier: string): {
    allowed: boolean;
    remainingAttempts: number;
    retryAfterSeconds: number;
  } {
    const now = Date.now();
    const record = this.attemptsMap.get(identifier);

    if (!record) {
      return {
        allowed: true,
        remainingAttempts: this.maxAttempts,
        retryAfterSeconds: 0,
      };
    }

    // Se estiver em período de bloqueio ativo
    if (record.blockedUntil > now) {
      const retryAfterSeconds = Math.ceil((record.blockedUntil - now) / 1000);
      return {
        allowed: false,
        remainingAttempts: 0,
        retryAfterSeconds,
      };
    }

    // Se a janela de tempo expirou, reseta o histórico
    if (now - record.firstAttempt > this.windowMs) {
      this.attemptsMap.delete(identifier);
      return {
        allowed: true,
        remainingAttempts: this.maxAttempts,
        retryAfterSeconds: 0,
      };
    }

    const remaining = Math.max(0, this.maxAttempts - record.attempts);
    return {
      allowed: remaining > 0,
      remainingAttempts: remaining,
      retryAfterSeconds: 0,
    };
  }

  /**
   * Verifica rate limit composto (IP e IP:Usuário) para barrar tanto
   * força bruta direta quanto password spraying contra contas específicas.
   */
  public checkCompound(
    ip: string,
    account?: string
  ): {
    allowed: boolean;
    remainingAttempts: number;
    retryAfterSeconds: number;
  } {
    const ipStatus = this.check(ip);
    if (!ipStatus.allowed) return ipStatus;

    if (account) {
      const accountKey = `acc:${account.toLowerCase().trim()}`;
      const accountStatus = this.check(accountKey);
      if (!accountStatus.allowed) return accountStatus;

      return {
        allowed: true,
        remainingAttempts: Math.min(ipStatus.remainingAttempts, accountStatus.remainingAttempts),
        retryAfterSeconds: 0,
      };
    }

    return ipStatus;
  }

  /**
   * Registra falha para IP e opcionalmente para conta.
   */
  public recordFailure(
    identifier: string,
    account?: string
  ): {
    blocked: boolean;
    remainingAttempts: number;
    retryAfterSeconds: number;
  } {
    const res = this.recordSingleFailure(identifier);

    if (account) {
      const accountKey = `acc:${account.toLowerCase().trim()}`;
      const accRes = this.recordSingleFailure(accountKey);
      if (accRes.blocked) return accRes;
    }

    return res;
  }

  private recordSingleFailure(identifier: string): {
    blocked: boolean;
    remainingAttempts: number;
    retryAfterSeconds: number;
  } {
    const now = Date.now();
    let record = this.attemptsMap.get(identifier);

    if (!record || now - record.firstAttempt > this.windowMs) {
      record = {
        attempts: 1,
        firstAttempt: now,
        blockedUntil: 0,
      };
      this.attemptsMap.set(identifier, record);
    } else {
      record.attempts += 1;
    }

    if (record.attempts >= this.maxAttempts) {
      record.blockedUntil = now + this.lockoutMs;
      const retryAfterSeconds = Math.ceil(this.lockoutMs / 1000);
      return {
        blocked: true,
        remainingAttempts: 0,
        retryAfterSeconds,
      };
    }

    return {
      blocked: false,
      remainingAttempts: this.maxAttempts - record.attempts,
      retryAfterSeconds: 0,
    };
  }

  /**
   * Reseta o histórico em caso de sucesso no login
   */
  public recordSuccess(identifier: string, account?: string): void {
    this.attemptsMap.delete(identifier);
    if (account) {
      this.attemptsMap.delete(`acc:${account.toLowerCase().trim()}`);
    }
  }

  /**
   * Coleta registros expirados
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.attemptsMap.entries()) {
      if (record.blockedUntil <= now && now - record.firstAttempt > this.windowMs) {
        this.attemptsMap.delete(key);
      }
    }
  }
}

// 1. Rate Limiter para Login Administrativo (5 tentativas, janela de 15m, lockout de 15m)
export const loginRateLimiter = new AuthRateLimiter(5, 15, 15);

// 2. Rate Limiter para Portal de Clientes (10 tentativas, janela de 10m, lockout de 10m)
export const customerRateLimiter = new AuthRateLimiter(10, 10, 10);

// 3. Rate Limiter para Conexão de Roteador MikroTik (5 tentativas, janela de 10m, lockout de 10m)
export const connectRateLimiter = new AuthRateLimiter(5, 10, 10);

