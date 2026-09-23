import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/auth-crypto';

export interface GeneratedEmergencyTokens {
  tokens: string[]; // Códigos em texto puro exibidos uma única vez
  count: number;
}

/**
 * Gera um lote de N tokens de emergência (ex: 8 tokens),
 * salva os hashes no banco e invalida tokens não utilizados anteriores (opcional).
 */
export async function generateEmergencyTokens(count: number = 8): Promise<string[]> {
  // Limpa tokens antigos não utilizados para não acumular
  await prisma.emergencyToken.deleteMany({
    where: { used: false }
  });

  const rawTokens: string[] = [];

  for (let i = 0; i < count; i++) {
    // Formato amigável: EMG-XXXX-XXXX (ex: EMG-7K9A-4B2E)
    const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const token = `EMG-${part1}-${part2}`;
    rawTokens.push(token);

    const codeHash = hashPassword(token);
    const tokenHint = `${token.slice(0, 7)}***${token.slice(-2)}`;

    await prisma.emergencyToken.create({
      data: {
        codeHash,
        tokenHint,
        used: false,
      }
    });
  }

  return rawTokens;
}

/**
 * Valida e consome um token de emergência.
 * Como o token foi salvo com scrypt, precisamos testar contra os tokens ativos (used = false).
 * Como são poucos tokens (geralmente <= 8), o custo computacional é mínimo e seguro.
 */
export async function validateAndConsumeEmergencyToken(
  providedToken: string,
  clientIp?: string
): Promise<{ valid: boolean; reason?: 'invalid' | 'already_used' }> {
  const cleanToken = providedToken.trim().toUpperCase();

  const activeTokens = await prisma.emergencyToken.findMany({
    where: { used: false }
  });

  if (activeTokens.length === 0) {
    return { valid: false, reason: 'invalid' };
  }

  for (const record of activeTokens) {
    const { isValid } = verifyPassword(cleanToken, record.codeHash);
    if (isValid) {
      // Consome o token imediatamente (uso único)
      await prisma.emergencyToken.update({
        where: { id: record.id },
        data: {
          used: true,
          usedAt: new Date(),
          clientIp: clientIp || null,
        }
      });
      return { valid: true };
    }
  }

  return { valid: false, reason: 'invalid' };
}

/**
 * Retorna o status atual dos tokens de emergência (quantos restam disponíveis).
 */
export async function getEmergencyTokenStatus(): Promise<{ available: number; used: number }> {
  const available = await prisma.emergencyToken.count({ where: { used: false } });
  const used = await prisma.emergencyToken.count({ where: { used: true } });
  return { available, used };
}
