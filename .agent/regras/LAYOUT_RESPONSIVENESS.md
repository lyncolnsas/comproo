# 📱 Checklist de Responsividade dos Menus — MikroGestor Voucher

> Este guia documenta o estado atual de responsividade de todos os menus (subpáginas) do painel MikroGestor, destacando melhorias necessárias, pontos de atenção por página, e as regras gerais de design móvel a seguir.

---

## 🔍 1. Relatório Geral de Auditoria

Rodamos uma varredura estática sobre todos os arquivos `page.tsx` no diretório `/dashboard`. O sistema é altamente adaptável, mas identificamos **13 pontos de atenção em potencial** que necessitam de tratamento ou que devem ser observados em futuras remodelações.

---

## 📋 2. Checklist por Menu

### 📟 1. Dashboard Principal (`/dashboard/page.tsx`)
- [x] **Bento Grid**: Utiliza a classe `.bento-grid`. Confirme se sofre colapso de `grid-template-columns: repeat(3, 1fr)` para `1fr` em resoluções inferiores a `768px`.
- [x] **Altura dos Cards**: No colapso móvel, as alturas fixas (`grid-auto-rows: 160px`) devem cair para `auto` para evitar sobreposição de elementos internos.
- [x] **Indicadores Gráficos (VU Meters)**: Devem ocupar 100% da largura do card sem transbordar.

### 👥 2. Central de Vouchers (`/dashboard/users/page.tsx`)
- [x] **Seletor de Abas (Tabs)**: Utiliza a classe `overflow-x-auto flex-nowrap scrollbar-none`. Permite deslizar as abas lateralmente no celular sem quebrar a tela.
- [x] **Grid de Controles (Busca / Lotes)**: Utiliza `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` garantindo perfeito empilhamento no mobile.
- [x] **Tabela Principal**: Envelopada em `<div className="overflow-x-auto w-full">`. Permite rolagem horizontal independente da listagem de vouchers.

### 🎫 3. Perfis e Planos de Velocidade (`/dashboard/profiles/page.tsx`)
- [x] **Layout Geral**: A estrutura lateral `grid-cols-1 lg:grid-cols-3` empilha o formulário e a documentação perfeitamente em tablets/celulares.
- [x] **Campos do Formulário**: O grid interno do form usa `grid-cols-1 sm:grid-cols-2` evitando espremimento de campos de validade e preços.
- [x] **Tabela de Perfis**: Contém wrapper `overflow-x-auto`.

### 🌐 4. Configurar Portal (`/dashboard/portal/page.tsx`)
- [ ] **Tabela de Leads (Linha 2646)**: A classe `.retro-table-wrap` possui `overflow: hidden`, mas falta a classe `overflow-x-auto` no container.
    *   *Ação Corretiva:* Alterar a div envolvente para `<div className="retro-table-wrap overflow-x-auto">` para permitir leitura dos leads no celular.
- [ ] **Grid de Sumário de Provisionamento (Linha 2995)**: Usa `grid-cols-2 gap-4` diretamente.
    *   *Ação Corretiva:* Mudar para `grid grid-cols-1 sm:grid-cols-2 gap-4`. Caso contrário, os dados de IP do Gateway, Range do Pool e DNS vão espremer e quebrar linhas no mobile.
- [x] **Simulador de Hotspot (Viewport do Celular)**: O preview interativo possui largura controlada (`max-w-[290px]` e `max-w-[480px]` para vídeos).
- [ ] **Lista de Etapas de Provisionamento (Linha 3117)**: O guia de passos usa `grid-cols-2 md:grid-cols-4`. Em celulares de tela muito estreita (como iPhone SE com 325px de largura utilizável), o texto interno das caixas pode ficar espremido. Mantenha sob observação.

### 📈 5. Monitor de Tráfego (`/dashboard/traffic/page.tsx`)
- [x] **Osciloscópio (Gráfico Recharts)**: Utiliza `<ResponsiveContainer width="100%" height="100%">` garantindo o redimensionamento dinâmico do gráfico SVG.
- [ ] **Grids Internos de Métricas (Linhas 197 e 226)**: Usam `grid-cols-2 gap-4` para exibir Peak RX/TX e Link State.
    *   *Ação Corretiva:* Como estão dentro de colunas empilhadas no mobile, a largura é suficiente. Monitorar se os textos dos valores Mbps não vazam em telas abaixo de 360px.

### 🖧 6. DHCP Leases (`/dashboard/dhcp/page.tsx`)
- [x] **Tabela de Concessões**: Envelopada em `overflow-x-auto`.
- [x] **Cabeçalho de Página**: Utiliza `flex-col sm:flex-row` para evitar sobreposição do título com o contador de leases ativas.

### 🔒 7. PPPoE Secrets (`/dashboard/ppp/page.tsx`)
- [x] **Tabela de Usuários**: Envelopada corretamente em `overflow-x-auto`.
- [x] **Badges de Status**: Sofrem alinhamento à direita no desktop e mantêm clareza no mobile.

### 🛡️ 8. Controle de Acesso e Segurança (`/dashboard/security/page.tsx`)
- [ ] **Tabela de Keywords (Linha 409)**: O container possui `overflow-y-auto` mas falta `overflow-x-auto`.
    *   *Ação Corretiva:* Mudar a classe envolvente para `max-h-[460px] overflow-auto custom-scrollbar` ou adicionar `overflow-x-auto`.
- [ ] **Tabela do Walled Garden (Linha 540)**: Falta tratamento para rolagem horizontal em domínios longos.
    *   *Ação Corretiva:* Adicionar `overflow-x-auto` no container envolvente.
- [ ] **Tabela de Bloqueio de Horários (Linha 648)**: A tabela com a regra ativa não possui rolagem em telas pequenas.
    *   *Ação Corretiva:* Adicionar `overflow-x-auto` no wrapper.

### 💰 9. Financeiro e Vendas (`/dashboard/finance/page.tsx`)
- [x] **Cards de Métricas**: Utiliza `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`, ideal para qualquer viewport.
- [x] **Tabela de Transações**: Envelopada em `overflow-x-auto`.
- [x] **Filtros Locais**: Flexbox configurado com `flex-col md:flex-row` permitindo que os inputs e os selects de planos fiquem legíveis.

### ⚙️ 10. Roteadores e Sistema (Administração - `/dashboard/admin/page.tsx`)
- [ ] **Grid do Formulário (Linha 166)**: O cadastro rápido de Usuário API e Senha usa `grid-cols-2` diretamente.
    *   *Ação Corretiva:* Mudar para `grid grid-cols-1 sm:grid-cols-2 gap-3` para evitar que a label de senha quebre em celulares.
- [ ] **Lista de Roteadores Cadastrados (Linha 201)**: Cada roteador é renderizado em uma linha usando `flex items-center justify-between`. Em celulares pequenos, o nome do host (`192.168.88.1`) e os botões "⚡ Conectar" e "Excluir" podem colidir.
    *   *Ação Corretiva:* Mudar o wrapper do roteador para `flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/5` para empilhar os botões abaixo das credenciais no mobile.

---

## 🛠️ 3. Padrões de Código para Responsividade (Best Practices)

Para garantir que novos menus ou modificações nos layouts existentes não quebrem a visualização mobile, adote sempre os seguintes padrões de classe CSS/Tailwind:

### A. Tabelas Responsivas
Nunca renderize tabelas cruas diretamente dentro de cards. Use sempre o wrapper com rolagem horizontal:
```tsx
<div className="overflow-x-auto w-full custom-scrollbar">
  <table className="w-full text-left border-collapse">
    {/* ... */}
  </table>
</div>
```

### B. Grid Columns Progressivo
Não use `grid-cols-2` ou `grid-cols-3` por padrão para formulários ou caixas de conteúdo. Sempre use a abordagem mobile-first:
```tsx
// Correto: 1 coluna no mobile, 2 em telas maiores
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

// Incorreto: Squeeze forçado no mobile
<div className="grid grid-cols-2 gap-4">
```

### C. Flex Wrap para Ações
Para blocos de botões no cabeçalho ou formulários, use `flex-wrap` ou empilhamento condicional:
```tsx
// Correto: Botões empilham verticalmente e se organizam lado a lado em sm+
<div className="flex flex-col sm:flex-row gap-3">
```

---

## 🧪 4. Validação Mobile (Fase de Testes)

Durante o desenvolvimento ou refatoração, a responsividade deve ser validada nos seguintes cenários virtuais no DevTools:

1.  **iPhone SE (375px)**: A largura mais restritiva em produção. O menu lateral da sidebar deve estar oculto, acessível apenas pelo botão hamburger, e nenhum card ou tabela deve empurrar a janela lateralmente (sem scrollbar horizontal na janela principal).
2.  **iPad / Tablet (768px - 1024px)**: Ponto de quebra onde a sidebar ainda deve colapsar ou as colunas do Bento Grid devem cair para `span 1`.
3.  **Verificação de Estouro Lateral (Overflow Check)**:
    ```javascript
    // Cole no console do navegador para encontrar elementos estourando a tela:
    document.querySelectorAll('*').forEach(el => {
      if (el.offsetWidth > document.documentElement.offsetWidth) {
        console.log('Estourando:', el);
      }
    });
    ```
