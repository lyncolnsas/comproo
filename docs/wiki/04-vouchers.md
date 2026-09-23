# 🎟️ Vouchers — Geração e Gestão

> **← [Voltar ao Índice](./README.md)**

Vouchers são códigos pré-pagos que permitem acesso imediato à rede sem necessidade de pagamento PIX no momento do uso. Ideais para eventos, salas de espera, consumidores VIP, etc.

---

## Tela de Vouchers

![Lista de Vouchers](../../docs/wiki/screenshots/04-vouchers-lista.png)

A lista de vouchers mostra:
- **Código** do voucher (ex: `MG-A1B2-C3D4`)
- **Plano** vinculado
- **Status**: `Disponível`, `Utilizado`, `Expirado`
- **Data de uso** (quando foi ativado pelo cliente)
- **Lead vinculado** (quem usou)

---

## Gerador em Lote

![Gerador de Vouchers em Lote](../../docs/wiki/screenshots/04-vouchers-lote.png)

Para criar múltiplos vouchers de uma vez:

1. Acesse **Vouchers → Gerar em Lote**
2. Selecione:
   - **Plano**: qual plano o voucher libera
   - **Quantidade**: de 1 a 500 vouchers por lote
   - **Prefixo** (opcional): ex. `EVENTO` gera `EVENTO-A1B2`
   - **Validade**: data de expiração (deixe em branco para nunca expirar)
3. Clique em **Gerar Vouchers**
4. Baixe o arquivo **CSV** ou **PDF** com todos os códigos

---

## Como o Cliente Usa um Voucher

1. Acessa a rede Wi-Fi → Portal aparece
2. Na tela de cadastro, insere o código no campo **"Voucher"**
3. Sistema valida o código → libera o plano correspondente automaticamente
4. O voucher é marcado como `Utilizado` e vinculado ao CPF/Telefone do cliente

> [!IMPORTANT]
> Cada voucher pode ser usado **apenas uma vez**. Se o cliente tenta reutilizar o mesmo código com CPF diferente, o sistema rejeita e registra a tentativa.

---

## Exportação e Impressão

- **CSV**: para integração com sistemas externos ou planilhas
- **PDF**: para impressão física (vouchers de papel para entregar no balcão)
- **Compartilhamento WhatsApp**: envie o código diretamente para o cliente via bot

---

## Anti-Fraude

O sistema detecta tentativas de:
- **Reuso do mesmo código** por CPFs diferentes → bloqueado automaticamente
- **Uso após expiração** → código retorna erro "Voucher expirado"
- **Vouchers de outro roteador** → o sistema valida que o voucher foi gerado para o ponto de acesso atual

---

## Relacionado

- [03 — Hotspot & Planos](./03-hotspot-planos.md)
- [09 — Segurança & Anti-Burla](./09-seguranca.md)

---
*← [Anterior: Hotspot & Planos](./03-hotspot-planos.md) · [Próximo: WhatsApp →](./05-whatsapp.md)*
