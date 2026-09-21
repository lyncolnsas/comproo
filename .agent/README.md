# 🗺️ .agent — Mapa da Loja (Estrutura Completa em Português)

> Cada coisa em seu devido lugar, organizada como uma loja com prateleiras e setores claros para facilitar o uso e navegação.

---

## 🤖 1. `/agentes` — Especialistas (34 Especialistas)
Personas com competências e instruções específicas para cada área do sistema:

| Agente | Arquivo | Especialidade / Atuação |
|---|---|---|
| **Orquestrador** | [`orquestrador.md`](agentes/orquestrador.md) | Coordenador mestre e distribuidor de tarefas complexas |
| **Especialista Backend** | [`especialista-backend.md`](agentes/especialista-backend.md) | APIs REST, regras de negócio, Node.js, integrações |
| **Especialista Frontend** | [`especialista-frontend.md`](agentes/especialista-frontend.md) | Next.js 16, React 19, UI/UX, interfaces ricas |
| **Depurador** | [`depurador.md`](agentes/depurador.md) | Investigação sistemática de bugs, logs e falhas de runtime |
| **Auditor de Segurança** | [`auditor-seguranca.md`](agentes/auditor-seguranca.md) | Metodologia Cloudflare, segurança RouterOS, JWT e Vouchers |
| **Especialista MikroTik Hotspot** | [`especialista-mikrotik-hotspot.md`](agentes/especialista-mikrotik-hotspot.md) | RouterOS API, provisionamento, firewall, Walled Garden |
| **Especialista WireGuard VPN** | [`especialista-wireguard-vpn.md`](agentes/especialista-wireguard-vpn.md) | Túneis WireGuard (RouterOS v7), Split-Tunneling, Coolify e VPS |
| **Arquiteto do Portal** | [`arquiteto-portal.md`](agentes/arquiteto-portal.md) | Editor visual do Portal Studio (`/dashboard/portal`) |
| **Engenheiro DevOps** | [`engenheiro-devops.md`](agentes/engenheiro-devops.md) | Docker ARM64, Raspberry Pi, deploy, Linux, rede |
| **Planejador de Projetos** | [`planejador-projetos.md`](agentes/planejador-projetos.md) | Roadmap, divisão de fases e especificação de tarefas |
| **Desenvolvedor Mobile** | [`desenvolvedor-mobile.md`](agentes/desenvolvedor-mobile.md) | Interfaces móveis, responsividade e PWA |
| **Testador de Penetração** | [`testador-penetracao.md`](agentes/testador-penetracao.md) | Simulação de ataques defensivos e testes de intrusão |
| **Engenheiro de Automação QA** | [`engenheiro-automacao-qa.md`](agentes/engenheiro-automacao-qa.md) | Testes E2E, Playwright e pipelines de teste |
| **Arquiteto de Banco de Dados** | [`arquiteto-banco-dados.md`](agentes/arquiteto-banco-dados.md) | Prisma ORM, modelagem SQLite e integridade relacional |
| **Otimizador de Performance** | [`otimizador-performance.md`](agentes/otimizador-performance.md) | Profiling, Core Web Vitals e renderização rápida |
| **Especialista em SEO** | [`especialista-seo.md`](agentes/especialista-seo.md) | Otimização para motores de busca e tráfego web |
| **Engenheiro de Testes** | [`engenheiro-testes.md`](agentes/engenheiro-testes.md) | Testes unitários, de integração e padrão AAA |
| **Arqueólogo de Código** | [`arqueologo-codigo.md`](agentes/arqueologo-codigo.md) | Análise de legado, histórico Git e refatoração segura |
| **Redator de Documentação** | [`redator-documentacao.md`](agentes/redator-documentacao.md) | Manuais, tutoriais técnicos e documentação de API |
| **Agente Explorador** | [`agente-explorador.md`](agentes/agente-explorador.md) | Mapeamento de repositórios e descoberta de código |
| **Desenvolvedor de Jogos** | [`desenvolvedor-jogos.md`](agentes/desenvolvedor-jogos.md) | Gamificação e interatividade visual |
| **Gerente de Produto** | [`gerente-produto.md`](agentes/gerente-produto.md) | Visão de produto, proposta de valor e mercado |
| **Dono do Produto** | [`dono-produto.md`](agentes/dono-produto.md) | Critérios de aceite, histórias de usuário e priorização |
| **Arquiteto de Código** | [`arquiteto-codigo.md`](agentes/arquiteto-codigo.md) | Design de arquitetura de novos recursos e módulos |
| **Explorador de Código** | [`explorador-codigo.md`](agentes/explorador-codigo.md) | Navegação rápida por bases de código desconhecidas |
| **Revisor de Código** | [`revisor-codigo.md`](agentes/revisor-codigo.md) | Revisão detalhada de pull requests e diffs |
| **Simplificador de Código** | [`simplificador-codigo.md`](agentes/simplificador-codigo.md) | Refatoração para redução de complexidade ciclomática |
| **Analisador de Comentários** | [`analisador-comentarios.md`](agentes/analisador-comentarios.md) | Análise e síntese de comentários e threads de PR |
| **Analisador de Testes PR** | [`analisador-testes-pr.md`](agentes/analisador-testes-pr.md) | Validação de cobertura e qualidade de suites de teste |
| **Caçador de Falhas Silenciosas** | [`cacador-falhas-silenciosas.md`](agentes/cacador-falhas-silenciosas.md) | Detecção de erros engolidos, unhandled promises e exceções silenciosas |
| **Analisador de Design de Tipos** | [`analisador-design-tipos.md`](agentes/analisador-design-tipos.md) | Design estrito de tipos TypeScript e interfaces |
| **Analisador de Conversas** | [`analisador-conversas.md`](agentes/analisador-conversas.md) | Extração de regras e aprendizados de diálogos anteriores |
| **Criador de Agentes** | [`criador-agentes.md`](agentes/criador-agentes.md) | Construção de novas personas e agentes padronizados |
| **Validador de Plugins** | [`validador-plugins.md`](agentes/validador-plugins.md) | Checagem de integridade e esquemas de extensões |
| **Revisor de Habilidades** | [`revisor-habilidades.md`](agentes/revisor-habilidades.md) | Auditoria de qualidade e clareza de arquivos SKILL.md |

---

## 📚 2. `/habilidades` — As 11 Prateleiras de Conhecimento (59 Habilidades)

### 🎯 Prateleira `00-mikrogestor/` (Específico do Projeto)
- [`conhecimento-hotspot-mikrotik/`](habilidades/00-mikrogestor/conhecimento-hotspot-mikrotik) — RouterOS API (8728), Walled Garden e provisionamento automático.
- [`conhecimento-portal-studio/`](habilidades/00-mikrogestor/conhecimento-portal-studio) — Arquitetura de componentes do Portal Studio, layouts e temas.
- [`sistema-contraste-ui/`](habilidades/00-mikrogestor/sistema-contraste-ui) — Diretrizes de contraste e temas escuro/claro para dashboards.
- [`wireguard-vpn/`](habilidades/00-mikrogestor/wireguard-vpn) — Base de conhecimento completa WireGuard (RouterOS v7, Linux VPS, daemon wg-manager, Docker Coolify).

### 🧠 Prateleira `01-orquestracao-ia/` (Coordenação de Agentes)
- [`agentes-paralelos/`](habilidades/01-orquestracao-ia/agentes-paralelos) — Decomposição e execução concorrente de tarefas.
- [`buscar-habilidades/`](habilidades/01-orquestracao-ia/buscar-habilidades) — Descoberta e instalação de habilidades via ecossistema aberto (Vercel Skills CLI).
- [`compressao-contexto/`](habilidades/01-orquestracao-ia/compressao-contexto) — Técnicas para manter contexto enxuto e evitar saturação de tokens.
- [`concepcao-brainstorming/`](habilidades/01-orquestracao-ia/concepcao-brainstorming) — Refinamento de ideias via questionamentos socráticos.
- [`desenvolvimento-agentes/`](habilidades/01-orquestracao-ia/desenvolvimento-agentes) — Padrões e prompts de sistema para criação de novos agentes.
- [`desenvolvimento-comandos/`](habilidades/01-orquestracao-ia/desenvolvimento-comandos) — Engenharia de fluxos e slash commands interativos.
- [`desenvolvimento-habilidades/`](habilidades/01-orquestracao-ia/desenvolvimento-habilidades) — Estrutura canônica de SKILL.md e referências.
- [`desenvolvimento-hooks/`](habilidades/01-orquestracao-ia/desenvolvimento-hooks) — Interceptadores de execução (pre/post-tool use).
- [`gerador-habilidades/`](habilidades/01-orquestracao-ia/gerador-habilidades) — Criação padronizada de novas habilidades para agentes.
- [`migracao-modelos-avancados/`](habilidades/01-orquestracao-ia/migracao-modelos-avancados) — Calibração de prompts para modelos de alta capacidade.
- [`modo-coordenador/`](habilidades/01-orquestracao-ia/modo-coordenador) — Orquestração de fluxos complexos com múltiplos especialistas.
- [`modos-comportamentais/`](habilidades/01-orquestracao-ia/modos-comportamentais) — Alternância entre modos (planejamento, edição cirúrgica, questionamento).
- [`roteamento-inteligente/`](habilidades/01-orquestracao-ia/roteamento-inteligente) — Direcionamento automático para o agente mais indicado.
- [`sistema-memoria/`](habilidades/01-orquestracao-ia/sistema-memoria) — Persistência de lições aprendidas entre sessões.

### ✅ Prateleira `02-qualidade-codigo/` (Engenharia Limpa)
- [`checklist-revisao-codigo/`](habilidades/02-qualidade-codigo/checklist-revisao-codigo) — Roteiro minucioso de verificação de código.
- [`codigo-limpo/`](habilidades/02-qualidade-codigo/codigo-limpo) — Princípios de código direto, legível e sem complexidade desnecessária.
- [`escrita-regras-guardrails/`](habilidades/02-qualidade-codigo/escrita-regras-guardrails) — Definição de regras automatizadas e prevenção de erros frequentes.
- [`grafo-revisao-codigo/`](habilidades/02-qualidade-codigo/grafo-revisao-codigo) — Análise de impacto e dependências via AST.
- [`lint-e-validacao/`](habilidades/02-qualidade-codigo/lint-e-validacao) — Checagens estáticas e correção de tipagem TypeScript.
- [`operacoes-em-lote/`](habilidades/02-qualidade-codigo/operacoes-em-lote) — Padrões para alterações em múltiplos arquivos com segurança.
- [`simplificar-codigo/`](habilidades/02-qualidade-codigo/simplificar-codigo) — Descarte de código morto e redução de complexidade ciclomática.

### 🎨 Prateleira `03-frontend/` (Design e Interface)
- [`design-frontend/`](habilidades/03-frontend/design-frontend) — Design moderno, microanimações e interfaces de alto padrão.
- [`design-mobile/`](habilidades/03-frontend/design-mobile) — Boas práticas de toque, layout fluido e responsividade.
- [`diretrizes-web-design/`](habilidades/03-frontend/diretrizes-web-design) — Acessibilidade (WCAG), semântica HTML e ergonomia visual.
- [`internacionalizacao-i18n/`](habilidades/03-frontend/internacionalizacao-i18n) — Suporte a múltiplos idiomas e formatação regional.
- [`padroes-tailwind/`](habilidades/03-frontend/padroes-tailwind) — Organização e boas práticas com Tailwind CSS.
- [`ui-ux-pro-max/`](habilidades/03-frontend/ui-ux-pro-max) — Biblioteca com 97 paletas de cores, 50+ estilos visuais e 57 combinações de fontes.

### ⚙️ Prateleira `04-backend/` (Serviços e APIs)
- [`boas-praticas-nodejs/`](habilidades/04-backend/boas-praticas-nodejs) — Tratamento de erros assíncronos, streams e performance no Node.js.
- [`construtor-mcp/`](habilidades/04-backend/construtor-mcp) — Construção e integração de servidores Model Context Protocol.
- [`design-banco-dados/`](habilidades/04-backend/design-banco-dados) — Modelagem relacional, índices, migrações Prisma e SQLite.
- [`especialista-nextjs-react/`](habilidades/04-backend/especialista-nextjs-react) — Server Components, Server Actions e otimizações Next.js 16.
- [`gerenciamento-servidores/`](habilidades/04-backend/gerenciamento-servidores) — Processos background, systemd, PM2 e saúde de serviços.
- [`integracao-mcp/`](habilidades/04-backend/integracao-mcp) — Conexão de ferramentas externas via protocolo MCP (STDIO/SSE).
- [`padroes-api/`](habilidades/04-backend/padroes-api) — Padrões REST, validação de entradas (Zod), paginação e respostas padronizadas.

### 🧪 Prateleira `05-testes/` (Qualidade e Validação)
- [`depuracao-sistematica/`](habilidades/05-testes/depuracao-sistematica) — Protocolo em 4 fases para identificação de causa-raiz.
- [`fluxo-tdd/`](habilidades/05-testes/fluxo-tdd) — Ciclo Red-Green-Refactor rigoroso.
- [`padroes-testes/`](habilidades/05-testes/padroes-testes) — Padrão AAA (Arrange, Act, Assert) e testes unitários/integrados.
- [`testes-webapp/`](habilidades/05-testes/testes-webapp) — Automação de testes de ponta a ponta com Playwright.
- [`verificar-alteracoes/`](habilidades/05-testes/verificar-alteracoes) — Validação por compilação e execução real antes da entrega.

### 🔒 Prateleira `06-seguranca/` (Defesa e Auditoria)
- [`auditoria-seguranca/`](habilidades/06-seguranca/auditoria-seguranca) — Metodologia Cloudflare: Mapeamento de superfície, hunting sistemático, validação independente e relatórios, integrado ao Guia Específico MikroGestor (RouterOS, Vouchers, JWT, Baileys).
- [`scanner-vulnerabilidades/`](habilidades/06-seguranca/scanner-vulnerabilidades) — OWASP Top 10:2025, integridade de supply chain e escaneamento automatizado.
- [`taticas-red-team/`](habilidades/06-seguranca/taticas-red-team) — MITRE ATT&CK, modelagem de ameaças e testes defensivos.

### 🚀 Prateleira `07-devops/` (Infraestrutura e Deploy)
- [`arquitetura-software/`](habilidades/07-devops/arquitetura-software) — Registros de decisão arquitetural (ADR) e visão sistêmica.
- [`construtor-aplicacoes/`](habilidades/07-devops/construtor-aplicacoes) — Scaffolding e estruturação de novos módulos full-stack.
- [`perfil-performance/`](habilidades/07-devops/perfil-performance) — Análise de gargalos de CPU/memória e Core Web Vitals.
- [`procedimentos-implantacao/`](habilidades/07-devops/procedimentos-implantacao) — Deploy seguro em 5 fases com plano de rollback garantido.

### 💻 Prateleira `08-plataformas/` (Linguagens e Ambientes)
- [`bash-linux/`](habilidades/08-plataformas/bash-linux) — Scripts shell para Debian, Ubuntu e Raspberry Pi OS.
- [`desenvolvimento-jogos/`](habilidades/08-plataformas/desenvolvimento-jogos) — Princípios de game design e física 2D/3D.
- [`padroes-python/`](habilidades/08-plataformas/padroes-python) — Tipagem estática, concorrência async e boas práticas Python 3.
- [`powershell-windows/`](habilidades/08-plataformas/powershell-windows) — Administração avançada Windows e scripts de automação.
- [`rust-pro/`](habilidades/08-plataformas/rust-pro) — Segurança de memória, concorrência e padrões de alta performance em Rust.

### 📈 Prateleira `09-marketing/` (Visibilidade)
- [`fundamentos-geo/`](habilidades/09-marketing/fundamentos-geo) — Otimização para mecanismos de busca por Inteligência Artificial (GEO).
- [`fundamentos-seo/`](habilidades/09-marketing/fundamentos-seo) — Otimização técnica para Google, Core Web Vitals e indexação.

### 📖 Prateleira `10-documentacao/` (Manuais e Planos)
- [`escrita-planos/`](habilidades/10-documentacao/escrita-planos) — Elaboração de planos técnicos estruturados com critérios de verificação.
- [`modelos-documentacao/`](habilidades/10-documentacao/modelos-documentacao) — Templates de guias de usuário, manuais de instalação e READMEs.

---

## 🛠️ 3. `/scripts` — Utilitários de Execução Rápida

- **`banco-de-dados/`** — Gerenciamento de permissões do SQLite e testes de persistência.
- **`implantacao/`** — Empacotamento standalone, instalador universal WireGuard (`setup-vpn.sh`) e deploy para Raspberry Pi.
- **`manutencao/`** — Verificação geral (`verify_all.py`), checklist de auditoria, motor de regras hookify e segurança de hooks.
- **`raspberry/`** — Provisionamento da arquitetura 64-bit, reinicialização e serviço do MikroGestor no Raspberry Pi.
- **`testes/`** — Validação da API RouterOS, teste completo de túnel WireGuard (`verificar_vpn.js`) e validadores.

---

## 🔄 4. `/fluxos` — Comandos Rápidos (Slash Commands - 21 Comandos)

- `concepcao.md` — Sessão de ideação com perguntas socráticas.
- `coordenar.md` — Orquestração de tarefas distribuídas.
- `criar.md` — Geração rápida de novos módulos ou componentes.
- `depurar.md` — Diagnóstico aprofundado de falhas.
- `desenvolver-funcionalidade.md` — Fluxo guiado de ciclo de vida de nova funcionalidade.
- `implantar.md` — Rotina de deploy seguro com validação.
- `melhorar.md` — Refatoração e aprimoramento de qualidade.
- `orquestrar.md` — Alocação de especialistas para missões grandes.
- `planejar.md` — Criação de plano técnico detalhado.
- `pre-visualizar.md` — Validação visual e de interface.
- `lembrar.md` — Consulta e gravação no sistema de memória.
- `revisar-pr.md` — Toolkit de revisão completa de Pull Request.
- `revisao-codigo.md` — Análise de qualidade e boas práticas de código.
- `criar-hook.md` — Criação rápida de interceptadores e guardrails.
- `commit.md` — Criação de commit semântico padronizado.
- `commit-pr.md` — Commit, push e abertura de PR automatizados.
- `status.md` — Diagnóstico do estado operacional do projeto.
- `testar.md` — Execução automatizada de baterias de teste.
- `verificar.md` — Checagem de integridade antes da entrega.
- `ui-ux-pro-max.md` — Assistente de consulta de paletas e estilos visuais.
- `vpn-wireguard.md` — Provisionamento e diagnóstico de túneis WireGuard VPN.

---

## 📋 5. `/regras` — Diretrizes Obrigatórias
- `GEMINI.md` — Regras mestras de orquestração, checagem pré-código e proibições de estilo.
- `PORTAL_RULES.md` — Regras arquiteturais específicas do Captive Portal do MikroGestor.
- `WIREGUARD_RULES.md` — Regras de ouro de split-tunneling, scripts em linha única para Winbox e isolamento VPN.
- `DIRETRIZES_REGRAS_HOOKS.md` — Padrões de escrita para guardrails e interceptadores de IA.
- `LAYOUT_REMODELING.md` / `LAYOUT_RESPONSIVENESS.md` — Regras de layout, responsividade e viewport móvel.
