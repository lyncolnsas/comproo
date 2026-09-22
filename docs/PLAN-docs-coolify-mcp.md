# Plano de Projeto: Documentação Completa & CooliFy - MCP Standalone

Este plano estabelece a reformulação integral da documentação do ecossistema MikroGestor e o empacotamento da pasta `CooliFy - MCP` como um servidor MCP 100% independente, portátil e autônomo para gerenciamento de qualquer VPS / Coolify com apenas um comando.

---

## 🎯 Objetivos Principais

1. **Revisão e Blindagem da Documentação do MikroGestor**:
   - Atualizar todos os manuais, checklists e regras para eliminar 100% dos erros operacionais em novos deploys e manutenções.
   - Cobrir todas as lições aprendidas em produção: persistência SQLite no Coolify (`/data/mikrogestor/prisma`), permissões de Firewall UFW (Docker subnet para `51821`), WireGuard Split-Tunnel (`10.8.0.0/24`), Peers Windows/Mobile com QR Code, acesso Winbox remoto e patches do RouterOS v7.

2. **Criação do Pacote `CooliFy - MCP` Standalone e Portátil**:
   - Copiar e reestruturar `C:\Users\lynco\OneDrive\Documentos\-Projetos\CooliFy` para `C:\Users\lynco\OneDrive\Documentos\-Projetos\CooliFy - MCP`.
   - Tornar o MCP completamente independente de qualquer projeto específico:
     - Sem IPs ou credenciais fixas no código (100% orientado a `.env` e variáveis de ambiente).
     - Script interativo de 1 comando (`npm run setup` / `node setup.js`) que testa a VPS (SSH e API Coolify) e gera/aplica as configurações do MCP.
     - Suporte a múltiplos ambientes de IA (Antigravity IDE, Claude Desktop, Cursor, VS Code).
     - Guia detalhado passo a passo de integração para conceder "poder total" sobre qualquer nova VPS.

---

## 🗂️ Estrutura das Tarefas

### Fase 1: Atualização e Blindagem da Documentação do Projeto
- **`AGENTS.md`**: Atualizar com as regras consolidadas (VpnPeer, regras de firewall MikroTik `10.8.0.0/24`, persistência e checklist de emergência).
- **`docs/GUIA_DEPLOY_COMPLETO_NOVA_VPS.md`**: Manual exaustivo passo a passo do zero (preparação de VPS Ubuntu, UFW, Coolify, WireGuard host daemon, volumes Docker, variáveis de ambiente, subdomínios, DNS wildcard e script RouterOS).
- **`docs/ARQUITETURA_SUBDOMINIOS_SSL_AUTOMATICO.md`**: Documentação do ciclo de vida Traefik dynamic config + extração de certificado + renovação automática no MikroTik.
- **`README.md`**: Visão geral moderna do MikroGestor com arquitetura, módulos e guia de instalação.
- **`.agent/fluxos/vpn-wireguard.md`**: Atualização do fluxo de diagnóstico com peers de Windows e celular.
- **`.agents/skills/mikrogestor-deploy/SKILL.md`**: Checklist atualizado pré/durante/pós deploy.

### Fase 2: Construção do Pacote `CooliFy - MCP`
- **Cópia e Isolamento**: Copiar `C:\Users\lynco\OneDrive\Documentos\-Projetos\CooliFy` para `C:\Users\lynco\OneDrive\Documentos\-Projetos\CooliFy - MCP`.
- **`index.js` (MCP Server)**:
  - Eliminar valores hardcoded.
  - Carregar configurações de `.env` com fallback seguro e mensagens informativas.
  - Suporte a autenticação SSH tanto por senha quanto por chave privada (`privateKey` ou `keyPath`).
  - Implementar todas as 12 ferramentas com validação estrita de erros.
- **Script de 1 Comando (`setup.js`)**:
  - Testa conectividade SSH à VPS e valida privilégios root/docker.
  - Testa comunicação com a API REST do Coolify (porta 8000).
  - Gera arquivos `.env` e exibe o bloco exato para inclusão no `mcp_config.json`.
- **Script de Diagnóstico (`test-connection.js`)**:
  - Valida SSH, Docker daemon e Coolify API em 3 segundos sem precisar do MCP client.
- **Documentação do MCP**:
  - `README.md`: Apresentação e guia de início rápido com 1 comando.
  - `docs/GUIA_INTEGRACAO_NOVA_VPS.md`: Passo a passo para preparar uma nova VPS para o MCP (gerar token no Coolify, configurar SSH, portas e firewall).
  - `docs/FERRAMENTAS_MCP.md`: Manual de referência de cada uma das ferramentas (`ssh_exec`, `docker_exec`, `docker_ps`, `docker_logs`, `coolify_api`, etc.).
  - `docs/CONFIGURACAO_IDE.md`: Guia de configuração para Antigravity IDE, Claude Desktop, Cursor e VS Code.

---

## 🧪 Critérios de Aceitação & Verificação
1. Todo o projeto MikroGestor possui documentação coerente, sem divergências entre código e guias.
2. A pasta `CooliFy - MCP` pode ser copiada para qualquer pasta ou máquina e executada independentemente com `npm install && npm run setup`.
3. O script de teste de conexão valida com sucesso a VPS atual e qualquer nova VPS informada no `.env`.
4. As ferramentas do MCP continuam funcionando perfeitamente no Antigravity IDE.
