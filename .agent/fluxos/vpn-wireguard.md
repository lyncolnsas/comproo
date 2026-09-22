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
   - `WG_MANAGER_URL=http://172.16.1.1:51821` (ou `http://172.17.0.1:51821` se rede Docker padrão)
   - `DEPLOYMENT_MODE=vps`
   - `PORTAL_PUBLIC_DOMAIN=mikrogestor.com`
3. Fazer o Redeploy da aplicação no Coolify.

---

## ⚡ Fase 3: Conexão do Roteador MikroTik

1. Acesse o painel web `/dashboard/vpn`.
2. Clique em **"+ Novo Túnel VPN"** ou selecione o roteador.
3. Copie o script gerado (100% em linha única).
4. Cole no **Terminal do Winbox** no MikroTik e pressione Enter.
5. O túnel subirá em menos de 5 segundos, exibindo status **"Online"** no dashboard.

---

## 💻 Fase 5: Admin Peers (Windows, iOS, Android) & Acesso Remoto Winbox

1. **Criar Peer para Técnico/Operador**:
   - Acesse `/dashboard/vpn`.
   - Na seção **"Dispositivos de Administração (Windows / Celular / Notebook)"**, clique em **"+ Novo Peer Administrativo"**.
   - Digite o nome do operador. O sistema sugere o próximo IP VPN disponível (ex: `10.8.0.4/32`).
2. **Conectar via Windows / macOS**:
   - Baixe o arquivo `.conf` gerado.
   - Abra o aplicativo WireGuard e clique em **"Adicionar Túnel"** selecionando o arquivo baixado.
   - Clique em **"Ativar"**.
3. **Conectar via Celular (Android / iOS)**:
   - Abra o aplicativo oficial WireGuard no smartphone.
   - Toque em **"+"** e escolha **"Escanear código QR"**.
   - Aponte para o QR Code exibido no modal do MikroGestor e ative o túnel.
4. **Abrir o MikroTik no Winbox**:
   - Com o túnel ativo, abra o **Winbox**.
   - No campo **Connect To**, informe o IP VPN do MikroTik (ex: `10.8.0.2:8291`).
   - Insira o usuário e senha do roteador e clique em **Connect**.
   - *Acesso remoto completo com zero latência sem depender de IP público ou DDNS!*

---

## 🛠️ Fase 6: Troubleshooting de Falhas Comuns

| Sintoma | Causa Mais Provável | Ação Corretiva |
|---|---|---|
| **Peer ausente no MikroTik** | Script executado com `VPS_WG_PUBLIC_KEY` vazia | Configure `VPS_WG_PUBLIC_KEY` no Coolify e gere o script novamente |
| **Syntax error no Winbox** | Comandos com quebras de linha `\` | Utilize o gerador atualizado que produz comandos em linha única |
| **`tx` sobe mas `rx` é zero** | VPS não cadastrou o peer do MikroTik em `wg0` | Execute na VPS: `wg set wg0 peer <MIKROTIK_PUBKEY> allowed-ips <IP>/32` |
| **Dashboard fica "Carregando..."** | Container Docker não alcança o daemon na porta 51821 | Libere a porta 51821 no UFW da VPS para a rede Docker: `ufw allow from 172.16.0.0/12 to any port 51821 proto tcp` |
| **Handshake não fecha** | Porta UDP 51820 bloqueada no firewall da VPS | Libere a porta no UFW: `ufw allow 51820/udp` |
| **Winbox não conecta via túnel** | Firewall do MikroTik não permite a porta 8291 na chain `input` | Adicione a regra: `/ip firewall filter add chain=input action=accept src-address=10.8.0.0/24 dst-port=8291 protocol=tcp comment="MG: Allow Winbox via WireGuard VPN" place-before=1` |
| **Forward entre peers WireGuard bloqueado** | Falta de `ip_forward` no host Linux | Execute na VPS: `sysctl -w net.ipv4.ip_forward=1` |
