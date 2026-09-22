import crypto from 'crypto';

/**
 * Formato do hash armazenado:
 * scrypt$<salt_hex>$<hash_hex>
 */
const SCRYPT_PREFIX = 'scrypt$';
const KEY_LEN = 64;

// Hash fixo pré-gerado para execução constante quando o usuário não existir no banco
const DUMMY_SALT = '0123456789abcdef0123456789abcdef';
const DUMMY_HASH = crypto.scryptSync('dummy_password_constant_timing', DUMMY_SALT, KEY_LEN);

/**
 * Gera um hash criptográfico seguro com scrypt e salt aleatório de 16 bytes.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, KEY_LEN);
  return `${SCRYPT_PREFIX}${salt}$${derivedKey.toString('hex')}`;
}

/**
 * Executa uma verificação simulada com scryptSync para consumir o mesmo tempo de CPU
 * quando um usuário não existir no banco, prevenindo enumeração por timing attack (CWE-208 / CWE-204).
 */
export function dummyVerifyPassword(providedPassword: string): void {
  try {
    const derivedKey = crypto.scryptSync(providedPassword || 'dummy', DUMMY_SALT, KEY_LEN);
    crypto.timingSafeEqual(derivedKey, DUMMY_HASH);
  } catch {
    // Propositalmente ignorado para manter tempo uniforme
  }
}

/**
 * Compara duas strings em tempo constante para mitigar timing attacks.
 */
export function timingSafeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');

  if (bufA.length !== bufB.length) {
    // Executa comparação dummy com mesmo buffer para manter tempo constante
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Compara a senha fornecida com o registro no banco em tempo constante.
 * Suporta hashes scrypt modernos e senhas legadas em texto plano com flag para migração.
 */
export function verifyPassword(
  providedPassword: string,
  storedPasswordHash: string
): { isValid: boolean; needsUpgrade: boolean } {
  if (!providedPassword || !storedPasswordHash) {
    dummyVerifyPassword(providedPassword);
    return { isValid: false, needsUpgrade: false };
  }

  // Verifica se a senha armazenada está no formato scrypt
  if (storedPasswordHash.startsWith(SCRYPT_PREFIX)) {
    const parts = storedPasswordHash.split('$');
    if (parts.length !== 3) {
      dummyVerifyPassword(providedPassword);
      return { isValid: false, needsUpgrade: false };
    }

    const salt = parts[1];
    const originalHashHex = parts[2];

    try {
      const derivedKey = crypto.scryptSync(providedPassword, salt, KEY_LEN);
      const originalBuffer = Buffer.from(originalHashHex, 'hex');

      if (derivedKey.length !== originalBuffer.length) {
        crypto.timingSafeEqual(derivedKey, derivedKey);
        return { isValid: false, needsUpgrade: false };
      }

      // Comparação em tempo constante para prevenir timing attacks (CWE-208)
      const isValid = crypto.timingSafeEqual(derivedKey, originalBuffer);
      return { isValid, needsUpgrade: false };
    } catch (err) {
      console.error('[AUTH CRYPTO ERROR] Falha ao verificar hash scrypt:', err);
      return { isValid: false, needsUpgrade: false };
    }
  }

  // Tratamento de senha legada em texto puro (migração suave)
  // Compara em tempo constante gerando buffers de mesmo tamanho
  try {
    const isValid = timingSafeCompare(providedPassword, storedPasswordHash);
    return {
      isValid,
      needsUpgrade: isValid, // Se válida, sinaliza para salvar o hash scrypt no banco
    };
  } catch (err) {
    console.error('[AUTH CRYPTO ERROR] Falha ao verificar senha legada:', err);
    return { isValid: false, needsUpgrade: false };
  }
}

