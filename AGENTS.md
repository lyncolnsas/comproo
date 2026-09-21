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
