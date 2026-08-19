# MikroGestor — Memória Persistente do Agente

> Atualizado automaticamente pelo mikrotik-hotspot-specialist após cada sessão.
> Lido no início de cada sessão para restaurar contexto sem re-descoberta.

---

## 📌 Projeto

- **Nome**: MikroGestor Voucher
- **Stack**: Next.js 16 (App Router) + TypeScript + routeros-client
- **Diretório**: `src/`
- **Dev Server**: porta 80 (`next dev -p 80`)
- **TypeScript**: zero erros confirmado (`npx tsc --noEmit`)

---

## 🔌 Roteador de Desenvolvimento

- **Nome**: `teste`
- **Conexão**: via sessão cookie (`mikro_session`)
- **Observação**: keepalive desativado (evita `UNKNOWNREPLY: !empty`)

---

## ✅ O que já foi implementado

### Autenticação e Sessão
- Login com usuário/senha do MikroTik (não NextAuth)
- Cookie `mikro_session` = credenciais criptografadas (JWE/A256GCM)
- `src/lib/session.ts` — `getMikrotikClient(overrideIp?)` e `updateSessionIp()`

### Provisionamento Inteligente (`/dashboard/provisioning`)
- Seleção de interface WAN → sistema configura tudo automaticamente
- 14 etapas: WAN DHCP → Bridge → Ports → Clean DHCP → Clean IPs → Set IP → Pool → DHCP Network → DHCP Server → Hotspot Profile → Hotspot Server → User Profile → NAT → Admin Bypass
- **Reconexão automática**: se IP muda, sistema re-conecta ao novo IP e atualiza cookie
- **Diagnóstico hotspot**: `checkHotspot()` verifica pacote ANTES de tentar — se ausente, pula com instruções detalhadas

### API Hotspot
- `GET /api/hotspot/provision` — lista interfaces com status detalhado
- `POST /api/hotspot/provision` — executa provisionamento faseado
- `POST /api/hotspot/provision/reconnect` — reconecta ao novo IP, verifica componentes, atualiza sessão

### Firewall / Segurança
- Keywords blocker: `GET/POST/DELETE /api/security/keywords`
- Walled Garden: `GET/POST/DELETE /api/security/walled-garden`

---

## ⚠️ Bugs Conhecidos e Resoluções

| Bug | Resolução |
|-----|-----------|
| `UNKNOWNREPLY: !empty` | `keepalive: false` na conexão RouterOSClient |
| `no such command prefix` no Hotspot Server | Path `/ip/hotspot/server` **NÃO EXISTE**. Correto: `/ip/hotspot` para servidores |
| `Pacote RouterOS ausente` no Hotspot | Path errado `/ip/hotspot` ≠ `/ip/hotspot/server`. Servidores = `/ip/hotspot` |
| **RouterOS 7.x hotspot detectado como ausente** | **RouterOS 7.x embute hotspot no `routeros` base. `majorVersion >= 7 && packages.includes('routeros')` = disponível** |
| Turbopack cache com erro antigo | `Remove-Item -Recurse -Force .next` resolve |
| Erro 401 em todas rotas | `routerErrorResponse()` em `src/lib/api-error.ts` lida com `MikrotikSessionError` |
| **Queda do link físico na migração de portas** | O envio sequencial de comandos de API causava queda de rede no primeiro comando, deixando as portas órfãs e travando o roteador. Resolvido gerando e injetando um **Script RouterOS Local** (`migrar_reboot`) que roda na CPU de forma autônoma e executa o reboot. O script é deletado na reconexão (Phase 2). |

---

## 🧱 Estrutura de Arquivos Críticos

```
src/lib/routeros.ts          — Classe MikrotikAPI com TODOS os métodos
src/lib/session.ts           — getMikrotikClient, getSessionCredentials, updateSessionIp
src/lib/api-error.ts         — routerErrorResponse() para tratar erros de sessão
src/app/api/hotspot/
  provision/route.ts         — GET (interfaces) + POST (14 etapas de provisionamento)
  provision/reconnect/route.ts — POST (reconexão inteligente ao novo IP)
src/app/dashboard/
  provisioning/page.tsx      — Wizard: seleção WAN → execução → reconexão → resultado
```

---

## 📐 Convenções do Projeto

- Erros de sessão: sempre usar `routerErrorResponse(error)` nos catch blocks das rotas
- Cada operação: verificar existência antes de criar (idempotência)
- Passos críticos usam `fail()` (lança erro e para)
- Passos opcionais (hotspot, admin bypass) usam `warn()` ou `skip()` (continua mesmo com erro)
- TypeScript: `npx tsc --noEmit` deve sempre passar com zero erros

---

## 🔮 Próximas Features Planejadas

1. **Firewall Keyword Blocker** (solicitado pelo usuário, não implementado ainda)
2. **Walled Garden visual** (UI para gerenciar sites liberados)
3. **Dashboard de uso em tempo real** (gráficos de consumo por usuário)
4. **Planos de velocidade** (criar perfis de usuário com diferentes rate-limits)

---

*Última atualização: 2026-05-21 — Especialista MikroTik Hotspot v1.0*
