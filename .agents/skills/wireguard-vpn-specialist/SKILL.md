---
name: wireguard-vpn-specialist
description: Especialista em arquitetura, provisionamento, configuração e troubleshooting de túneis VPN WireGuard entre roteadores MikroTik (RouterOS v7) e servidores Linux VPS (Ubuntu/Debian, Docker, Coolify). Utilize quando o usuário solicitar configuração de VPN, túnel remoto, WireGuard, scripts RouterOS de VPN ou gerenciamento de roteadores sem IP público.
---

# WireGuard VPN Specialist (MikroTik RouterOS v7 & Linux VPS)

Este guia e runbook estabelece os padrões e melhores práticas para implementação de túneis WireGuard de alta performance e segurança entre roteadores MikroTik (RouterOS v7) e a plataforma MikroGestor (Linux VPS / Coolify / Docker).

---

## 1. Arquitetura de Controle (Split-Tunnel)

O objetivo principal desta infraestrutura é permitir que a VPS controle roteadores MikroTik em clientes que **não possuem IP público** (atrás de CGNAT ou NAT residencial).

```text
[ MikroTik Cliente ]                      [ Servidor VPS (Linux) ]
 (192.168.88.1)                            (2.25.168.82 / wg0: 10.8.0.1)
        │                                                │
   wg-mikrogestor                                       wg0
     (10.8.0.2) ───[ Túnel Criptografado UDP:51820 ]───> (10.8.0.1)
        │                                                │
        │                                         wg-manager:51821
        │                                         (Daemon Python)
        │                                                │
   API RouterOS (TCP 8728) <─────────────────────── Next.js App
                                                   (Docker Container)
```

### Regras Críticas de Rede:
1. **Split-Tunneling Obrigatório**:
   - `AllowedIPs` no MikroTik DEVE ser estritamente `10.8.0.0/24`.
   - NUNCA use `0.0.0.0/0` no MikroTik, pois isso redirecionaria todo o tráfego dos clientes do Hotspot para a VPS, consumindo banda e recursos indevidos.
2. **Firewall MikroTik**:
   - Permitir conexões de gerenciamento (TCP 8728, 8729, 8291) **apenas** vindas do IP da VPS (`10.8.0.1`) na interface `wg-mikrogestor`.
   - Bloquear qualquer tráfego que tente usar a VPN para rota externa.

---

## 2. Padrão de Scripts MikroTik RouterOS v7 (Winbox Terminal)

> ⚠️ **REGRA MANDATÓRIA (P0)**: No Winbox Terminal, **NUNCA use barras invertidas (`\`)** para quebra de linhas em scripts para copiar e colar. Quebras invisíveis (`\r\n`) geradas pelo Windows causam `syntax error` no RouterOS. Todos os comandos devem ser gerados em **linha única**.

### Script Padrão de Conexão do Roteador:

```routeros
# --- 1. LIMPEZA PREVENTIVA ---
:do { /interface wireguard peers remove [find interface=wg-mikrogestor] } on-error={}
:do { /ip address remove [find interface=wg-mikrogestor] } on-error={}
:do { /ip address remove [find network=10.8.0.0] } on-error={}
:do { /ip route remove [find comment="MikroGestor VPN route"] } on-error={}
:do { /interface wireguard remove [find name=wg-mikrogestor] } on-error={}

# --- 2. INTERFACE E IP ---
/interface wireguard add name=wg-mikrogestor private-key="<MIKROTIK_PRIV_KEY>" listen-port=13231 comment="MikroGestor VPN - NAO MODIFICAR"
/ip address add address=<VPN_IP>/24 interface=wg-mikrogestor network=10.8.0.0 comment="MikroGestor VPN IP"

# --- 3. PEER VPS ---
/interface wireguard peers add interface=wg-mikrogestor public-key="<VPS_PUBLIC_KEY>" endpoint-address=<VPS_IP> endpoint-port=51820 allowed-address=10.8.0.0/24 persistent-keepalive=25 comment="MikroGestor VPS"

# --- 4. ROTA DE CONTROLE ---
/ip route add dst-address=10.8.0.0/24 gateway=wg-mikrogestor comment="MikroGestor VPN route"

# --- 5. FIREWALL DE SEGURANÇA ---
:local ruleApi [/ip firewall filter find comment="MikroGestor: API access"]
:if ([:len $ruleApi] = 0) do={ /ip firewall filter add chain=input in-interface=wg-mikrogestor src-address=10.8.0.1 dst-port=8728,8729 protocol=tcp action=accept place-before=0 comment="MikroGestor: API access" }

:local ruleBlock [/ip firewall filter find comment="MikroGestor: block non-VPS via VPN"]
:if ([:len $ruleBlock] = 0) do={ /ip firewall filter add chain=input in-interface=wg-mikrogestor src-address=!10.8.0.1 action=drop comment="MikroGestor: block non-VPS via VPN" }

:do {
  :local ruleHs [/ip firewall filter find comment="MikroGestor: block hotspot thru VPN"]
  :if ([:len $ruleHs] = 0) do={ /ip firewall filter add chain=forward in-interface=bridge-hotspot out-interface=wg-mikrogestor action=drop comment="MikroGestor: block hotspot thru VPN" }
} on-error={}

:log info "MikroGestor VPN: configuracao concluida (<VPN_IP>)"
```

---

## 3. Configuração do Servidor VPS (Linux / Ubuntu)

### Instalação e Kernel Forwarding:
```bash
apt-get update && apt-get install -y wireguard wireguard-tools python3 openssl
echo "net.ipv4.ip_forward=1" > /etc/sysctl.d/99-mikrogestor-vpn.conf
sysctl -p /etc/sysctl.d/99-mikrogestor-vpn.conf
```

### Arquivo `/etc/wireguard/wg0.conf`:
```ini
[Interface]
Address = 10.8.0.1/24
ListenPort = 51820
PrivateKey = <VPS_PRIVATE_KEY>

PostUp   = iptables -A FORWARD -i %i -j ACCEPT; iptables -A FORWARD -o %i -j ACCEPT
PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT
```

### Firewall UFW da VPS:
```bash
# Permitir túnel UDP público
ufw allow 51820/udp comment "WireGuard VPN"

# Permitir acesso do Docker ao daemon local wg-manager (RFC 1918)
ufw allow from 172.16.0.0/12 to any port 51821 proto tcp comment "MikroGestor Docker to WG-Manager"
ufw reload
```

---

## 4. Integração com Docker e Coolify

Quando o MikroGestor roda em um container Docker no Coolify:
1. O container acessa o host na porta `51821` pelo IP do bridge gateway: `http://172.17.0.1:51821`.
2. Variáveis de ambiente obrigatórias:
   - `VPS_WG_PUBLIC_KEY`: Chave pública da interface `wg0` do servidor.
   - `VPS_PUBLIC_IP`: IP público da VPS (ex: `2.25.168.82`).
   - `WG_MANAGER_SECRET`: Token seguro gerado em `/etc/mikrogestor-wg.secret`.
   - `WG_MANAGER_URL`: `http://172.17.0.1:51821`.

---

## 5. Checklist de Verificação e Troubleshooting

### No MikroTik:
- **Verificar interface**: `/interface/wireguard print` (deve estar `running=yes`).
- **Verificar peer**: `/interface/wireguard/peers print`
  - `last-handshake` deve ser menor que 2 minutos (ex: `15s`, `0s`).
  - `rx` e `tx` devem estar incrementando.

### Na VPS:
- **Verificar status dos túneis**: `wg show`
- **Testar ping direto**: `ping -c 3 10.8.0.2`
- **Testar porta API do MikroTik via VPN**: `nc -zv 10.8.0.2 8728`
- **Testar daemon HTTP**:
  ```bash
  curl -H "X-WG-Secret: <SECRET>" http://127.0.0.1:51821/health
  curl -H "X-WG-Secret: <SECRET>" http://127.0.0.1:51821/status
  ```
