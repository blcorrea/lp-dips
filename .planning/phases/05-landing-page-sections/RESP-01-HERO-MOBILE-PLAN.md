# RESP-01 — Hero Mobile (375px) — Plano de Execução

**Fonte:** CSS dump do frame mobile "Hero Section" (375×1656) + 2 screenshots (colados na conversa em 2026-07-21). Complementa `FIGMA-MOBILE-EXTRACTION.md` (node `281:22`).
**Alvo:** `src/components/Hero.tsx` (worktree `agent-a647a13d3da177a22`). `LandingHeader.tsx` NÃO muda nesta rodada (ver "Fora de escopo").
**Estratégia:** só mexer nas classes base (mobile-first) e mover o comportamento atual para `lg:` onde preciso. O layout desktop (canvas 1440 absoluto) fica intocado — tudo dele já vive atrás de `lg:`.

## Cross-reference Figma mobile × código atual

| # | Elemento | Figma mobile (375) | Código atual (abaixo de lg) | Ação |
|---|----------|--------------------|------------------------------|------|
| 1 | Alinhamento do bloco de texto | **Esquerda** (align-items:flex-start; badge, H1, subtítulo, trust, CTAs todos à esquerda; frame em left:29, w:316) | `items-center text-center` (centralizado) | Trocar para `items-start text-left` na base; remover os `lg:items-start lg:text-left` (viram redundantes). Nos filhos: `justify-center lg:justify-start` → `justify-start` (trust items e CTAs) |
| 2 | H1 | 40px/48px (line-height 1.2), 3 linhas "The Chocolate / that changes / the night." | `text-display-hero` = **58px fixo em todos os breakpoints** | `text-[36px] leading-[1.2] lg:text-display-hero lg:leading-[1.05]` — 40→36 pela convenção "um passo abaixo" (64→58 no desktop). A quebra em 3 linhas sai naturalmente da largura; NÃO forçar `<br/>` extra (o `br` do en já divide "The Chocolate" ↑ do resto) |
| 3 | Subtítulo | Filson Pro itálico **19px**/23 #EBD9FE | `text-[21px]` fixo | `text-[17px] lg:text-[21px]` (19→17, um passo abaixo) |
| 4 | Mini trust items | **Empilhados em coluna**, gap 15, à esquerda; texto 12px **#EBD9FE** (lavanda cheia, não muted); losango 5px | `flex flex-wrap` em linha, centralizado, `text-dips-text-lavender-muted` | Base: `flex-col items-start gap-[15px]`; `lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-6 lg:gap-y-2`. Cor: `text-dips-text-lavender lg:text-dips-text-lavender-muted` (Figma mobile usa a lavanda clara; desktop mantém o muted já aprovado) |
| 5 | CTAs | Lado a lado (row, gap 15), Buy Now 118×50 e How It Works 161×50, ambos h-50/16px | Buy Now `h-[44px] text-[14px]` (override do usuário), How It Works `h-[50px]` | **NÃO mudar tamanhos** — o h-44/14px do Buy Now é override explícito do usuário que vence o Figma. Só garantir `justify-start` na base (item #1). Gap atual `gap-4` (16px) ≈ 15px do Figma, manter |
| 6 | Imagem do produto | **373.83px de largura em viewport de 375** = full-bleed borda a borda, logo abaixo do header (top:170), rotate -0.85deg | `max-w-[420px]` centralizada, mas dentro do wrapper com `px-6` → sobra gutter | Deixar full-bleed no mobile: na `motion.div`, `-mx-6 w-auto max-w-none lg:mx-0 lg:w-[52%] lg:max-w-[750px]` (o `-mx-6` cancela o `px-6` do canvas). Ordem no fluxo já está correta (imagem primeiro) |
| 7 | Feature cards | **1 coluna**, gap **25px**, largura 311 (=375−2×25... na real o frame é left:25 w:320), cards h:127, padding 25, título 18/desc 18 | `grid-cols-1 gap-[15px] sm:grid-cols-2` | Base `gap-[25px]`, `lg:gap-[15px]` (o 15px do desktop é refinamento aprovado GAP-34, não regressar). Manter `sm:grid-cols-2` para tablet (Figma não define tablet; decisão nossa já documentada). Tipografia dos cards já está em 16px (18→16 um passo abaixo) — não mexer |
| 8 | Blob pequeno (laranja, esq.) | top **26.99%** da seção (~atrás do badge/H1, ver screenshot), left -9.07%→right 80.22% (~108px visível), rotate -167.8deg | `top-[4px]` sempre (posição desktop aplicada também no mobile) | `top-[26%] w-[110px] lg:top-[4px] lg:w-[193px]` (width via classe; manter height auto). O corte na borda esquerda já funciona (overflow-hidden da section + left negativo) |
| 9 | Blob grande (laranja, inf. dir.) | **Visível no mobile**: top 76.45%→bottom -7.31%, left 54.93%→right **-45.95%** (≈ right:-172px), rotate 53.34deg, atrás do 4º card (transparece pelo bg translúcido do card) | `hidden lg:block` (só desktop, dentro da banda do canvas) | Adicionar render mobile: a banda-wrapper vira visível na base como `absolute inset-0 overflow-hidden` com o blob em `right-[-172px] bottom-[-120px]` e, em `lg:`, volta ao comportamento atual (`lg:inset-x-0 lg:top-0 lg:h-[937px]` + blob `lg:right-[-90px] lg:top-[542px] lg:bottom-auto`). Alternativa mais limpa: DUAS instâncias — a atual intocada (`hidden lg:block`) + uma nova `lg:hidden` com posicionamento mobile próprio. **Preferir a alternativa de 2 instâncias** (não arriscar regressão no posicionamento desktop já aprovado pelo usuário) |
| 10 | Badge social proof | 275×42, borda rgba(0,0,0,.25), bg rgba(59,21,46,.3), estrelas 18px | pill `px-5 py-2.5`, tokens tint-2, estrelas 14px | **Não mexer** — os tokens atuais são os aprovados no desktop; a variação de cor do dump mobile (bg vinho) contradiz o desktop e o screenshot mobile mostra o mesmo pill escuro atual. Divergência anotada, não aplicada |
| 11 | Trust bar (topo) | Grupo desktop de 1440px **clipado** em 375 (mostra ~2 itens estáticos) | Marquee animado (letreiro) já implementado | **Não mexer** — o marquee é melhoria explícita pedida pelo usuário; o clip do Figma é artefato de reuso do grupo desktop. Já documentado em FIGMA-MOBILE-EXTRACTION.md |
| 12 | Header (logo + hambúrguer) | Logo+tagline à esq., hambúrguer 28px à dir.; nav links e Shop Now `display:none` | Já esconde nav/CTA abaixo de md e mostra hambúrguer (sem drawer) | **Fora de escopo desta rodada** — o estado fechado já bate. O drawer é tarefa própria (RESP-02/hambúrguer), tratar depois |

## Overrides funcionais que VENCEM o Figma (não copiar)

- **Buy Now h-[44px]/14px** (item 5) — pedido explícito do usuário, mantém.
- **"Satisfaction Gauranteed"** [sic no Figma] — nossa copy i18n já corrige para "Guaranteed" (FUNC-04), mantém.
- **Marquee da trust bar** (item 11) — mantém a animação.
- **Efeitos de hover jump** (CTAs/cards, commit `c341780`) — mantém; irrelevante em touch, inofensivo.

## Resumo de fontes (convenção "um passo abaixo", aplicada ao mobile)

| Elemento | Figma mobile | Aplicar |
|----------|--------------|---------|
| H1 | 40px | **36px** (lg: 58px já existente) |
| Subtítulo | 19px | **17px** (lg: 21px) |
| Card título/desc | 18px | **16px** — já está, sem mudança |
| Trust items / badge | 12px | **12px** (text-trust-bar) — já está |

## Sequência de execução (Sonnet)

1. `Hero.tsx` — bloco de texto: alinhamento base à esquerda (item 1), H1 responsivo (2), subtítulo (3), trust items em coluna + cor (4).
2. `Hero.tsx` — imagem full-bleed mobile (6).
3. `Hero.tsx` — cards `gap-[25px] lg:gap-[15px]` (7).
4. `Hero.tsx` — blob pequeno responsivo (8); blob grande: segunda instância `lg:hidden` (9).
5. Build + 71 testes + commit atômico no worktree + restart dev + addendum no 05-VISUAL-GAPS.md.

**Verificação visual:** DevTools em 375px — conferir com os 2 screenshots (ordem: imagem → badge → H1 3 linhas → subtítulo → 3 trust empilhados → CTAs lado a lado → 4 cards empilhados com blob laranja atrás do último).
