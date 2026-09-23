# 🔐 VPN WireGuard — Acesso Remoto Seguro

> **← [Voltar ao Índice](./README.md)**

O WireGuard é o backbone de comunicação entre o servidor MikroGestor (VPS) e todos os roteadores MikroTik. Ele cria um túnel criptografado privado que permite controle total dos roteadores, mesmo sem IP público.

---

## Arquitetura da VPN

```
VPS Coolify (2.25.168.82)
│  ├─ wg0 interface (10.8.0.1)
│  │
│  ├─ Peer: MikroTik Loja Centro (10.8.0.2)
│  ├─ Peer: MikroTik Loja Sul    (10.8.0.3)
│  ├─ Peer: Admin Windows        (10.8.0.4)
│  └─ Peer: Admin Mobile         (10.8.0.5)
│
└─ Tráfego Split-Tunnel:
   AllowedIPs = 10.8.0.0/24 (APENAS tráfego de controle)
   ✅ MikroTik API (TCP 8728, 8729)
   ✅ Winbox (TCP 8291)
   ❌ Navegação geral dos clientes NÃO passa pela VPS
```

> [!IMPORTANT]
> **Split-Tunnel obrigatório**: o `AllowedIPs` deve ser sempre `10.8.0.0/24`. NUNCA `0.0.0.0/0`. Rotear o tráfego dos clientes pela VPS violaria a regra de arquitetura do sistema e causaria sobrecarga.

---

## Tela de VPN

![WireGuard VPN Dashboard](../../docs/wiki/screenshots/08-wireguard-vpn.png)

O painel VPN mostra:
- **Peers ativos**: roteadores e admins conectados
- **IP WireGuard** de cada peer
- **Último handshake**: indica se o peer está ativo
- **Bytes enviados/recebidos**: métricas de tráfego por peer

---

## Peers Administrativos (Windows e Mobile)

Além dos MikroTiks, você pode adicionar seu computador ou celular ao túnel VPN para ter **acesso remoto direto via Winbox**:

### Adicionando seu computador (Windows)

1. Acesse **VPN → Peers Administrativos → + Novo Peer Admin**
2. Sistema gera o par de chaves e atribui um IP (ex: `10.8.0.4`)
3. Baixe o arquivo `.conf` gerado
4. Abra o **WireGuard for Windows**, clique em **"Import tunnel"**, selecione o `.conf`
5. Ative o túnel → ícone do WireGuard fica verde

### Adicionando pelo celular (QR Code)

1. Mesmos passos 1-3 acima
2. Em vez de baixar o `.conf`, clique em **"QR Code"**
3. Abra o app WireGuard no celular → **"+"** → **"Escanear do QR Code"**
4. Aponte a câmera para o QR Code exibido na tela

---

## Acesso Remoto via Winbox (sem IP público)

Com a VPN ativa no Windows:

1. Abra o **Winbox** normalmente
2. No campo "Connect To", digite o **IP WireGuard** do roteador (ex: `10.8.0.2`)
3. Porta: `8291` (padrão Winbox)
4. Entre com as credenciais do roteador

Você tem acesso completo ao Winbox do roteador — sem TeamViewer, sem AnyDesk, sem IP público. Qualquer MikroTik na VPN fica a um clique de distância.

> [!TIP]
> O MikroTik precisa ter a regra de firewall permitindo Winbox pela subnet VPN:
> ```
> /ip firewall filter add chain=input action=accept src-address=10.8.0.0/24 dst-port=8291 protocol=tcp comment="MG: Allow Winbox via VPN" place-before=1
> ```

---

## Diagnóstico

| Sintoma | Causa | Solução |
|---------|-------|---------|
| Roteador offline na VPN | WireGuard do MikroTik caiu | No Winbox: `/interface wireguard peer print` e verificar `last-handshake` |
| Não consigo acessar via Winbox pelo IP VPN | Firewall MikroTik bloqueando porta 8291 | Adicionar regra de accept para `10.8.0.0/24` na porta `8291` |
| VPS perdeu a configuração WireGuard | Serviço não reiniciou | `systemctl restart wg-quick@wg0 && systemctl enable wg-quick@wg0` |

---

## Relacionado

- [02 — Roteadores MikroTik](./02-roteadores.md)
- [Skill: wireguard-vpn-specialist](../../.agents/skills/wireguard-vpn-specialist/SKILL.md)

---
*← [Anterior: Financeiro](./07-financeiro.md) · [Próximo: Segurança →](./09-seguranca.md)*
