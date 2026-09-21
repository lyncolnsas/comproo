import { prisma } from './prisma';
import { getPublicDomain } from './domain';

/**
 * Normaliza o nome do roteador em um slug DNS RFC 1123 válido:
 * - Remove acentos (ex: "roça" -> "roca", "São Paulo" -> "sao-paulo")
 * - Converte para minúsculas
 * - Substitui espaços e caracteres não-alfanuméricos por hífen (-)
 * - Remove hífens duplicados, iniciais e finais
 * - Garante comprimento entre 3 e 50 caracteres
 */
export function slugifyRouterName(name: string): string {
  if (!name || !name.trim()) return 'router';

  let slug = name
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')     // caracteres inválidos viram hífen
    .replace(/^-+|-+$/g, '')         // remove hífens no início e fim
    .replace(/-+/g, '-');            // remove hífens duplicados

  if (!slug || slug.length < 2) {
    slug = `router-${slug || 'node'}`;
  }

  // Limita tamanho para respeitar rótulos de domínio DNS
  if (slug.length > 50) {
    slug = slug.substring(0, 50).replace(/-+$/, '');
  }

  return slug;
}

/**
 * Gera um subdomínio único garantindo que não haja colisão no banco de dados.
 * Exemplo: se "mkroca" já existir para outro roteador, gera "mkroca-2".
 */
export async function generateUniqueSubdomain(
  routerName: string,
  currentRouterId?: string
): Promise<{ slug: string; subdomain: string }> {
  const baseSlug = slugifyRouterName(routerName);
  const baseDomain = getPublicDomain() || 'mikrogestor.com';

  let candidateSlug = baseSlug;
  let counter = 1;

  while (true) {
    const candidateSubdomain = `${candidateSlug}.${baseDomain}`;

    const existing = await prisma.router.findFirst({
      where: {
        subdomain: candidateSubdomain,
        ...(currentRouterId ? { id: { not: currentRouterId } } : {})
      }
    });

    if (!existing) {
      return {
        slug: candidateSlug,
        subdomain: candidateSubdomain
      };
    }

    counter++;
    candidateSlug = `${baseSlug}-${counter}`;
  }
}
