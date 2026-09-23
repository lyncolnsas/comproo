# ❓ FAQ — Perguntas Frequentes

> **← [Voltar ao Índice](./README.md)**

Respostas rápidas para as dúvidas mais comuns de operadores e administradores do MikroGestor.

---

## Clientes / Usuários

### "O cliente pagou mas o acesso não liberou. O que fazer?"

1. Verifique em **Financeiro → Transações** se o pagamento aparece como `approved`
2. Se aprovado mas sem acesso: clique em **"Reprocessar"** na transação
3. Se não aparece: o webhook do PIX pode não ter chegado. Verifique os logs da API em `/var/log` ou no Coolify → Logs do container

---

### "O cliente diz que a internet parou mas ele está no prazo do plano."

1. Verifique em **Controle de Acesso → Sessões Ativas** se o cliente ainda aparece online
2. Se offline, pode ter ocorrido desconexão por inatividade — cliente precisa abrir o browser e acessar o portal novamente
3. Oriente o cliente: *"Abra o Chrome e acesse neverssl.com para forçar a tela de reconexão"*

---

### "O cliente tentou burlar com MAC aleatório. O que acontece?"

O sistema detecta o CPF/Telefone no novo cadastro → rejeita com erro 403 → adiciona o novo MAC à blacklist do MikroTik automaticamente. Nenhuma ação manual necessária.

---

### "Posso reembolsar um cliente?"

O sistema não processa reembolsos automaticamente — o PIX já foi liquidado. Para reembolso manual, utilize o canal PIX do seu banco para devolver o valor ao cliente. Em seguida, cancele ou desative o acesso no painel em **Clientes → [Nome] → Desativar Acesso**.

---

## Administração / Técnico

### "O roteador aparece offline. Como diagnosticar?"

1. `ssh root@vps` → `wg show` → o peer do MikroTik aparece com `last-handshake`?
2. Sem handshake nos últimos 5 minutos → roteador perdeu conectividade
3. No MikroTik via Winbox (se tiver acesso alternativo): verifique `/interface wireguard peer print`
4. Reinicie o WireGuard no MikroTik: `/interface wireguard set wg-mg disabled=yes` e depois `disabled=no`

---

### "Adicionei um novo chip WhatsApp mas ele não entrou no grupo."

O sistema tenta automaticamente por até 3 vezes com 5 segundos de intervalo. Aguarde ~20 segundos após o chip conectar. Se ainda não entrar:
1. Verifique se o grupo tem ingresso por convite habilitado (configurações do grupo no WhatsApp)
2. Ou adicione manualmente o número do chip ao grupo pelo WhatsApp no seu celular

---

### "Recebi erro 'RosException: !empty' nos logs."

Isso era um bug em versões antigas. O patch em `src/lib/routeros.ts` (linhas 5-33) intercepta esse erro e retorna `[]` (lista vazia) automaticamente. Se ainda estiver ocorrendo, **nunca remova ou mova esse patch**.

---

### "Vou fazer um redeploy no Coolify. O que verificar antes?"

Consulte o **[Checklist de Deploy](../../.agents/skills/mikrogestor-deploy/SKILL.md)** — é obrigatório antes de qualquer redeploy. O ponto crítico é confirmar que o volume persistente `/data/mikrogestor/prisma` → `/app/prisma` está montado. Sem isso, todos os dados são perdidos.

---

### "Como fazer backup do banco de dados?"

```bash
# No servidor VPS:
docker exec <container_id> sqlite3 /app/prisma/dev.db .dump > backup_$(date +%Y%m%d).sql

# Ou copiar o arquivo diretamente:
cp /data/mikrogestor/prisma/dev.db /backup/mikrogestor_$(date +%Y%m%d).db
```

---

### "O certificado SSL do portal expirou no MikroTik."

O sistema renova automaticamente via agendador `/system scheduler` a cada 15 dias. Se expirou manualmente:
1. Acesse **Roteadores → [Nome] → Sincronizar SSL**
2. O sistema busca o certificado atual do Traefik e envia para o MikroTik via `/tool fetch`

---

## WhatsApp Marketing

### "Quantas mensagens posso enviar por dia sem risco de bloqueio?"

Não existe um número exato definido pelo WhatsApp. Com o pool de múltiplos chips e a estratégia de encaminhamento (não re-upload), o risco é significativamente menor. Como referência conservadora: cada chip pode enviar **200-500 mensagens/dia** antes de entrar em zona de risco. Com 4 chips, isso representa **800-2000 mensagens/dia** com segurança razoável.

---

### "Posso usar o mesmo vídeo para todos os clientes?"

Sim, e é exatamente para isso que serve a **Biblioteca de Mídias**. Você envia o vídeo uma vez no grupo de biblioteca, e o sistema encaminha o mesmo Media ID para todos os clientes. O vídeo é servido pela CDN da Meta — zero re-upload, entrega instantânea.

---

## Jurídico / Compliance

### "O sistema está em conformidade com a LGPD?"

Sim. O MikroGestor:
- Coleta apenas dados necessários (nome, telefone, CPF, logs de conexão)
- Não vende ou compartilha dados com terceiros
- Armazena logs de conexão conforme obrigação do Marco Civil da Internet (art. 13 — 1 ano mínimo)
- Os Termos de Uso versão 2.0 citam explicitamente a base legal de cada tratamento

### "O cliente pode solicitar exclusão dos dados?"

Sim, pelo direito do art. 18 da LGPD. O administrador pode excluir os dados do cliente em **Clientes → [Nome] → Excluir Dados**. Logs de conexão obrigatórios (art. 13 do Marco Civil) são retidos pelo prazo legal mínimo mesmo após exclusão de dados pessoais.

---

*← [Anterior: Segurança](./09-seguranca.md) · [Voltar ao Índice →](./README.md)*

---
*Wiki MikroGestor v2.0 · Setembro/2024*
