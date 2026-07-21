# RESP-04 — Buy/Bundle Mobile (375px) — Plano de Execução

**Fonte:** CSS dump do frame mobile (375×1429: foto 699px em cima + painel creme 730px embaixo) + 2 screenshots (2026-07-21). Node `281:373` em `FIGMA-MOBILE-EXTRACTION.md`.
**Alvos:** `src/components/BuySection.tsx` e `src/components/ProductPurchaseBox.tsx` (worktree). Só classes base; `lg:` intocado.

## Mudanças estruturais (as duas grandes)

1. **Ordem dos painéis invertida no mobile:** a FOTO vem primeiro, o painel de compra creme vem depois (no desktop compra à esquerda = primeira no DOM). Resolver com `order-*` nos dois filhos do grid em `BuySection.tsx`: foto `order-1 lg:order-2`, compra `order-2 lg:order-1` (grid respeita order). Já previsto em FIGMA-MOBILE-EXTRACTION.md.
2. **Anatomia do bundle card muda no mobile:** vira uma COLUNA de duas linhas — linha 1: imagem (110×74) + nome/preço-unitário; linha 2: pill de desconto à esquerda + total à direita (`justify-between`). No desktop é uma linha única com pill/total empilhados à direita. Reestruturar o JSX do card em `ProductPurchaseBox.tsx` para servir os dois via classes:
   ```
   button: flex-col gap-[10px] p-5 | lg:flex-row lg:items-center lg:px-[25px] lg:py-5
     div A (linha 1): flex items-center gap-[10px] | lg:flex-1
       [imagem] [nome + unit price]
     div B (linha 2): flex w-full items-center justify-between | lg:w-auto lg:flex-col lg:items-end lg:gap-[10px]
       [pill] [total]
   ```

## Cross-reference — BuySection.tsx (painel da foto)

| # | Elemento | Figma mobile | Código atual (base) | Ação |
|---|----------|--------------|---------------------|------|
| 1 | Altura da foto | **699px** | `min-h-[420px]` | `min-h-[699px]` (remover o `lg:min-h-[699px]` redundante) |
| 2 | Título "Bring the Experience home." | **44px**/53, à direita | `text-[58px]` | `text-[40px] lg:text-[58px]` (44→40) |
| 3 | Subtítulo | **16px**/19 | `text-[21px]` | `text-[14px] lg:text-[21px]` (16→14) |
| 4 | Badge "THE DIPS EXPERIENCE" | padding 12, texto 12px, **radius 10** | `px-[15px] py-3 text-[14px] rounded-card` | `p-3 text-[12px] rounded-[10px] lg:px-[15px] lg:py-3 lg:text-[14px] lg:rounded-card` |
| 5 | Gap badge→título | 15px (grupo) / 10px (título→sub) | `gap-4` | `gap-2.5 lg:gap-4` (aproximação, mesmo tratamento das seções anteriores) |
| 6 | Badges de benefício (base) | **coluna empilhada à ESQUERDA**, gap 15, radius 10, padding 15, texto 12px | linha com wrap `justify-end`, radius 15 | `flex-col items-start gap-[15px]` na base + `rounded-[10px] text-[12px]` nos badges; `lg:` restaura linha/justify-between/rounded-card/13px. ⚠ Alinhamento muda: topo à direita, badges à ESQUERDA (screenshot confirma) |
| 7 | Padding do painel | 25px | `p-6` (+ o painel creme tem `py-12`) | foto: `p-6` já ok; creme: remover `py-12` na base (`lg:py-12`) |

## Cross-reference — ProductPurchaseBox.tsx

| # | Elemento | Figma mobile | Código atual | Ação |
|---|----------|--------------|--------------|------|
| 8 | Card: padding | **20px** | `px-[25px] py-5` | `p-5 lg:px-[25px] lg:py-5` |
| 9 | Card: anatomia | coluna 2 linhas (ver estrutura acima) | linha única | Reestruturar (mudança estrutural 2) |
| 10 | Nome do bundle | **16px** | `text-[18px]` | `text-[14px] lg:text-[18px]` (16→14) |
| 11 | Unit price ($29.99 / box) | 14px | `text-[13px]` | Manter 13px (já é o 14→13) |
| 12 | Total do card | **18px** | `text-[18px]` | `text-[16px] lg:text-[18px]` (18→16) |
| 13 | Pill de desconto | texto **8px**, h 27 | `text-[9px]` | **Manter 9px** (mesmo override de legibilidade do RESP-03; 1px de diferença) |
| 14 | Summary: labels | **12px** | `text-[13px]` | `text-[12px] lg:text-[13px]` (literal, ≤12 não reduz) |
| 15 | Summary: valores | **18px** | `text-[18px]` | `text-[16px] lg:text-[18px]` |
| 16 | Summary: padding | **20px** | `px-[25px] py-5` | `p-5 lg:px-[25px] lg:py-5` |
| 17 | Buy Now (botão) | h 50, "Buy Now" esq. + total dir., 16px | já idêntico em estrutura, texto 14px | **Nada** — 14px é override aprovado |
| 18 | "Most Popular" | Figma mobile posiciona na BORDA INFERIOR do card 2x | na borda superior | **Manter no topo** — override explícito do usuário (pedido com screenshot em 2026-07-21), vence o Figma |

## Overrides mantidos (vencem o Figma)

- **Preços/descontos reais** (FUNC-01): $29.99 / $55.78 / $75.57, unit prices reais — NUNCA os placeholders $59.99/$89.99 "todos $29.99/box" do mock.
- **"Most Popular" no topo do card** (item 18) — pedido explícito do usuário.
- **Copy i18n corrigida**: "Igredients" [sic do Figma] segue "Ingredients" no nosso en.json.
- **Pill 8px → 9px** (item 13) e **Buy Now 14px** (item 17) — legibilidade/consistência já estabelecidas.

## Resumo de fontes

| Elemento | Figma mobile | Base | lg (atual) |
|----------|--------------|------|------------|
| Título da foto | 44px | **40px** | 58px |
| Subtítulo | 16px | **14px** | 21px |
| Badges (topo e base) | 12px | **12px** | 14px/13px |
| Nome do bundle | 16px | **14px** | 18px |
| Total do card / summary valores | 18px | **16px** | 18px |
| Summary labels | 12px | **12px** | 13px |

## Sequência de execução (Sonnet)

1. `BuySection.tsx` — order swap dos painéis (1ª estrutural), foto min-h/título/subtítulo/badges (itens 1-7).
2. `ProductPurchaseBox.tsx` — reestruturar card em 2 linhas (2ª estrutural, itens 8-13), summary (14-16).
3. Build + 71 testes + commit atômico + restart dev + addendum no 05-VISUAL-GAPS.md.
4. **Verificação funcional obrigatória:** a seleção de bundle e o Buy Now continuam funcionando (a reestruturação mexe no JSX do botão de seleção).

**Verificação visual:** DevTools 375px vs screenshots — foto primeiro (título à direita, badges empilhados à esquerda embaixo), depois painel creme com 3 cards em 2 linhas cada, summary, Buy Now com total.
