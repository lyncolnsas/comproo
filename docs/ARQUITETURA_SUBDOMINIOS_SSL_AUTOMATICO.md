# Arquitetura de Subdomínios Dedicados e SSL Automático no MikroGestor

Este documento descreve detalhadamente a arquitetura de provisionamento de **subdomínios dedicados** e **certificados SSL Let's Encrypt automatizados** para cada roteador MikroTik conectado à VPS MikroGestor via túnel WireGuard VPN.

---

## 1. O Problema Resolvido

No modo Hotspot do MikroTik com redirecionamento de captive portal:
1. **Telas Vermelhas de Alerta de Segurança (CNA / Navegadores)**: Quando um cliente tenta navegar em um site HTTPS antes do login, se o roteador responder com um certificado auto-assinado ou sem certificado, o navegador ou o assistente de conexão (CNA da Apple/Android) exibe tela vermelha de bloqueio/risco de segurança.
2. **Conflito de Domínio (Loop de Redirecionamento)**: Se o campo `dns-name` do Hotspot Profile for preenchido com o domínio principal do sistema (`mikrogestor.com`), o MikroTik intercepta todas as consultas DNS e aponta para `192.168.88.1`, impedindo que os clientes acessem o painel da VPS ou o portal de pagamento PIX.
3. **Falta de IP Público no Roteador**: Os MikroTiks dos clientes estão atrás de CGNAT ou links comuns de operadoras (sem IP público ou DDNS fixo).

---

## 2. A Solução Implementada

Para cada roteador criado (ex: `"mkroça"`):
1. **Geração do Slug e Subdomínio**: O nome é sanitizado para conformidade DNS RFC 1123 (ex: `"mkroça"` → `"mkroca"` → `mkroca.mikrogestor.com`).
2. **Apontamento Wildcard no DNS (Hostinger)**:
   - Registro `A` com `Host: *` e `Valor: 2.25.168.82` (IP da VPS).
   - Qualquer subdomínio existente ou futuro aponta instantaneamente para a VPS sem precisar criar registros manuais para cada roteador.
3. **Proxy Reverso Dinâmico no Traefik (Coolify)**:
   - O daemon `wg-manager` cria um arquivo dinâmico em `/data/coolify/proxy/dynamic/router-<slug>.yaml`.
   - O Traefik v3 monitora essa pasta em tempo real (`watch: true`) e publica as rotas:
     - `https://<slug>.mikrogestor.com` → `http://<vpnIp>:80` (WebFig / Hotspot do MikroTik através do túnel WireGuard `10.8.0.0/24`).
     - `http://<slug>.mikrogestor.com` → `http://<vpnIp>:80`.
   - O Traefik gera o certificado Let's Encrypt automaticamente via desafio HTTP-01 e armazena em `/data/coolify/proxy/acme.json`.
4. **Extração do Certificado e Chave**:
   - O daemon `wg-manager` no host lê `/data/coolify/proxy/acme.json` e expõe `GET /cert/extract?domain=<subdomain>`.
   - O MikroGestor expõe o endpoint público `/api/vpn/router/[id]/cert-file?type=cert|key` (liberado no `middleware.ts`).
5. **Injeção e Auto-Renovação no MikroTik**:
   - O script de configuração do WireGuard (.rsc) cria um script `/system script add name=mg-sync-ssl ...` e um agendador `/system scheduler add name=mg-renew-ssl interval=15d ...`.
   - O script baixa `mg-cert.pem` e `mg-key.pem` via `/tool fetch check-certificate=no`, importa em `/certificate`, vincula a `www-ssl` (porta 443) e atualiza o Hotspot Profile:
     - `dns-name: <slug>.mikrogestor.com`
     - `ssl-certificate: mg-ssl-<slug>`
     - `https: yes`
6. **Walled Garden Completo**:
   - Libera `*mikrogestor.com*` no Walled Garden HTTP.
   - Libera `mikrogestor.com`, `www.mikrogestor.com`, `<slug>.mikrogestor.com` e o IP `2.25.168.82` no Walled Garden IP (HTTPS porta 443).

---

## 3. Diagrama do Fluxo de Rede

```
[ Cliente Hotspot ]
        │
        ├── 1. Conecta no Wi-Fi e solicita navegação
        ▼
[ MikroTik RouterOS v7 ] (10.8.0.X na VPN)
        │
        ├── 2. Captive Portal responde em https://mkroca.mikrogestor.com
        │      com Certificado Let's Encrypt VÁLIDO (sem avisos de segurança)
        │
        ├── 3. Liberação de Walled Garden IP (porta 443)
        ▼
[ VPS MikroGestor ] (2.25.168.82)
        │
        ├── Traefik (Coolify Proxy)
        │     ├── CertResolver: letsencrypt (HTTP-01)
        │     └── Dynamic provider: /data/coolify/proxy/dynamic/
        │
        └── wg-manager daemon (127.0.0.1:51821)
              ├── Traefik config manager
              ├── acme.json parser & extractor
              └── WireGuard kernel manager
```

---

## 4. Requisitos de Configuração na VPS e Hostinger

### 4.1 Hostinger / Provedor DNS
Criar um registro `A` wildcard:
- **Tipo**: `A`
- **Nome**: `*`
- **Aponta para**: `2.25.168.82`
- **TTL**: `300` ou `Default`

### 4.2 Coolify / Traefik
O container `coolify-proxy` monta o diretório de configurações dinâmicas:
- Host: `/data/coolify/proxy/dynamic/` → Container: `/traefik/dynamic/`
- Traefik flag: `--providers.file.directory=/traefik/dynamic/ --providers.file.watch=true`

### 4.3 Daemon WG-Manager (`/opt/mikrogestor-wg-manager/wg-manager.py`)
Executado como serviço systemd `mikrogestor-wg-manager.service`:
- Porta: `51821`
- Autenticação: cabeçalho `X-WG-Secret` correspondente a `/etc/mikrogestor-wg.secret`
- Endpoints:
  - `POST /traefik/subdomain/add`
  - `POST /traefik/subdomain/remove`
  - `GET /cert/extract?domain=<subdomain>`
  - `POST /peer/add`
  - `POST /peer/remove`
  - `GET /status`
  - `GET /health`
