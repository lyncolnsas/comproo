---
name: portal-studio-knowledge
description: Base de conhecimento completa e cirúrgica de toda a página /dashboard/portal e subsistemas de Hotspot Captive Portal.
---

# SKILL: PORTAL STUDIO KNOWLEDGE (`portal-studio-knowledge`)

Este documento é o índice de consulta rápida para intervenções na tela `http://localhost/dashboard/portal`. Consulte a tabela abaixo para saber instantaneamente qual arquivo alterar.

---

## ⚡ TABELA DE LOCALIZAÇÃO RÁPIDA (ONDE ALTERAR)

| Solicitação do Usuário | Arquivo(s) Responsável(eis) | Linhas / Seção Chave |
| :--- | :--- | :--- |
| **Cores, Logos, Fundos, Efeitos ou Tipografia** | `src/components/portal/studio/panels/BrandingStudioPanel.tsx`<br>`src/app/dashboard/portal/page.tsx` | Subtabs `presets`, `palette`, `logo`, `background`. Estados `colors`, `brand`, `bg`, `effects`. |
| **Métodos de Login (Voucher, Usuário, Trial, PIX)** | `src/components/portal/studio/panels/HotspotAuthStudioPanel.tsx`<br>`src/app/dashboard/portal/page.tsx` | Função `handleSetAuthMode()`, switch de `systemFreeWifiMode` e `saleMode`. |
| **Campos de Formulário e Cadastro de Leads** | `src/components/portal/studio/panels/LeadsFieldsStudioPanel.tsx`<br>`src/app/portal/register/ClientPage.tsx` | Lista `leadFieldsList`, checkboxes de ativação e labels customizadas. |
| **Anúncios, Carrossel, Vídeos, Timer e Áudio** | `src/components/portal/studio/panels/AdsStudioPanel.tsx`<br>`src/components/portal/studio/StudioCanvas.tsx`<br>`src/app/api/portal/config/route.ts` | Configuração `ad` (`type`, `items`, `timerEnabled`, `timerDuration`), reprodução de vídeo, trigger de áudio invisível. |
| **Liberação de Domínios / Walled Garden** | `src/components/portal/studio/panels/WalledGardenStudioPanel.tsx`<br>`src/app/api/hotspot/walled-garden/route.ts` | Lista `detectedDomains`, `handleAddHost()`, fetch da API RouterOS. |
| **CSS Customizado e Injeção Inline** | `src/components/portal/studio/panels/CssProStudioPanel.tsx`<br>`src/app/api/portal/config/route.ts` | Estado `customCode.customCss` injetado em `<style>` no template. |
| **Provisionamento do Roteador (DHCP, Bridge, Firewall)** | `src/components/portal/studio/panels/ProvisioningStudioPanel.tsx`<br>`src/app/api/hotspot/provision/route.ts` | Wizard das 4 etapas de configuração direta via RouterOS API. |
| **Envio para o Roteador (Deploy / FTP)** | `src/components/portal/studio/panels/DeployStudioModal.tsx`<br>`src/app/api/portal/deploy/route.ts` | Formulário com porta FTP (padrão 21) e envio dos arquivos gerados. |
| **Simulador de Dispositivo / Iframe / Preview** | `src/components/portal/studio/StudioCanvas.tsx`<br>`src/app/api/portal/preview/route.ts` | Container responsivo (Mobile/Tablet/Desktop), iframe do portal captive, `postMessage`. |
| **TopBar (Template, Zoom, Undo, Salvar)** | `src/components/portal/studio/StudioTopBar.tsx`<br>`src/app/dashboard/portal/page.tsx` | Seletor de template (`default`, `FAP`), zoom, botões `Salvar` e `Deploy`. |
| **Navegação Lateral do Studio (Abas)** | `src/components/portal/studio/StudioNavRail.tsx` | Definição das 7 abas e contadores de badge de alerta. |

---

## 🔄 FLUXO DE DADOS E PERSISTÊNCIA

1. **Leitura Inicial**:
   - `page.tsx` chama `GET /api/portal/config?template=<nome>`.
   - A API lê `hotspot/<template>/config.json`.
2. **Atualização em Tempo Real**:
   - Ao alterar qualquer controle, `page.tsx` emite `postMessage` para o iframe do `StudioCanvas`.
   - O script injetado pelo `route.ts` do preview aplica as alterações de CSS e DOM instantaneamente sem recarregar a página.
3. **Persistência e Recompilação**:
   - Ao clicar em **Salvar**, `page.tsx` envia `POST /api/portal/config`.
   - A API atualiza `config.json` e recompila `login.html` do template com as novas diretrizes (incluindo markup de anúncios, botões de trial e botões de cadastro).
4. **Deploy no Equipamento**:
   - Ao clicar em **Deploy**, `DeployStudioModal` chama `POST /api/portal/deploy`.
   - O servidor MikroGestor conecta via FTP/API ao MikroTik e envia os arquivos do template para o diretório de arquivos do roteador.
