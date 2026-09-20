---
name: ui-contrast-system
description: >
  Mapa completo do sistema de CSS/design do MikroGestor Dashboard.
  Use quando for melhorar contraste, tipografia, legibilidade ou cores
  em qualquer pagina do dashboard ou portal. Contem a arquitetura CSS,
  o inventario de classes problematicas e o plano de correcao aprovado.
skills:
  - frontend-design
  - clean-code
---

# UI Contrast & Typography System - MikroGestor

> Leia este arquivo COMPLETO antes de modificar qualquer cor no projeto.
> Gerado apos auditoria manual de todos os CSS e paginas do dashboard.

---

## 1. Arquitetura CSS do Projeto

### Unico arquivo CSS global
`src/app/globals.css` (777 linhas) e a UNICA fonte de estilos customizados.
Tailwind v4 configurado via `@import "tailwindcss"` inline (sem tailwind.config.ts).

### Dois temas coexistem

| Tema | Classe raiz | Fundo |
|------|-------------|-------|
| Aurora / Dark | `.aurora-*`, `.retro-*` | #0c0c18 |
| SaaS / Light | `.saas-theme`, `.saas-*` | #f4f6fa |

O `layout.tsx` do dashboard aplica `saas-theme` no root.
Todas as paginas do dashboard herdam o tema claro.

---

## 2. Design Tokens (`:root` globals.css)

```
--chassis:    #0c0c18
--panel:      #14142a
--foreground: #c8c8e8   (texto no tema escuro)
```

---

## 3. Classes Base do Tema SaaS

### Sidebar
- bg: #1a1d2e / border: #262a3d
- Links inativos: text-slate-400 (#94a3b8) -> contraste ~4.5:1 OK
- Links ativos: text-blue-400 -> contraste ~5.2:1 OK
- Section labels: text-slate-400 9px uppercase -> PROBLEMA: muito pequeno

### Main Content
- bg: #f4f6fa

### Cards (.saas-card)
- bg: #ffffff / border: #e2e8f0

---

## 4. INVENTARIO DE PROBLEMAS - Frequencia por Classe

| Classe | Ocorrencias | Problema |
|--------|-------------|---------|
| text-slate-400 | 155x | CRITICO: #94a3b8 sobre #fff = 3.0:1 (falha WCAG AA) |
| text-slate-500 | 91x | Marginal: 4.6:1 |
| text-slate-300 | 41x | FALHA: #cbd5e1 sobre #f4f6fa = 2.1:1 |
| text-white | 133x | OK quando sobre fundos escuros |
| text-slate-900 | 31x | OK (15:1) |
| text-slate-200 | 19x | FALHA: invisivel sobre fundo claro |
| text-slate-450 | 16x | INVALIDA no Tailwind - herda do pai |
| text-slate-350 | 11x | INVALIDA no Tailwind |
| text-slate-555 | 1x | INVALIDA no Tailwind |

### Classes invalidas (nao existem no Tailwind v4)
- text-slate-450, text-slate-350, text-slate-405, text-slate-455
- text-slate-250, text-slate-555, text-slate-850

---

## 5. Problemas em globals.css

| Classe | Linha | Problema | Correcao |
|--------|-------|---------|---------|
| .aurora-label | L284 | color: rgba(255,255,255,0.2) invisivel | -> 0.55 |
| .aurora-nav-link | L242 | color: rgba(255,255,255,0.45) baixo | -> 0.75 |
| .saas-table th | L669 | color: #64748b (slate-500) | -> #475569 (slate-600) |

---

## 6. Referencia Visual - Meta Business Manager

Padrao de contraste identificado na screenshot do usuario:

| Elemento | Cor | Contraste |
|----------|-----|---------|
| Texto primario | #1c1e21 | 15:1 |
| Texto secundario | #65676b | 5.9:1 |
| Header tabela | #65676b bold | 5.9:1 |
| Sidebar inativo | #1c1e21/60% | 6.5:1 |
| Sidebar ativo | #1877f2 sobre #e7f3ff | 4.8:1 |
| Badge ativo | #00a400 sobre #e6f7e6 | 5.1:1 |

---

## 7. PLANO DE ACAO

### PRIORIDADE 1 - globals.css (impacto global)

Arquivo: src/app/globals.css

Linha 242 (.aurora-nav-link):
  color: rgba(255,255,255,0.45) -> rgba(255,255,255,0.75)

Linha 284 (.aurora-label):
  color: rgba(255,255,255,0.2) -> rgba(255,255,255,0.55)

Linha 669 (.saas-table th):
  color: #64748b -> #475569

Adicionar bloco no globals.css (dentro de .saas-theme):
  .saas-theme p, .saas-theme span, .saas-theme td: usar slate-700 base

### PRIORIDADE 2 - layout.tsx (sidebar)

Arquivo: src/app/dashboard/layout.tsx

L131 section label: text-slate-400 -> text-slate-300 (fundo escuro)
L157 link inativo: text-slate-400 -> text-slate-300
L184 nome admin: text-slate-200 -> text-white

### PRIORIDADE 3 - Substituir classes invalidas (batch)

Buscar e substituir em src/app/dashboard/**/*.tsx:
  text-slate-450 -> text-slate-500
  text-slate-350 -> text-slate-400
  text-slate-250 -> text-slate-300
  text-slate-555 -> text-slate-600
  text-slate-850 -> text-slate-800
  text-slate-405 -> text-slate-400
  text-slate-455 -> text-slate-500

---

## 8. Hierarquia Tipografica Recomendada (WCAG AA)

Tema SaaS claro (bg branco/f4f6fa):

| Nivel | Classe | Contraste |
|-------|--------|---------|
| Titulo H1 | text-slate-900 | 16:1 OK |
| Subtitulo H2 | text-slate-800 | 12:1 OK |
| Label H3 | text-slate-700 | 8.9:1 OK |
| Texto corpo | text-slate-700 | 8.9:1 OK |
| Auxiliar | text-slate-500 | 4.6:1 OK (minimo) |
| Placeholder | text-slate-400 | 3.0:1 (so hints) |
| NUNCA usar | text-slate-300 | 2.1:1 FALHA |
| NUNCA usar | text-slate-200 | 1.5:1 FALHA |

Sidebar escuro (bg #1a1d2e):

| Nivel | Classe | Contraste |
|-------|--------|---------|
| Item ativo | text-blue-400 | 5.2:1 OK |
| Item inativo | text-slate-300 | 7.2:1 OK |
| Label secao | text-slate-400 | 4.5:1 OK |

---

## 9. Arquivos por Prioridade de Edicao

1. src/app/globals.css                    <- impacto em TODO o sistema
2. src/app/dashboard/layout.tsx           <- sidebar (todas as paginas)
3. src/app/dashboard/page.tsx             <- visao geral
4. src/app/dashboard/leads/page.tsx       <- tabela grande
5. src/app/dashboard/users/page.tsx       <- central de vouchers
6. src/app/dashboard/finance/page.tsx
7. src/app/dashboard/admin/page.tsx
8. src/app/dashboard/whatsapp/page.tsx
9. demais paginas (traffic, ppp, dhcp...)

---

## 10. Comandos de Auditoria

```powershell
# Classes invalidas de cor
Select-String -Path "src\app\dashboard\**\*.tsx" `
  -Pattern "text-slate-(250|350|405|450|455|555|850)" -AllMatches

# Frequencia de classes de texto
Select-String -Path "src\app\dashboard\**\*.tsx" `
  -Pattern "text-(slate|gray|white|black)-[0-9]+" -AllMatches |
  ForEach-Object { $_.Matches } | Group-Object Value | Sort-Object Count -Descending

# Cores inline (hex e rgba)
Select-String -Path "src\app\dashboard\**\*.tsx" `
  -Pattern "(#[0-9a-fA-F]{3,6}|rgba?\([^)]+\))" -AllMatches |
  ForEach-Object { $_.Matches.Value } | Sort-Object | Get-Unique
```

---

## 11. Design System Unificado (`--mg-*`) e Classes Globais

Para trocar qualquer cor, arredondamento ou tema em TODO o sistema sem alterar arquivos `.tsx`, utilize as variáveis declaradas no final de `src/app/globals.css`:

### Design Tokens
- `--mg-app-bg`: Fundo principal da página (ex: `#f4f6fa` no Light, `#090d16` no Dark).
- `--mg-card-bg` / `--mg-card-border` / `--mg-card-radius`: Estilo de cards e painéis.
- `--mg-text-heading` / `--mg-text-body` / `--mg-text-muted`: Tipografia de alto contraste.
- `--mg-primary` / `--mg-primary-hover` / `--mg-primary-shadow`: Ação primária e botões.
- `--mg-input-bg` / `--mg-input-border` / `--mg-input-focus`: Estilo de formulários.
- `--mg-table-th-bg` / `--mg-table-row-hover`: Estilo de tabelas corporativas.

### Classes Semânticas Reutilizáveis
- `.mg-card`: Card padrão com sombra suave e borda limpa.
- `.mg-card-header`, `.mg-card-title`, `.mg-card-desc`: Cabeçalho padrão de cards.
- `.mg-input`, `.mg-select`: Inputs e selects com foco e contraste calibrados.
- `.mg-btn-primary`, `.mg-btn-secondary`, `.mg-btn-danger`, `.mg-btn-success`: Botões de ação padronizados.
- `.mg-table-container`, `.mg-table`: Tabela responsiva.
- `.mg-badge-success`, `.mg-badge-danger`, `.mg-badge-warning`, `.mg-badge-info`, `.mg-badge-primary`: Badges semânticos.

### Troca de Tema (Light / Dark)
- O seletor `data-theme="dark"` no elemento `<html>` ou `<body>` comuta automaticamente todas as variáveis CSS e classes existentes do sistema para o modo escuro corporativo.
- Um botão de alternância (☀️/🌙) está integrado no topo mobile e no rodapé da sidebar em `src/app/dashboard/layout.tsx`.

