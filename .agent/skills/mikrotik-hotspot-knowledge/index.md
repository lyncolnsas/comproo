---
name: mikrotik-hotspot-knowledge
description: Base de conhecimento completa do MikroTik RouterOS para hotspot, bridge, DHCP, NAT, firewall, QoS e RADIUS
when_to_use: Use when working on any MikroTik-related feature, RouterOS API integration, hotspot configuration, or diagnosing router issues
---

# MikroTik RouterOS — Base de Conhecimento Completa

## RouterOS API via routeros-client (Node.js)

### Conexão
```typescript
import { RouterOSClient } from 'routeros-client';

const connection = new RouterOSClient({
  host: '192.168.88.1',
  user: 'admin',
  password: '',
  keepalive: false,  // ⚠️ keepalive:true causa UNKNOWNREPLY:!empty em alguns firmwares
  timeout: 10,
});

const client = await connection.connect();
// client.menu('/path').get() / .add() / .update() / .remove()
```

### Paths corretos (RouterOS 7.x)
```
/interface               → listar interfaces
/interface/bridge        → bridges
/interface/bridge/port   → portas de bridge
/interface/ethernet      → interfaces ethernet físicas
/interface/wireless      → wireless
/ip/address              → endereços IP
/ip/pool                 → pools de endereços
/ip/dhcp-client          → clientes DHCP (WAN)
/ip/dhcp-server          → servidores DHCP
/ip/dhcp-server/network  → redes DHCP
/ip/hotspot/profile      → perfis de servidor hotspot  
/ip/hotspot/server       → servidores hotspot (⚠️ NÃO /ip/hotspot)
/ip/hotspot/user/profile → perfis de usuário hotspot
/ip/hotspot/user         → usuários
/ip/hotspot/active       → usuários conectados
/ip/hotspot/ip-binding   → bindings de IP
/ip/hotspot/walled-garden → walled garden
/ip/firewall/nat         → regras NAT
/ip/firewall/filter      → regras de filtro
/ip/firewall/layer7-protocol → protocolos L7
/system/resource         → recursos do sistema
/system/package          → pacotes instalados
/system/identity         → nome do roteador
```

## Rate Limit Format
```
<upload>/<download>
5M/5M       → 5 Mbps up, 5 Mbps down
10M/20M     → 10 Mbps up, 20 Mbps down
512k/1M     → 512 kbps up, 1 Mbps down
```

## Session Timeout Format
```
30m   → 30 minutos
1h    → 1 hora
1d    → 1 dia
1w    → 1 semana
0     → ilimitado
```

## Pacotes RouterOS (hotspot requer instalação)
Em RouterOS 7.x, `hotspot` pode ser pacote separado. Verificar:
```
/system/package print → lista pacotes
hotspot = incluído em 'system' na maioria dos casos
se não houver → System → Packages → Check Updates → instalar hotspot
```

## Erros Comuns e Soluções

| Erro | Causa | Fix |
|------|-------|-----|
| `no such command prefix` | Pacote ausente ou path errado | Verificar path e pacotes |
| `UNKNOWNREPLY: !empty` | keepalive em firmware antigo | `keepalive: false` |
| `already have such entry` | Tentando criar duplicado | Verificar existência antes |
| `invalid value for argument` | Valor mal formatado | Verificar formato (ex: rate-limit) |
| Hotspot não distribui IP | Pool errado ou DHCP desabilitado | Checar `disabled=no` |

## Walled Garden — Domínios Comuns para Liberar

### WhatsApp:
```
*.whatsapp.com, *.whatsapp.net, *.facebook.com
```

### Google:
```
*.google.com, *.googleapis.com, *.gstatic.com
```

### DNS para Hotspot:
```
8.8.8.8, 8.8.4.4 (Google)
1.1.1.1, 1.0.0.1 (Cloudflare)
```
