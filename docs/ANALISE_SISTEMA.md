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

### O "Deus" `whatsapp.ts`
O arquivo `src/services/whatsapp.ts` possui mais de 700 linhas e assumiu responsabilidades demais. Ele não apenas gerencia as conexões do WhatsApp (Baileys), mas também:
- Faz sincronização automática de IP e DNS no MikroTik (`[AutoSync] DNS portal.wifi.local`).
- Manipula estado de banco de dados (`prisma`).
- Lida com fila e retentativas.

**Melhoria sugerida:** Refatorar o `whatsapp.ts` dividindo-o em módulos menores:
- `whatsapp-connection.ts` (Apenas baileys auth e sockets)
- `mikrotik-sync.ts` (Sincronização de IP e Walled Garden)
- `whatsapp-queue.ts` (Gerenciamento de mensagens e filas)

### Log de Erros Síncrono Bloqueante no Portal
A rota `register/route.ts` faz uso intensivo de logs em arquivos de texto usando `fs.appendFileSync` (`error.log`).
- Em Node.js, métodos síncronos de sistema de arquivos (`Sync`) bloqueiam o *Event Loop*. Se muitos usuários se cadastrarem simultaneamente no hotspot, o servidor inteiro vai travar.
- **Melhoria sugerida:** Substituir `fs.appendFileSync` por fluxos assíncronos (`fs.promises.appendFile`) ou integrar uma biblioteca de logs moderna (como `Pino` ou `Winston`).

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
5. [x] **Desacoplamento do WhatsApp:** Criado serviço dedicado `src/services/network-sync.ts` para sincronização de DNS (`portal.wifi.local`) e Walled Garden IP no MikroTik, retirando responsabilidades não relacionadas a mensageria de `src/services/whatsapp.ts`.
