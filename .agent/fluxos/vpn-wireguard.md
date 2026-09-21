---
description: Guia de fluxo e diagnóstico rápido para provisionamento e resolução de problemas em túneis WireGuard VPN
---

# 🔄 Fluxo de Trabalho: VPN WireGuard (Provisionamento & Diagnóstico)

Execute este fluxo sempre que precisar configurar uma nova conexão VPN entre um MikroTik e a VPS ou diagnosticar um túnel que esteja "Offline".

---

## 🎯 Fase 1: Diagnóstico Rápido

1. **Testar status da interface e peers no MikroTik**:
   ```bash
   node scripts/inspect-mikrotik.js
   ```
2. **Avaliar checklist de saúde**:
   - [ ] Interface `wg-mikrogestor` existe e está com status `running: true`?
   - [ ] IP `10.8.0.X/24` está atribuído à interface `wg-mikrogestor`?
   - [ ] Peer da VPS está cadastrado com `public-key` válida?
   - [ ] `lastHandshake` é recente (< 2 minutos)?
   - [ ] `tx` e `rx` estão incrementando (tráfego bidirecional)?

---

## 🚀 Fase 2: Configuração Automatizada do Servidor (VPS / Raspberry Pi)

Se o servidor VPS ainda não possui o WireGuard ativo:
1. No terminal do servidor (SSH ou Web Terminal Coolify):
   ```bash
   sudo bash vpn/setup-vps.sh
   ```
2. Copiar as variáveis geradas para o painel Coolify:
   - `VPS_WG_PUBLIC_KEY`
   - `VPS_PUBLIC_IP`
   - `WG_MANAGER_SECRET`
   - `WG_MANAGER_URL=http://172.17.0.1:51821`
3. Fazer o Redeploy da aplicação no Coolify.

---

## ⚡ Fase 3: Conexão do Roteador MikroTik

1. Acesse o painel web `/dashboard/vpn`.
2. Clique em **"+ Novo Túnel VPN"** ou selecione o roteador.
3. Copie o script gerado (100% em linha única).
4. Cole no **Terminal do Winbox** no MikroTik e pressione Enter.
5. O túnel subirá em menos de 5 segundos, exibindo status **"Online"** no dashboard.

---

## 🛠️ Fase 4: Troubleshooting de Falhas Comuns

| Sintoma | Causa Mais Provável | Ação Corretiva |
|---|---|---|
| **Peer ausente no MikroTik** | Script executado com `VPS_WG_PUBLIC_KEY` vazia | Configure `VPS_WG_PUBLIC_KEY` no Coolify e gere o script novamente |
| **Syntax error no Winbox** | Comandos com quebras de linha `\` | Utilize o gerador atualizado que produz comandos em linha única |
| **`tx` sobe mas `rx` é zero** | VPS não cadastrou o peer do MikroTik em `wg0` | Execute na VPS: `wg set wg0 peer <MIKROTIK_PUBKEY> allowed-ips <IP>/32` |
| **Dashboard fica "Carregando..."** | Container Docker não alcança o daemon na porta 51821 | Libere a porta 51821 no UFW da VPS para a rede Docker: `ufw allow from 172.16.0.0/12 to any port 51821 proto tcp` |
| **Handshake não fecha** | Porta UDP 51820 bloqueada no firewall da VPS | Libere a porta no UFW: `ufw allow 51820/udp` |
