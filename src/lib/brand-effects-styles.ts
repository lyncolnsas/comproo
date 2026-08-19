/**
 * Gera os estilos CSS minimalistas para a marca.
 * Mantido para compatibilidade de assinatura de API com o Dashboard e o Preview.
 */
export function getBrandEffectsStyles(brandColor: string = '#2563eb'): string {
  return `
/* Correção de tipografia para evitar sobreposição pelo Studio */
#mg-live-brand-text *,
.brand-title-text * {
  font-family: inherit !important;
}
`;
}
