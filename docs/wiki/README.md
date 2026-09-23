# 📚 MikroGestor — Wiki Completa (A Bíblia do Sistema)

> **Este documento é o índice central da documentação técnica e operacional do MikroGestor.**  
> Cada seção é auto-explicativa e pode ser lida de forma independente. Os links cruzados garantem que você sempre encontre respostas.

---

## 🧭 Navegação Rápida

| # | Seção | O que você aprende |
|---|-------|--------------------|
| [01](./01-dashboard.md) | **Dashboard & Métricas** | Como interpretar os indicadores do painel principal |
| [02](./02-roteadores.md) | **Roteadores MikroTik** | Como cadastrar, provisionar e gerenciar MikroTiks |
| [03](./03-hotspot-planos.md) | **Hotspot & Planos** | Como configurar planos de acesso e preços |
| [04](./04-vouchers.md) | **Vouchers** | Como gerar, listar e distribuir vouchers |
| [05](./05-whatsapp.md) | **WhatsApp Multi-Chip** | Pool de números, biblioteca de mídias e encaminhamento |
| [06](./06-portal-cliente.md) | **Portal do Cliente** | O que o cliente vê ao se conectar na rede |
| [07](./07-financeiro.md) | **Financeiro** | Receitas, transações PIX e relatórios |
| [08](./08-vpn-wireguard.md) | **VPN WireGuard** | Acesso remoto seguro aos roteadores via VPN |
| [09](./09-seguranca.md) | **Segurança & Anti-Burla** | Bloqueio de inadimplentes, anti-tethering, blacklist |
| [10](./10-faq.md) | **FAQ — Perguntas Frequentes** | Respostas rápidas para dúvidas comuns |

---

## 🏗️ Arquitetura em Uma Página

```
CLIENTE (celular)
      │
      ▼
  Wi-Fi do MikroTik
      │
      ▼
  Hotspot (autenticação)
      │
      ├─ CPF/Telefone bloqueado? ──► Rejeita (HTTP 403)
      │
      ├─ Pago/Voucher? ────────────► Libera acesso
      │
      └─ Gratuito (cortesia)? ─────► Libera 15 minutos
                                          │
                                          └─ Não pagou? ─► Bloqueia MAC + blacklist

ADMINISTRADOR (você)
      │
      ▼
  Dashboard MikroGestor (http://localhost ou https://mikrogestor.com)
      │
      ├─ Gerencia roteadores via WireGuard VPN (10.8.0.0/24)
      ├─ Configura planos, preços e portal visual
      ├─ Monitora pagamentos PIX em tempo real
      ├─ Envia mensagens WhatsApp via pool de chips (2-8 números)
      └─ Gera vouchers em lote
```

---

## 📌 Conceitos Fundamentais

### O que é o MikroGestor?
Sistema completo de gerenciamento de Hotspot Wi-Fi com:
- **Cadastro de clientes** com validação por CPF/Telefone
- **Pagamento PIX automático** integrado ao MikroTik
- **WhatsApp Marketing** via encaminhamento de mídias (sem re-upload)
- **VPN WireGuard** para gestão remota de roteadores sem IP público

### Como funciona o fluxo de pagamento?
1. Cliente acessa a rede → Portal exibe planos
2. Cliente escolhe plano → QR Code PIX gerado
3. Cliente paga no app do banco → Webhook confirma
4. Sistema libera acesso automaticamente no MikroTik

### Por que o Baileys não faz upload de vídeo toda vez?
O sistema usa **`relayMessage` + `generateForwardMessageContent`** do Baileys, que apenas encaminha o ID de mídia já hospedado nos servidores da Meta. O vídeo é servido diretamente da CDN do WhatsApp — sem custos de banda do servidor e simulando um encaminhamento humano natural.

---

## 🆘 Suporte Rápido

| Problema | Onde buscar a resposta |
|----------|----------------------|
| Chip WhatsApp não entrou no grupo | → [05-whatsapp.md → Seção 3](./05-whatsapp.md) |
| MikroTik não aparece online | → [02-roteadores.md → Diagnóstico](./02-roteadores.md) |
| PIX não liberou o acesso | → [07-financeiro.md → Troubleshooting](./07-financeiro.md) |
| Cliente não consegue se conectar | → [06-portal-cliente.md → FAQ](./06-portal-cliente.md) |
| Deploy/redeploy no Coolify | → [SKILL: mikrogestor-deploy](../../.agents/skills/mikrogestor-deploy/SKILL.md) |

---

*Versão da Wiki: 2.0 · Setembro/2024 · MikroGestor*
