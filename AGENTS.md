<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# REGRAS OBRIGATÓRIAS DO PROJETO MIKROGESTOR (P0)

1. **PORTA OBRIGATÓRIA**: O servidor Next.js roda EXCLUSIVAMENTE na porta 80 (`http://localhost` ou `http://localhost:80`). É EXPRESSAMENTE PROIBIDO acessar ou sugerir a porta 3000.
2. **VALIDAÇÃO ANTES DE ENTREGAR**: Antes de declarar qualquer alteração concluída, rode a verificação de compilação (`npm run build` ou checagem de tipos) e, se o Prisma mudar, execute `npx prisma db push; npx prisma generate`.
3. **PERSISTÊNCIA DO BAILEYS**: O WhatsApp Baileys persiste sessões no SQLite via Prisma (`BaileysAuth`), nunca gerando milhares de arquivos JSON em disco.
4. **ARQUITETURA WIREGUARD VPN**:
   - **Split-Tunnel Obrigatório**: O túnel WireGuard (`10.8.0.0/24`) serve exclusivamente para tráfego de controle/API da VPS para os MikroTiks (TCP 8728, 8729). É PROIBIDO rotear tráfego geral de navegação dos usuários de Hotspot através da VPS (`AllowedIPs` deve ser sempre estritamente `10.8.0.0/24`).
   - **Scripts RouterOS v7 em Linha Única**: No Winbox Terminal, NUNCA use quebra de linha com barra invertida (`\`). Todos os comandos para RouterOS v7 devem ser gerados em linha única para evitar `syntax error` por quebras de linha Windows (`\r\n`).
   - **Comunicação Docker-Host**: No Coolify/Docker, o container do MikroGestor comunica-se com o daemon WireGuard do host via `http://172.17.0.1:51821` com cabeçalho `X-WG-Secret`. O UFW na VPS deve liberar a subnet Docker `172.16.0.0/12` para a porta 51821.
5. **PATCH ROUTEROS v7 OBRIGATÓRIO**: A biblioteca `node-routeros`/`routeros-client` LANÇA EXCEÇÃO (`RosException: Tried to process unknown reply: !empty`) ao consultar tabelas vazias no RouterOS v7. O patch em `src/lib/routeros.ts` (linhas 5-33) intercepta `Channel.prototype.processPacket` e `Channel.prototype.onUnknown` para retornar `[]` quando `reply === '!empty'`. **NUNCA remova, mova ou refatore esse bloco.** Qualquer agente que altere `src/lib/routeros.ts` DEVE verificar que o patch ainda está intacto.
6. **PERSISTÊNCIA DO BANCO SQLITE NO COOLIFY**: O Coolify destrói o container a cada redeploy. O arquivo `prisma/dev.db` DEVE estar mapeado como volume persistente: container `/app/prisma` → host `/data/mikrogestor/prisma`. Sem isso, TODOS os roteadores cadastrados e dados de hotspot são perdidos a cada deploy. Antes de qualquer redeploy, confirme que o volume está configurado em Coolify → Application → Persistent Storage.
7. **CHECKLIST DE DEPLOY**: Antes de qualquer deploy/redeploy, use a skill `mikrogestor-deploy` em `.agents/skills/mikrogestor-deploy/SKILL.md`. Ela contém o checklist completo pré/durante/pós-deploy, diagnóstico de erros comuns e comandos de emergência.
8. **GUIA DE DEPLOY EM NOVA VPS**: Para qualquer provisionamento do zero em nova VPS (Ubuntu 22/24 / Debian / Coolify), o procedimento obrigatório passo a passo está documentado em `docs/GUIA_DEPLOY_COMPLETO_NOVA_VPS.md` e a validação deve ser executada com `bash scripts/verificar-deploy-completo.sh`.
9. **MODOS DE PROVISIONAMENTO — REGRA CRÍTICA**:
   - **`DEPLOYMENT_MODE=local`** (padrão): Servidor na LAN. O provisionamento cria DNS estático `portal.wifi.local → IP LAN` e Walled Garden com IP LAN. O IP do container/servidor é real e roteável.
   - **`DEPLOYMENT_MODE=vps`**: Servidor em VPS/Docker. O provisionamento NUNCA deve criar DNS estático com IPs internos Docker (`172.17.x.x` / `10.8.x.x`). Deve usar `PORTAL_PUBLIC_DOMAIN` no Walled Garden e no `dns-name` do perfil de hotspot. A variável `PORTAL_PUBLIC_DOMAIN` é **OBRIGATÓRIA** neste modo — sem ela, o hotspot ficará inacessível. A lógica está em `src/lib/domain.ts` (`isVpsMode()`, `getPublicDomain()`) e o método `ensureAdminArpAndBypass()` aceita `{ mode, publicDomain }` como quarto parâmetro.

