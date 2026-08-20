#!/usr/bin/env bash

# ==============================================================================
#  MIKROGESTOR VOUCHER — SCRIPT DE INSTALAÇÃO AUTOMÁTICA
#  Compatível com: Linux (Ubuntu, Debian, DietPi) e Raspberry Pi (ARMv7 / ARM64)
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
    echo "       __  __ _ _              ____           _             "
    echo "      |  \/  (_) |            / ___| ___  ___| |_ ___  _ __ "
    echo "      | |\/| | | | _____  ___| |  _ / _ \/ __| __/ _ \| '__|"
    echo "      | |  | | | |/ _ \ \/ / | |_| |  __/\__ \ || (_) | |   "
    echo "      |_|  |_|_|_|\___/\__/   \____|\___||___/\__\___/|_|   "
    echo "                                                            "
    echo "             SISTEMA DE GESTÃO DE VOUCHERS & HOTSPOT        "
    echo "            Instalador para Linux e Raspberry Pi            "
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
            log_info "Plataforma detectada: PC / Servidor Linux x86_64"
            ;;
        aarch64|arm64)
            log_info "Plataforma detectada: Raspberry Pi 3/4/5 ou ARM 64-bit"
            ;;
        armv7l|armv6l)
            log_info "Plataforma detectada: Raspberry Pi 32-bit (ARMv7/v6)"
            ;;
        *)
            log_warn "Arquitetura $ARCH não padrão. Continuando com instalação genérica..."
            ;;
    esac
}

# 3. Instalação das dependências básicas do Linux
install_system_packages() {
    log_info "Atualizando repositórios do sistema (apt update)..."
    apt-get update -y > /dev/null 2>&1

    log_info "Instalando pacotes essenciais (curl, git, build-essential, sqlite3, ufw)..."
    apt-get install -y curl git build-essential sqlite3 ca-certificates gnupg ufw lsof > /dev/null 2>&1
    log_success "Pacotes base do sistema instalados com sucesso!"
}

# 4. Instalação do Node.js (v20 LTS) e NPM
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
        log_info "Configurando repositório oficial NodeSource (Node.js 20 LTS)..."
        mkdir -p /etc/apt/keyrings
        curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg --yes > /dev/null 2>&1
        echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list > /dev/null 2>&1
        apt-get update -y > /dev/null 2>&1
        apt-get install -y nodejs > /dev/null 2>&1
        log_success "Node.js $(node -v) e NPM $(npm -v) instalados!"
    fi
}

# 5. Instalação do PM2 para inicialização automática no boot
install_pm2() {
    if ! command -v pm2 > /dev/null 2>&1; then
        log_info "Instalando PM2 (Gerenciador de Processos Daemon)..."
        npm install -g pm2 > /dev/null 2>&1
        log_success "PM2 instalado globalmente."
    else
        log_info "PM2 já está instalado."
    fi
}

# 6. Configuração e Clonagem do MikroGestor Voucher
setup_mikrogestor() {
    TARGET_DIR="${INSTALL_DIR:-$DEFAULT_INSTALL_DIR}"
    
    # Se o script está sendo executado de dentro da própria pasta clonada
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
        log_info "Gerando arquivo de configuração .env com chave secreta segura..."
        JWT_RANDOM=$(openssl rand -hex 32 2>/dev/null || echo "mikrogestor_secret_$(date +%s)")
        cat <<EOF > "$TARGET_DIR/.env"
DATABASE_URL="file:./dev.db"
JWT_SECRET="$JWT_RANDOM"
PORT=$PORT
EOF
        log_success "Arquivo .env configurado."
    fi

    # Permissões da pasta
    chmod -R 755 "$TARGET_DIR"

    # Instalação das dependências NPM
    log_info "Instalando dependências do projeto (npm install)..."
    cd "$TARGET_DIR"
    npm install --loglevel=error

    # Configuração do Banco de Dados SQLite e Prisma
    log_info "Inicializando Banco de Dados e Migrations Prisma..."
    npx prisma db push --accept-data-loss > /dev/null 2>&1
    npx prisma generate > /dev/null 2>&1
    node scripts/init-db.js

    # Compilação do Next.js
    log_info "Compilando aplicação Next.js para produção (npm run build)..."
    npm run build

    log_success "Compilação concluída com sucesso!"
}

# 7. Liberar portas no Firewall UFW (se ativo)
setup_firewall() {
    if command -v ufw > /dev/null 2>&1; then
        if ufw status | grep -q "Status: active"; then
            log_info "Configurando regras no firewall UFW para a porta $PORT e SSH (22)..."
            ufw allow 22/tcp > /dev/null 2>&1
            ufw allow $PORT/tcp > /dev/null 2>&1
            ufw reload > /dev/null 2>&1
            log_success "Porta $PORT liberada no firewall."
        fi
    fi
}

# 8. Iniciar com PM2 e configurar inicialização automática no Boot
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

    # Iniciar usando o arquivo ecosystem se disponível ou diretamente
    if [ -f "ecosystem.config.js" ]; then
        pm2 start ecosystem.config.js
    else
        pm2 start npm --name "$APP_NAME" -- start
    fi

    log_info "Salvando lista de processos para inicialização automática no boot..."
    pm2 save
    
    # Gerar startup script se ainda não configurado
    pm2 startup systemd -u root --hp /root > /dev/null 2>&1 || pm2 startup > /dev/null 2>&1 || true
    log_success "Serviço PM2 configurado para iniciar automaticamente com o sistema!"
}

# 9. Mostrar tela final com dados de acesso
show_summary() {
    # Obter IP local da máquina
    LOCAL_IP=$(hostname -I | awk '{print $1}')
    [ -z "$LOCAL_IP" ] && LOCAL_IP="localhost"

    echo ""
    echo -e "${GREEN}${BOLD}================================================================================"
    echo "            🎉 MIKROGESTOR VOUCHER INSTALADO COM SUCESSO! 🎉"
    echo "================================================================================${NC}"
    echo ""
    echo -e "  ${BOLD}🌐 Painel Administrativo:${NC} ${CYAN}http://$LOCAL_IP:$PORT/dashboard${NC}"
    echo -e "  ${BOLD}📱 Portal de Login / Hotspot:${NC} ${CYAN}http://$LOCAL_IP:$PORT/dashboard/portal${NC}"
    echo -e "  ${BOLD}🔑 Login Padrão:${NC}          ${YELLOW}admin${NC}"
    echo -e "  ${BOLD}🔒 Senha Padrão:${NC}          ${YELLOW}123${NC}"
    echo ""
    echo -e "--------------------------------------------------------------------------------"
    echo -e "  ${BOLD}Comandos úteis do sistema:${NC}"
    echo -e "  • Ver status em tempo real:   ${MAGENTA}pm2 status${NC}"
    echo -e "  • Ver logs ao vivo:           ${MAGENTA}pm2 logs mikrogestor-voucher${NC}"
    echo -e "  • Reiniciar sistema:          ${MAGENTA}pm2 restart mikrogestor-voucher${NC}"
    echo -e "  • Parar sistema:              ${MAGENTA}pm2 stop mikrogestor-voucher${NC}"
    echo -e "  • Atualizar para nova versão: ${MAGENTA}cd $(pwd) && ./install.sh --update${NC}"
    echo -e "================================================================================"
    echo ""
}

# 10. Modo de Atualização Rápida
run_update() {
    log_info "Iniciando atualização do MikroGestor Voucher..."
    git pull
    npm install
    npx prisma db push --accept-data-loss
    npx prisma generate
    npm run build
    pm2 restart "$APP_NAME"
    log_success "MikroGestor Voucher atualizado com sucesso!"
    exit 0
}

# Main Execution Switch
case "$1" in
    --update|-u)
        check_root
        run_update
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
        install_system_packages
        install_nodejs
        install_pm2
        setup_mikrogestor
        setup_firewall
        start_pm2_service
        show_summary
        ;;
esac
