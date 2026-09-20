# Guia de Auditoria de Segurança: MikroGestor Voucher & Hotspot

Este documento estende a metodologia de auditoria da Cloudflare (`security-audit-skill`) para o ecossistema específico do **MikroGestor Voucher**.

---

## 1. Superfícies e Fronteiras de Confiança (Trust Boundaries)

O MikroGestor possui 6 superfícies críticas de confiança:

```
[ Usuário Não Autenticado (Wi-Fi Hotspot) ]
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ 1. Captive Portal & Endpoints Públicos (/api/portal/*) │
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│ 2. Backend Next.js 16 (Porta 80, Auth JWT, Prisma ORM) │
└───────────┬────────────────────────────┬───────────────┘
            │                            │
            ▼                            ▼
┌────────────────────────┐  ┌────────────────────────────┐
│ 3. MikroTik RouterOS   │  │ 4. WhatsApp Baileys        │
│    API (8728/8729)     │  │    (Multi-Device & SQLite) │
│    Firewall / Walled   │  └────────────────────────────┘
│    Garden / Hotspot    │
└────────────────────────┘
            │
            ▼
┌────────────────────────────────────────────────────────┐
│ 5. Appliance Local (Raspberry Pi 3 / Docker ARM64)    │
│    SQLite (dev.db) / Uploads (/public/uploads)         │
└────────────────────────────────────────────────────────┘
```

---

## 2. Vetores de Ataque Específicos do MikroGestor

### 2.1 RouterOS API & Hotspot Security
- **Injeção de Comandos RouterOS**: Parâmetros passados para menus como `/ip/hotspot/user`, `/system/script`, `/ip/firewall/filter`. Verificar sanitização contra delimitadores de comando RouterOS (`;`, `\`, quebras de linha).
- **Abuso de Walled Garden**: Regras de liberação de IP/Host (`/ip/hotspot/walled-garden`) que permitam que clientes não autenticados acessem redes privadas, painel administrativo ou endpoints restritos.
- **Exposição da API RouterOS**: Porta 8728 exposta para interfaces externas (WAN). A regra de firewall `MikroGestor: Accept API Access` deve ter `in-interface` ou `src-address` restrito para a rede local ou IP do servidor.

### 2.2 Voucher & Captive Portal
- **Entropia e Adivinhação de Vouchers**: Algoritmo de geração de vouchers (`src/app/api/hotspot/generate`). Garantir que os códigos não sejam sequenciais ou previsíveis por força bruta.
- **Controle de Sessão e MAC Spoofing**: Como o Hotspot lida com spoofing de endereço MAC ou reutilização indevida de vouchers.
- **Endpoints Públicos do Portal (`/api/portal/*`)**: Garantir que endpoints de compra de voucher via PIX (`buy-voucher`), cadastro de leads e verificação de status não permitam inserção arbitrária de créditos sem confirmação válida de webhook do Mercado Pago.

### 2.3 Next.js & Autenticação
- **Assinatura e Validação de JWT**: Chave `JWT_SECRET`. Garantir que não existam fallbacks fracos codificados ou permissão de algoritmo `none`.
- **Prevenção de Path Traversal no Upload**: Rota `/api/portal/upload` e `/uploads/[filename]`. Validação estrita de extensões de arquivo, impedindo upload de arquivos executáveis, scripts ou substituição de arquivos fora de `/public/uploads`.
- **Isolamento de Dados no Prisma**: Sanitização de parâmetros nas rotas de relatórios, usuários e logs para evitar vazamento entre tenants ou consultas maliciosas no SQLite.

### 2.4 WhatsApp Baileys & Webhooks
- **Persistência de Sessão no SQLite**: Tabela `BaileysAuth`. Credenciais e chaves criptográficas de sessão do WhatsApp nunca devem ser expostas em respostas de API ou logs.
- **Validação de Webhooks**: Validação de assinaturas e autenticação em `/api/webhook/mercadopago` e `/api/webhook/whatsapp`.

### 2.5 Hardening do Appliance (Raspberry Pi / Docker)
- **Execução Docker**: O container roda com `security_opt: ["seccomp:unconfined"]` e `network_mode: "host"`. Garantir que o processo Node.js dentro do container não execute tarefas privilegiadas desnecessárias.
- **Credenciais Padrão do Sistema Operacional**: Alertar e bloquear senhas de fábrica do usuário `hotspot` no Raspberry Pi e Winbox MikroTik.

---

## 3. Matriz de Severidade Adaptada para o MikroGestor

| Severidade | Critério no MikroGestor |
|---|---|
| **CRÍTICA** | Execução de código no servidor ou roteador; Acesso total ao banco SQLite sem autenticação; Bypass do Hotspot que libere internet irrestrita a todos sem voucher. |
| **ALTA** | Bypass de autenticação JWT no painel admin; Geração arbitrária de vouchers sem pagamento; Upload irrestrito de arquivos na raiz; Vazamento de credenciais do MikroTik (`Router` table). |
| **MÉDIA** | Adivinhação de vouchers por falta de rate limiting; SSRF em webhooks; Vazamento de informações do sistema em endpoints de erro; Falta de validação em campos do formulário de leads. |
| **BAIXA** | Divulgação de versões de pacotes em cabeçalhos HTTP; Regras de firewall com escopo excessivo mas sem exploração direta; Falta de headers de segurança (HSTS, CSP). |
| **INFO** | Recomendações de boas práticas e hardening de rotinas internas. |
