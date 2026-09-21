# 🚀 Guia Definitivo de Deploy do MikroGestor em Nova VPS

> **Manual Oficial e À Prova de Falhas para Provisionamento de Produção**  
> Compatível com: **Ubuntu 22.04 LTS / 24.04 LTS**, **Debian 11 / 12**, **Coolify**, **Docker** e **Raspberry Pi OS (ARM64)**.

---

## 📑 Índice
1. [Arquitetura Geral da Infraestrutura](#1-arquitetura-geral-da-infraestrutura)
2. [Pré-Requisitos e Liberação de Portas na Nuvem](#2-pré-requisitos-e-liberação-de-portas-na-nuvem)
3. [Método Principal: Deploy com Coolify (Recomendado)](#3-método-principal-deploy-com-coolify-recomendado)
   - [Passo 1: Instalação do Coolify](#passo-1-instalação-do-coolify)
   - [Passo 2: Configuração de Host (WireGuard, Firewall e Volumes)](#passo-2-configuração-de-host-wireguard-firewall-e-volumes)
   - [Passo 3: Criação da Aplicação no Coolify](#passo-3-criação-da-aplicação-no-coolify)
   - [Passo 4: Volume Persistente SQLite (OBRIGATÓRIO)](#passo-4-volume-persistente-sqlite-obrigatório)
   - [Passo 5: Variáveis de Ambiente](#passo-5-variáveis-de-ambiente)
   - [Passo 6: Deploy e Inicialização Automática](#passo-6-deploy-e-inicialização-automática)
4. [Validação Automática do Deploy (Script de 8 Camadas)](#4-validação-automática-do-deploy-script-de-8-camadas)
5. [Conectando o Primeiro MikroTik (RouterOS v7)](#5-conectando-o-primeiro-mikrotik-routeros-v7)
6. [Método Alternativo: Deploy Direto via Docker Compose](#6-método-alternativo-deploy-direto-via-docker-compose)
7. [Troubleshooting Playbook (Resolução Imediata de Problemas)](#7-troubleshooting-playbook-resolução-imediata-de-problemas)
8. [Comandos de Emergência e Manutenção](#8-comandos-de-emergência-e-manutenção)

---

## 1. Arquitetura Geral da Infraestrutura

O MikroGestor utiliza uma arquitetura híbrida projetada para máxima performance, segurança e capacidade de controlar roteadores remotos mesmo que estejam atrás de **CGNAT ou sem IP público**:

```
[ MikroTik RouterOS v7 ] (Cliente Hotspot/PPPoE)
        │
        │ Túnel Criptografado WireGuard (UDP 51820)
        │ Subnet VPN de Controle: 10.8.0.0/24 (Split-Tunneling Estrito)
        ▼
[ Servidor VPS Ubuntu / Debian (Host) ]
  ├── Interface WireGuard: wg0 (10.8.0.1/24)
  ├── NAT Masquerade Ativo: (iptables -t nat -A POSTROUTING -o wg0 -j MASQUERADE)
  ├── Daemon WG-Manager: 127.0.0.1:51821 / 172.17.0.1:51821 (Protegido via HMAC Header)
  ├── Volume Persistente no Host: /data/mikrogestor/prisma (chmod 777)
  │
  └── [ Container Docker Coolify (MikroGestor Next.js) ]
        ├── Porta HTTP: 80 (Interna e Externa)
        ├── Volume Mapeado: /app/prisma -> /data/mikrogestor/prisma
        ├── Banco de Dados: SQLite dev.db (WAL Mode de alta concorrência)
        ├── Patch Automático: node-routeros Channel.js (!empty reply RouterOS v7)
        └── Comunicação API MikroTik: 10.8.0.2:8728 (Via Gateway Docker -> wg0)
```

### Por que o NAT Masquerade na `wg0` é crucial?
Quando o container Docker (`172.17.0.X`) envia comandos da API para o MikroTik (`10.8.0.2`), o pacote passa pelo host e entra no túnel `wg0`. Com a regra de `MASQUERADE`, o IP de origem do pacote é reescrito para `10.8.0.1` (o IP da VPS no túnel).  
Dessa forma:
1. O firewall do MikroTik reconhece o tráfego como legítimo vindo da VPS (`10.8.0.1`).
2. O MikroTik devolve a resposta diretamente pela interface VPN, eliminando 100% dos problemas de roteamento assimétrico.

---

## 2. Pré-Requisitos e Liberação de Portas na Nuvem

### Requisitos Mínimos de Servidor
- **SO**: Ubuntu 22.04 LTS ou Ubuntu 24.04 LTS (x86_64 ou ARM64) / Debian 12
- **CPU**: 1 vCPU (2 vCPUs recomendadas para 50+ roteadores)
- **RAM**: 1 GB mínimo (2 GB recomendados)
- **Disco**: 20 GB SSD

### Portas Obrigatórias no Painel da Cloud (Security Groups / Firewall Externo)
Antes de começar, certifique-se de que seu provedor (Oracle Cloud, Hetzner, AWS, Contabo, DigitalOcean, etc.) libera as seguintes portas no firewall externo:

| Porta | Protocolo | Finalidade | Origem Permitida |
|---|---|---|---|
| **22** | TCP | Acesso SSH ao Servidor | Seu IP ou `0.0.0.0/0` |
| **80** | TCP | Tráfego Web do MikroGestor / Hotspot | `0.0.0.0/0` |
| **443** | TCP | Acesso Seguro SSL / HTTPS | `0.0.0.0/0` |
| **8000** | TCP | Painel Web do Coolify | Seu IP ou `0.0.0.0/0` |
| **51820** | UDP | **Túnel WireGuard com os MikroTiks** | `0.0.0.0/0` (Essencial) |

> ⚠️ **Atenção (Oracle Cloud e AWS)**: Além do UFW interno, você DEVE abrir a porta **51820/UDP** nas *Security Lists / Security Groups* do painel da Oracle/AWS, caso contrário os pacotes do MikroTik não chegarão à VPS.

---

## 3. Método Principal: Deploy com Coolify (Recomendado)

### Passo 1: Instalação do Coolify
Na VPS recém-instalada, conecte via SSH e instale o Coolify:
```bash
ssh root@SEU_IP_VPS
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```
Aguarde a conclusão (cerca de 2 a 3 minutos). Acesse `http://SEU_IP_VPS:8000` e crie sua conta de administrador.

---

### Passo 2: Configuração de Host (WireGuard, Firewall e Volumes)
No terminal da VPS, execute o script de provisionamento automatizado do MikroGestor:
```bash
bash <(curl -sSL https://raw.githubusercontent.com/lyncolnsas/mikrogestor-voucher22/main/vpn/setup-vps.sh)
```
*(Ou se já clonou o repositório: `sudo bash vpn/setup-vps.sh`)*

#### O que este script faz automaticamente:
1. Instala pacotes do Kernel (`wireguard`, `wireguard-tools`, `iptables`, `ufw`, `python3`).
2. Ativa o encaminhamento de pacotes IPv4 no Kernel (`net.ipv4.ip_forward=1`).
3. Gera o par de chaves WireGuard (Curve25519) da VPS.
4. Cria `/etc/wireguard/wg0.conf` com **NAT Masquerade ativo** e sobe a interface `wg0` em `10.8.0.1/24`.
5. **Cria `/data/mikrogestor/prisma` com `chmod 777`** para persistência do banco SQLite.
6. Instala o daemon de gerenciamento seguro `mikrogestor-wg-manager` (porta 51821) gerenciado pelo systemd.
7. Ajusta o UFW permitindo SSH, HTTP, HTTPS, Coolify, WireGuard UDP e tráfego Docker interno.
8. **Imprime na tela o bloco completo de variáveis para copiar e colar no Coolify!**

---

### Passo 3: Criação da Aplicação no Coolify
1. No painel do Coolify (`http://SEU_IP_VPS:8000`), clique em **+ Create New Resource** → **Application**.
2. Selecione **Public Repository** (ou configure seu GitHub App para repositório privado).
3. Insira a URL do repositório:
   ```text
   https://github.com/lyncolnsas/mikrogestor-voucher22.git
   ```
4. Branch: `main`.
5. **Build Pack**: Selecione **Nixpacks** (ou Dockerfile se disponível).
6. **Portas**: Defina a porta de escuta como **`80`**.

---

### Passo 4: Volume Persistente SQLite (OBRIGATÓRIO)
> 🚨 **REGRA CRÍTICA P0**: Sem este passo, o Coolify destruirá o banco SQLite (`dev.db`) em cada novo deploy, apagando todos os roteadores e vouchers cadastrados!

No painel da aplicação no Coolify:
1. Vá na aba **Persistent Storage** (Armazenamento Persistente).
2. Clique em **Add Volume** (Adicionar Volume).
3. Preencha exatamente:
   - **Name**: `prisma-db`
   - **Host Path**: `/data/mikrogestor/prisma`
   - **Container Path**: `/app/prisma`
4. Clique em **Save**.

*(Alternativa equivalente: Vá na aba **General Settings** → **Custom Docker Run Options** e adicione: `-v /data/mikrogestor/prisma:/app/prisma`)*.

---

### Passo 5: Variáveis de Ambiente
Na aba **Environment Variables** da aplicação no Coolify, adicione as variáveis geradas pelo `setup-vps.sh`:

```env
DATABASE_URL=file:/app/prisma/dev.db
NEXTAUTH_SECRET=sua_chave_secreta_aleatoria_32_chars
NEXTAUTH_URL=http://SEU_IP_VPS
PORT=80
VPS_PUBLIC_IP=SEU_IP_VPS
VPS_WG_PUBLIC_KEY=sua_chave_publica_wireguard_gerada_no_passo_2
WG_MANAGER_SECRET=seu_secret_gerado_no_passo_2
WG_MANAGER_URL=http://172.17.0.1:51821
```

> 💡 *Dica*: Se você apontou um domínio (ex: `painel.meuprovedor.com`), coloque `NEXTAUTH_URL=https://painel.meuprovedor.com` e defina o domínio no campo **Domains** do Coolify para que o Traefik/Caddy gere o certificado SSL Let's Encrypt automaticamente.

---

### Passo 6: Deploy e Inicialização Automática
Clique no botão **Deploy** no topo do Coolify.

#### O que o sistema faz sozinho durante o build e inicialização:
1. **Fase de Build (`npm install`)**: O script `postinstall` executa automaticamente `scripts/patch-routeros.js`, garantindo que a biblioteca `node-routeros` suporte as respostas `!empty` do RouterOS v7.
2. **Fase de Inicialização (`npm start`)**:
   - Executa `npx prisma db push --skip-generate` (cria as tabelas no SQLite persistente se ainda não existirem).
   - Executa `node scripts/init-db.js` (ativa o modo **WAL** de alta concorrência e cria o usuário padrão `admin` / `123` caso o banco seja novo).
   - Inicia o Next.js na porta `80`.

---

## 4. Validação Automática do Deploy (Script de 8 Camadas)

Para garantir que não existe nenhuma falha oculta (de rede, firewall, banco ou VPN), execute o script de diagnóstico automatizado na VPS:

```bash
bash scripts/verificar-deploy-completo.sh
```

### Exemplo de saída esperada (Tudo Verde):
```text
═══════════════════════════════════════════════════════════════════════════
       🔍 MIKROGESTOR — VERIFICAÇÃO COMPLETA DE DEPLOY & AMBIENTE          
═══════════════════════════════════════════════════════════════════════════

1. WireGuard Host & Interface wg0:
  [✓ PASS] WireGuard CLI disponível (wireguard-tools v1.0.20210914)
  [✓ PASS] Interface wg0 ativa no host (IP: 10.8.0.1/24)
  [✓ PASS] Porta UDP 51820 ouvindo conexões dos MikroTiks

2. Encaminhamento de Pacotes & NAT Masquerade:
  [✓ PASS] IP Forwarding ativado no Kernel (net.ipv4.ip_forward=1)
  [✓ PASS] Regra NAT Masquerade ativa na interface wg0 (permite Docker falar com MikroTik)

3. Daemon WireGuard Manager (Porta 51821):
  [✓ PASS] Serviço systemd mikrogestor-wg-manager ativo
  [✓ PASS] API HTTP do Manager respondendo em 127.0.0.1:51821 (HTTP 200 OK)
  [✓ PASS] API acessível a partir da ponte Docker 172.17.0.1:51821

4. Armazenamento Persistente SQLite no Host (/data/mikrogestor/prisma):
  [✓ PASS] Diretório /data/mikrogestor/prisma existe
  [✓ PASS] Diretório possui permissão de escrita
  [✓ PASS] Banco dev.db presente no host (Tamanho: 1.2M)

5. Container MikroGestor (Docker / Coolify):
  [✓ PASS] Container ativo encontrado: mikrogestor-prod (45262b0b04c7)
  [✓ PASS] Volume persistente /data/mikrogestor/prisma montado corretamente dentro do container
  [✓ PASS] Patch RouterOS v7 (!empty) ativo dentro do container em node_modules

6. Servidor Web MikroGestor (Porta 80):
  [✓ PASS] Servidor respondendo na porta 80 (HTTP 200)

7. Status de Peers WireGuard (MikroTik):
  [✓ PASS] Peer 10.8.0.2/32: 🟢 ONLINE (Último handshake há 0m, RX: 5120KB, TX: 5120KB)

═══════════════════════════════════════════════════════════════════════════
  🎉 SUCESSO TOTAL: Todos os checks vitais passaram! (11 checks aprovados)
  O MikroGestor está 100% pronto para operar em produção.
═══════════════════════════════════════════════════════════════════════════
```

---

## 5. Conectando o Primeiro MikroTik (RouterOS v7)

1. Acesse o painel web: `http://SEU_IP_VPS` (ou seu domínio).
2. Faça login com as credenciais padrão:
   - **Usuário**: `admin`
   - **Senha**: `123`  
   *(Altere a senha após o primeiro acesso em Configurações)*.
3. No menu lateral, acesse **Roteadores** → **Adicionar Roteador**.
4. Preencha os dados:
   - **Nome do Roteador**: Ex: `RB-Hotspot-Central`
   - **IP VPN**: O sistema sugere automaticamente (ex: `10.8.0.2`)
   - **Usuário API**: `admin` (ou seu usuário MikroTik)
   - **Senha API**: Sua senha do MikroTik
   - **Porta API**: `8728`
5. Clique em **Salvar e Gerar Script WireGuard**.
6. Copie o script gerado.

### Como aplicar no MikroTik:
1. Abra o **Winbox** e conecte no seu MikroTik.
2. Abra o **New Terminal**.
3. Cole o script copiado e pressione `Enter`.
4. O script configura:
   - Interface WireGuard `wg-mikrogestor`
   - IP `10.8.0.2/24`
   - Peer apontando para a VPS com keepalive de 25s
   - Rota estrita de controle para `10.8.0.0/24` (sem desviar tráfego dos clientes da internet)
   - Regras de firewall liberando as portas 8728/8729 apenas para a VPS (`10.8.0.1`)
5. No terminal do MikroTik, teste a conexão:
   ```routeros
   /ping 10.8.0.1 count=4
   ```
   *Deve responder imediatamente com 0% packet loss!*
6. No painel do MikroGestor, o roteador ficará **Verde (Online)** e os gráficos de CPU, Memória e Hotspot carregarão em tempo real.

---

## 6. Método Alternativo: Deploy Direto via Docker Compose

Se você prefere não usar o Coolify e deseja rodar diretamente com Docker Compose e Caddy (SSL automático):

Crie um arquivo `docker-compose.yml` na VPS:
```yaml
version: '3.8'

services:
  mikrogestor:
    image: node:20-alpine
    container_name: mikrogestor
    restart: always
    working_dir: /app
    volumes:
      - /data/mikrogestor/prisma:/app/prisma
    ports:
      - "80:80"
    environment:
      - DATABASE_URL=file:/app/prisma/dev.db
      - NEXTAUTH_SECRET=sua_chave_secreta_aqui
      - NEXTAUTH_URL=http://SEU_IP_VPS
      - PORT=80
      - VPS_PUBLIC_IP=SEU_IP_VPS
      - VPS_WG_PUBLIC_KEY=chave_publica_vps
      - WG_MANAGER_SECRET=secret_wg_manager
      - WG_MANAGER_URL=http://172.17.0.1:51821
    command: sh -c "npm install --production && npx prisma db push && node scripts/init-db.js && next start -H 0.0.0.0 -p 80"
```

Inicie com:
```bash
docker compose up -d
```

---

## 7. Troubleshooting Playbook (Resolução Imediata de Problemas)

| Sintoma / Erro | Causa Raiz | Solução Imediata |
|---|---|---|
| `RosException: Tried to process unknown reply: !empty` | A biblioteca `node-routeros` recebeu `!empty` de uma tabela vazia do RouterOS v7 sem o patch. | O patch já está incluído no topo de `src/lib/routeros.ts` e em `scripts/patch-routeros.js`. Execute `node scripts/patch-routeros.js` no container ou faça rebuild. |
| O banco de dados zerou após novo deploy no Coolify | O volume persistente não estava montado em `/app/prisma`. | Configure em **Application → Persistent Storage**: Host `/data/mikrogestor/prisma` mapeado para Container `/app/prisma`. |
| `ECONNREFUSED 10.8.0.2:8728` ao buscar dados do roteador | O túnel WireGuard não conectou ou a porta API (8728) está desativada no MikroTik. | 1. No MikroTik: `/ip service enable api`.<br>2. Verifique o handshake: `/interface wireguard peers print`.<br>3. Verifique se a porta 51820/UDP está liberada na nuvem. |
| MikroTik pinga `10.8.0.1`, mas a API na VPS dá `ETIMEDOUT` | Falta da regra de NAT Masquerade na interface `wg0` da VPS. | Execute na VPS:<br>`iptables -t nat -A POSTROUTING -o wg0 -j MASQUERADE` |
| `Error: P1001 Can't reach database` | Permissão insuficiente no diretório de dados do SQLite. | Execute na VPS:<br>`chmod -R 777 /data/mikrogestor/prisma` |
| Syntax error ao colar o script no Winbox Terminal | Quebra de linhas Windows (`\r\n`) ou barras invertidas (`\`) no script. | Todos os comandos para RouterOS v7 devem ser gerados em linha única com `;` separando comandos. |
| Daemon WG-Manager retornando HTTP 401 Unauthorized | O cabeçalho `X-WG-Secret` enviado pelo MikroGestor não confere com o secret da VPS. | Verifique `cat /etc/mikrogestor-wg.secret` na VPS e atualize a variável `WG_MANAGER_SECRET` no Coolify. |

---

## 8. Comandos de Emergência e Manutenção

```bash
# 1. Ver status completo e logs do túnel WireGuard na VPS
wg show

# 2. Reiniciar o daemon de gerenciamento WireGuard
systemctl restart mikrogestor-wg-manager
journalctl -u mikrogestor-wg-manager -n 50 --no-pager

# 3. Fazer backup manual imediato do banco SQLite
cp /data/mikrogestor/prisma/dev.db /data/mikrogestor/prisma/dev.db.backup.$(date +%Y%m%d_%H%M%S)

# 4. Forçar reconexão WireGuard no MikroTik (em linha única no Winbox)
/interface wireguard peers set [find interface=wg-mikrogestor] disabled=yes; :delay 2s; /interface wireguard peers set [find interface=wg-mikrogestor] disabled=no

# 5. Visualizar logs em tempo real do container MikroGestor no Coolify
docker logs -f $(docker ps -q --filter "ancestor=*mikrogestor*" | head -1)

# 6. Rodar diagnóstico completo do MikroGestor
bash scripts/verificar-deploy-completo.sh
```

---
*Documentação validada em ambiente de produção com MikroTik RouterOS v7 e Coolify.*
