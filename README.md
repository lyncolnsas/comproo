# MikroGestor Voucher 🚀

Sistema completo e profissional para **Gestão de Vouchers, Hotspot MikroTik, Estúdio de Portais Captive Personalizáveis, Captura de Leads e Autenticação WhatsApp**.

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
- 🎨 **Portal Studio Pro com 25 Nichos Temáticos** e 16 animações exclusivas em Canvas HTML5.
- 📱 **Captura de Leads e Cadastro via Formulário Responsivo**.
- 🎫 **Geração, Impressão e Gestão de Vouchers em Lote**.
- 💬 **Fluxo de Conexão e Verificação via WhatsApp**.
- 💳 **Integração de Pagamento Mercado Pago PIX**.
- 🛡️ **Segurança Walled Garden, Bloqueio de Horários e Palavras-chave**.
- 🚀 **Pronto para Produção com PM2 e SQLite/Prisma**.
