<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# REGRAS OBRIGATÓRIAS DO PROJETO MIKROGESTOR (P0)

1. **PORTA OBRIGATÓRIA**: O servidor Next.js roda EXCLUSIVAMENTE na porta 80 (`http://localhost` ou `http://localhost:80`). É EXPRESSAMENTE PROIBIDO acessar ou sugerir a porta 3000.
2. **VALIDAÇÃO ANTES DE ENTREGAR**: Antes de declarar qualquer alteração concluída, rode a verificação de compilação (`npm run build` ou checagem de tipos) e, se o Prisma mudar, execute `npx prisma db push; npx prisma generate`.
3. **PERSISTÊNCIA DO BAILEYS**: O WhatsApp Baileys persiste sessões no SQLite via Prisma (`BaileysAuth`), nunca gerando milhares de arquivos JSON em disco.
