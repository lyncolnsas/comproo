# 💬 WhatsApp Multi-Chip — Pool de Números e Biblioteca de Mídias

> **← [Voltar ao Índice](./README.md)**

O módulo WhatsApp é o diferencial competitivo do MikroGestor. Ele opera com um **pool de 2 a 8 chips simultâneos** em modo Round-Robin, com proteção anti-bloqueio e encaminhamento inteligente de mídias.

---

## Arquitetura do Pool Multi-Chip

```
Disparo de mensagem
        │
        ▼
   Round-Robin  ──►  Chip 1 (554497743598) ──► Envia
   automático   ──►  Chip 2 (554497743552) ──► Envia (próxima)
                ──►  Chip 3 (554497540481) ──► Envia (próxima)
                └──► Chip N ...

   Se um chip cair → failover automático para o próximo disponível
```

**Por que isso protege contra bloqueio do WhatsApp?**  
Quando muitas mensagens partem do mesmo número, o WhatsApp pode sinalizar spam. Com o pool, cada número envia uma fração das mensagens — diluindo o risco e simulando comportamento humano natural.

---

## Tela de Instâncias WhatsApp

![WhatsApp Hub — Instâncias](../../docs/wiki/screenshots/05-whatsapp-instancias.png)

Cada linha representa um chip físico com:
- **Nome** do chip (editável)
- **Número** identificado após pareamento
- **Status**: `Conectado ✅`, `Aguardando QR 📱`, `Reconectando 🔄`, `Desconectado ❌`
- **Grupo de Biblioteca**: qual grupo de mídias esse chip monitora

---

## Como Conectar um Novo Chip

1. Acesse **WhatsApp → Instâncias**
2. Clique em **"+ Adicionar Chip"**
3. Nomeie o chip (ex: "Chip 4 — Chip Spare")
4. Um **QR Code** aparece na tela
5. Abra o WhatsApp no celular → **Dispositivos Vinculados → Vincular um Dispositivo**
6. Escaneie o QR Code
7. Em ~15 segundos, o chip aparece como `Conectado ✅`

> [!TIP]
> Após conectar, o chip entra automaticamente no grupo de biblioteca central (se configurado). Esse processo usa o código de convite do grupo — não requer que você seja admin.

---

## Biblioteca de Mídias — O Coração do Sistema

![WhatsApp Templates](../../docs/wiki/screenshots/05-whatsapp-templates.png)

### Como popular a biblioteca

1. **Crie um grupo** no WhatsApp com todos os chips
2. Configure o JID do grupo em **Configurações → WhatsApp → JID do Grupo de Biblioteca**
3. Envie imagens, vídeos, áudios e documentos nesse grupo
4. O sistema detecta automaticamente, salva o ID de mídia da Meta e exibe na Biblioteca

### Como funciona o encaminhamento (sem re-upload)

```
Você envia vídeo no grupo central
         │
         ▼
Sistema salva o Media ID da Meta (ex: 6062153050556037)
         │
         ▼
Cliente paga → Sistema envia mensagem
         │
         ▼
relayMessage(mediaId) → WhatsApp serve o vídeo da própria CDN da Meta
         │
         ▼
Cliente recebe o vídeo como se fosse um encaminhamento humano ✅
```

**Vantagens:**
- ✅ Zero re-upload de arquivo (sem custo de banda)
- ✅ Entrega mais rápida (CDN global da Meta)
- ✅ Parece encaminhamento humano (menor risco de bloqueio)
- ✅ Funciona para: imagens, vídeos, áudios, PDFs, documentos

---

## Grupo de Biblioteca — Auto-Inclusão de Chips

Quando você configura o JID do grupo de biblioteca, **todos os chips entram automaticamente** no grupo. O processo é:

1. Chip conecta (`connection === 'open'`)
2. Sistema aguarda **3 segundos** (estabilização do socket)
3. Verifica se o chip já é membro do grupo via `groupMetadata`
4. Se não é membro:
   - Tenta adicionar via admin de outro chip (se houver admin no grupo)
   - Ou obtém código de convite via `groupInviteCode` e usa `groupAcceptInvite`
   - Retry automático: até **3 tentativas** com **5 segundos** de intervalo
5. Confirma ingresso com log `✅ entrou no grupo central com sucesso`

> [!IMPORTANT]
> O grupo deve ter a opção de ingresso por convite habilitada no WhatsApp. Grupos com "Apenas admins podem adicionar" precisam ter ao menos um chip como admin para a auto-inclusão funcionar.

---

## Configuração do Grupo por Chip

Cada chip pode ter seu **próprio grupo** de biblioteca, permitindo:
- Chip 1 e 2 → grupo com banners de verão
- Chip 3 e 4 → grupo com banners de natal

Ou todos os chips compartilham o mesmo grupo — o mais comum e simples de gerenciar.

---

## Templates de Mensagem

![Templates de Mensagem](../../docs/wiki/screenshots/05-whatsapp-templates.png)

Os templates são mensagens automáticas enviadas em gatilhos como:
- Confirmação de pagamento PIX (`liberacao_wifi`)
- Lembrete de renovação (`lembrete_pagamento`)
- Boas-vindas com dados de acesso (`numero_de_serie_`)

Cada template suporta variáveis: `{{nome}}`, `{{valor}}`, `{{plano}}`.

---

## Resolução de Problemas

| Problema | Causa | Solução |
|----------|-------|---------|
| Chip não entra no grupo | Socket ainda em sync de histórico | Sistema tenta automaticamente 3x com 5s de intervalo |
| QR Code some antes de escanear | Expirou (15s de validade) | Clique em "Gerar Novo QR" |
| Mensagens não saem | Todos chips desconectados | Reconecte ao menos 1 chip |
| Mídia aparece como "arquivo expirado" | Media ID da Meta expirou | Re-envie a mídia no grupo de biblioteca |

---

## Relacionado

- [07 — Financeiro (gatilhos de confirmação PIX)](./07-financeiro.md)
- [09 — Segurança (bloqueio por inadimplência)](./09-seguranca.md)

---
*← [Anterior: Vouchers](./04-vouchers.md) · [Próximo: Portal do Cliente →](./06-portal-cliente.md)*
