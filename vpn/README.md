# 🔒 VPN WireGuard — MikroGestor

Arquivos desta pasta configuram a infraestrutura VPN para controle remoto de MikroTiks sem IP público.

## Arquitetura

```
[MikroTik] ──WireGuard UDP:51820──> [VPS Host]
                                         │
                                    [wg0: 10.8.0.1]
                                         │ 10.8.0.0/24 (rede de controle)
                                         │
                                    [wg-manager: 127.0.0.1:51821]
                                         │ HTTP interno
                                         │
                                    [MikroGestor Docker]
                                    connect(10.8.0.X, 8728)
```

## Instalação na VPS (uma vez)

```bash
# 1. SSH na VPS
ssh root@2.25.168.82

# 2. Baixar e executar o script de setup
bash <(curl -sSL https://raw.githubusercontent.com/SEU_REPO/main/vpn/setup-vps.sh)
# ou se o repo ainda não está publicado:
# Copie setup-vps.sh para a VPS e execute:
# bash setup-vps.sh
```

### O script faz automaticamente:
- [x] Instala WireGuard + Python3
- [x] Gera chaves do servidor (privada + pública)
- [x] Cria `/etc/wireguard/wg0.conf`
- [x] Habilita IP forwarding (`net.ipv4.ip_forward=1`)
- [x] Abre porta UDP 51820 no ufw
- [x] Instala `wg-manager.py` em `/opt/mikrogestor-wg-manager/`
- [x] Cria serviço `mikrogestor-wg-manager.service`
- [x] Exibe a chave pública e o secret para copiar no `.env`

## Variáveis de ambiente obrigatórias

Após o setup, adicione no `.env` da VPS (Coolify → Environment Variables):

```bash
VPS_WG_PUBLIC_KEY="[saída do setup]"
VPS_PUBLIC_IP="2.25.168.82"
WG_MANAGER_URL="http://172.17.0.1:51821"   # Docker host-gateway
WG_MANAGER_SECRET="[saída do setup]"
```

> ⚠️ **WG_MANAGER_URL no Docker**: Use `http://172.17.0.1:51821` (gateway padrão do Docker bridge)
> ou adicione `--add-host=host-gateway:host-gateway` no container e use `http://host-gateway:51821`

## Configuração do Coolify

No painel Coolify, na configuração da aplicação MikroGestor:

1. Adicionar as variáveis de ambiente acima
2. O container precisa acessar `127.0.0.1:51821` do host → usar network_mode ou host-gateway
3. **Alternativa simples**: No Coolify, mapear porta 51821 como interna ou usar `network: host` em dev

## Verificar instalação

```bash
# Na VPS
bash vpn/check-vpn.sh

# Output esperado:
# [✓] WireGuard instalado
# [✓] Interface wg0 ativa
# [✓] Porta UDP 51820 ouvindo
# [✓] IP Forwarding ativado
# [✓] Serviço wg-quick@wg0 ativo
# [✓] WG Manager Daemon ativo
# [✓] WG Manager HTTP respondendo
```

## Comandos úteis

```bash
# Ver status do WireGuard
wg show

# Ver peers conectados
wg show wg0 dump

# Ver logs do daemon manager
journalctl -u mikrogestor-wg-manager -f

# Reiniciar daemon
systemctl restart mikrogestor-wg-manager

# Testar manager manualmente
SECRET=$(cat /etc/mikrogestor-wg.secret)
curl -H "X-WG-Secret: $SECRET" http://127.0.0.1:51821/health
curl -H "X-WG-Secret: $SECRET" http://127.0.0.1:51821/status
```

## Fluxo de adição de MikroTik

1. Admin acessa `/dashboard/vpn` no MikroGestor
2. Clica em "Configurar VPN" no roteador desejado
3. Sistema gera chaves + IP VPN
4. Script RouterOS é exibido
5. Admin executa script no MikroTik (Winbox Terminal)
6. MikroTik conecta automaticamente → status "Online" no dashboard

## Segurança

- WG Manager escuta **apenas** em `127.0.0.1` — nunca exposto à internet
- Autenticação por `X-WG-Secret` em todos os requests
- Secret armazenado em `/etc/mikrogestor-wg.secret` (chmod 600)
- Cada MikroTik tem chave WireGuard única — revogação individual
- `AllowedIPs = 10.8.0.0/24` garante que usuários do hotspot **não** passam pela VPS