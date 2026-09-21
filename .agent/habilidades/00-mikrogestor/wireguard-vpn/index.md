---
name: wireguard-vpn
description: Base de conhecimento completa para túneis WireGuard VPN no MikroTik RouterOS v7 e servidores Linux VPS/Coolify/Raspberry Pi
when_to_use: Use when configuring VPN tunnels, managing remote MikroTiks without public IP, diagnosing WireGuard handshakes, or integrating with Coolify Docker
---

# WireGuard VPN — Base de Conhecimento e Runbook de Engenharia

Esta habilidade detalha a arquitetura, padrões de configuração, comandos RouterOS v7 e rotinas de manutenção para túneis WireGuard de gerência no ecossistema MikroGestor.

---

## 1. Comandos e Paths do RouterOS v7

O RouterOS v7 reescreveu completamente a pilha de VPN, integrando o WireGuard nativamente no kernel do MikroTik.

### 1.1 Interface WireGuard
```routeros
# Criar interface
/interface wireguard add name=wg-mikrogestor private-key="<PRIV_KEY>" listen-port=13231 comment="MikroGestor VPN - NAO MODIFICAR"

# Consultar chave pública gerada automaticamente
:put [/interface wireguard get [find name=wg-mikrogestor] public-key]
```

### 1.2 Endereçamento IP e Rota
```routeros
# Atribuir IP na interface
/ip address add address=10.8.0.X/24 interface=wg-mikrogestor network=10.8.0.0 comment="MikroGestor VPN IP"

# Criar rota de controle para alcançar a VPS e os demais nós
/ip route add dst-address=10.8.0.0/24 gateway=wg-mikrogestor comment="MikroGestor VPN route"
```

### 1.3 Adicionar Peer (Servidor VPS)
```routeros
/interface wireguard peers add interface=wg-mikrogestor public-key="<VPS_PUB_KEY>" endpoint-address=<VPS_IP> endpoint-port=51820 allowed-address=10.8.0.0/24 persistent-keepalive=25 comment="MikroGestor VPS"
```
> ⚠️ **IMPORTANTE**: O parâmetro `persistent-keepalive=25` é obrigatório para manter a sessão UDP aberta através de modems NAT/CGNAT. Sem ele, a operadora fecha a tabela de tradução após 30 a 60 segundos de inatividade.

### 1.4 Regras de Firewall (Segurança e Isolamento)
```routeros
# 1. Permitir acesso à API (portas 8728, 8729) estritamente a partir da VPS (10.8.0.1)
/ip firewall filter add chain=input in-interface=wg-mikrogestor src-address=10.8.0.1 dst-port=8728,8729 protocol=tcp action=accept place-before=0 comment="MikroGestor: API access"

# 2. Bloquear qualquer outro tráfego desconhecido na interface VPN
/ip firewall filter add chain=input in-interface=wg-mikrogestor src-address=!10.8.0.1 action=drop comment="MikroGestor: block non-VPS via VPN"

# 3. Garantir que o tráfego de clientes Hotspot nunca seja roteado pela VPN (Split-Tunnel)
:do {
  :local rExists [/ip firewall filter find comment="MikroGestor: block hotspot thru VPN"]
  :if ([:len $rExists] = 0) do={ /ip firewall filter add chain=forward in-interface=bridge-hotspot out-interface=wg-mikrogestor action=drop comment="MikroGestor: block hotspot thru VPN" }
} on-error={}
```

---

## 2. Padrões do Servidor Linux (VPS / Raspberry Pi)

### 2.1 Estrutura de Arquivos
- `/etc/wireguard/wg0.conf`: Arquivo de configuração da interface `wg0`.
- `/etc/wireguard/private.key`: Chave privada do servidor (permissão `600`).
- `/etc/wireguard/public.key`: Chave pública compartilhada com os MikroTiks.
- `/etc/mikrogestor-wg.secret`: Token hexadecimal de 64 caracteres para autenticação da API.
- `/opt/mikrogestor-wg-manager/wg-manager.py`: Daemon HTTP para gestão de peers via Docker.
- `/etc/systemd/system/mikrogestor-wg-manager.service`: Unidade systemd com restart automático.

### 2.2 Endpoints da API do Daemon (`wg-manager.py` na porta 51821)
Todos os requests exigem o cabeçalho `X-WG-Secret`:
- `GET /health` → Retorna `{"ok": true}`
- `GET /status` → Retorna lista de peers, endpoints, transferRx, transferTx e último handshake.
- `POST /peer/add` → Corpo `{ "publicKey": "...", "vpnIp": "10.8.0.X" }`
- `POST /peer/remove` → Corpo `{ "publicKey": "..." }`
- `GET /keygen` → Retorna par de chaves Curve25519 gerado via `wg genkey`.

---

## 3. Integração com Coolify e Docker

### 3.1 Resolução de Rede Docker-to-Host
Por padrão, containers Docker no Coolify acessam o host através do gateway da bridge padrão:
- URL de conexão: `http://172.17.0.1:51821`
- Regra de Firewall necessária no host:
  `ufw allow from 172.16.0.0/12 to any port 51821 proto tcp comment "Docker to WG-Manager"`

### 3.2 Variáveis de Ambiente no Coolify
```env
VPS_WG_PUBLIC_KEY="<chave pública do servidor>"
VPS_PUBLIC_IP="<IP público ou domínio do servidor>"
WG_MANAGER_SECRET="<secret gerado pelo instalador>"
WG_MANAGER_URL="http://172.17.0.1:51821"
```

---

## 4. Script de Instalação Rápida (1 Comando)

Em qualquer servidor VPS Ubuntu/Debian ou Raspberry Pi OS:
```bash
sudo bash vpn/setup-vps.sh
```
O script executa automaticamente todas as 7 etapas sem intervenção manual e exibe as variáveis prontas para copiar.
