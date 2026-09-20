---
name: auditoria-seguranca
description: Guia de auditoria de segurança e revisão de vulnerabilidades para código-fonte, APIs, serviços, ferramentas CLI, bibliotecas e daemons. Baseado na metodologia Cloudflare Security Audit e adaptado para o MikroGestor Voucher & Hotspot. Use para dúvidas de segurança, revisões pontuais, caça a vulnerabilidades ou testes de penetração com base no código-fonte.
---

# 🛡️ Auditoria de Segurança (Metodologia Cloudflare & MikroGestor)

Encontre vulnerabilidades reais que violam fronteiras de confiança (*trust boundaries*), fornecendo aos mantenedores evidências baseadas no código-fonte, reproduções seguras em ambiente isolado (sandbox), severidade precisa e a menor correção eficaz. 

> [!IMPORTANT]
> Um apontamento sem agente/ator afetado, recurso comprometido ou impacto de segurança demonstrável **NÃO** é considerado uma vulnerabilidade confirmada.

---

## 🧭 Modos de Operação

1. **Modo Consulta / Orientação (Padrão)**: Para dúvidas de segurança, revisões focadas em um arquivo ou endpoint, triage de bugs ou investigação de hipóteses. Não executa todas as fases nem gera relatórios formais em disco.
2. **Modo Auditoria Completa**: Acionado quando o usuário solicita expressamente auditoria de segurança completa do projeto, pentest ou relatório formal. Executa as 6 fases e gera os artefatos estruturados.

---

## 🎯 Especificidades do MikroGestor Voucher

Ao auditar este repositório (**MikroGestor Voucher**), consulte **SEMPRE** o arquivo:
👉 [00-guia-auditoria-mikrogestor.md](00-guia-auditoria-mikrogestor.md)

Principais vetores críticos no ecossistema MikroGestor:
- **RouterOS API MikroTik (Portas 8728/8729)**: Injeção de comandos RouterOS, escape de regras de firewall e desvio de Walled Garden.
- **Motor de Vouchers & Captive Portal**: Entropia e previsibilidade de códigos de voucher, sequestro de sessão, spoofing de MAC e endpoints públicos desprotegidos (`/api/portal/*`).
- **Next.js 16 & JWT Auth**: Validação de assinaturas JWT, segurança no upload de imagens/arquivos (`/public/uploads`) e isolamento de consultas Prisma SQLite.
- **WhatsApp Baileys & Webhooks**: Proteção das chaves da tabela `BaileysAuth` e validação estrita de webhooks do Mercado Pago e WhatsApp.
- **Appliance Raspberry Pi 3 / Docker**: Porta 80 obrigatória (`http://localhost:80`), regras de rede local e integridade do banco SQLite (`prisma/dev.db`).

---

## 📚 Índice de Guias Temáticos da Auditoria

| Arquivo | Tema e Foco de Auditoria |
|---|---|
| [00-guia-auditoria-mikrogestor.md](00-guia-auditoria-mikrogestor.md) | **MikroGestor**: RouterOS API, Vouchers, Hotspot, Baileys, Next.js, RPi |
| [01-inteligencia-artificial-e-llm.md](01-inteligencia-artificial-e-llm.md) | Injeção de prompt, extração de dados sensíveis e segurança de LLMs |
| [02-classes-de-ataque.md](02-classes-de-ataque.md) | Catálogo e taxonomia de classes de vulnerabilidade |
| [03-seguranca-frontend-e-navegador.md](03-seguranca-frontend-e-navegador.md) | XSS, CSRF, Clickjacking, CSP, Storage local e segurança de clientes web |
| [04-nuvem-e-implantacao.md](04-nuvem-e-implantacao.md) | Configurações de nuvem, Docker, contêineres e deploy seguro |
| [05-isolamento-de-dados-e-ciclo-de-vida.md](05-isolamento-de-dados-e-ciclo-de-vida.md) | Vazamento multi-tenant, persistência, retenção e destruição de dados |
| [06-desktop-mobile-e-ipc-local.md](06-desktop-mobile-e-ipc-local.md) | IPC, permissões de arquivos locais, soquetes Unix e apps nativos |
| [07-caca-de-vulnerabilidades.md](07-caca-de-vulnerabilidades.md) | Metodologia sistemática de caça (Hunting) e ondas de cobertura |
| [08-seguranca-de-memoria-e-binarios.md](08-seguranca-de-memoria-e-binarios.md) | Buffer overflows, use-after-free e segurança em linguagens compiladas |
| [09-protocolos-rpc-e-mensageria.md](09-protocolos-rpc-e-mensageria.md) | gRPC, WebSockets, filas de mensageria e deserialização |
| [10-reconhecimento-e-superficie.md](10-reconhecimento-e-superficie.md) | Mapeamento inicial da superfície de ataque e livro-razão (ledger) |
| [11-exaustao-de-recursos-e-dos.md](11-exaustao-de-recursos-e-dos.md) | DoS, consumo excessivo de memória/CPU e limites de taxa (Rate Limiting) |
| [12-cadeia-de-suprimentos-e-dependencias.md](12-cadeia-de-suprimentos-e-dependencias.md) | Dependências npm, pacotes maliciosos, scripts de build e SBOM |
| [13-validacao-e-relatorios.md](13-validacao-e-relatorios.md) | Protocolo de validação independente de candidatos e geração de relatórios |
| [14-protocolos-web-e-autenticacao.md](14-protocolos-web-e-autenticacao.md) | OAuth, JWT, cookies de sessão, CORS, cabeçalhos HTTP e TLS |

---

## 🔒 Regras Universais de Execução Segura

1. **Inspeção de código é Somente-Leitura**: Nunca altere o código em produção durante uma auditoria.
2. **Ambiente Local e Isolado**: Testes de reprodução rodam apenas em `scratch/` ou via mocks locais (loopback `127.0.0.1`).
3. **Nunca ataque ambientes de produção ou terceiros**: Proibido enviar tráfego malicioso para gateways externos de pagamento, servidores de terceiros ou dispositivos ativos sem consentimento.
4. **Dados Fictícios**: Use sempre tokens, números de telefone e vouchers falsos nos testes.

---

## 🔄 Fluxo de Auditoria Completa (As 6 Fases)

1. **Fase 1: Reconhecimento** — Mapeie a superfície de ataque, fronteiras de confiança e monte o plano inicial ([10-reconhecimento-e-superficie.md](10-reconhecimento-e-superficie.md)).
2. **Fase 2: Caça Sistemática (Hunting)** — Agentes caçadores investigam áreas específicas com base em [07-caca-de-vulnerabilidades.md](07-caca-de-vulnerabilidades.md) e [02-classes-de-ataque.md](02-classes-de-ataque.md).
3. **Fase 3: Validação Independente** — Cada vulnerabilidade candidata é verificada por um agente independente para eliminar falsos positivos ([13-validacao-e-relatorios.md](13-validacao-e-relatorios.md)).
4. **Fase 4: Saída Estruturada** — Registros validados em `findings.json` validados via `esquema-relatorio.json` e `validar-achados.cjs`.
5. **Fase 5: Verificação Cruzada de Registros** — Reconciliação final e auditoria de cobertura com `validar-cobertura.cjs`.
6. **Fase 6: Relatório Executivo** — Geração de `REPORT.md`, detalhamento de achados e guia de remediação mínima e eficaz.

---

## ⚖️ Classificação de Severidade

- **Crítica (Critical)**: RCE (execução remota de código), acesso total ao banco SQLite sem autenticação, ou comprometimento total do roteador MikroTik.
- **Alta (High)**: Desvio completo de autenticação JWT, injeção de comandos via API RouterOS por usuário autenticado, ou geração arbitrária de vouchers sem pagamento.
- **Média (Medium)**: Violação de fronteira com impacto delimitado (ex: bypass pontual de taxa de requisições, leitura indevida de dados não críticos).
- **Baixa (Low)**: Vazamento de informações técnicas (versões internas, stack traces controladas) com risco mínimo isolado.
- **Informativa (Info)**: Oportunidade de endurecimento (*hardening*) de segurança e boas práticas.
