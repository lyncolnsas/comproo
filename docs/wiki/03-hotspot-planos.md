# 📡 Hotspot & Planos de Acesso

> **← [Voltar ao Índice](./README.md)**

Esta seção explica como configurar os planos de acesso Wi-Fi, preços e o comportamento do Hotspot.

---

## O que são Planos de Hotspot?

Planos definem **quanto tempo** e **quanta velocidade** o cliente recebe ao pagar. Você pode ter planos variados: 1 hora, 1 dia, 7 dias, etc.

---

## Tela de Planos

![Planos de Hotspot](../../docs/wiki/screenshots/03-hotspot-planos.png)

Cada plano exibe:
- Nome do plano (ex: "1 Hora de Internet", "Diária")
- Preço em R$
- Duração (minutos/horas/dias)
- Limite de upload/download (Mbps)
- Limite de uptime (tempo total de uso)
- Status (ativo/inativo)

---

## Como Criar um Plano

1. Clique em **"+ Novo Plano"**
2. Preencha:
   - **Nome**: nome visível para o cliente no portal
   - **Preço (R$)**: valor cobrado via PIX
   - **Duração**: ex. `60` minutos, `24` horas
   - **Velocidade**: limite de download e upload em Mbps
3. Clique em **Salvar**

O plano é criado no banco de dados e sincronizado automaticamente para o MikroTik na próxima provisão.

---

## Modo de Venda (Pago vs. Gratuito)

O sistema tem dois modos, configuráveis por roteador:

| Modo | Como funciona | Quando usar |
|------|-------------|-------------|
| **Gratuito (cortesia)** | Cliente se cadastra e recebe X minutos grátis | Estabelecimentos que oferecem Wi-Fi sem cobrar |
| **Pago (PIX)** | Cliente escolhe plano e paga via PIX para liberar o acesso | Praças, eventos, locais com alto fluxo |

> [!TIP]
> Você pode oferecer os **primeiros 15 minutos gratuitos** e depois exigir pagamento — configure isso em "Tempo de Cortesia" nas configurações do roteador.

---

## Configurações Avançadas do Hotspot

Acesse **Roteadores → [Nome do Roteador] → Configurar Hotspot**:

| Campo | Descrição |
|-------|-----------|
| **Nome da Rede (SSID)** | Nome do Wi-Fi que o cliente verá no celular |
| **Perfil Hotspot** | Perfil do RouterOS vinculado ao sistema |
| **DNS Name** | Hostname local do portal (ex: `hotspot.wifi`) |
| **Walled Garden** | Domínios liberados antes da autenticação |
| **Tempo de Cortesia** | Minutos gratuitos antes de exigir pagamento |
| **Shared-Users** | Sempre `1` — bloqueio de compartilhamento |

---

## Como o PIX Libera o Acesso

```
Cliente paga PIX
       ↓
Banco do Brasil / Pix Instant → Webhook MikroGestor
       ↓
Sistema verifica CPF/Telefone → cria sessão Hotspot via API MikroTik
       ↓
MikroTik libera o MAC do cliente → internet disponível em < 5 segundos
       ↓
WhatsApp envia confirmação automática para o cliente
```

---

## Bloqueio Anti-Tethering (obrigatório)

Todo plano aplica automaticamente a regra de Mangle no MikroTik:
```
/ip firewall mangle add chain=postrouting out-interface=bridge action=change-ttl new-ttl=set:1 
comment="MikroGestor: Anti-Tethering"
```

Isso faz todos os pacotes chegarem ao celular com TTL=1 — se o cliente tentar compartilhar via Hotspot Pessoal, os pacotes são descartados pelo kernel do celular antes de chegar ao segundo dispositivo.

---

## Relacionado

- [04 — Vouchers](./04-vouchers.md)
- [06 — Portal do Cliente](./06-portal-cliente.md)
- [09 — Segurança & Anti-Burla](./09-seguranca.md)

---
*← [Anterior: Roteadores](./02-roteadores.md) · [Próximo: Vouchers →](./04-vouchers.md)*
