#!/usr/bin/env bash
# ==============================================================================
#  MIKROGESTOR — VPN HEALTH CHECK
#  Verifica se o WireGuard e o Manager estão funcionando corretamente
#  Uso: bash vpn/check-vpn.sh
# ==============================================================================

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; NC='\033[0m'
CYAN='\033[0;36m'; BOLD='\033[1m'

ok()   { echo -e "${GREEN}[✓]${NC} $1"; }
fail() { echo -e "${RED}[✗]${NC} $1"; FAILED=1; }
info() { echo -e "${CYAN}[i]${NC} $1"; }

FAILED=0
SECRET_FILE="/etc/mikrogestor-wg.secret"
MANAGER_PORT=51821

echo -e "${CYAN}${BOLD}── MikroGestor VPN Health Check ─────────────────────${NC}"

# 1. WireGuard instalado
if command -v wg &>/dev/null; then
    ok "WireGuard instalado ($(wg --version 2>&1 | head -1))"
else
    fail "WireGuard NÃO instalado"
fi

# 2. Interface wg0 ativa
if wg show wg0 &>/dev/null; then
    ok "Interface wg0 ativa"
    WG_IP=$(ip addr show wg0 2>/dev/null | grep 'inet ' | awk '{print $2}')
    info "IP na VPN: $WG_IP"
else
    fail "Interface wg0 não encontrada"
fi

# 3. Porta UDP 51820 ouvindo
if ss -ulnp | grep -q ':51820'; then
    ok "Porta UDP 51820 ouvindo (WireGuard)"
else
    fail "Porta UDP 51820 NÃO ouvindo"
fi

# 4. IP Forwarding
if [[ "$(cat /proc/sys/net/ipv4/ip_forward 2>/dev/null)" == "1" ]]; then
    ok "IP Forwarding ativado"
else
    fail "IP Forwarding DESATIVADO — execute: sysctl -w net.ipv4.ip_forward=1"
fi

# 5. WireGuard systemd service
if systemctl is-active --quiet wg-quick@wg0; then
    ok "Serviço wg-quick@wg0 ativo"
else
    fail "Serviço wg-quick@wg0 inativo"
fi

# 6. WG Manager daemon
if systemctl is-active --quiet mikrogestor-wg-manager; then
    ok "WG Manager Daemon ativo"
else
    fail "WG Manager Daemon inativo"
fi

# 7. Manager HTTP respondendo
if [[ -f "$SECRET_FILE" ]]; then
    SECRET=$(cat "$SECRET_FILE")
    RESPONSE=$(curl -sf -H "X-WG-Secret: $SECRET" "http://127.0.0.1:$MANAGER_PORT/health" 2>/dev/null || echo "FAIL")
    if [[ "$RESPONSE" == *"true"* ]]; then
        ok "WG Manager HTTP respondendo em 127.0.0.1:$MANAGER_PORT"
    else
        fail "WG Manager HTTP não respondendo — logs: journalctl -u mikrogestor-wg-manager -n 20"
    fi
else
    fail "Secret do Manager não encontrado em $SECRET_FILE"
fi

# 8. Peers conectados
PEER_COUNT=$(wg show wg0 peers 2>/dev/null | wc -l)
info "Peers WireGuard configurados: $PEER_COUNT"

# Listar peers com status
if [[ $PEER_COUNT -gt 0 ]]; then
    echo ""
    echo -e "${CYAN}── Peers Ativos ─────────────────────────────────────${NC}"
    wg show wg0 dump 2>/dev/null | tail -n +2 | while IFS=$'\t' read -r pubkey _ endpoint allowed_ips last_hs rx tx _; do
        AGE=$(( ($(date +%s) - last_hs) / 60 ))
        STATUS="🔴 Offline (${AGE}m atrás)"
        [[ $AGE -lt 3 ]] && STATUS="🟢 Online (${AGE}m atrás)"
        echo "  ${allowed_ips} → ${STATUS}"
    done
fi

echo ""
echo -e "${CYAN}── Chave Pública do Servidor ─────────────────────────${NC}"
if [[ -f "/etc/wireguard/public.key" ]]; then
    cat /etc/wireguard/public.key
    ok "Copie para VPS_WG_PUBLIC_KEY no .env do MikroGestor"
fi

echo ""
if [[ $FAILED -eq 0 ]]; then
    echo -e "${GREEN}${BOLD}✅ Todos os checks passaram! VPN pronta para uso.${NC}"
else
    echo -e "${RED}${BOLD}❌ $FAILED check(s) falharam. Corrija os itens acima.${NC}"
    echo -e "${YELLOW}   Execute novamente para re-verificar.${NC}"
fi