/**
 * Contrato comum para os adapters de WhatsApp (Meta e Baileys Multi-Device).
 */

export interface SendMessageOptions {
  skipStandby?: boolean;
  pinnedInstanceId?: string;
  preferredEngine?: 'meta' | 'baileys';
  /**
   * Quando definido, o Baileys usará relayMessage (forward nativo) em vez
   * de upload. O valor deve ser o ID de um registro na tabela MediaLibrary.
   * Tem precedência sobre o campo media.url.
   */
  forwardLibraryId?: string;
  media?: {
    url: string;
    type: 'image' | 'video' | 'audio' | 'document';
  };
}

export interface SendMessageResult {
  success: boolean;
  instanceId?: string;
  error?: string;
}

export interface IWhatsappAdapter {
  /** Envia uma mensagem de texto simples com suporte a Session Pinning e opções */
  sendMessage(to: string, text: string, options?: SendMessageOptions): Promise<boolean | SendMessageResult>;

  /** Envia um template aprovado pela Meta (no Baileys, vira texto formatado) */
  sendTemplate(
    to: string,
    templateName: string,
    languageCode: string,
    components: any[],
    options?: SendMessageOptions
  ): Promise<boolean | SendMessageResult>;

  /** Retorna o QR code base64 ou texto (apenas Baileys; Meta retorna null) */
  getQrCode(instanceId?: string): string | null;

  /** Status atual da conexão */
  getStatus(instanceId?: string): string;

  /** Desconecta / faz logout de forma graciosa */
  logout(instanceId?: string): void | Promise<void>;

  /** Obtém a URL da foto de perfil do contato no WhatsApp (se disponível) */
  getProfilePictureUrl?(to: string, instanceId?: string): Promise<string | null>;
}

