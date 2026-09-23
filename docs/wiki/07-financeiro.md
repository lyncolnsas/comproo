# 💰 Financeiro — Receitas, PIX e Relatórios

> **← [Voltar ao Índice](./README.md)**

O módulo financeiro consolida todos os pagamentos recebidos, fornece relatórios de receita e permite acompanhar cada transação PIX em tempo real.

---

## Tela Financeira

![Dashboard Financeiro](../../docs/wiki/screenshots/07-financeiro.png)

O painel financeiro exibe:
- **Receita do dia / semana / mês** com gráficos de evolução
- **Total de transações** aprovadas
- **Ticket médio** por cliente
- **Lista de transações** com filtros por data, plano, roteador

---

## Como Funciona o PIX

O MikroGestor usa a integração nativa com o sistema bancário via **webhook PIX** (Open Finance):

```
QR Code gerado pelo sistema
         │
Cliente escaneia com app do banco
         │
         ▼
Banco processa pagamento
         │
Banco envia webhook para: https://mikrogestor.com/api/pix/webhook
         │
         ▼
Sistema confirma pagamento → libera acesso no MikroTik (< 5 segundos)
         │
         ▼
WhatsApp envia confirmação para o cliente
```

### Por que o PIX é seguro para o cliente?

> **O pagamento ocorre exclusivamente dentro do aplicativo do banco do cliente, em conexão criptografada direta com o sistema bancário. Nenhum dado financeiro transita pela rede Wi-Fi do Hotspot.**

---

## Relatório de Receita por Período

1. Acesse **Financeiro → Relatórios**
2. Selecione o período (dia, semana, mês, custom)
3. Filtre por roteador (para ver receita de um ponto específico)
4. Exporte em **CSV** para Excel/Google Sheets

---

## Reconciliação de Pagamentos

O sistema mantém log de cada transação com:
- ID único da transação PIX (EndToEndId)
- CPF do pagador
- Valor em centavos
- Timestamp de confirmação
- Status: `approved`, `pending`, `failed`

Em caso de discrepância, o administrador pode reprocessar manualmente um pagamento clicando em **"Reprocessar"** na linha da transação.

---

## Troubleshooting

| Problema | Causa provável | Solução |
|----------|---------------|---------|
| PIX confirmado mas acesso não liberado | Webhook não chegou | Verifique logs da API: `GET /api/pix/webhook` |
| Transação duplicada | Webhook enviado duas vezes pelo banco | Sistema é idempotente por EndToEndId — segunda chamada ignorada automaticamente |
| Receita não aparece no relatório | Filtro de data errado | Verifique o timezone — sistema usa UTC-3 (Brasília) |

---

## Relacionado

- [03 — Hotspot & Planos](./03-hotspot-planos.md)
- [05 — WhatsApp (gatilho de confirmação)](./05-whatsapp.md)

---
*← [Anterior: Portal do Cliente](./06-portal-cliente.md) · [Próximo: VPN WireGuard →](./08-vpn-wireguard.md)*
