#!/usr/bin/env bash
# ==============================================================================
#  MIKROGESTOR — INSTALADOR AUTOMÁTICO WIREGUARD VPN (VPS / COOLIFY / RASPBERRY PI)
#  Instala e configura WireGuard + daemon de gerenciamento HTTP em 1 único comando.
#  Compatibilidade: Ubuntu 20.04+, Debian 11+, Raspberry Pi OS (ARM64 / ARMv7)
#  Uso: sudo bash setup-vps.sh
# ==============================================================================

set -euo pipefail

# ─── Cores e Formatação ───────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

log()     { echo -e "${CYAN}[VPN-SETUP]${NC} $1"; }
success() { echo -e "${GREEN}${BOLD}[✓ OK]${NC} $1"; }
warn()    { echo -e "${YELLOW}[AVISO]${NC} $1"; }
error()   { echo -e "${RED}${BOLD}[ERRO]${NC} $1"; exit 1; }

# ─── Verificação de Privilégios ───────────────────────────────────────────────
if [[ $EUID -ne 0 ]]; then
    error "Este script precisa ser executado como root. Use: sudo bash $0"
fi

# ─── Variáveis Globais ────────────────────────────────────────────────────────
WG_DIR="/etc/wireguard"
WG_INTERFACE="wg0"
WG_PORT=51820
VPN_SUBNET="10.8.0.0/24"
VPN_SERVER_IP="10.8.0.1"
WG_MANAGER_PORT=51821
WG_MANAGER_DIR="/opt/mikrogestor-wg-manager"
WG_MANAGER_SECRET_FILE="/etc/mikrogestor-wg.secret"

echo -e "${CYAN}${BOLD}"
echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║       MIKROGESTOR — INSTALADOR AUTOMATIZADO WIREGUARD VPN & COOLIFY       ║"
echo "║       Suporte: Linux VPS (x86_64) | Raspberry Pi (ARM64/ARMv7) | Docker   ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ─── 1. Instalação de Dependências ────────────────────────────────────────────
log "Passo 1/7: Instalando pacotes necessários..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq

# Instalação com suporte a Debian, Ubuntu e Raspberry Pi OS
apt-get install -y --no-install-recommends \
    wireguard \
    wireguard-tools \
    python3 \
    openssl \
    curl \
    iproute2 \
    iptables \
    ufw \
    ca-certificates

success "Dependências do WireGuard e do sistema instaladas com sucesso."

# ─── 2. Habilitação de IP Forwarding ──────────────────────────────────────────
log "Passo 2/7: Habilitando encaminhamento de pacotes IPv4 (Kernel IP Forwarding)..."
echo "net.ipv4.ip_forward=1" > /etc/sysctl.d/99-mikrogestor-vpn.conf
sysctl -p /etc/sysctl.d/99-mikrogestor-vpn.conf >/dev/null 2>&1 || true
success "IP Forwarding ativado no Kernel."

# ─── 3. Chaves Criptográficas Curve25519 ──────────────────────────────────────
log "Passo 3/7: Gerando chaves criptográficas WireGuard do Servidor..."
mkdir -p "$WG_DIR"
chmod 700 "$WG_DIR"

if [[ -f "$WG_DIR/private.key" && -f "$WG_DIR/public.key" ]]; then
    warn "Chaves WireGuard existentes detectadas. Mantendo par atual."
else
    wg genkey | tee "$WG_DIR/private.key" | wg pubkey > "$WG_DIR/public.key"
    chmod 600 "$WG_DIR/private.key"
fi

VPS_PRIVATE_KEY=$(cat "$WG_DIR/private.key")
VPS_PUBLIC_KEY=$(cat "$WG_DIR/public.key")
success "Par de chaves do servidor validado."

# ─── 4. Configuração da Interface wg0 ─────────────────────────────────────────
log "Passo 4/7: Criando /etc/wireguard/wg0.conf..."

cat > "$WG_DIR/$WG_INTERFACE.conf" <<EOF
[Interface]
Address = ${VPN_SERVER_IP}/24
ListenPort = ${WG_PORT}
PrivateKey = ${VPS_PRIVATE_KEY}

# Regras de roteamento e permissão de tráfego de controle VPN
PostUp   = iptables -A FORWARD -i %i -j ACCEPT; iptables -A FORWARD -o %i -j ACCEPT
PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT
EOF

chmod 600 "$WG_DIR/$WG_INTERFACE.conf"

# Reiniciar / Ativar interface WireGuard
systemctl enable wg-quick@$WG_INTERFACE >/dev/null 2>&1 || true
wg-quick down $WG_INTERFACE >/dev/null 2>&1 || true
wg-quick up $WG_INTERFACE
success "Interface WireGuard ${WG_INTERFACE} ativa em ${VPN_SERVER_IP}/24 (porta UDP ${WG_PORT})."

# ─── 5. Instalação do Daemon WireGuard Manager (Python) ───────────────────────
log "Passo 5/7: Instalando WireGuard Manager Daemon em ${WG_MANAGER_DIR}..."

mkdir -p "$WG_MANAGER_DIR"

# Token de autenticação HMAC/Header
if [[ ! -f "$WG_MANAGER_SECRET_FILE" ]]; then
    openssl rand -hex 32 > "$WG_MANAGER_SECRET_FILE"
    chmod 600 "$WG_MANAGER_SECRET_FILE"
fi
WG_MANAGER_SECRET=$(cat "$WG_MANAGER_SECRET_FILE")

# Escrever wg-manager.py via base64 para eliminar 100% dos erros de escape em bash
cat << 'EOF' | base64 -d > "$WG_MANAGER_DIR/wg-manager.py"
IyEvdXNyL2Jpbi9lbnYgcHl0aG9uMwppbXBvcnQgaHR0cC5zZXJ2ZXIsIGpzb24sIHN1YnByb2Nlc3MsIG9zLCBzeXMsIGxvZ2dpbmcsIGhtYWMKCmxvZ2dpbmcuYmFzaWNDb25maWcobGV2ZWw9bG9nZ2luZy5JTkZPLCBmb3JtYXQ9JyUoYXNjdGltZSlzIFtXRy1NR1JdICUobGV2ZWxuYW1lKXMgJShtZXNzYWdlKXMnKQpsb2cgPSBsb2dnaW5nLmdldExvZ2dlcihfX25hbWVfXykKCldHX0lOVEVSRkFDRSA9IG9zLmVudmlyb24uZ2V0KCdXR19JTlRFUkZBQ0UnLCAnd2cwJykKQklORF9IT1NUICAgID0gJzAuMC4wLjAnCkJJTkRfUE9SVCAgICA9IGludChvcy5lbnZpcm9uLmdldCgnV0dfTUFOQUdFUl9QT1JUJywgJzUxODIxJykpClNFQ1JFVF9GSUxFICA9ICcvZXRjL21pa3JvZ2VzdG9yLXdnLnNlY3JldCcKCmRlZiBsb2FkX3NlY3JldCgpOgogICAgdHJ5OgogICAgICAgIHdpdGggb3BlbihTRUNSRVRfRklMRSkgYXMgZjoKICAgICAgICAgICAgcmV0dXJuIGYucmVhZCgpLnN0cmlwKCkKICAgIGV4Y2VwdCBFeGNlcHRpb24gYXMgZToKICAgICAgICBsb2cuZXJyb3IoZidDYW5ub3QgcmVhZCBzZWNyZXQ6IHtlfScpCiAgICAgICAgc3lzLmV4aXQoMSkKClNFQ1JFVCA9IGxvYWRfc2VjcmV0KCkKCmRlZiBydW4oY21kKToKICAgIHJlc3VsdCA9IHN1YnByb2Nlc3MucnVuKGNtZCwgc2hlbGw9VHJ1ZSwgY2FwdHVyZV9vdXRwdXQ9VHJ1ZSwgdGV4dD1UcnVlKQogICAgcmV0dXJuIHJlc3VsdC5zdGRvdXQuc3RyaXAoKSwgcmVzdWx0LnN0ZGVyci5zdHJpcCgpLCByZXN1bHQucmV0dXJuY29kZQoKZGVmIHZlcmlmeV9zZWNyZXQoaGVhZGVycyk6CiAgICBhdXRoID0gaGVhZGVycy5nZXQoJ1gtV0ctU2VjcmV0JywgJycpCiAgICByZXR1cm4gaG1hYy5jb21wYXJlX2RpZ2VzdChhdXRoLCBTRUNSRVQpCgpjbGFzcyBXR0hhbmRsZXIoaHR0cC5zZXJ2ZXIuQmFzZUhUVFBSZXF1ZXN0SGFuZGxlcik6CiAgICBkZWYgbG9nX21lc3NhZ2Uoc2VsZiwgZm9ybWF0LCAqYXJncyk6CiAgICAgICAgbG9nLmluZm8oZid7c2VsZi5jbGllbnRfYWRkcmVzc1swXX0gLSB7Zm9ybWF0ICUgYXJnc30nKQoKICAgIGRlZiBzZW5kX2pzb24oc2VsZiwgY29kZSwgZGF0YSk6CiAgICAgICAgYm9keSA9IGpzb24uZHVtcHMoZGF0YSkuZW5jb2RlKCkKICAgICAgICBzZWxmLnNlbmRfcmVzcG9uc2UoY29kZSkKICAgICAgICBzZWxmLnNlbmRfaGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpCiAgICAgICAgc2VsZi5zZW5kX2hlYWRlcignQ29udGVudC1MZW5ndGgnLCBsZW4oYm9keSkpCiAgICAgICAgc2VsZi5lbmRfaGVhZGVycygpCiAgICAgICAgc2VsZi53ZmlsZS53cml0ZShib2R5KQoKICAgIGRlZiByZWFkX2JvZHkoc2VsZik6CiAgICAgICAgbGVuZ3RoID0gaW50KHNlbGYuaGVhZGVycy5nZXQoJ0NvbnRlbnQtTGVuZ3RoJywgMCkpCiAgICAgICAgcmV0dXJuIGpzb24ubG9hZHMoc2VsZi5yZmlsZS5yZWFkKGxlbmd0aCkpIGlmIGxlbmd0aCBlbHNlIHt9CgogICAgZGVmIGRvX0dFVChzZWxmKToKICAgICAgICBpZiBub3QgdmVyaWZ5X3NlY3JldChzZWxmLmhlYWRlcnMpOgogICAgICAgICAgICByZXR1cm4gc2VsZi5zZW5kX2pzb24oNDAxLCB7J2Vycm9yJzogJ1VuYXV0aG9yaXplZCd9KQogICAgICAgIGlmIHNlbGYucGF0aCA9PSAnL2hlYWx0aCc6CiAgICAgICAgICAgIHJldHVybiBzZWxmLnNlbmRfanNvbigyMDAsIHsnb2snOiBUcnVlfSkKICAgICAgICBpZiBzZWxmLnBhdGggPT0gJy9zdGF0dXMnOgogICAgICAgICAgICBzdGRvdXQsIHN0ZGVyciwgcmMgPSBydW4oZid3ZyBzaG93IHtXR19JTlRFUkZBQ0V9IGR1bXAnKQogICAgICAgICAgICBpZiByYyAhPSAwOgogICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuc2VuZF9qc29uKDUwMCwgeydlcnJvcic6IHN0ZGVycn0pCiAgICAgICAgICAgIGxpbmVzID0gW2wgZm9yIGwgaW4gc3Rkb3V0LnNwbGl0bGluZXMoKSBpZiBsLnN0cmlwKCldCiAgICAgICAgICAgIHBlZXJzID0gW10KICAgICAgICAgICAgZm9yIGxpbmUgaW4gbGluZXNbMTpdOgogICAgICAgICAgICAgICAgcGFydHMgPSBsaW5lLnNwbGl0KCcJJykKICAgICAgICAgICAgICAgIGlmIGxlbihwYXJ0cykgPCA4OgogICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlCiAgICAgICAgICAgICAgICBwdWJfa2V5LCBfLCBlbmRwb2ludCwgYWxsb3dlZF9pcHMsIGxhc3RfaHMsIHJ4LCB0eCwgXyA9IHBhcnRzWzo4XQogICAgICAgICAgICAgICAgcGVlcnMuYXBwZW5kKHsKICAgICAgICAgICAgICAgICAgICAncHVibGljS2V5JzogcHViX2tleSwKICAgICAgICAgICAgICAgICAgICAnZW5kcG9pbnQnOiBlbmRwb2ludCBpZiBlbmRwb2ludCAhPSAnKG5vbmUpJyBlbHNlIE5vbmUsCiAgICAgICAgICAgICAgICAgICAgJ2FsbG93ZWRJcHMnOiBhbGxvd2VkX2lwcywKICAgICAgICAgICAgICAgICAgICAnbGFzdEhhbmRzaGFrZSc6IGludChsYXN0X2hzKSwKICAgICAgICAgICAgICAgICAgICAndHJhbnNmZXJSeCc6IGludChyeCksCiAgICAgICAgICAgICAgICAgICAgJ3RyYW5zZmVyVHgnOiBpbnQodHgpLAogICAgICAgICAgICAgICAgfSkKICAgICAgICAgICAgcmV0dXJuIHNlbGYuc2VuZF9qc29uKDIwMCwgeydpbnRlcmZhY2UnOiBXR19JTlRFUkZBQ0UsICdwZWVycyc6IHBlZXJzfSkKICAgICAgICByZXR1cm4gc2VsZi5zZW5kX2pzb24oNDA0LCB7J2Vycm9yJzogJ05vdCBmb3VuZCd9KQoKICAgIGRlZiBkb19QT1NUKHNlbGYpOgogICAgICAgIGlmIG5vdCB2ZXJpZnlfc2VjcmV0KHNlbGYuaGVhZGVycyk6CiAgICAgICAgICAgIHJldHVybiBzZWxmLnNlbmRfanNvbig0MDEsIHsnZXJyb3InOiAnVW5hdXRob3JpemVkJ30pCiAgICAgICAgYm9keSA9IHNlbGYucmVhZF9ib2R5KCkKICAgICAgICBpZiBzZWxmLnBhdGggPT0gJy9wZWVyL2FkZCc6CiAgICAgICAgICAgIHB1Yl9rZXkgPSBib2R5LmdldCgncHVibGljS2V5JywgJycpLnN0cmlwKCkKICAgICAgICAgICAgdnBuX2lwICA9IGJvZHkuZ2V0KCd2cG5JcCcsICcnKS5zdHJpcCgpCiAgICAgICAgICAgIGlmIG5vdCBwdWJfa2V5IG9yIG5vdCB2cG5faXA6CiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5zZW5kX2pzb24oNDAwLCB7J2Vycm9yJzogJ3B1YmxpY0tleSBhbmQgdnBuSXAgcmVxdWlyZWQnfSkKICAgICAgICAgICAgXywgZXJyLCByYyA9IHJ1bihmJ3dnIHNldCB7V0dfSU5URVJGQUNFfSBwZWVyICJ7cHViX2tleX0iIGFsbG93ZWQtaXBzIHt2cG5faXB9LzMyJykKICAgICAgICAgICAgaWYgcmMgIT0gMDoKICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLnNlbmRfanNvbig1MDAsIHsnZXJyb3InOiBlcnJ9KQogICAgICAgICAgICBydW4oZid3Zy1xdWljayBzYXZlIHtXR19JTlRFUkZBQ0V9JykKICAgICAgICAgICAgcmV0dXJuIHNlbGYuc2VuZF9qc29uKDIwMCwgeydvayc6IFRydWUsICd2cG5JcCc6IHZwbl9pcH0pCiAgICAgICAgaWYgc2VsZi5wYXRoID09ICcvcGVlci9yZW1vdmUnOgogICAgICAgICAgICBwdWJfa2V5ID0gYm9keS5nZXQoJ3B1YmxpY0tleScsICcnKS5zdHJpcCgpCiAgICAgICAgICAgIGlmIG5vdCBwdWJfa2V5OgogICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuc2VuZF9qc29uKDQwMCwgeydlcnJvcic6ICdwdWJsaWNLZXkgcmVxdWlyZWQnfSkKICAgICAgICAgICAgcnVuKGYnd2cgc2V0IHtXR19JTlRFUkZBQ0V9IHBlZXIgIntwdWJfa2V5fSIgcmVtb3ZlJykKICAgICAgICAgICAgcnVuKGYnd2ctcXVpY2sgc2F2ZSB7V0dfSU5URVJGQUNFfScpCiAgICAgICAgICAgIHJldHVybiBzZWxmLnNlbmRfanNvbigyMDAsIHsnb2snOiBUcnVlfSkKICAgICAgICByZXR1cm4gc2VsZi5zZW5kX2pzb24oNDA0LCB7J2Vycm9yJzogJ05vdCBmb3VuZCd9KQoKaWYgX19uYW1lX18gPT0gJ19fbWFpbl9fJzoKICAgIHNlcnZlciA9IGh0dHAuc2VydmVyLkhUVFBTZXJ2ZXIoKEJJTkRfSE9TVCwgQklORF9QT1JUKSwgV0dIYW5kbGVyKQogICAgbG9nLmluZm8oZidXRyBNYW5hZ2VyIGxpc3RlbmluZyBvbiB7QklORF9IT1NUfTp7QklORF9QT1JUfScpCiAgICBzZXJ2ZXIuc2VydmVfZm9yZXZlcigpCg==
EOF

chmod +x "$WG_MANAGER_DIR/wg-manager.py"

# Criar Serviço Systemd
cat > /etc/systemd/system/mikrogestor-wg-manager.service << EOF
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

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable mikrogestor-wg-manager >/dev/null 2>&1
systemctl restart mikrogestor-wg-manager
success "Daemon wg-manager ativo em 0.0.0.0:${WG_MANAGER_PORT} (serviço systemd habilitado)."

# ─── 6. Configuração do Firewall (UFW / Iptables) ─────────────────────────────
log "Passo 6/7: Configurando regras de firewall..."

if command -v ufw >/dev/null 2>&1; then
    # Porta UDP pública para o túnel
    ufw allow ${WG_PORT}/udp comment "MikroGestor WireGuard UDP" >/dev/null 2>&1 || true
    # Porta TCP do daemon liberada estritamente para subnets Docker (RFC 1918)
    ufw allow from 172.16.0.0/12 to any port ${WG_MANAGER_PORT} proto tcp comment "MikroGestor Docker to WG-Manager" >/dev/null 2>&1 || true
    ufw allow from 10.0.0.0/8 to any port ${WG_MANAGER_PORT} proto tcp comment "MikroGestor Local Subnet" >/dev/null 2>&1 || true
    ufw reload >/dev/null 2>&1 || true
    success "Firewall UFW ajustado: porta ${WG_PORT}/udp liberada e porta ${WG_MANAGER_PORT}/tcp liberada para Docker."
fi

# ─── 7. Auto-Detecção de IP Público e Testes de Integridade ───────────────────
log "Passo 7/7: Executando auto-testes de integridade..."

# Detecção resiliente de IP Público
PUBLIC_IP=$(curl -s4 --max-time 3 https://api.ipify.org || \
            curl -s4 --max-time 3 https://icanhazip.com || \
            curl -s4 --max-time 3 https://ifconfig.me || \
            hostname -I | awk '{print $1}')
PUBLIC_IP=$(echo "$PUBLIC_IP" | tr -d '[:space:]')

# Teste local do daemon
TEST_HTTP=$(curl -s -o /dev/null -w "%{http_code}" -H "X-WG-Secret: ${WG_MANAGER_SECRET}" "http://127.0.0.1:${WG_MANAGER_PORT}/health" || echo "000")
if [[ "$TEST_HTTP" == "200" ]]; then
    success "Auto-teste HTTP local em 127.0.0.1:${WG_MANAGER_PORT} aprovado (HTTP 200 OK)."
else
    warn "Daemon retornou HTTP ${TEST_HTTP}. Verifique 'journalctl -u mikrogestor-wg-manager -n 20'."
fi

# Se houver interface docker0 (Coolify/Docker presente), testar IP da ponte
if ip addr show docker0 >/dev/null 2>&1; then
    DOCKER_GW=$(ip -4 addr show docker0 | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | head -n1 || echo "172.17.0.1")
    TEST_DOCKER=$(curl -s -o /dev/null -w "%{http_code}" -H "X-WG-Secret: ${WG_MANAGER_SECRET}" "http://${DOCKER_GW}:${WG_MANAGER_PORT}/health" || echo "000")
    if [[ "$TEST_DOCKER" == "200" ]]; then
        success "Comunicação Docker-Host via ${DOCKER_GW}:${WG_MANAGER_PORT} aprovada (HTTP 200 OK)."
    else
        warn "Ponte Docker ${DOCKER_GW} ainda não acessível diretamente (verifique regras de rede)."
    fi
else
    DOCKER_GW="172.17.0.1"
fi

# ─── Resumo e Variáveis Prontas para Coolify ──────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}═══════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}      🎉 WIREGUARD VPN & DAEMON INSTALADOS COM SUCESSO TOTAL!              ${NC}"
echo -e "${GREEN}${BOLD}═══════════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "Copie e cole estas variáveis no seu painel ${CYAN}${BOLD}Coolify → Environment Variables${NC}:"
echo ""
echo -e "${YELLOW}${BOLD}# --- MIKROGESTOR WIREGUARD VPN CONFIG ---"
echo "VPS_WG_PUBLIC_KEY=\"${VPS_PUBLIC_KEY}\""
echo "VPS_PUBLIC_IP=\"${PUBLIC_IP}\""
echo "WG_MANAGER_SECRET=\"${WG_MANAGER_SECRET}\""
echo "WG_MANAGER_URL=\"http://${DOCKER_GW}:${WG_MANAGER_PORT}\""
echo -e "# ----------------------------------------${NC}"
echo ""
echo -e "Status da Interface WireGuard:"
wg show
echo ""
echo -e "${CYAN}Comando para monitorar logs em tempo real:${NC} journalctl -u mikrogestor-wg-manager -f"
echo -e "${GREEN}${BOLD}Pronto para conectar qualquer MikroTik sem IP público!${NC}"