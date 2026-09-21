#!/usr/bin/env bash
# ==============================================================================
#  MIKROGESTOR — INSTALADOR VPN WIREGUARD (VPS)
#  Instala e configura WireGuard + daemon de gerenciamento na VPS
#  Compatível: Ubuntu 20.04+, Debian 11+
#  Uso: curl -sSL [URL]/vpn/setup-vps.sh | sudo bash
#       ou: sudo bash vpn/setup-vps.sh
# ==============================================================================

set -euo pipefail

# ── Cores ─────────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

log()     { echo -e "${CYAN}[VPN]${NC} $1"; }
success() { echo -e "${GREEN}${BOLD}[OK]${NC} $1"; }
warn()    { echo -e "${YELLOW}[AVISO]${NC} $1"; }
error()   { echo -e "${RED}[ERRO]${NC} $1"; exit 1; }

# ── Verificações ───────────────────────────────────────────────────────────────
[[ $EUID -ne 0 ]] && error "Execute como root: sudo bash $0"
command -v apt-get &>/dev/null || error "Este script requer apt-get (Ubuntu/Debian)"

# ── Configurações ──────────────────────────────────────────────────────────────
WG_DIR="/etc/wireguard"
WG_INTERFACE="wg0"
WG_PORT=51820
VPN_SUBNET="10.8.0.0/24"
VPN_SERVER_IP="10.8.0.1"
WG_MANAGER_PORT=51821
WG_MANAGER_DIR="/opt/mikrogestor-wg-manager"
WG_MANAGER_SECRET_FILE="/etc/mikrogestor-wg.secret"

echo -e "${CYAN}${BOLD}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║         MikroGestor — Configuração VPN WireGuard             ║"
echo "║         WireGuard + Daemon de Gerenciamento                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ── PASSO 1: Instalar WireGuard ────────────────────────────────────────────────
log "Passo 1/7: Instalando WireGuard..."
apt-get update -qq
apt-get install -y wireguard wireguard-tools python3 openssl ufw
success "WireGuard instalado"

# ── PASSO 2: IP Forwarding ────────────────────────────────────────────────────
log "Passo 2/7: Habilitando IP forwarding..."
echo "net.ipv4.ip_forward=1" > /etc/sysctl.d/99-mikrogestor-vpn.conf
sysctl -p /etc/sysctl.d/99-mikrogestor-vpn.conf >/dev/null
success "IP forwarding ativo"

# ── PASSO 3: Gerar Chaves ─────────────────────────────────────────────────────
log "Passo 3/7: Gerando chaves WireGuard do servidor..."
mkdir -p "$WG_DIR"
chmod 700 "$WG_DIR"

if [[ -f "$WG_DIR/private.key" ]]; then
    warn "Chaves já existem — reutilizando. Delete $WG_DIR/private.key para regenerar."
else
    wg genkey | tee "$WG_DIR/private.key" | wg pubkey > "$WG_DIR/public.key"
    chmod 600 "$WG_DIR/private.key"
fi

VPS_PRIVATE_KEY=$(cat "$WG_DIR/private.key")
VPS_PUBLIC_KEY=$(cat "$WG_DIR/public.key")
success "Chaves geradas"
echo ""
echo -e "${YELLOW}${BOLD}╔══════════════════════════════════════════════════════════════╗"
echo    "║  CHAVE PÚBLICA DA VPS (copie para VPS_WG_PUBLIC_KEY no .env) ║"
echo    "╠══════════════════════════════════════════════════════════════╣"
echo    "║  $VPS_PUBLIC_KEY"
echo -e "╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ── PASSO 4: Criar wg0.conf ───────────────────────────────────────────────────
log "Passo 4/7: Criando configuração do servidor WireGuard..."

# Detectar interface de rede principal
MAIN_IFACE=$(ip route | grep default | awk '{print $5}' | head -n1)
[[ -z "$MAIN_IFACE" ]] && MAIN_IFACE="eth0"
log "Interface de rede principal detectada: $MAIN_IFACE"

cat > "$WG_DIR/$WG_INTERFACE.conf" <<EOF
# MikroGestor WireGuard Server — wg0.conf
# Gerado em: $(date)
# NAO EDITE MANUALMENTE — gerenciado pelo MikroGestor

[Interface]
Address = ${VPN_SERVER_IP}/24
ListenPort = ${WG_PORT}
PrivateKey = ${VPS_PRIVATE_KEY}

# Permitir forward na rede de controle VPN
PostUp   = iptables -A FORWARD -i %i -j ACCEPT; iptables -A FORWARD -o %i -j ACCEPT
PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT

# Peers são adicionados dinamicamente pelo MikroGestor
# wg set wg0 peer [PUBKEY] allowed-ips [VPN_IP]/32
EOF

chmod 600 "$WG_DIR/$WG_INTERFACE.conf"
success "wg0.conf criado"

# ── PASSO 5: Iniciar WireGuard ────────────────────────────────────────────────
log "Passo 5/7: Iniciando WireGuard..."
systemctl enable wg-quick@$WG_INTERFACE 2>/dev/null || true
wg-quick down $WG_INTERFACE 2>/dev/null || true
wg-quick up $WG_INTERFACE
success "WireGuard ativo (interface $WG_INTERFACE em $VPN_SERVER_IP)"

# ── PASSO 6: Firewall ─────────────────────────────────────────────────────────
log "Passo 6/7: Configurando firewall (ufw)..."
ufw allow ${WG_PORT}/udp comment "MikroGestor WireGuard"
ufw allow 80/tcp comment "MikroGestor HTTP"
ufw allow 443/tcp comment "MikroGestor HTTPS"
ufw allow 8000/tcp comment "Coolify Dashboard"
ufw allow 22/tcp comment "SSH"
# WG Manager apenas localhost — NÃO expor à internet
ufw reload 2>/dev/null || true
success "Firewall configurado"

# ── PASSO 7: Instalar WireGuard Manager Daemon ────────────────────────────────
log "Passo 7/7: Instalando daemon de gerenciamento WireGuard..."

# Gerar secret de autenticação
if [[ -f "$WG_MANAGER_SECRET_FILE" ]]; then
    warn "Secret já existe — reutilizando"
    WG_MANAGER_SECRET=$(cat "$WG_MANAGER_SECRET_FILE")
else
    WG_MANAGER_SECRET=$(openssl rand -hex 32)
    echo "$WG_MANAGER_SECRET" > "$WG_MANAGER_SECRET_FILE"
    chmod 600 "$WG_MANAGER_SECRET_FILE"
fi

mkdir -p "$WG_MANAGER_DIR"

# Criar o daemon Python (servidor HTTP mínimo, apenas localhost)
cat > "$WG_MANAGER_DIR/wg-manager.py" << 'PYEOF'
#!/usr/bin/env python3
"""
MikroGestor WireGuard Manager Daemon
Servidor HTTP mínimo em 127.0.0.1:51821
Permite que o container Docker do MikroGestor gerencie peers WireGuard no host.
NUNCA expor este serviço à internet.
"""

import http.server
import json
import subprocess
import os
import sys
import logging
import hmac
import hashlib
from urllib.parse import urlparse

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [WG-MGR] %(levelname)s %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
log = logging.getLogger(__name__)

WG_INTERFACE = os.environ.get('WG_INTERFACE', 'wg0')
BIND_HOST    = '127.0.0.1'
BIND_PORT    = int(os.environ.get('WG_MANAGER_PORT', '51821'))
SECRET_FILE  = '/etc/mikrogestor-wg.secret'

def load_secret():
    try:
        with open(SECRET_FILE) as f:
            return f.read().strip()
    except Exception as e:
        log.error(f"Não foi possível ler secret: {e}")
        sys.exit(1)

SECRET = load_secret()

def run(cmd):
    """Executa comando e retorna (stdout, stderr, returncode)."""
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return result.stdout.strip(), result.stderr.strip(), result.returncode

def verify_secret(headers):
    auth = headers.get('X-WG-Secret', '')
    return hmac.compare_digest(auth, SECRET)

class WGHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        log.info(f"{self.client_address[0]} - {format % args}")

    def send_json(self, code, data):
        body = json.dumps(data).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', len(body))
        self.end_headers()
        self.wfile.write(body)

    def read_body(self):
        length = int(self.headers.get('Content-Length', 0))
        return json.loads(self.rfile.read(length)) if length else {}

    def do_GET(self):
        if not verify_secret(self.headers):
            return self.send_json(401, {'error': 'Unauthorized'})

        if self.path == '/health':
            return self.send_json(200, {'ok': True})

        if self.path == '/status':
            stdout, stderr, rc = run(f'wg show {WG_INTERFACE} dump')
            if rc != 0:
                return self.send_json(500, {'error': stderr})

            lines = [l for l in stdout.split('\n') if l]
            peers = []
            for line in lines[1:]:  # pular header do server
                parts = line.split('\t')
                if len(parts) < 8:
                    continue
                pub_key, _, endpoint, allowed_ips, last_hs, rx, tx, _ = parts[:8]
                peers.append({
                    'publicKey': pub_key,
                    'endpoint': endpoint if endpoint != '(none)' else None,
                    'allowedIps': allowed_ips,
                    'lastHandshake': int(last_hs),
                    'transferRx': int(rx),
                    'transferTx': int(tx),
                })
            return self.send_json(200, {'interface': WG_INTERFACE, 'peers': peers})

        return self.send_json(404, {'error': 'Not found'})

    def do_POST(self):
        if not verify_secret(self.headers):
            return self.send_json(401, {'error': 'Unauthorized'})

        body = self.read_body()

        if self.path == '/peer/add':
            pub_key = body.get('publicKey', '').strip()
            vpn_ip  = body.get('vpnIp', '').strip()

            if not pub_key or not vpn_ip:
                return self.send_json(400, {'error': 'publicKey e vpnIp obrigatórios'})

            # Adicionar peer
            _, err, rc = run(f'wg set {WG_INTERFACE} peer "{pub_key}" allowed-ips {vpn_ip}/32')
            if rc != 0:
                log.error(f"wg set peer falhou: {err}")
                return self.send_json(500, {'error': err})

            # Persistir
            _, err, rc = run(f'wg-quick save {WG_INTERFACE}')
            if rc != 0:
                log.warning(f"wg-quick save falhou (não crítico): {err}")

            log.info(f"Peer adicionado: {pub_key[:12]}... → {vpn_ip}")
            return self.send_json(200, {'ok': True, 'vpnIp': vpn_ip})

        if self.path == '/peer/remove':
            pub_key = body.get('publicKey', '').strip()
            if not pub_key:
                return self.send_json(400, {'error': 'publicKey obrigatório'})

            _, err, rc = run(f'wg set {WG_INTERFACE} peer "{pub_key}" remove')
            if rc != 0:
                log.warning(f"Peer não encontrado para remoção: {pub_key[:12]}...")

            run(f'wg-quick save {WG_INTERFACE}')
            log.info(f"Peer removido: {pub_key[:12]}...")
            return self.send_json(200, {'ok': True})

        if self.path == '/keygen':
            # Gerar par de chaves WireGuard
            priv, err, rc = run('wg genkey')
            if rc != 0:
                return self.send_json(500, {'error': err})
            pub, err, rc = run(f'echo "{priv}" | wg pubkey')
            if rc != 0:
                return self.send_json(500, {'error': err})
            return self.send_json(200, {'privateKey': priv, 'publicKey': pub})

        return self.send_json(404, {'error': 'Not found'})

if __name__ == '__main__':
    server = http.server.HTTPServer((BIND_HOST, BIND_PORT), WGHandler)
    log.info(f"WG Manager escutando em {BIND_HOST}:{BIND_PORT}")
    log.info(f"Interface: {WG_INTERFACE}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        log.info("Encerrado")
PYEOF

chmod +x "$WG_MANAGER_DIR/wg-manager.py"

# Criar serviço systemd para o daemon
cat > /etc/systemd/system/mikrogestor-wg-manager.service <<EOF
[Unit]
Description=MikroGestor WireGuard Manager Daemon
After=network.target wg-quick@wg0.service
Requires=wg-quick@wg0.service

[Service]
Type=simple
User=root
ExecStart=/usr/bin/python3 ${WG_MANAGER_DIR}/wg-manager.py
Restart=always
RestartSec=5
Environment=WG_INTERFACE=${WG_INTERFACE}
Environment=WG_MANAGER_PORT=${WG_MANAGER_PORT}
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable mikrogestor-wg-manager
systemctl start mikrogestor-wg-manager
sleep 2

# Verificar se o daemon iniciou
if systemctl is-active --quiet mikrogestor-wg-manager; then
    success "WireGuard Manager Daemon ativo em 127.0.0.1:${WG_MANAGER_PORT}"
else
    warn "Daemon falhou ao iniciar. Veja: journalctl -u mikrogestor-wg-manager -n 20"
fi

# ── Resumo Final ───────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════════════════════════╗"
echo "║              CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!             ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  Interface WireGuard : $WG_INTERFACE ($VPN_SERVER_IP)          ║"
echo "║  Porta WireGuard     : UDP $WG_PORT                         ║"
echo "║  WG Manager Daemon   : 127.0.0.1:$WG_MANAGER_PORT (localhost) ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  ADICIONE NO .env DO MIKROGESTOR:                            ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  VPS_WG_PUBLIC_KEY=$(cat $WG_DIR/public.key | cut -c1-30)...  ║"
echo -e "║  VPS_PUBLIC_IP=$(hostname -I | awk '{print $1}')                 ║"
echo "║  WG_MANAGER_SECRET=$(cat $WG_MANAGER_SECRET_FILE)  ║"
echo "║  WG_MANAGER_URL=http://127.0.0.1:51821             ║"
echo -e "╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}Chave pública completa (copie para VPS_WG_PUBLIC_KEY):${NC}"
echo ""
cat "$WG_DIR/public.key"
echo ""
echo -e "${CYAN}Secret do Manager (copie para WG_MANAGER_SECRET):${NC}"
echo ""
cat "$WG_MANAGER_SECRET_FILE"
echo ""
echo -e "${YELLOW}Para verificar o status: wg show${NC}"
echo -e "${YELLOW}Para ver logs do manager: journalctl -u mikrogestor-wg-manager -f${NC}"
echo ""