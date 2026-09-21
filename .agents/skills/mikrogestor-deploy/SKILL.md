---
name: mikrogestor-deploy
description: >
  Checklist completo de deploy, provisionamento em nova VPS e troubleshooting para o MikroGestor no Coolify.
  Contém regras obrigatórias aprendidas em produção: compatibilidade RouterOS v7,
  persistência do banco SQLite, NAT Masquerade na interface wg0, verificação WireGuard e scripts de auto-teste.
  Use SEMPRE antes de fazer deploy ou redeploy no Coolify.
---

# MikroGestor — Skill de Deploy Seguro & Provisionamento em Nova VPS

> **LEIA ESTE ARQUIVO INTEIRO antes de qualquer deploy, redeploy ou alteração de infraestrutura.**
> Manual completo detalhado: `docs/GUIA_DEPLOY_COMPLETO_NOVA_VPS.md`

---

## 1. Regras Críticas de Infraestrutura (P0 — NUNCA IGNORE)

### 1.1 Dupla Proteção: Patch RouterOS v7 (`!empty` replies)
A biblioteca `node-routeros` / `routeros-client` lança exceção fatal (`RosException: Tried to process unknown reply: !empty`) quando o RouterOS v7 responde a consultas em tabelas vazias.
O projeto implementa **dupla proteção**:
1. **Build-time / Disk**: `package.json` possui `"postinstall": "node scripts/patch-routeros.js"` que modifica fisicamente `node-routeros/dist/Channel.js` a cada `npm install`.
2. **Runtime / Memória**: No topo de `src/lib/routeros.ts` (linhas 5-33), há o monkey-patch que intercepta `Channel.prototype.processPacket` e `onUnknown` retornando `this.data = []`.
**NUNCA remova ou mova o bloco de patch em `src/lib/routeros.ts`.**

### 1.2 Persistência do banco SQLite no Coolify (OBRIGATÓRIO)
O Coolify destrói o container a cada redeploy. O arquivo `prisma/dev.db` DEVE ser mapeado para um volume persistente no host:
- **Host Path**: `/data/mikrogestor/prisma`
- **Container Path**: `/app/prisma`
- **Permissões no Host**: `chmod -R 777 /data/mikrogestor/prisma`

Configuração no Coolify:
- **Opção A**: Application → Persistent Storage → Add Volume (`/data/mikrogestor/prisma` -> `/app/prisma`)
- **Opção B**: Application → General Settings → Custom Docker Run Options: `-v /data/mikrogestor/prisma:/app/prisma`

> 🛡️ **Zero Retrabalho com Schema Sync**: O container inicia com `npx prisma db push --accept-data-loss --skip-generate`. Isso evita que qualquer divergência entre o código e o banco existente cause bloqueio interativo ou crash loops.

### 1.3 WireGuard: NAT Masquerade & Split-Tunnel Obrigatório
1. **Split-Tunneling**: `AllowedIPs` do peer MikroTik deve ser SEMPRE `10.8.0.0/24` (NUNCA `0.0.0.0/0`).
2. **NAT Masquerade no Host (Crucial para Docker)**: O arquivo `/etc/wireguard/wg0.conf` no host DEVE conter:
   ```ini
   PostUp   = iptables -A FORWARD -i %i -j ACCEPT; iptables -A FORWARD -o %i -j ACCEPT; iptables -t nat -A POSTROUTING -o %i -j MASQUERADE
   PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT; iptables -t nat -D POSTROUTING -o %i -j MASQUERADE
   ```
   *Sem o MASQUERADE, pacotes vindos do Docker (172.16.X.X ou 172.17.X.X) chegam ao MikroTik com IP de origem que ele desconhece ou descarta.*
3. **Portas de controle VPN**: TCP 8728 (API plain) e TCP 8729 (API SSL).
4. **Daemon WG-Manager**: Escuta em `0.0.0.0:51821`, protegido por header `X-WG-Secret`.
5. **UFW**: Deve liberar porta 51820/udp para o mundo e porta 51821/tcp para a rede Docker (`172.16.0.0/12`).

### 1.4 Subdomínio Dedicado & SSL Automático (Traefik + Let's Encrypt)
Para que todo roteador conectado responda em um subdomínio próprio (ex: `mkroca.mikrogestor.com`) com certificado SSL válido:
1. **Apontamento DNS Wildcard Obrigatório no Registro (Hostinger / Cloudflare)**:
   - **Tipo**: `A`
   - **Nome / Host**: `*` (ou `*.mikrogestor.com`)
   - **Valor / IP**: IP público da VPS (`2.25.168.82`)
   *Sem este registro wildcard, o Let's Encrypt falha no desafio HTTP-01 e os subdomínios não resolvem para a VPS.*
2. **Diretório Dinâmico do Traefik no Coolify**:
   - `/data/coolify/proxy/dynamic/` no host VPS é monitorado pelo Traefik (`--providers.file.watch=true`).
   - O daemon `wg-manager` cria arquivos `router-<slug>.yaml` nesse diretório automaticamente ao gerar uma nova VPN.
3. **Certificados Let's Encrypt (`acme.json`)**:
   - Traefik salva os certificados em `/data/coolify/proxy/acme.json`.
   - O daemon extrai certificado e chave em `/cert/extract?domain=<subdomain>`.
   - O MikroTik baixa os arquivos via `/tool fetch` e renova a cada 15 dias via `/system scheduler`.

### 1.5 Walled Garden: Regras Críticas no RouterOS v7
1. **Sem asteriscos em `walled-garden/ip`**: No RouterOS v7, `dst-host` em `/ip/hotspot/walled-garden/ip` **NÃO ACEITA ASTERISCOS** (ex: `*mikrogestor.com*` se torna `invalid: true`). Deve ser sempre o domínio exato (`mikrogestor.com`, `www.mikrogestor.com`) ou IP do host (`dst-address`).
2. **Idempotência estrita**: Todas as chamadas de provisionamento usam `ensureWalledGardenRules`, que varre regras existentes, deduplica entradas antigas e apenas insere as regras faltantes.
3. **Isolamento de IPs Docker**: O sincronizador de rede (`network-sync.ts`) nunca deve injetar IPs de containers Docker (`172.16.x.x`) ou DNS local (`portal.wifi.local`) no MikroTik quando `DEPLOYMENT_MODE === 'vps'`.

---

## 2. Deploy em Nova VPS do Zero (Checklist Rápido)

1. **Instalar Coolify na VPS**:
   ```bash
   curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
   ```
2. **Configurar Apontamento DNS Wildcard**:
   - `*` -> `IP_PUBLICO_VPS`
   - `@` -> `IP_PUBLICO_VPS`
   - `www` -> `IP_PUBLICO_VPS`
3. **Executar instalador de infraestrutura do MikroGestor**:
   ```bash
   bash <(curl -sSL https://raw.githubusercontent.com/lyncolnsas/mikrogestor-voucher22/main/vpn/setup-vps.sh)
   ```
4. **Criar aplicação no Coolify**:
   - Repo: `https://github.com/lyncolnsas/mikrogestor-voucher22.git`
   - Build Pack: `Nixpacks`
   - Porta: `80`
5. **Configurar Persistent Storage**:
   - `/data/mikrogestor/prisma` (Host) → `/app/prisma` (Container)
6. **Colar Variáveis de Ambiente no Coolify**:
   ```env
   DATABASE_URL=file:/app/prisma/dev.db
   NEXTAUTH_SECRET=(gerado pelo setup-vps.sh)
   NEXTAUTH_URL=https://SEU_DOMINIO
   PORT=80
   VPS_PUBLIC_IP=SEU_IP_VPS
   VPS_WG_PUBLIC_KEY=(chave do servidor wg0)
   WG_MANAGER_SECRET=(secret do wg-manager)
   # Gateway Docker do Coolify: 172.16.1.1 (ou 172.17.0.1 em Docker padrão)
   WG_MANAGER_URL=http://172.16.1.1:51821
   # ❗ OBRIGATÓRIO para modo VPS — sem isso o hotspot fica inacessível!
   DEPLOYMENT_MODE=vps
   PORTAL_PUBLIC_DOMAIN=SEU_DOMINIO  # Ex: mikrogestor.com (sem http:// e sem barra)
   ```
7. **Clicar em Deploy no Coolify**.
8. **Executar validação automatizada em 8 camadas**:
   ```bash
   bash scripts/verificar-deploy-completo.sh
   ```

---

## 3. Diagnóstico Rápido de Falhas

### RosException: !empty
- **Causa**: O patch do RouterOS v7 não foi aplicado na biblioteca `node-routeros`.
- **Solução**: Verifique se `scripts/patch-routeros.js` foi executado no container:
  `docker exec <id> node scripts/patch-routeros.js`

### ECONNREFUSED ou ETIMEDOUT ao conectar MikroTik (10.8.0.2:8728)
- **Causa 1**: Túnel WireGuard sem handshake (< 3 min) ou porta 51820 UDP bloqueada na nuvem.
- **Causa 2**: Falta de regra `iptables -t nat -A POSTROUTING -o wg0 -j MASQUERADE` no host.
- **Causa 3**: Serviço de API desativado no MikroTik (`/ip service enable api`).

### P1001: Can't reach database ou Container Crash Loop
- **Causa**: Falta de permissão no diretório montado ou conflito interativo de migração.
- **Solução**: No host, execute `chmod -R 777 /data/mikrogestor/prisma`. O script `npm run start` já inclui `--accept-data-loss` para prevenir bloqueios.

### Walled Garden com regras inválidas ou duplicadas
- **Causa**: Inserção de `*` em `walled-garden/ip` no RouterOS v7 ou provisionamento repetido.
- **Solução**: O MikroGestor trata isso nativamente via `ensureWalledGardenRules` e `cleanupAndDeduplicateWalledGarden`. Para resetar manualmente:
  `/ip hotspot walled-garden remove [find]; /ip hotspot walled-garden ip remove [find]` e execute o provisionamento novamente no painel.

### Portal do Hotspot inacessível após provisionamento (modo VPS)
- **Sintoma**: Clientes do hotspot são redirecionados mas não conseguem abrir o portal de login.
- **Causa mais comum**: `DEPLOYMENT_MODE` não está definido como `vps` ou `PORTAL_PUBLIC_DOMAIN` está vazio. O sistema cria DNS estático `portal.wifi.local → 172.17.X.X` (IP Docker interno), que é completamente inacessível para os clientes do hotspot.
- **Solução**:
  1. No Coolify, adicione `DEPLOYMENT_MODE=vps` e `PORTAL_PUBLIC_DOMAIN=seu.dominio.com`
  2. Fora do MikroTik, remova o DNS estático errado: `/ip dns static remove [find name=portal.wifi.local]`
  3. Re-provisione o roteador na tela de Provisionamento do MikroGestor

### Banco de dados perdeu dados após deploy
- **Causa**: Volume `/data/mikrogestor/prisma` não foi configurado no Coolify.
- **Solução**: Configure o volume no Coolify e execute `docker exec <id> npx prisma db push`.

---

## 4. Regras de Scripts RouterOS v7

- **NUNCA** use quebra de linha com barra invertida (`\`) em scripts para Winbox Terminal.
- **SEMPRE** gere comandos em linha única (evita `syntax error` por quebras CRLF no Windows).
- Use `:do {} on-error={}` para comandos em tabelas que podem estar vazias.
- Paths corretos RouterOS v7:
  - Hotspot server: `/ip/hotspot` (NÃO `/ip/hotspot/server`)
  - Interface WireGuard: `/interface/wireguard`
  - Peers WireGuard: `/interface/wireguard/peers`

---

## 5. Ferramentas e Scripts Úteis

| Script | Função |
|---|---|
| `vpn/setup-vps.sh` | Configura WireGuard, daemon, firewall e volumes no host em 1 comando. |
| `scripts/verificar-deploy-completo.sh` | Testa 8 camadas de saúde do sistema e aponta causas de falha. |
| `scripts/patch-routeros.js` | Aplica o patch RouterOS v7 fisicamente no `node_modules`. |
| `scripts/init-db.js` | Inicializa SQLite em modo WAL e cria usuário admin padrão. |
