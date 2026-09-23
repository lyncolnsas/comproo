# 🖧 Roteadores MikroTik

> **← [Voltar ao Índice](./README.md)**

Esta seção explica como adicionar, configurar e monitorar roteadores MikroTik no sistema.

---

## O que é um Roteador no MikroGestor?

Cada roteador cadastrado representa um **ponto físico de Wi-Fi** que você gerencia remotamente. O sistema se comunica com ele via **VPN WireGuard** (túnel seguro na subnet `10.8.0.0/24`), sem necessidade de IP público no roteador.

---

## Tela de Roteadores

![Tela de Roteadores](../../docs/wiki/screenshots/02-roteadores.png)

A lista mostra cada roteador com:
- **Status VPN**: `Online ✅` ou `Offline ❌`
- **IP WireGuard**: ex. `10.8.0.2`
- **Subdomínio dedicado**: ex. `loja-centro.mikrogestor.com`
- **Último heartbeat**: quando o roteador fez check-in pela última vez

---

## Como Adicionar um Novo Roteador

### Passo 1 — Clique em "Novo Roteador"

Preencha:
- **Nome**: ex. "Loja Centro"
- **Slug**: ex. `loja-centro` (usado no subdomínio)
- **IP WireGuard**: o sistema atribui automaticamente o próximo IP disponível na subnet `10.8.0.0/24`

### Passo 2 — Baixe o Script de Provisionamento

Após salvar, clique em **"Gerar Script WireGuard"**. O sistema gera um script `.rsc` pronto para colar no Terminal do Winbox.

> [!IMPORTANT]
> O script é gerado em **linha única** (sem quebras de linha). Isso é obrigatório para o RouterOS v7 — quebras de linha causam `syntax error`. Cole diretamente no Winbox Terminal.

### Passo 3 — Cole no Terminal do Winbox

```
/interface wireguard add name=wg-mg ...
/ip address add address=10.8.0.X/24 interface=wg-mg
/ip route add dst-address=10.8.0.0/24 gateway=wg-mg
```

Após ~30 segundos, o roteador aparece como `Online ✅` no dashboard.

### Passo 4 — Provisione o Hotspot

Com o roteador online, clique em **"Provisionar Hotspot"**. O sistema configura automaticamente via RouterOS API:
- Perfis de usuário Hotspot
- Walled Garden (HTTPS e HTTP)
- DNS estático do portal
- Regras de firewall anti-tethering

---

## Subdomínio Dedicado com SSL

Cada roteador recebe um subdomínio próprio: `<slug>.mikrogestor.com`. O certificado SSL é provisionado automaticamente via Let's Encrypt pelo Traefik e sincronizado com o MikroTik a cada 15 dias via agendador.

> [!TIP]
> O wildcard DNS `*.mikrogestor.com → IP_DA_VPS` precisa estar configurado na sua zona DNS (Hostinger/Cloudflare) para novos subdomínios funcionarem instantaneamente.

---

## Diagnóstico de Problemas

| Sintoma | Causa provável | Solução |
|---------|---------------|---------|
| Roteador aparece Offline | Serviço WireGuard caiu | `systemctl restart wg-quick@wg0` na VPS |
| Script gera `syntax error` no Winbox | Quebra de linha `\r\n` do Windows | Certifique-se de copiar o script gerado pelo sistema (já em linha única) |
| Hotspot não autentica após provisionar | Walled Garden incompleto | Re-execute "Provisionar Hotspot" pelo painel |
| API MikroTik retorna `!empty` | RouterOS v7 retorna `!empty` em tabelas vazias | Patch aplicado automaticamente — verifique `src/lib/routeros.ts` linhas 5-33 |

---

## Acesso Remoto via Winbox (VPN)

Com a VPN ativa no seu computador ou celular, você pode abrir o Winbox e conectar diretamente no IP WireGuard do roteador:
- **Host**: `10.8.0.2` (IP WireGuard do roteador)
- **Porta**: `8291` (Winbox padrão)

Sem necessidade de TeamViewer, AnyDesk ou IP público.

---

## Relacionado

- [08 — VPN WireGuard](./08-vpn-wireguard.md)
- [03 — Hotspot & Planos](./03-hotspot-planos.md)

---
*← [Anterior: Dashboard](./01-dashboard.md) · [Próximo: Hotspot & Planos →](./03-hotspot-planos.md)*
