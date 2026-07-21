# RESP-03 — Ingredients Mobile (375px) — Plano de Execução

**Fonte:** CSS dump do frame mobile (375×1097, dois painéis empilhados: lista 708px + detalhe 389px, ambos bg #1A0A2E) + 2 screenshots (2026-07-21). Node `281:209` em `FIGMA-MOBILE-EXTRACTION.md`.
**Alvo:** `src/components/IngredientsSection.tsx` (worktree). Só classes base; `lg:` intocado.
**Nota sobre fontes:** a convenção "um passo abaixo" existe porque texto GRANDE renderiza visualmente mais pesado no browser que no canvas do Figma. Para tamanhos ≤12px isso não vale (reduzir prejudicaria legibilidade sem ganho) — nesses casos seguimos o Figma literal. Exceção flagrada abaixo (pill 8px).

## Cross-reference Figma mobile × código atual

| # | Elemento | Figma mobile | Código atual (base) | Ação |
|---|----------|--------------|---------------------|------|
| 1 | **Ordem do header** | Título "Behind the experience." PRIMEIRO, eyebrow "The ingredients" DEPOIS (invertido vs desktop!) | eyebrow → título (ordem desktop) | Envolver eyebrow+título num wrapper `flex flex-col` e trocar via `order-*`: título `order-1 lg:order-2`, eyebrow `order-2 lg:order-1`. Confirmado pelo screenshot e já previsto em FIGMA-MOBILE-EXTRACTION.md |
| 2 | Título | **44px**/53, branco, 2 linhas | `text-[44px]` fixo | `text-[40px] lg:text-[44px]` (44→40, um passo abaixo) |
| 3 | Eyebrow | Filson itálico **16px**/19 #EBD9FE | `text-[18px]` | `text-[14px] lg:text-[18px]` (16→14) |
| 4 | Badge social proof | padding 12, texto 12px | `px-[15px] py-3 text-[14px]` | `p-3 text-[12px] lg:px-[15px] lg:py-3 lg:text-[14px]` (idêntico ao RESP-02) |
| 5 | Espaçamentos do painel esq. | padding 25/28, gap 25 entre grupos, gap 10 no header, título→lista ~25 | `p-6 py-12 lg:p-10`, `mb-1 mt-6` eyebrow, `mb-8` título | Base: `p-6` (remover `py-12`), header com gap-2.5, título `mb-0` dentro do wrapper + wrapper `mb-6`; `lg:` restaura os valores atuais |
| 6 | Row selecionada (cocoa) | padding **15**, radius **12**, icon 44, nome 12px, desc **12px**/16 visível | `p-card-padding` (25), `rounded-card` (15), nome 14px, desc 13px | Base: `p-[15px] rounded-[12px] text-[12px]` (nome e desc); `lg:` mantém 25/15/14/13 |
| 7 | Rows não-selecionadas | padding **15**, radius **10**, icon 35×30, nome 12px | `px-card-padding py-5`, `rounded-card`, icon `h-8 w-9` (32×36) | Base: `p-[15px] rounded-[10px]`, nome `text-[12px]`; icon atual fica (32×36 ≈ 35×30, diferença imperceptível); `lg:` mantém |
| 8 | Keyword pill | padding 8×15, h:27, texto **8px** | `px-[15px] py-[6px] text-[10px]` | **Manter 10px** (override de legibilidade — 8px em tela real é ilegível e falha acessibilidade; os 2px de padding-y de diferença ficam). ⚠ Flag: se quiser fidelidade literal aos 8px, é 1 classe |
| 9 | Painel direito — intro | Satoshi **18px**/24 #AE9BDA | `text-[21px]` | `text-[16px] lg:text-[21px]` (18→16) |
| 10 | Painel direito — espaçamentos | padding 25, gap 25 | `p-6 py-12 gap-12 lg:p-10` | Base: `p-6 gap-6` (remover `py-12`); `lg:gap-12 lg:p-10` |
| 11 | Card de detalhe | padding **20**, icon **40**, nome 12px, desc **10px**/14 | `p-card-padding` (25), icon 44, nome 21px, desc 13px | Base: `p-5`, icon `h-10 w-10`, nome `text-[12px]`, desc `text-[10px] leading-[14px]`; `lg:` mantém tudo |
| 12 | Card Origins & Curiosities | padding **15**, título 12px, corpo **10px**/14 | `p-card-padding` (25), título 14px, corpo 13px | Base: `p-[15px]`, título `text-[12px]`, corpo `text-[10px] leading-[14px]`; `lg:` mantém |
| 13 | Tokens/cores (bgs, bordas, #96838F, #AE9BDA) | idênticos ao desktop | já corretos | Nada |
| 14 | Interatividade (seleção por clique) e hover lift | Figma é mock estático do cocoa | implementados | **Manter** — comportamento aprovado, irrelevante pro dump |

## Overrides mantidos (vencem o Figma)

- **Pill 8px → fica 10px** (item 8) — legibilidade/acessibilidade; único desvio tipográfico proposto, flagrado pra decisão do usuário.
- Interação de seleção + hover jump (itens 14).
- Copy i18n atual (o dump repete a copy desktop; "Aphrodiasiac" [sic] do Figma continua corrigido pra "Aphrodisiac" no nosso i18n).

## Resumo de fontes

| Elemento | Figma mobile | Aplicar (base) | lg (atual) |
|----------|--------------|----------------|------------|
| Título | 44px | **40px** | 44px |
| Eyebrow | 16px | **14px** | 18px |
| Intro | 18px | **16px** | 21px |
| Nome de ingrediente (lista e detalhe) | 12px | **12px** (literal, ≤12 não reduz) | 14px / 21px |
| Desc da lista | 12px | **12px** | 13px |
| Desc detalhe / corpo Origins | 10px | **10px** (literal) | 13px |
| Pill | 8px | **10px** (override legibilidade) | 10px |
| Badge | 12px | **12px** | 14px |

## Sequência de execução (Sonnet)

1. `IngredientsSection.tsx` — painel esq.: badge (4), wrapper header com order swap (1), título (2), eyebrow (3), espaçamentos (5).
2. Rows da lista: paddings/radius/tipografia mobile (6, 7); pill fica (8).
3. Painel dir.: intro (9), espaçamentos (10), card detalhe (11), card Origins (12).
4. Build + 71 testes + commit atômico + restart dev + addendum no 05-VISUAL-GAPS.md.

**Verificação visual:** DevTools 375px vs screenshots — título antes do eyebrow; cocoa selecionado compacto (radius 12, desc 12px); rows apertadas (~60px); intro 16px lavanda-muted; card de detalhe com textos 10px.
