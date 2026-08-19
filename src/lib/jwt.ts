import { SignJWT, jwtVerify, CompactEncrypt, compactDecrypt } from 'jose';

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length === 0) {
    throw new Error('A variável de ambiente JWT_SECRET não está configurada');
  }
  return secret;
};

// --- Autenticação Local (Assinatura) ---

export const signJwt = async (payload: { username: string; name: string }) => {
  const secret = new TextEncoder().encode(getJwtSecretKey());
  const alg = 'HS256';

  return new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(secret);
};

export const verifyJwt = async (token: string) => {
  try {
    const secret = new TextEncoder().encode(getJwtSecretKey());
    const { payload } = await jwtVerify(token, secret);
    return payload as { username: string; name: string; exp: number };
  } catch (_error) {
    return null;
  }
};

// --- Sessão do MikroTik (Criptografia Forte) ---

export const encryptData = async (payload: object) => {
  const secretStr = getJwtSecretKey();
  // JWE with A256GCM requires exactly 32 bytes key
  const secretKey = new TextEncoder().encode(secretStr.padEnd(32, '0').slice(0, 32));
  
  const text = JSON.stringify(payload);
  const jwe = await new CompactEncrypt(new TextEncoder().encode(text))
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .encrypt(secretKey);
    
  return jwe;
};

export const decryptData = async (jwe: string) => {
  try {
    const secretStr = getJwtSecretKey();
    const secretKey = new TextEncoder().encode(secretStr.padEnd(32, '0').slice(0, 32));
    
    const { plaintext } = await compactDecrypt(jwe, secretKey);
    const text = new TextDecoder().decode(plaintext);
    return JSON.parse(text);
  } catch (_error) {
    return null;
  }
};
