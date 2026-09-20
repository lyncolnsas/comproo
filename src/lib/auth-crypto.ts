import crypto from 'crypto';

/**
 * Formato do hash armazenado:
 * scrypt$<salt_hex>$<hash_hex>
 */
const SCRYPT_PREFIX = 'scrypt$';
const KEY_LEN = 64;

/**
 * Gera um hash criptográfico seguro com scrypt e salt aleatório de 16 bytes.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, KEY_LEN);
  return `${SCRYPT_PREFIX}${salt}$${derivedKey.toString('hex')}`;
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
    return { isValid: false, needsUpgrade: false };
  }

  // Verifica se a senha armazenada está no formato scrypt
  if (storedPasswordHash.startsWith(SCRYPT_PREFIX)) {
    const parts = storedPasswordHash.split('$');
    if (parts.length !== 3) {
      return { isValid: false, needsUpgrade: false };
    }

    const salt = parts[1];
    const originalHashHex = parts[2];

    try {
      const derivedKey = crypto.scryptSync(providedPassword, salt, KEY_LEN);
      const originalBuffer = Buffer.from(originalHashHex, 'hex');

      if (derivedKey.length !== originalBuffer.length) {
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
    const providedBuffer = Buffer.from(providedPassword, 'utf8');
    const storedBuffer = Buffer.from(storedPasswordHash, 'utf8');

    let isValid = false;
    if (providedBuffer.length === storedBuffer.length) {
      isValid = crypto.timingSafeEqual(providedBuffer, storedBuffer);
    } else {
      // Dummy check para manter o tempo constante
      crypto.timingSafeEqual(providedBuffer, providedBuffer);
    }

    return {
      isValid,
      needsUpgrade: isValid, // Se válida, sinaliza para salvar o hash scrypt no banco
    };
  } catch (err) {
    console.error('[AUTH CRYPTO ERROR] Falha ao verificar senha legada:', err);
    return { isValid: false, needsUpgrade: false };
  }
}
