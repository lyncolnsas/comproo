#!/usr/bin/env bash

# ==============================================================================
#  MIKROGESTOR VOUCHER — SCRIPT DE INSTALAÇÃO AUTOMÁTICA
#  Otimizado para: Raspberry Pi (Pi 3, Pi 4, Pi 5, Zero 2W - ARM64 / ARMv7)
#                  e Servidores Linux (Debian, Ubuntu, DietPi x86_64)
# ==============================================================================

set -e

# Cores para o terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Configurações do Projeto
APP_NAME="mikrogestor-voucher"
REPO_URL="https://github.com/lyncolnsas/mikrogestor-voucher22.git"
DEFAULT_INSTALL_DIR="/opt/mikrogestor-voucher"
PORT=80

print_banner() {
    clear
    echo -e "${CYAN}${BOLD}"
    echo "================================================================================"
    echo "          __  __ _ _               ____           _             "
    echo "         |  \/  (_) | ___ __ ___  / ___| ___  ___| |_ ___  _ __ "
    echo "         | |\/| | | |/ / '__/ _ \| |  _ / _ \/ __| __/ _ \| '__|"
    echo "         | |  | | |   <| | | (_) | |_| |  __/\__ \ || (_) | |   "
    echo "         |_|  |_|_|_|\_\_|  \___/ \____|\___||___/\__\___/|_|   "
    echo "                                                                "
    echo "                SISTEMA DE GESTÃO DE VOUCHERS & HOTSPOT         "
    echo "             Instalador Oficial Raspberry Pi & Linux Server     "
    echo "================================================================================"
    echo -e "${NC}"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}${BOLD}[SUCESSO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[AVISO]${NC} $1"
}

log_error() {
    echo -e "${RED}${BOLD}[ERRO]${NC} $1"
}

# 1. Checagem de privilégios de ROOT
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_warn "O instalador precisa de privilégios de superusuário (root)."
        echo -e "Executando via ${BOLD}sudo${NC}..."
        exec sudo bash "$0" "$@"
        exit 1
    fi
}

# 2. Identificação da arquitetura do sistema
detect_system() {
    ARCH=$(uname -m)
    log_info "Detectando arquitetura do sistema: ${BOLD}$ARCH${NC}"

    case "$ARCH" in
        x86_64)
            log_info "Plataforma: Servidor Linux PC x86_64"
            ;;
        aarch64|arm64)
            log_info "Plataforma: Raspberry Pi (ARM 64-bit) / ARM64 Server"
            ;;
        armv7l|armv6l)
            log_info "Plataforma: Raspberry Pi 32-bit (ARMv7 / ARMv6)"
            log_warn "Nota: Sistemas 64-bit são recomendados para Raspberry Pi 3/4/5."
            ;;
        *)
            log_warn "Arquitetura $ARCH detectada. Prosseguindo com instalação compatível..."
            ;;
    esac
}

# 3. Otimização de Memória & Configuração de SWAP (Essencial para Raspberry Pi)
configure_swap() {
    log_info "Auditando capacidade de memória RAM e SWAP para build seguro..."
    
    RAM_KB=$(grep MemTotal /proc/meminfo 2>/dev/null | awk '{print $2}' || echo "1048576")
    SWAP_KB=$(grep SwapTotal /proc/meminfo 2>/dev/null | awk '{print $2}' || echo "0")
    TOTAL_MEM_MB=$(( (RAM_KB + SWAP_KB) / 1024 ))

    log_info "Memória total combinada (RAM + Swap): ${BOLD}${TOTAL_MEM_MB} MB${NC}"

    # O Next.js requer pelo menos 3GB de memória virtual para o build sem sofrer OOM Kill
    if [ "$TOTAL_MEM_MB" -lt 3200 ]; then
        log_warn "Memória combinada baixa (< 3.2 GB). Configurando SWAP de proteção para o build..."
        
        # Caso Raspberry Pi OS com dphys-swapfile
        if [ -f /etc/dphys-swapfile ] && command -v dphys-swapfile > /dev/null 2>&1; then
            CURRENT_SWAP=$(grep "^CONF_SWAPSIZE=" /etc/dphys-swapfile | cut -d'=' -f2 || echo "100")
            if [ "$CURRENT_SWAP" -lt 2048 ]; then
                log_info "Aumentando dphys-swapfile para 2048 MB..."
                dphys-swapfile swapoff > /dev/null 2>&1 || true
                sed -i 's/^CONF_SWAPSIZE=.*/CONF_SWAPSIZE=2048/' /etc/dphys-swapfile
                dphys-swapfile setup > /dev/null 2>&1 || true
                dphys-swapfile swapon > /dev/null 2>&1 || true
                log_success "Swap aumentado via dphys-swapfile para 2GB."
            fi
        # Caso padrão Debian / Linux com /swapfile
        elif [ ! -f /swapfile ]; then
            log_info "Criando arquivo de SWAP seguro de 2GB (/swapfile)..."
            fallocate -l 2G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=2048 status=none
            chmod 600 /swapfile
            mkswap /swapfile > /dev/null 2>&1
            swapon /swapfile > /dev/null 2>&1
            if ! grep -q "/swapfile" /etc/fstab; then
                echo "/swapfile none swap sw 0 0" >> /etc/fstab
            fi
            log_success "Arquivo /swapfile de 2GB provisionado e ativado!"
        fi
    else
        log_success "Memória e SWAP suficientes para compilação do Next.js."
    fi
}

# 4. Detecção de Conflitos de Porta 80 (Pi-hole, Lighttpd, Apache, etc.)
check_port_conflicts() {
    log_info "Verificando disponibilidade da porta $PORT..."
    OCCUPIED_PID=$(lsof -i :$PORT -sTCP:LISTEN -t 2>/dev/null | head -n 1 || true)
    
    if [ -n "$OCCUPIED_PID" ]; then
        PROC_NAME=$(ps -p "$OCCUPIED_PID" -o comm= 2>/dev/null || echo "Desconhecido")
        log_warn "A porta $PORT já está ocupada por: ${BOLD}$PROC_NAME (PID: $OCCUPIED_PID)${NC}"
        if [ "$PROC_NAME" = "lighttpd" ] || [ "$PROC_NAME" = "pihole-FTL" ] || [ "$PROC_NAME" = "apache2" ] || [ "$PROC_NAME" = "nginx" ]; then
            log_warn "No Raspberry Pi, isso frequentemente indica a presença de Pi-hole ou servidor web."
            log_warn "Recomendamos desativar o serviço ou mudar a porta do Pi-hole se desejar usar a porta 80 para o MikroGestor."
        fi
    else
        log_success "Porta $PORT livre e disponível!"
    fi
}

# 5. Instalação de Pacotes Essenciais do Sistema
install_system_packages() {
    log_info "Atualizando índices de pacotes do sistema (apt update)..."
    apt-get update -y > /dev/null 2>&1

    log_info "Instalando utilitários essenciais (curl, git, build-essential, sqlite3, libcap2-bin)..."
    apt-get install -y curl git build-essential sqlite3 ca-certificates gnupg ufw lsof libcap2-bin > /dev/null 2>&1
    log_success "Pacotes base do sistema instalados com sucesso!"
}

# 6. Instalação do Node.js (v20 LTS) e NPM
install_nodejs() {
    NEED_NODE=true
    if command -v node > /dev/null 2>&1; then
        NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VER" -ge 18 ]; then
            log_success "Node.js $(node -v) já está instalado e compatível."
            NEED_NODE=false
        else
            log_warn "Node.js instalado ($NODE_VER) é antigo. Atualizando para v20 LTS..."
        fi
    fi

    if [ "$NEED_NODE" = true ]; then
        ARCH=$(uname -m)
        if [ "$ARCH" = "armv7l" ] || [ "$ARCH" = "armv6l" ]; then
            log_info "Instalando Node.js para Raspberry Pi 32-bit..."
            apt-get install -y nodejs npm > /dev/null 2>&1 || true
        else
            log_info "Configurando repositório oficial NodeSource (Node.js 20 LTS)..."
            mkdir -p /etc/apt/keyrings
            curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg --yes > /dev/null 2>&1
            echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list > /dev/null 2>&1
            apt-get update -y > /dev/null 2>&1
            apt-get install -y nodejs > /dev/null 2>&1
        fi
        log_success "Node.js $(node -v) e NPM $(npm -v) prontos para uso!"
    fi

    # Permitir que o binário do Node.js escute em portas abaixo de 1024 sem restrições
    NODE_BIN=$(command -v node || true)
    if [ -n "$NODE_BIN" ]; then
        log_info "Concedendo permissões para binding da porta 80 (cap_net_bind_service)..."
        setcap 'cap_net_bind_service=+ep' "$NODE_BIN" > /dev/null 2>&1 || true
    fi
}

# 7. Instalação do PM2
install_pm2() {
    if ! command -v pm2 > /dev/null 2>&1; then
        log_info "Instalando PM2 (Gerenciador de Processos Daemon)..."
        npm install -g pm2 > /dev/null 2>&1
        log_success "PM2 instalado globalmente."
    else
        log_info "PM2 já está instalado."
    fi
}

# 8. Configuração e Compilação do MikroGestor Voucher
setup_mikrogestor() {
    TARGET_DIR="${INSTALL_DIR:-$DEFAULT_INSTALL_DIR}"
    
    # Se o script está sendo executado a partir do próprio repositório
    CURRENT_DIR=$(pwd)
    if [ -f "$CURRENT_DIR/package.json" ] && grep -q "mikrogestor-voucher" "$CURRENT_DIR/package.json" 2>/dev/null; then
        TARGET_DIR="$CURRENT_DIR"
        log_info "Executando instalação a partir da pasta atual: ${BOLD}$TARGET_DIR${NC}"
    else
        if [ -d "$TARGET_DIR/.git" ]; then
            log_info "Repositório já existe em $TARGET_DIR. Atualizando código (git pull)..."
            cd "$TARGET_DIR"
            git fetch --all > /dev/null 2>&1
            git reset --hard origin/master > /dev/null 2>&1 || git pull > /dev/null 2>&1
        else
            log_info "Clonando repositório em ${BOLD}$TARGET_DIR${NC}..."
            mkdir -p "$TARGET_DIR"
            git clone "$REPO_URL" "$TARGET_DIR"
            cd "$TARGET_DIR"
        fi
    fi

    # Criar arquivo .env se não existir
    if [ ! -f "$TARGET_DIR/.env" ]; then
        log_info "Gerando arquivo de configuração .env com segredo de produção..."
        JWT_RANDOM=$(openssl rand -hex 32 2>/dev/null || echo "mikrogestor_secret_$(date +%s)")
        cat <<EOF > "$TARGET_DIR/.env"
DATABASE_URL="file:./dev.db"
JWT_SECRET="$JWT_RANDOM"
PORT=$PORT
NODE_ENV=production
EOF
        log_success "Arquivo .env configurado."
    fi

    # Criar diretórios de dados locais necessários
    mkdir -p "$TARGET_DIR/baileys_auth_info"
    chmod -R 755 "$TARGET_DIR"

    # Instalação das dependências NPM
    log_info "Instalando dependências do projeto (npm install)..."
    cd "$TARGET_DIR"
    npm install --loglevel=error

    # Configuração do Banco de Dados SQLite e Prisma com otimizações WAL
    log_info "Gerando cliente Prisma com suporte ARM..."
    npx prisma generate > /dev/null 2>&1
    
    log_info "Aplicando migrations no SQLite..."
    npx prisma db push --accept-data-loss > /dev/null 2>&1
    
    log_info "Inicializando banco e ativando modo WAL (proteção contra corrupção em SD)..."
    node scripts/init-db.js

    # Compilação do Next.js com limite de Heap seguro para Raspberry Pi
    log_info "Compilando aplicação Next.js para produção (com proteção de memória ARM)..."
    export NODE_OPTIONS="--max-old-space-size=2048"
    npm run build

    log_success "Compilação de produção finalizada com sucesso!"
}

# 9. Configuração de Firewall
setup_firewall() {
    if command -v ufw > /dev/null 2>&1; then
        if ufw status 2>/dev/null | grep -q "Status: active"; then
            log_info "Configurando regras no firewall UFW para a porta $PORT e SSH (22)..."
            ufw allow 22/tcp > /dev/null 2>&1
            ufw allow $PORT/tcp > /dev/null 2>&1
            ufw reload > /dev/null 2>&1
            log_success "Portas 22 e $PORT liberadas no firewall."
        fi
    fi
}

# 10. Iniciar com PM2 e configurar inicialização automática no Boot
start_pm2_service() {
    TARGET_DIR="${INSTALL_DIR:-$DEFAULT_INSTALL_DIR}"
    if [ -f "$(pwd)/package.json" ] && grep -q "mikrogestor-voucher" "$(pwd)/package.json" 2>/dev/null; then
        TARGET_DIR="$(pwd)"
    fi

    cd "$TARGET_DIR"
    log_info "Iniciando MikroGestor via PM2 na porta $PORT..."

    # Parar processo anterior se existir
    pm2 stop "$APP_NAME" > /dev/null 2>&1 || true
    pm2 delete "$APP_NAME" > /dev/null 2>&1 || true

    # Iniciar usando o arquivo ecosystem.config.js otimizado
    if [ -f "ecosystem.config.js" ]; then
        pm2 start ecosystem.config.js
    else
        pm2 start npm --name "$APP_NAME" -- start
    fi

    log_info "Persistindo lista de processos PM2 para inicialização automática no boot..."
    pm2 save > /dev/null 2>&1
    
    # Configurar systemd startup do PM2
    pm2 startup systemd -u root --hp /root > /dev/null 2>&1 || pm2 startup > /dev/null 2>&1 || true
    log_success "Serviço PM2 configurado para iniciar automaticamente com o Raspberry Pi!"

    # Provisionar arquivo de serviço systemd nativo como alternativa
    if [ -f "$TARGET_DIR/mikrogestor.service" ]; then
        cp "$TARGET_DIR/mikrogestor.service" /etc/systemd/system/mikrogestor.service 2>/dev/null || true
        systemctl daemon-reload > /dev/null 2>&1 || true
    fi
}

# 11. Resumo e Instruções Finais
show_summary() {
    # Obter IP local da máquina
    LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
    [ -z "$LOCAL_IP" ] && LOCAL_IP="localhost"

    echo ""
    echo -e "${GREEN}${BOLD}================================================================================"
    echo "       🎉 MIKROGESTOR VOUCHER INSTALADO COM SUCESSO NO RASPBERRY PI! 🎉"
    echo "================================================================================${NC}"
    echo ""
    echo -e "  ${BOLD}🌐 Painel Administrativo:${NC}     ${CYAN}http://$LOCAL_IP/dashboard${NC}"
    echo -e "  ${BOLD}📱 Portal de Login / Hotspot:${NC} ${CYAN}http://$LOCAL_IP/dashboard/portal${NC}"
    echo -e "  ${BOLD}🔑 Usuário Padrão:${NC}            ${YELLOW}admin${NC}"
    echo -e "  ${BOLD}🔒 Senha Padrão:${NC}            ${YELLOW}123${NC}"
    echo ""
    echo -e "--------------------------------------------------------------------------------"
    echo -e "  ${BOLD}Comandos úteis de monitoramento e controle:${NC}"
    echo -e "  • Ver status em tempo real:   ${MAGENTA}pm2 status${NC}"
    echo -e "  • Ver logs ao vivo:           ${MAGENTA}pm2 logs mikrogestor-voucher${NC}"
    echo -e "  • Reiniciar aplicação:        ${MAGENTA}pm2 restart mikrogestor-voucher${NC}"
    echo -e "  • Parar aplicação:            ${MAGENTA}pm2 stop mikrogestor-voucher${NC}"
    echo -e "  • Atualizar para nova versão: ${MAGENTA}cd $(pwd) && ./install.sh --update${NC}"
    echo -e "================================================================================"
    echo ""
}

# 12. Modo de Atualização Rápida
run_update() {
    log_info "Iniciando atualização do MikroGestor Voucher..."
    git pull
    npm install
    npx prisma generate
    npx prisma db push --accept-data-loss
    node scripts/init-db.js
    export NODE_OPTIONS="--max-old-space-size=2048"
    npm run build
    pm2 restart "$APP_NAME"
    log_success "MikroGestor Voucher atualizado com sucesso!"
    exit 0
}

# 13. Diagnóstico do Sistema
run_check() {
    print_banner
    detect_system
    configure_swap
    check_port_conflicts
    exit 0
}

# Main Execution Switch
case "$1" in
    --update|-u)
        check_root
        run_update
        ;;
    --check|-c)
        check_root
        run_check
        ;;
    --restart|-r)
        pm2 restart "$APP_NAME"
        exit 0
        ;;
    --logs|-l)
        pm2 logs "$APP_NAME"
        exit 0
        ;;
    --status|-s)
        pm2 status
        exit 0
        ;;
    *)
        print_banner
        check_root
        detect_system
        configure_swap
        check_port_conflicts
        install_system_packages
        install_nodejs
        install_pm2
        setup_mikrogestor
        setup_firewall
        start_pm2_service
        show_summary
        ;;
esac
