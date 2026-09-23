# MikroGestor Voucher 🚀

Sistema completo e profissional para **Gestão de Vouchers, Hotspot MikroTik, Estúdio de Portais Captive Personalizáveis, Captura de Leads e Autenticação WhatsApp**.

---

## ☁️ Deploy em Nuvem / VPS (Coolify & WireGuard)

Para instalar o MikroGestor em uma **VPS nova (Ubuntu 22.04/24.04, Debian 11/12)** usando **Coolify** ou **Docker**, consulte o guia oficial passo a passo:
👉 **[Guia Definitivo de Deploy em Nova VPS (docs/GUIA_DEPLOY_COMPLETO_NOVA_VPS.md)](docs/GUIA_DEPLOY_COMPLETO_NOVA_VPS.md)**

- ⚡ **Instalação WireGuard + Daemon + Firewall em 1 comando**: `sudo bash vpn/setup-vps.sh`
- 🛡️ **Persistência garantida do banco SQLite**: Mapeamento `/data/mikrogestor/prisma` -> `/app/prisma`
- 🔍 **Validação automática em 8 camadas**: `bash scripts/verificar-deploy-completo.sh`
- 🔒 **Subdomínios com SSL Let's Encrypt por Roteador**: Auto-provisionamento via Traefik dinâmico
- 📲 **Admin Peers WireGuard (Windows & Celular)**: Conexão direta com download `.conf` e QR Code
- 💻 **Acesso Remoto Winbox**: Conecte no Winbox em qualquer MikroTik via IP VPN (`10.8.0.2:8291`) sem AnyDesk
- 🤖 **Servidor Autônomo Coolify MCP**: Localizado em `CooliFy - MCP` com setup em 1 comando (`npm run setup`)

---

## 🤖 Servidor Autônomo Coolify MCP (v2.0.0)

Para gerenciar a VPS, containers Docker e deploys do Coolify através de assistentes de Inteligência Artificial (**Antigravity IDE**, **Claude Desktop**, **Cursor**, **Windsurf**, **VS Code**):

Consulte a pasta dedicada **`CooliFy - MCP`**:
- **Setup em 1 comando**: `npm run setup`
- **Diagnóstico instantâneo**: `npm test`
- **Guia de Integração em Nova VPS**: `CooliFy - MCP/docs/GUIA_INTEGRACAO_NOVA_VPS.md`
- **Catálogo de 13 Ferramentas MCP**: `CooliFy - MCP/docs/FERRAMENTAS_MCP.md`

---

## 💻 Instalação Rápida no Linux e Raspberry Pi

Compatível com **Ubuntu, Debian, DietPi, Raspberry Pi OS (Raspbian - 32-bit e 64-bit)** e qualquer distribuição baseada em Debian.

### ⚡ Comando Único de Instalação (1-Click)

Execute o comando abaixo no terminal da sua máquina Linux ou Raspberry Pi:

```bash
curl -fsSL https://raw.githubusercontent.com/lyncolnsas/mikrogestor-voucher22/master/install.sh | sudo bash
```

### 🛠️ Ou Instalação Manual via Git:

```bash
# 1. Clone o repositório
git clone https://github.com/lyncolnsas/mikrogestor-voucher22.git /opt/mikrogestor-voucher
cd /opt/mikrogestor-voucher

# 2. Dê permissão e execute o instalador
chmod +x install.sh
sudo ./install.sh
```

---

## 📋 Comandos de Gerenciamento no Linux / Raspberry Pi

O instalador configura automaticamente o **PM2** para manter o MikroGestor rodando 24/7 e iniciar sozinho caso a máquina reinicie.

- **Ver status do sistema:**
  ```bash
  pm2 status
  ```
- **Ver logs em tempo real:**
  ```bash
  pm2 logs mikrogestor-voucher
  ```
- **Reiniciar o sistema:**
  ```bash
  pm2 restart mikrogestor-voucher
  ```
- **Parar o sistema:**
  ```bash
  pm2 stop mikrogestor-voucher
  ```
- **Atualizar para a última versão do GitHub:**
  ```bash
  cd /opt/mikrogestor-voucher && sudo ./install.sh --update
  ```

---

## 🪟 Instalação no Windows

1. Certifique-se de ter o **Node.js (v18+)** instalado.
2. Clone ou baixe este repositório.
3. Dê dois cliques em `setup.bat` para instalar as dependências e configurar o banco de dados.
4. Execute `Iniciar_MikroGestor.bat` para iniciar a aplicação.

---

## 🔑 Credenciais Padrão de Acesso

- **URL do Painel:** `http://<IP-DO-SERVIDOR>/dashboard` (porta 80)
- **Usuário:** `admin`
- **Senha:** `123`

---

## ✨ Funcionalidades Principais

- 📡 **Integração Nativa com MikroTik RouterOS** (v6 e v7 via API RouterOS e FTP).
- 🌐 **Túneis WireGuard Multi-Roteador em Split-Tunneling** para controle remoto sem IP público.
- 💻 **Suporte a Admin Peers (Windows, iOS, Android)** com QR Code e acesso Winbox remoto na porta 8291.
- 🔒 **Certificados SSL Let's Encrypt por Roteador** com renovação automática via `/tool fetch`.
- 🎨 **Portal Studio Pro com 25 Nichos Temáticos** e 16 animações exclusivas em Canvas HTML5.
- 📱 **Captura de Leads e Cadastro via Formulário Responsivo**.
- 🎫 **Geração, Impressão e Gestão de Vouchers em Lote**.
- 💬 **Pool WhatsApp Multi-Device (2 até 8 números simultâneos)**:
  - 🔄 **Balanceamento Round-Robin** com failover automático e anti-bloqueio.
  - 👥 **Grupo Central de Mídias com Auto-Inclusão Autônoma** via código de convite.
  - 🚀 **Biblioteca de Mídias com Forward Nativo (`relayMessage`)**: reenvia vídeos e fotos aos clientes como reencaminhamento humano sem gastar upload do servidor.
  - 📚 Veja a documentação técnica: [ARQUITETURA_WHATSAPP_MULTI_NUMEROS_E_FORWARD.md](docs/ARQUITETURA_WHATSAPP_MULTI_NUMEROS_E_FORWARD.md).
- 💳 **Integração de Pagamento Mercado Pago PIX** com liberação imediata e carência temporária de 15 minutos.
- 🛡️ **Segurança Walled Garden Ultra-Restrito, Anti-Tethering (TTL=1) e Bloqueio de Inadimplentes**.
- 🚀 **Pronto para Produção com Coolify, Docker, PM2 e SQLite WAL Mode**.
