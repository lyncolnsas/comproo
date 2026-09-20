# 📐 Guia de Remodelação de Layout — MikroGestor Voucher

> Este documento serve como referência de engenharia de frontend para desenvolvedores e agentes de IA sobre tudo o que deve ser verificado, mantido e alterado ao realizar qualquer remodelação estética ou estrutural do layout da plataforma MikroGestor.

---

## 🎨 1. Arquitetura do Design System Atual (Aurora UI)

O sistema atual baseia-se em uma estética **Aurora Glassmorphism** combinada com **Bento Grid** responsiva. Qualquer alteração de layout precisa respeitar ou conscientemente migrar estas fundações.

### Ficheiro Crítico: `src/app/globals.css`
Contém todos os tokens de design, variáveis de cor, animações fundamentais e compatibilidade com estilos antigos.

#### Tokens de Design Fundamentais
*   **Fundo Geral (`body` / `--chassis`)**: Cor `#0c0c18` (escuro profundo/azul petróleo escuro).
*   **Efeito Aurora (Blobs)**: `.aurora-blob` (mistura de cores fluida, mix-blend-mode: screen, desfoque de 80px, animação suave de translação e rotação).
*   **Cards de Conteúdo**: `.aurora-card` (ou wrapper antigo `.retro-card`) com fundo semi-transparente `rgba(255, 255, 255, 0.03)` e `backdrop-filter: blur(16px)`.
*   **Borda Gradiente Fina**: Máscara CSS aplicada no pseudo-elemento `::after` dos cards com gradiente de `#6366f1` (Indigo) para `#2dd4bf` (Teal), com espessura de `1.5px`.

---

## 📋 2. Checklist Geral de Remodelação de Layout

Sempre que decidir alterar a identidade visual ou a estrutura do layout, siga estes passos sistemáticos:

### Passo 1: Atualização dos Design Tokens (`globals.css`)
- [ ] Atualizar as variáveis de cor em `:root` (ex: `--chassis`, `--panel`, `--display-bg`, cores de LEDs).
- [ ] Ajustar as animações principais (`aurora-float`, `power-on`, `led-pulse`).
- [ ] Customizar a barra de rolagem global (`.custom-scrollbar`), mantendo track invisível ou sutil.

### Passo 2: Chassis e Estrutura Principal (`src/app/layout.tsx`)
- [ ] Verificar o container de background global (`body` e wrappers de blobs).
- [ ] Garantir que o manipulador global de erros de script inline continue injetado corretamente na tag `<head>` ou via componente `Script`.

### Passo 3: Sidebar e Navegação (`src/app/dashboard/layout.tsx`)
- [ ] Atualizar o visual do painel lateral (`.aurora-panel` ou equivalente).
- [ ] Adaptar a responsividade móvel (menu sanduíche, estado aberto/fechado controlado via React `useState`).
- [ ] Sincronizar os estilos de **Links Ativos** (`#a5b4fc` cor, fundo leve, e a barra vertical esquerda em gradiente).
- [ ] Garantir a integridade da seção do rodapé (dados do administrador, indicador LED verde `led-green` online/offline do MikroTik e botão de logout).

### Passo 4: Sincronização Obrigatória das Subpáginas
Qualquer alteração no layout principal exige que as páginas internas sejam editadas para manter a coerência estética. O sistema possui **11 menus fundamentais** organizados nas seguintes subpáginas:

| Menu Original / Funcionalidade | Rota do Arquivo correspondente |
| :--- | :--- |
| **Planos / Perfis** | `src/app/dashboard/profiles/page.tsx` |
| **Central de Vouchers (Users)** | `src/app/dashboard/users/page.tsx` |
| **Configurar Portal** | `src/app/dashboard/portal/page.tsx` |
| **Serviços & Rede** | `src/app/dashboard/traffic/page.tsx` (ou dhcp/ppp) |
| **Monitor de Tráfego** | `src/app/dashboard/traffic/page.tsx` |
| **PPPoE Secrets** | `src/app/dashboard/ppp/page.tsx` |
| **DHCP Leases** | `src/app/dashboard/dhcp/page.tsx` |
| **Administração** | `src/app/dashboard/admin/page.tsx` |
| **Controle de Acesso (Segurança)**| `src/app/dashboard/security/page.tsx` |
| **Financeiro / Vendas** | `src/app/dashboard/finance/page.tsx` |
| **Roteadores e Sistema (Settings)**| `src/app/dashboard/settings/page.tsx` |

**Ao remodelar, verifique em cada subpágina:**
- [ ] Os inputs de formulários utilizam `.aurora-input` (ou `.retro-input`).
- [ ] Os botões de ação e submissão utilizam `.aurora-btn` / `.retro-btn` com suas variantes de cor.
- [ ] Os layouts de blocos usam `.aurora-card` ou `.bento-grid`.
- [ ] Os indicadores e badges utilizam as classes atualizadas de LEDs e `.retro-badge-x`.
- [ ] Os wrappers de tabelas mantêm as bordas arredondadas e overflow oculto (`.retro-table-wrap`).

---

## 🛠️ 3. Regras de Layout Críticas

### 📱 Responsividade Bento Grid (Regra de Ouro)
Ao utilizar a grade Bento (`.bento-grid`), as dimensões customizadas (`2x2`, `1x2`, `2x1`) devem **obrigatoriamente** sofrer colapso no mobile:
```css
@media (max-width: 768px) {
  .bento-grid {
    grid-template-columns: 1fr;
    grid-auto-rows: auto;
  }
  .bento-card-2x2, .bento-card-1x2, .bento-card-2x1 {
    grid-column: span 1;
    grid-row: span 1;
  }
}
```
**Impacto:** Se essa regra for quebrada, os cards do dashboard se sobreporão e ficarão ilegíveis em telas de smartphones.

### 🔮 Wrapper de Compatibilidade Retrô
Para evitar que páginas antigas ou secundárias quebrem visualmente, o arquivo `globals.css` contém um mapeamento das classes antigas (`.retro-`) para se comportarem visualmente como as novas classes (`.aurora-`). 
*   **Atenção:** Em remodelações futuras, mantenha as definições dessas classes compatíveis ou migre todo o código-fonte restante nas subpáginas para evitar dependências órfãs.

### 🚫 Proibições e Diretrizes Estéticas (Baseadas no Agent Rules)
1.  **Purple Ban (Proibição de Roxo sem solicitação)**: Evite usar roxo/violeta como cor primária ou neon predominante, exceto nas manchas de fundo sutis (como `.blob-violet`). A cor de destaque deve ser baseada nos gradientes Indigo/Teal/Cyan para manter o visual tecnológico limpo.
2.  **Isolamento Aurora (`isolation: isolate`)**: A classe `.aurora-scene` deve envelopar layouts com manchas no fundo para garantir que as cores se misturem corretamente via `mix-blend-mode: screen` sem afetar a legibilidade dos textos.
3.  **Evitar layouts genéricos**: Não use layouts simétricos 50/50 em páginas centrais. Prefira Bento Grids assimétricos bem distribuídos.

---

## 🧪 4. Validação e Controle de Qualidade pós-Alteração

Após qualquer alteração de layout ou estilos globais:

1.  **Validação de Compilação e Tipagem**:
    ```bash
    npx tsc --noEmit
    ```
    *Garante que nenhum componente alterado quebrou a tipagem TypeScript.*
2.  **Análise de Layout Responsivo**:
    - Simular visualização em iPhone SE (375px de largura) e tablets.
    - Confirmar que as tabelas de listagem de usuários e vouchers possuem rolagem horizontal suave dentro dos cards sem esticar a tela inteira.
3.  **Verificação de Linting**:
    ```bash
    npm run lint
    ```
