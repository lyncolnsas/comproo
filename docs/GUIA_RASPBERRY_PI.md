# 🍓 Guia de Instalação no Raspberry Pi — MikroGestor Voucher

Este guia contém o passo a passo completo para instalar e rodar o **MikroGestor Voucher** em um **Raspberry Pi** de forma estável, com inicialização automática e proteção de hardware.

---

## 📋 Requisitos Recomendados

| Componente | Especificação Mínima | Recomendado |
| :--- | :--- | :--- |
| **Placa** | Raspberry Pi 3 Model B+ / Zero 2W | Raspberry Pi 4 (2GB+) ou Raspberry Pi 5 |
| **Sistema Operacional** | Raspberry Pi OS 64-bit (Debian 11 Bullseye ou 12 Bookworm) | Raspberry Pi OS 64-bit Lite (sem desktop) |
| **Armazenamento** | Cartão MicroSD 16GB Classe 10 | MicroSD 32GB A1/A2 ou SSD USB |
| **Conexão** | Cabo de rede Ethernet conectado ao roteador/MikroTik | Cabo de rede Gigabit |

> 💡 **Dica:** A versão **64 bits** do Raspberry Pi OS oferece desempenho muito superior e compatibilidade nativa com o Node.js 20 LTS e os binários do Prisma.

---

## ⚡ Instalação Rápida (1 Comando via Terminal)

Acesse o seu Raspberry Pi via **SSH** ou abra o terminal e execute:

```bash
sudo apt-get update && sudo apt-get install -y git curl
git clone https://github.com/lyncolnsas/mikrogestor-voucher22.git /opt/mikrogestor-voucher
cd /opt/mikrogestor-voucher && sudo bash install.sh
```

---

## ⚙️ O Que o Instalador Faz Automaticamente

O script [`install.sh`](file:///c:/Users/lynco/OneDrive/Documentos/-Projetos/mikrogestor-voucher22/install.sh) foi preparado especificamente para o ecossistema ARM do Raspberry Pi:

1. **Proteção de Memória (SWAP Automático):**  
   O Raspberry Pi OS vem de fábrica com apenas 100MB de swap. O instalador detecta a memória disponível e cria automaticamente um arquivo de **2GB de SWAP**, evitando o erro fatal de falta de memória (*Out of Memory / Killed 137*) durante a compilação do Next.js.

2. **Proteção do Cartão MicroSD (SQLite WAL Mode):**  
   Configura o banco de dados em modo **Write-Ahead Logging (WAL)**. Isso reduz em mais de 80% o número de gravações físicas no cartão MicroSD, aumentando sua durabilidade e protegendo os dados contra corrupção em caso de quedas de energia.

3. **Suporte Nativo a ARM64 e ARMv7:**  
   Gera o cliente Prisma especificando os motores de execução compilados para arquitetura ARM Linux (`linux-arm64-openssl-3.0.x`).

4. **Permissões de Porta 80 (`cap_net_bind_service`):**  
   Aplica permissões no binário do Node para permitir escuta direta na porta `80` (HTTP) sem necessidade de scripts inseguros.

5. **Inicialização Automática no Boot (PM2 Daemon):**  
   Configura o PM2 para que o sistema suba sozinho caso o Raspberry Pi seja reiniciado ou caia a energia.

---

## 🌐 Acesso ao Painel

Ao finalizar a instalação, o terminal exibirá o endereço IP local do seu Raspberry Pi. Acesse de qualquer computador ou celular na mesma rede:

- **Painel Administrativo:** `http://IP-DO-RASPBERRY/dashboard`
- **Editor do Portal Captivo:** `http://IP-DO-RASPBERRY/dashboard/portal`
- **Usuário Padrão:** `admin`
- **Senha Padrão:** `123`

---

## 📡 Conexão com o MikroTik

Para que o MikroGestor gerencie seus vouchers e configure o Hotspot:

1. Conecte o cabo de rede do Raspberry Pi a uma porta do MikroTik (ex: `ether2` ou em um switch da rede local).
2. No Winbox / Terminal do MikroTik, certifique-se de que o serviço de API está ativo:
   ```routeros
   /ip service enable api
   /ip service print
   ```
   *(A porta padrão da API é a `8728`)*.
3. No painel do MikroGestor (`/dashboard/routers`), cadastre o IP do MikroTik, usuário e senha.

---

## 🛠️ Comandos Úteis do Dia a Dia

Dentro do Raspberry Pi, utilize os seguintes comandos no terminal:

| Ação | Comando |
| :--- | :--- |
| **Ver status e consumo de RAM** | `pm2 status` |
| **Ver logs ao vivo (tempo real)** | `pm2 logs mikrogestor-voucher` |
| **Reiniciar o sistema** | `pm2 restart mikrogestor-voucher` |
| **Parar o sistema** | `pm2 stop mikrogestor-voucher` |
| **Atualizar para a última versão** | `cd /opt/mikrogestor-voucher && sudo ./install.sh --update` |
| **Fazer diagnóstico de portas e memória** | `cd /opt/mikrogestor-voucher && sudo ./install.sh --check` |

---

## ❓ Resolução de Problemas Frequentes

### 1. "Porta 80 já está em uso"
Se o seu Raspberry Pi já possui o **Pi-hole**, **Lighttpd** ou **Apache** instalado, eles ocupam a porta 80.
- Para liberar a porta 80: desative o servidor web conflitante (`sudo systemctl stop lighttpd apache2 2>/dev/null || true`). O MikroGestor opera obrigatoriamente na porta 80.

### 2. Acesso aos logs de erro
Se encontrar alguma instabilidade:
```bash
pm2 logs mikrogestor-voucher --lines 100
```
