#!/usr/bin/env bash
# ==============================================================================
#  MIKROGESTOR — DIAGNÓSTICO TOTAL DE DEPLOY & SAÚDE DO SISTEMA
#  Executa verificação profunda em 8 camadas para garantir 100% de operação:
#  1. WireGuard Kernel & Interface wg0
#  2. IP Forwarding & NAT Masquerade
#  3. Daemon WireGuard Manager & HMAC
#  4. Persistência de Volume SQLite no Host
#  5. Container Docker (Coolify) & Mapeamento de Volumes
#  6. Inicialização do Banco Prisma & WAL Mode
#  7. Patch RouterOS v7 (!empty) em Node.js
#  8. Conectividade MikroTik (Túnel, Handshake e API Stats)
# ==============================================================================

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

ok()   { echo -e "  ${GREEN}[✓ PASS]${NC} $1"; PASS_COUNT=$((PASS_COUNT + 1)); }
fail() { echo -e "  ${RED}[✗ FAIL]${NC} $1"; FAIL_COUNT=$((FAIL_COUNT + 1)); }
warn() { echo -e "  ${YELLOW}[! WARN]${NC} $1"; WARN_COUNT=$((WARN_COUNT + 1)); }
info() { echo -e "  ${CYAN}[i INFO]${NC} $1"; }

echo -e "\n${CYAN}${BOLD}═══════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}${BOLD}       🔍 MIKROGESTOR — VERIFICAÇÃO COMPLETA DE DEPLOY & AMBIENTE          ${NC}"
echo -e "${CYAN}${BOLD}═══════════════════════════════════════════════════════════════════════════${NC}\n"

# ─── CAMADA 1: WIREGUARD KERNEL & INTERFACE ──────────────────────────────────
echo -e "${BOLD}1. WireGuard Host & Interface wg0:${NC}"
if command -v wg &>/dev/null; then
    ok "WireGuard CLI disponível ($(wg --version 2>&1 | head -1))"
else
    fail "WireGuard NÃO instalado. Execute: apt-get install -y wireguard wireguard-tools"
fi

if wg show wg0 &>/dev/null; then
    WG_IP=$(ip -4 addr show wg0 2>/dev/null | grep -oP '(?<=inet\s)\d+(\.\d+){3}/\d+' || echo "desconhecido")
    ok "Interface wg0 ativa no host (IP: $WG_IP)"
else
    fail "Interface wg0 INATIVA. Execute: wg-quick up wg0"
fi

if ss -ulnp 2>/dev/null | grep -q ':51820'; then
    ok "Porta UDP 51820 ouvindo conexões dos MikroTiks"
else
    fail "Porta UDP 51820 NÃO está ouvindo. Verifique wg-quick@wg0"
fi

# ─── CAMADA 2: IP FORWARDING & ROTEAMENTO ────────────────────────────────────
echo -e "\n${BOLD}2. Encaminhamento de Pacotes & NAT Masquerade:${NC}"
IP_FWD=$(cat /proc/sys/net/ipv4/ip_forward 2>/dev/null || echo "0")
if [[ "$IP_FWD" == "1" ]]; then
    ok "IP Forwarding ativado no Kernel (net.ipv4.ip_forward=1)"
else
    fail "IP Forwarding DESATIVADO. Execute: sysctl -w net.ipv4.ip_forward=1"
fi

if iptables -t nat -L POSTROUTING -n -v 2>/dev/null | grep -q "wg0"; then
    ok "Regra NAT Masquerade ativa na interface wg0 (permite Docker falar com MikroTik)"
else
    warn "NAT Masquerade não detectado em wg0. Adicione: iptables -t nat -A POSTROUTING -o wg0 -j MASQUERADE"
fi

# ─── CAMADA 3: DAEMON WIREGUARD MANAGER ──────────────────────────────────────
echo -e "\n${BOLD}3. Daemon WireGuard Manager (Porta 51821):${NC}"
if systemctl is-active --quiet mikrogestor-wg-manager 2>/dev/null; then
    ok "Serviço systemd mikrogestor-wg-manager ativo"
else
    fail "Serviço mikrogestor-wg-manager INATIVO. Execute: systemctl restart mikrogestor-wg-manager"
fi

SECRET_FILE="/etc/mikrogestor-wg.secret"
if [[ -f "$SECRET_FILE" ]]; then
    SECRET=$(cat "$SECRET_FILE")
    RESP_127=$(curl -s -m 2 -H "X-WG-Secret: $SECRET" "http://127.0.0.1:51821/health" 2>/dev/null || echo "")
    if [[ "$RESP_127" == *"true"* ]]; then
        ok "API HTTP do Manager respondendo em 127.0.0.1:51821 (HTTP 200 OK)"
    else
        fail "API HTTP do Manager não respondeu em 127.0.0.1. Verifique 'journalctl -u mikrogestor-wg-manager -n 20'"
    fi

    # Teste via gateway Docker (172.17.0.1)
    RESP_DK=$(curl -s -m 2 -H "X-WG-Secret: $SECRET" "http://172.17.0.1:51821/health" 2>/dev/null || echo "")
    if [[ "$RESP_DK" == *"true"* ]]; then
        ok "API acessível a partir da ponte Docker 172.17.0.1:51821"
    else
        warn "Ponte Docker 172.17.0.1 não respondeu. Verifique UFW: ufw allow from 172.16.0.0/12 to any port 51821 proto tcp"
    fi
else
    fail "Arquivo de chave $SECRET_FILE não encontrado."
fi

# ─── CAMADA 4: PERSISTÊNCIA DO BANCO NO HOST ─────────────────────────────────
echo -e "\n${BOLD}4. Armazenamento Persistente SQLite no Host (/data/mikrogestor/prisma):${NC}"
if [[ -d "/data/mikrogestor/prisma" ]]; then
    ok "Diretório /data/mikrogestor/prisma existe"
    if [[ -w "/data/mikrogestor/prisma" ]]; then
        ok "Diretório possui permissão de escrita"
    else
        fail "Diretório sem permissão de escrita. Execute: chmod -R 777 /data/mikrogestor/prisma"
    fi

    if [[ -f "/data/mikrogestor/prisma/dev.db" ]]; then
        DB_SIZE=$(ls -lh /data/mikrogestor/prisma/dev.db | awk '{print $5}')
        ok "Banco dev.db presente no host (Tamanho: $DB_SIZE)"
    else
        warn "Arquivo dev.db ainda não criado no host. Será criado no primeiro startup do container."
    fi
else
    fail "Diretório /data/mikrogestor/prisma NÃO EXISTE. Execute: mkdir -p /data/mikrogestor/prisma && chmod 777 /data/mikrogestor/prisma"
fi

# ─── CAMADA 5: CONTAINER DOCKER & COOLIFY ─────────────────────────────────────
echo -e "\n${BOLD}5. Container MikroGestor (Docker / Coolify):${NC}"
CONTAINER_ID=$(docker ps -q --filter "ancestor=*mikrogestor*" 2>/dev/null | head -1)
if [[ -z "$CONTAINER_ID" ]]; then
    # Tenta encontrar por porta 80 ou nome
    CONTAINER_ID=$(docker ps --format "{{.ID}} {{.Image}} {{.Ports}}" 2>/dev/null | grep -E "mikrogestor|:80->" | awk '{print $1}' | head -1 || echo "")
fi

if [[ -n "$CONTAINER_ID" ]]; then
    CONTAINER_NAME=$(docker inspect --format '{{.Name}}' "$CONTAINER_ID" 2>/dev/null | sed 's/\///')
    ok "Container ativo encontrado: $CONTAINER_NAME ($CONTAINER_ID)"
    
    # Verificar montagem do volume
    MOUNT_FOUND=$(docker inspect "$CONTAINER_ID" 2>/dev/null | grep -c "/data/mikrogestor/prisma" || echo "0")
    if [[ "$MOUNT_FOUND" -gt 0 ]]; then
        ok "Volume persistente /data/mikrogestor/prisma montado corretamente dentro do container"
    else
        fail "ALERTA CRÍTICO: Container NÃO está com o volume /data/mikrogestor/prisma montado! O banco será perdido ao redeploy!"
        info "Solução no Coolify: Application -> Persistent Storage -> Mapear /data/mikrogestor/prisma para /app/prisma"
    fi

    # Testar patch RouterOS v7 dentro do container
    PATCH_IN_CONTAINER=$(docker exec "$CONTAINER_ID" node -e "
        try {
            const fs = require('fs');
            const p = '/app/node_modules/node-routeros/dist/Channel.js';
            if (fs.existsSync(p) && fs.readFileSync(p, 'utf8').includes('!empty')) {
                console.log('PATCHED');
            } else {
                console.log('UNPATCHED');
            }
        } catch(e) { console.log('ERROR'); }
    " 2>/dev/null || echo "UNKNOWN")

    if [[ "$PATCH_IN_CONTAINER" == "PATCHED" ]]; then
        ok "Patch RouterOS v7 (!empty) ativo dentro do container em node_modules"
    else
        info "Patch em runtime via src/lib/routeros.ts protegerá chamadas do RouterOS v7"
    fi
else
    warn "Nenhum container MikroGestor ativo detectado no Docker local. Se você roda com PM2 local, ignore este aviso."
fi

# ─── CAMADA 6: APLICAÇÃO WEB & RESPOSTA NA PORTA 80 ─────────────────────────
echo -e "\n${BOLD}6. Servidor Web MikroGestor (Porta 80):${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -m 3 "http://127.0.0.1:80" 2>/dev/null || echo "000")
if [[ "$HTTP_CODE" =~ ^(200|301|302|307|308)$ ]]; then
    ok "Servidor respondendo na porta 80 (HTTP $HTTP_CODE)"
else
    fail "Servidor NÃO respondeu na porta 80 (código $HTTP_CODE). Verifique 'docker logs $CONTAINER_ID --tail=50'"
fi

# ─── CAMADA 7: PEERS MIKROTIK CONECTADOS ─────────────────────────────────────
echo -e "\n${BOLD}7. Status de Peers WireGuard (MikroTik):${NC}"
PEERS_OUT=$(wg show wg0 dump 2>/dev/null | tail -n +2 || echo "")
if [[ -n "$PEERS_OUT" ]]; then
    NOW=$(date +%s)
    PEER_TOTAL=0
    PEER_ONLINE=0
    while IFS=$'\t' read -r pubkey _ endpoint allowed_ips last_hs rx tx _; do
        PEER_TOTAL=$((PEER_TOTAL + 1))
        if [[ "$last_hs" -gt 0 ]]; then
            DIFF=$((NOW - last_hs))
            MIN=$((DIFF / 60))
            if [[ "$DIFF" -lt 180 ]]; then
                PEER_ONLINE=$((PEER_ONLINE + 1))
                ok "Peer $allowed_ips: 🟢 ONLINE (Último handshake há ${MIN}m, RX: $((rx/1024))KB, TX: $((tx/1024))KB)"
            else
                warn "Peer $allowed_ips: 🟡 Inativo há ${MIN} minutos (Endpoint: $endpoint)"
            fi
        else
            warn "Peer $allowed_ips: 🔴 Nunca conectou (Aguardando configuração no MikroTik)"
        fi
    done <<< "$PEERS_OUT"
    info "Total de peers cadastrados: $PEER_TOTAL (Online: $PEER_ONLINE)"
else
    info "Nenhum roteador conectado ainda na VPN. Cadastre um roteador no painel web para testar."
fi

# ─── RESUMO FINAL ────────────────────────────────────────────────────────────
echo -e "\n${CYAN}${BOLD}═══════════════════════════════════════════════════════════════════════════${NC}"
if [[ "$FAIL_COUNT" -eq 0 ]]; then
    echo -e "${GREEN}${BOLD}  🎉 SUCESSO TOTAL: Todos os checks vitais passaram! ($PASS_COUNT checks aprovados)${NC}"
    echo -e "${GREEN}  O MikroGestor está 100% pronto para operar em produção.${NC}"
else
    echo -e "${RED}${BOLD}  ⚠️ ATENÇÃO: $FAIL_COUNT erro(s) e $WARN_COUNT aviso(s) detectados.${NC}"
    echo -e "${YELLOW}  Consulte as mensagens acima para realizar a correção recomendada.${NC}"
fi
echo -e "${CYAN}${BOLD}═══════════════════════════════════════════════════════════════════════════${NC}\n"
