# 📱 Portal do Cliente — O que o usuário vê

> **← [Voltar ao Índice](./README.md)**

O Portal do Cliente é a interface exibida no **navegador do celular do cliente** quando ele se conecta na rede Wi-Fi e tenta acessar um site. O MikroTik intercepta a navegação e redireciona para esta tela.

---

## Fluxo Completo do Cliente

```
Cliente liga o Wi-Fi → conecta na rede
         │
         ▼
Abre o Chrome → MikroTik redireciona para o portal
         │
         ▼
    ┌────────────┐
    │ Tela de    │
    │ Login      │ ← cliente já cadastrado? entra direto
    │            │
    └─────┬──────┘
          │ Não tem conta
          ▼
    ┌────────────┐
    │ Tela de    │
    │ Cadastro   │ ← preenche nome, CPF, telefone
    │            │
    └─────┬──────┘
          │
          ▼
    ┌────────────┐
    │ Aceita os  │
    │ Termos     │ ← OBRIGATÓRIO (botão travado sem aceitar)
    └─────┬──────┘
          │
          ├─ Gratuito → acesso liberado imediatamente
          │
          └─ Pago → escolhe plano → gera PIX → paga no banco → acesso liberado
```

---

## Configuração Visual do Portal

O administrador pode customizar completamente o portal em **Configurações → Portal Visual**:

![Configurador de Portal](../../docs/wiki/screenshots/06-portal-config.png)

### Elementos customizáveis:

| Elemento | Descrição |
|----------|-----------|
| **Logo** | Imagem do estabelecimento (PNG/SVG) |
| **Cor principal** | Cor dos botões e destaques |
| **Background** | Cor de fundo ou imagem |
| **Texto de boas-vindas** | Mensagem exibida no topo do portal |
| **Campos do formulário** | Quais dados pedir (nome, CPF, e-mail, etc.) |
| **Botão de submit** | Texto do botão (ex: "Conectar Grátis", "Pagar e Conectar") |
| **Termos de uso** | Exibidos no rodapé e como checkbox obrigatório |

---

## Termos de Uso — Aceite Obrigatório

A partir da versão 2.0, o cliente **não pode concluir o cadastro** sem marcar o checkbox de aceite dos termos.

**Comportamento do botão:**
- ☐ Termos não aceitos → botão cinza, texto "🔒 Aceite os Termos para Continuar", desabilitado
- ☑ Termos aceitos → botão colorido com gradiente, texto normal, habilitado

Os termos abrem em nova aba com a versão adequada:
- **Acesso Gratuito** → [Termos de Acesso Gratuito](../termos-gratis.md)
- **Acesso Pago** → [Contrato de Prestação de Serviço](../termos-pagos.md)

---

## Segurança do Cadastro — Anti-Fraude

O sistema verifica o cliente ao se cadastrar:

1. **CPF/Telefone** já está na blacklist? → Cadastro rejeitado (HTTP 403)
2. **MAC Address** já foi bloqueado por não pagamento? → Novo MAC adicionado à blacklist no MikroTik
3. **Carência não paga** (cliente usou 15 min gratuitos sem pagar)? → Cadastro negado até regularização

Isso impede que o cliente esqueça a rede Wi-Fi ou ative MAC aleatório para burlar o sistema.

---

## Templates de Portal (Temas Visuais)

O sistema inclui múltiplos templates prontos:
- **Default** — moderno, gradiente azul
- **Dark** — tema escuro premium
- **Neon** — estilo futurista para baladas/eventos
- **Corporate** — minimalista para escritórios

Cada template pode ser totalmente personalizado com a paleta do estabelecimento.

---

## Relacionado

- [03 — Hotspot & Planos](./03-hotspot-planos.md)
- [09 — Segurança & Anti-Burla](./09-seguranca.md)

---
*← [Anterior: WhatsApp](./05-whatsapp.md) · [Próximo: Financeiro →](./07-financeiro.md)*
