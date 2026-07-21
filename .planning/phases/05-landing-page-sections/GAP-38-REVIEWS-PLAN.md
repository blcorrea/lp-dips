# GAP-38 — Seção 5 (Reviews) — Plano de execução

> Análise no Fable (Copy-as-CSS da seção inteira + print do Figma). Execução: Sonnet.
> Worktree: `C:/dev/dips/lp-dips/.claude/worktrees/agent-a647a13d3da177a22`.
> Processo padrão: editar → parar dev server → build + 71 testes → commit atômico → restart → addendum no 05-VISUAL-GAPS.md (main repo, `cd` antes).

## Contexto do Figma

Frame 1440×1368, bg `#2D1A69` (= token `dips-purple-reviews`, já usado — ✓ sem mudança). Header centralizado (título + subtítulo), depois um grid de **6 review cards em 3 colunas × 2** (masonry: alturas variam por conteúdo, colunas alinhadas pelo topo), e **setas de carrossel** (prev/next) no canto inferior direito.

**Tokens já corretos (não mexer):** bg da seção, `dips-card-review` rgba(35,20,53,.4), `dips-card-review-border` rgba(57,41,76,.4), `rounded-card-lg` 18px.

## Decisão de conteúdo (IMPORTANTE)

O override funcional "reviews reais vencem o Figma" **não se aplica aqui**: o `src/data/reviews.ts` atual declara no próprio cabeçalho que é conteúdo **placeholder** ("Replace placeholder content with real reviews"). Logo o Figma vence → **substituir os 12 reviews placeholder pelos 6 do Figma**, que têm anatomia mais rica (role, país+bandeira, data relativa):

| Nome | Role | País/bandeira | Data | Quote (dump traz o texto integral de cada uma — copiar de lá) |
|---|---|---|---|---|
| Marcus | Doctor | 🇺🇸 United States | 3 days ago | "An absolute game-changer for date night. …" |
| Liam | Workout Beast | 🇩🇪 Germany | 19 days ago | "From the beautiful packaging to the gold flecks…" |
| Elena R. | Yoga Instructor | 🇨🇭 Switzerland | 13 days ago | "We loved everything about this. …" |
| Jessica T. | Athlete | 🇺🇸 United States | 1 month ago | "With a busy routine, it's easy to slip into autopilot…" |
| David K. | Doctor | 🇨🇭 Switzerland | 9 days ago | "I was skeptical at first, but Dips completely exceeded…" |
| Tyson W. | Singer | 🇮🇹 Italy | 3 months ago | "Exceptional quality. The flavor profile is easily on par…" |

**i18n (invariante do projeto):** campos traduzíveis (role, país, data relativa, quote) vão pra chaves no namespace `Reviews` (`r1_role`, `r1_country`, `r1_date`, `r1_quote`, … r6), traduzidas pra es/pt. `reviews.ts` mantém só o não-traduzível: id, name, flag (emoji), stars, photoUrl. Único consumidor é o ReviewsSection — restruturar o tipo é seguro.

**Avatares:** Figma usa fotos redondas 60px; não temos os assets. Manter o fallback de iniciais (60px, mecanismo atual) e deixar `photoUrl` pronto pro usuário fornecer fotos depois — **avisar o usuário disso na resposta final** (ele pode gerar como fez com as imagens de produto).

## Mudanças — layout/estilo

1. **Header:** título `Reviews.title` → title case "What People Are Saying" (só en). `font-heading text-[48px]` (54→48) branco centrado; subtítulo `text-[21px]` (24→21) `text-dips-text-lavender` (#EBD9FE) centrado, max-w ~1062px. Subtítulo já bate com o Figma, não mexer no texto.
2. **Grid:** trocar CSS `columns-3` por **3 colunas explícitas determinísticas**: `grid lg:grid-cols-3 gap-[15px]`, cada coluna `flex flex-col gap-[15px]` com o par de cards na ordem [1,2|3,4|5,6] (chunk de 2). Alturas naturais (masonry pelo conteúdo), colunas top-aligned. Mobile: 1 coluna.
3. **Card** (reescrever a anatomia — a atual tem media block + autor no rodapé; Figma é autor no TOPO):
   - Wrapper: `rounded-card-lg border-2 border-dips-card-review-border bg-dips-card-review p-card-padding flex flex-col gap-[25px]` (borda era 1px → **2px**).
   - **Header row** (gap 15): avatar 60px redondo (foto ou iniciais) + coluna flex-1 com row `justify-between`: à esquerda nome (`font-heading text-[21px] font-bold text-white` — Figma AllRoundGothic 24→21) sobre role (`text-[13px] text-[#9499a9]`); à direita (align-end, gap ~6px) **5 estrelas 18px `#FFCD00`** (amarelas! as atuais são laranja — laranja fica só nas do Hero, que lá é spec) sobre `flag emoji + país` (`text-[13px] text-white`).
   - **Quote:** `font-body text-[16px] leading-[1.25] text-[#9499a9]` (Figma Filson 18/22 → 16; cor era white/90).
   - **Data:** `text-[13px] text-dips-text-lavender text-right` largura cheia ("3 days ago").
   - Remover `MediaBlock` (nenhum card do Figma tem mídia; dados novos não têm o campo). Hover sutil atual pode manter.
4. **Carrossel:** container das setas abaixo do grid, alinhado à direita, `gap-[14px]`: botão prev 60px redondo `bg-[#2b1543]` com chevron-esquerda branco; botão next 60px redondo `bg-brand-orange` (Figma #F16B16 → normalização DSGN-03) com chevron-direita branco. Lógica: paginação de 6 em 6 com wrap-around (`page = (page+1) % pageCount`); com os 6 atuais há 1 página só (setas presentes visualmente, prontas pra quando houver mais reviews). Chevrons como SVG inline (24px, stroke 2 branco). `aria-label` via i18n novo (`Reviews.prev`/`Reviews.next` nas 3 línguas).
5. **Limpeza:** remover `initials`/`AVATAR_COLORS` só se não usados (iniciais continuam sendo o fallback → manter); remover import/uso de `MediaBlock` e campos `mediaUrl/mediaType/handle` do tipo.

## Tratamento de fontes (padrão das seções anteriores)

título 54→48 · subtítulo 24→21 · nome 24→21 · quote 18→16 · role/país/data 14→13 · estrelas 18px e setas 60px mantêm (elementos gráficos).

## Verificações finais

- Grid 3×2 a 1440px com colunas de alturas diferentes top-aligned; 1 coluna no mobile.
- Estrelas amarelas #FFCD00 (não laranja) — conferir que o Hero continua laranja.
- Setas renderizam e não quebram com 1 página (wrap no-op).
- Addendum GAP-38 no 05-VISUAL-GAPS.md + commit docs no main. Avisar usuário sobre os avatares.
