# 📊 Dashboard & Métricas

> **← [Voltar ao Índice](./README.md)**

O Dashboard é a tela inicial após o login de administrador. Ele exibe um resumo em tempo real de toda a operação.

---

## O que você vê ao entrar

![Dashboard Principal](../../docs/wiki/screenshots/01-dashboard.png)

O Dashboard é dividido em **4 blocos principais**:

### 1. Cards de Resumo (linha superior)

| Card | O que mostra | Por que importa |
|------|-------------|-----------------|
| 👥 **Clientes Ativos** | Usuários com sessão aberta agora | Indica lotação atual da rede |
| 💰 **Receita do Dia** | Soma dos pagamentos PIX confirmados hoje | Acompanhamento de caixa diário |
| 📶 **Roteadores Online** | Quantos MikroTiks estão com VPN ativa | Saúde da infraestrutura |
| 💬 **Mensagens Enviadas** | WhatsApp disparados nas últimas 24h | Monitoramento do pool |

### 2. Gráfico de Receita

Mostra a receita dos últimos 7 ou 30 dias (alternável). Útil para identificar dias de pico e vales de demanda.

### 3. Lista de Últimas Transações

Exibe as últimas 10 ativações (pagamentos PIX confirmados), com:
- Nome do cliente
- Plano contratado
- Valor pago
- Horário da confirmação

### 4. Status dos Chips WhatsApp

Mini-painel indicando quais chips estão `Conectado ✅`, `Aguardando QR 📱` ou `Desconectado ❌`.

---

## Ações disponíveis no Dashboard

- **Clicar em um roteador** → vai direto para os detalhes do MikroTik
- **Clicar em uma transação** → exibe detalhes do lead/cliente
- **Clicar no chip WhatsApp** → abre o gerenciador de instâncias

---

## Indicadores de Alerta

> [!WARNING]
> Se o card "Roteadores Online" mostrar **0**, verifique o serviço WireGuard na VPS com `systemctl status wg-quick@wg0`.

> [!TIP]
> A receita do Dashboard é atualizada em tempo real via Server-Sent Events (SSE). Não é necessário recarregar a página.

---

## Relacionado

- [02 — Roteadores MikroTik](./02-roteadores.md)
- [05 — WhatsApp Multi-Chip](./05-whatsapp.md)
- [07 — Financeiro](./07-financeiro.md)

---
*← [Anterior: Índice](./README.md) · [Próximo: Roteadores →](./02-roteadores.md)*
