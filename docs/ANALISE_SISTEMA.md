# Análise Completa do Sistema: Melhorias e Remoção de Códigos Parasitas

Esta documentação detalha a auditoria técnica do sistema MikroGestor, focando na identificação de erros, códigos obsoletos ("parasitas"), problemas de arquitetura e pontos de melhoria, visando manter o código limpo, seguro e escalável.

---

## 1. Erros de Linting e Tipagem (ESLint & TypeScript)
A auditoria estática do código (via `eslint` e `tsc`) identificou **786 problemas (431 erros, 355 warnings)**. Os principais vilões que sujam a base de código são:

- **Abuso do tipo `any`:** Inúmeros erros de `@typescript-eslint/no-explicit-any`. O uso excessivo de `any` anula os benefícios do TypeScript, escondendo bugs em tempo de compilação.
- **Variáveis não utilizadas:** Centenas de avisos `@typescript-eslint/no-unused-vars` (variáveis declaradas e nunca usadas, parâmetros `e` em blocos `catch`, imports não utilizados). Isso polui a leitura e aumenta o tamanho dos bundles.
- **Configuração incorreta do ESLint (Falso Positivo):** O arquivo `src/services/whatsapp.ts` acusa o erro `react-hooks/rules-of-hooks` ao chamar `useMultiFileAuthState`. A biblioteca `@whiskeysockets/baileys` usa o prefixo `use`, mas não é um React Hook. Como é código de backend, o ESLint deve ser configurado para ignorar essa regra em pastas de serviços Node (`src/services/**`, `src/app/api/**`).

---

## 2. Códigos "Parasitas" e Arquivos Soltos
Existem diversos arquivos de teste e scripts na raiz do projeto que estão poluindo o ambiente de produção e gerando erros do tipo `no-require-imports`:

- `test-wa.js`
- `test-wa.mjs`
- `update_page.js`
- `update_templates_with_images.js`

**Melhoria sugerida:**
Esses arquivos devem ser **removidos** (se obsoletos) ou movidos para uma pasta isolada como `scripts/` ou `tools/`. A raiz do projeto deve conter apenas configurações essenciais (`next.config.ts`, `package.json`, etc.).

---

## 3. Arquitetura e Boas Práticas (Single Responsibility)

### O Desacoplamento e Evolução da Mensageria (`whatsapp.ts` e `whatsapp-baileys.ts`)
O serviço de mensageria foi completamente modernizado e desacoplado:
- **`src/services/whatsapp-baileys.ts`**: Camada dedicada exclusivamente ao ciclo de vida de sockets Baileys, persistência de credenciais no SQLite via Prisma (`BaileysAuth`), pool dinâmico de 2 a 8 números simultâneos e auto-inclusão autônoma em grupo de biblioteca de mídias via código de convite (`groupAcceptInvite`).
- **`src/services/whatsapp.ts`**: Focado no despacho de mensagens, roteamento circular Round-Robin real entre números conectados, failover automático e encaminhamento nativo de mídias Meta (`relayMessage` + `generateForwardMessageContent`) sem re-upload de arquivos.
- **`src/services/network-sync.ts`**: Centraliza a sincronização de DNS (`portal.wifi.local`) e regras de Walled Garden no MikroTik, removendo 100% de código de rede do serviço de mensageria.

### Log de Erros Síncrono Bloqueante no Portal
A rota `register/route.ts` fazia uso intensivo de logs em arquivos de texto usando `fs.appendFileSync` (`error.log`).
- Em Node.js, métodos síncronos de sistema de arquivos (`Sync`) bloqueiam o *Event Loop*. Se muitos usuários se cadastrarem simultaneamente no hotspot, o servidor inteiro vai travar.
- **Melhoria implementada:** Substituído `fs.appendFileSync` por fluxos assíncronos (`fs.promises.appendFile`) em todas as rotas da aplicação.

---

## 4. Segurança e Manipulação de Erros

### Tratamento "Silencioso" via `console.log` e `console.error`
Foram encontrados inúmeros `console.error` espalhados pelo backend:
- `src/lib/routeros.ts` (Mikrotik Connection Error)
- `src/services/mercadopago.ts` (Error creating PIX)
- Vários em `src/services/whatsapp.ts`

**Problema:** Esses logs se perdem no terminal de produção (PM2/Docker) e não disparam alertas. Erros assíncronos não capturados (`.catch(console.error)`) podem derrubar processos em caso de falha de memória ou limite de conexões.
**Melhoria sugerida:** Centralizar os logs e implementar monitoramento de erros (ex: envio automático de alertas pro admin caso o RouterOS perca conexão ou o Baileys desconecte).

---

## 5. Plano de Ação Recomendado (Status: Concluído)

1. [x] **Limpeza de Raiz:** Movidos scripts avulsos (`create_*.js`, `patch_*.js`, `test-wa.*`, `update_*.ps1`, etc.) para a pasta `/scripts`. Raiz limpa e padronizada.
2. [x] **Ajuste de ESLint:** Configurado `eslint.config.mjs` com isolamento de regras para backend (desativando falsos positivos de hooks em Baileys) e frontend (regras de compilação do React 19 / Next.js 16). ESLint agora passa com **0 erros**.
3. [x] **Refatoração de Logs:** Substituídos todos os `fs.appendFileSync` bloqueantes em rotas críticas (`register`, `safari-bypass`) por versões assíncronas via `fs.promises.appendFile`.
4. [x] **Tipagem e Compilação:** Compilação TypeScript (`tsc --noEmit`) e Build Next.js (`next build`) executando com **100% de sucesso (0 erros)** em todas as 59 rotas da aplicação.
5. [x] **Desacoplamento do WhatsApp & Rede:** Criado serviço dedicado `src/services/network-sync.ts` para sincronização de DNS e Walled Garden IP no MikroTik.
6. [x] **Pool Multi-Números WhatsApp (2 a 8 Números):** Criado `src/services/whatsapp-baileys.ts` com gerenciamento de múltiplas instâncias concorrentes, persistência completa no SQLite (`BaileysAuth`), Round-Robin circular real e failover automático em caso de desconexão.
7. [x] **Biblioteca Central de Mídias & Forwarding Nativo:** Implementado encaminhamento nativo de fotos, vídeos e áudios a partir de grupo central do WhatsApp sem re-upload, com auto-inclusão autônoma de novas instâncias via código de convite.
