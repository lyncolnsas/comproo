# RULE: MikroGestor Portal Studio (`/dashboard/portal`)

Este arquivo define os padrões, arquitetura, mapa de componentes e regras operacionais para qualquer modificação na página **http://localhost/dashboard/portal** e seus subsistemas.

---

## 1. PRINCÍPIOS FUNDAMENTAIS
1. **Porta Obrigatória**: A aplicação MikroGestor roda EXCLUSIVAMENTE na porta `80` (`http://localhost/dashboard/portal`). É terminantemente proibido referenciar ou abrir na porta 3000.
2. **Arquitetura Bifásica (Studio vs Template Compilado)**:
   - Toda alteração visual no Studio (`/dashboard/portal`) reflete em tempo real no iframe (`/api/portal/preview` ou `/portal/register?preview=1`) via `postMessage`.
   - Ao salvar (`onSave`), a rota `/api/portal/config` regrava `config.json` e recompila o template (`login.html` do template ativo).
   - Ao alterar regras do Portal, sempre verificar se afeta o componente React do Studio e/ou a injeção em `/api/portal/config/route.ts` ou `/api/portal/preview/route.ts`.
3. **Validação Contínua de Build**:
   - Antes de declarar qualquer tarefa concluída, rodar `npm run build`.

---

## 2. MAPA DE COMPONENTES E ARQUIVOS
| Caminho do Arquivo | Função / Responsabilidade |
| :--- | :--- |
| `src/app/dashboard/portal/page.tsx` | Orquestrador principal do Studio: estados, tabs, undo/redo, save, export, deploy. |
| `src/components/portal/studio/StudioNavRail.tsx` | Barra lateral com os 7 módulos do Studio. |
| `src/components/portal/studio/StudioTopBar.tsx` | Cabeçalho: alternador de template, viewport (mobile/tablet/desktop), zoom, undo/redo, salvar, deploy. |
| `src/components/portal/studio/StudioCanvas.tsx` | Viewport de simulação com iframe e overlay de anúncio/mídia. |
| `src/components/portal/studio/panels/BrandingStudioPanel.tsx` | Módulo 1: Identidade, cores, logotipos, fundos e efeitos de nicho. |
| `src/components/portal/studio/panels/HotspotAuthStudioPanel.tsx` | Módulo 2: Métodos de login (Voucher/PIN, Usuário/Senha, 1-Clique/Trial, Venda PIX). |
| `src/components/portal/studio/panels/LeadsFieldsStudioPanel.tsx` | Módulo 3: Formulário de captação de leads, campos obrigatórios, LGPD. |
| `src/components/portal/studio/panels/AdsStudioPanel.tsx` | Módulo 4: Anúncios patrocinados, timer obrigatório, banner único e carrossel. |
| `src/components/portal/studio/panels/WalledGardenStudioPanel.tsx` | Módulo 5: Auditor de domínios Walled Garden e integração com MikroTik. |
| `src/components/portal/studio/panels/CssProStudioPanel.tsx` | Módulo 6: Injeção de CSS customizado direto no captive portal. |
| `src/components/portal/studio/panels/ProvisioningStudioPanel.tsx` | Módulo 7: Wizard em 4 etapas para provisionamento automático do roteador MikroTik. |
| `src/components/portal/studio/panels/DeployStudioModal.tsx` | Modal de envio direto via FTP/API para o roteador. |
| `src/app/api/portal/config/route.ts` | Endpoint de leitura/gravação de configuração e gerador de HTML captive. |
| `src/app/api/portal/preview/route.ts` | Endpoint que serve o HTML para o iframe do Studio com live updates. |

---

## 3. REGRAS DE ÁUDIO E VÍDEO (ANÚNCIOS / CARROSSEL)
1. **Autoplay Imediato**: Vídeos iniciam sempre em reprodução contínua (com `muted` para cumprir a política estrita dos navegadores modernos).
2. **Tela Toda como Trigger Invisível**:
   - Não utilizar botões de som que fiquem piscando ou que cubram o vídeo com telas pretas/preloader infinito.
   - Qualquer toque ou clique em qualquer ponto da tela (ou arrasto de slide) desbloqueia o áudio imediatamente.
3. **Trava Permanente**: Uma vez liberado o áudio (`window._mgAudioPermanentlyUnlocked = true`), o som NUNCA mais volta a ser silenciado por toques subsequentes.
