# GAP-37 — Seção 4 (Buy/Bundle) — Plano de execução

> Análise feita no Fable a partir do Copy-as-CSS da seção inteira + print do Figma.
> Execução: Sonnet. Arquivos-alvo no worktree `C:/dev/dips/lp-dips/.claude/worktrees/agent-a647a13d3da177a22`.
> Processo padrão: editar → parar dev server → `npm run build` + `npm test` (71) → commit atômico → reiniciar dev server → addendum no 05-VISUAL-GAPS.md (main repo, `cd` antes!).

## Contexto do Figma

Frame 1440×699, **full-bleed** (sem container arredondado): painel de compra à ESQUERDA (717px, bg `#FFF8F0` = token `dips-cream`, padding 40, conteúdo 637px, coluna centralizada) + painel de foto à DIREITA (723px, overlay preto flat 20%, padding 40, coluna `justify-between`, conteúdo alinhado à direita). A interatividade já existe e está correta (seleção → `BuyNowButton` com priceId/quantity reais do Stripe) — **manter a fiação intacta, só reestilizar**.

**Override funcional (NÃO copiar do Figma):** os preços do Figma são placeholder ($29.99/59.99/89.99, "$29.99 / box" em todos). Os REAIS ficam em `BUNDLES` no `ProductPurchaseBox.tsx` (2x=$55.78 @27.89, 3x=$75.57 @25.19) — manter. Idem o total do botão: código atual soma frete quando aplicável; Figma mostra só o total do produto. **Manter o cálculo atual** (mostrar preço menor que o cobrado seria enganoso).

## Mudanças — `BuySection.tsx`

1. **Full-bleed**: remover `container/px-6/max-w-6xl/rounded-[36px]/shadow/py-20 lg:py-28`. Usar o padrão da Ingredients: `<section id="bundle" class="scroll-mt-[72px] bg-dips-cream">` + `<div class="mx-auto grid max-w-[1440px] grid-cols-1 lg:grid-cols-2">`. Split 50/50 (era 1.2fr/1fr). Painéis com `p-6 py-12 lg:p-10`, foto `lg:min-h-[699px]`.
2. **Overlay da foto**: trocar o gradiente bottom-heavy (`from-black/60 via-black/10 to-transparent`) por **flat** `bg-black/20` (dump: `linear-gradient(0deg, rgba(0,0,0,.2), rgba(0,0,0,.2))`).
3. **Painel da foto = coluna `justify-between`** (não tudo no rodapé como hoje):
   - **Grupo do TOPO** (align-end, à direita): badge "THE DIPS EXPERIENCE" → retângulo `rounded-card` 15px (não pill), `border-2 border-dips-card-tint-2-border bg-dips-card-tint-2 px-[15px] py-3`, losango 8px, `text-[14px] font-bold text-[#eadae4]` (Figma 16→14, tratamento padrão), SEM tracking/uppercase forçado (a copy já é maiúscula). Abaixo (gap 15): título `text-right`, 2 linhas fixas "Bring the" / "Experience home." — mesmo padrão `<br></br>` + `t.rich` do Hero/Story (só en) — `font-heading text-[58px] font-bold leading-[1.2] text-white` (64→58). Abaixo (gap 10): subtítulo "A Chocolate crafted for connection." — `font-body text-[21px] italic leading-[1.4] text-dips-text-lavender text-right` (24→21). **Chave nova** `BuySection.subtitle` nas 3 línguas (foi removida numa rodada antiga; recriar: en "A Chocolate crafted for connection." / es "Un Chocolate creado para la conexión." / pt "Um Chocolate feito para a conexão.").
   - **Grupo do RODAPÉ**: 3 badges em linha `justify-between` — `rounded-card border-2 bg-dips-card-lavender px-[15px] py-3` com **borda `border-[rgba(146,122,210,0.25)]`** (o dump usa esse valor aqui, DIFERENTE do token `dips-card-lavender-border` rgba(212,201,244,.25) usado na Story — usar arbitrário), losango 8px, `font-card text-[13px] font-bold text-white` (14→13).
4. **Copy dos benefits** (en/es/pt): "100% Natural Ingredients" (corrigir typo "Igredients" do Figma) / "Secure Checkout" / "Made To Share". es: "100% Ingredientes Naturales" / "Pago Seguro" / "Hecho Para Compartir". pt: "100% Ingredientes Naturais" / "Checkout Seguro" / "Feito Para Compartilhar".
5. Título en atual é "Bring the experience home." → virar `"Bring the<br></br>Experience home."` (capitalização do Figma). Título usa `t.rich` com handler `br`.

## Mudanças — `ProductPurchaseBox.tsx`

6. **Cards** (gap 10 entre eles; grupo cards→summary gap 25; summary→botão gap **50**):
   - Não-selecionado: `rounded-card border-2 border-dips-bundle-light-border bg-dips-bundle-light px-[25px] py-5`. Selecionado: `bg-dips-card-ingredient-hl border-brand-orange p-[25px]` (Figma `#FF6B01` → manter `brand-orange` #f27521 pela normalização DSGN-03).
   - **Thumbnail**: trocar o quadradinho branco 48px por a própria foto do produto transparente, **espelhada**: `/images/redesign/hero-product.png` (é o mesmo asset do dump), `w-[110px] h-[74px] object-contain scale-x-[-1]`, sem caixa/fundo.
   - Nome: `font-card text-[18px] font-bold` (20→18); cor `text-dips-text-purple-deep` (não-sel.) / `text-white` (sel.). Labels no formato Figma: **"1x Box" / "2x Boxes" / "3x Boxes"**.
   - Linha de unidade: `"$XX.XX / box"` com o unitPrice REAL — `font-card text-[13px] text-[#96838f]` nos dois estados (Figma usa #96838F até no selecionado).
   - **Pill de desconto** (substitui o badge verde/laranja atual): rounded-full, `px-[15px] py-2`, losango 5px, `font-card text-[9px] font-bold`; não-sel.: `bg-white border-2 border-dips-bundle-light-border text-dips-text-purple-deep`; sel.: `bg-[rgba(55,22,41,0.15)] border-2 border-dips-card-ingredient-hl-border text-white`. Texto no formato Figma com os percentuais REAIS: 1x → "0% Discount" (**sem** "+ Free Shipping" — no Figma o 1x diz free shipping, mas o dado real cobra $6.97; afirmar frete grátis falso é override funcional), 2x → "7% Discount", 3x → "16% Discount + Free Shipping". Preço total abaixo da pill: `font-card text-[18px] font-bold` (20→18).
   - **"Most Popular"**: mover pra **borda inferior centralizada do card 2x, SEMPRE no 2x** (é atributo do produto, não da seleção — hoje segue a seleção, errado): `absolute left-1/2 -translate-x-1/2 -bottom-[17px]`, pill `bg-brand-orange px-[15px] py-2.5 font-body text-[12px] font-bold text-white` (Filson Pro no Figma = font-body), sem uppercase. O card 2x precisa de `overflow` visível e a lista de `gap` suficiente (Figma dá ~14px extras entre 2x e 3x pra pill caber — usar `mb-[14px]` no card 2x ou gap maior só ali).
7. **Summary**: `rounded-card border-2 border-dips-bundle-light-border bg-dips-bundle-summary px-[25px] py-5`, **2 colunas** (não 2 linhas como hoje): esquerda = "Unit Price" (`text-[13px] text-[#96838f]`) empilhado sobre o valor (`text-[18px] font-bold text-dips-text-purple-deep`); direita alinhada à direita = "Shipping" sobre `$6.97`/"Free" (Free em verde pode manter). Fonte `font-card`.
8. **Botão Buy Now**: manter `BuyNowButton` intocado; wrapper com total à direita **em branco** (`text-white font-cta font-semibold text-[14px]`, hoje é `text-brand-purple text-lg`); "Buy Now" também 16→14 via className (`font-cta font-semibold`). Altura h-[50px] do Figma (o BuyNowButton já deve ter ~isso; conferir).
9. **i18n dos textos hardcoded** (invariante do projeto — tudo en/es/pt): mover pra chaves novas em `BuySection`: `box1/box2/box3` ("1x Box"/"2x Boxes"/"3x Boxes"), `perBox` (já existe), `discount0/discount2/discount3` (pills), `mostPopular`, `unitPrice`, `shipping`, `freeShipping`, `buyNow`. `ProductPurchaseBox` recebe `useTranslations('BuySection')` (é client — ok). Traduções es/pt diretas ("2x Cajas"/"2x Caixas", "7% de Descuento"/"7% de Desconto", "Más Popular"/"Mais Popular", "Precio Unitario"/"Preço Unitário", "Envío"/"Frete", "Gratis"/"Grátis", "Comprar Ahora"/"Comprar Agora" etc.).

## Verificações finais

- Testar clique nos 3 cards → summary/total/pill do botão mudam; "Most Popular" fica fixo no 2x; Stripe click-through NÃO precisa (mesma fiação).
- Conferir a seção em ~1440px e também abaixo de lg (colapso pra 1 coluna).
- Addendum GAP-37 no 05-VISUAL-GAPS.md + commit docs no main.
