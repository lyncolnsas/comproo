interface RateLimitRecord {
  attempts: number;
  firstAttempt: number;
  blockedUntil: number;
}

class AuthRateLimiter {
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
   * Obtém o IP do cliente a partir dos cabeçalhos da requisição
   */
  public getClientIp(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
      const first = forwarded.split(',')[0].trim();
      if (first) return first;
    }
    const realIp = request.headers.get('x-real-ip');
    if (realIp) return realIp.trim();

    const cfIp = request.headers.get('cf-connecting-ip');
    if (cfIp) return cfIp.trim();

    return '127.0.0.1';
  }

  /**
   * Verifica se o identificador (IP ou usuário) está bloqueado por limite de taxa.
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

    // Se a janela de tempo expirou, reseta o histórico do IP
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
   * Registra uma falha de autenticação. Bloqueia se atingir o limite.
   */
  public recordFailure(identifier: string): {
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
  public recordSuccess(identifier: string): void {
    this.attemptsMap.delete(identifier);
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

// Instância singleton para proteção global de autenticação
export const loginRateLimiter = new AuthRateLimiter(5, 15, 15);
