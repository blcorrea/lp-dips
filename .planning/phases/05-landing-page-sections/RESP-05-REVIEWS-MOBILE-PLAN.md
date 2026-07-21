# RESP-05 — Reviews Mobile (375px) — Plano de Execução

**Fonte:** CSS dump do frame mobile (375×2093, bg #2D1A69) + 3 screenshots (2026-07-21). Node `281:529` em `FIGMA-MOBILE-EXTRACTION.md`.
**Alvo:** `src/components/ReviewsSection.tsx` (worktree). Só classes base; `lg:` intocado.
**Boa notícia:** a estrutura já bate — coluna única no mobile (o `grid-cols-1` atual já produz a ordem Marcus→Liam→Elena→Jessica→David→Tyson, idêntica à do Figma), cards com os mesmos tokens (padding 25, radius 18, bg/borda). Só tipografia, tamanhos internos e o rodapé do carrossel divergem.

## Cross-reference Figma mobile × código atual

| # | Elemento | Figma mobile | Código atual (base) | Ação |
|---|----------|--------------|---------------------|------|
| 1 | Título | **44px**/53, centrado | `text-[48px]` | `text-[40px] lg:text-[48px]` (44→40) |
| 2 | Subtítulo | **18px**/22 | `text-[21px]` | `text-[16px] lg:text-[21px]` (18→16) |
| 3 | Padding vertical da seção | ~40px em cima/embaixo | `py-20 sm:py-28` | `py-10 lg:py-20` (mover o atual pra `lg:`; remover `sm:py-28` ou trocar por `lg:py-28` — manter o visual desktop atual) |
| 4 | Gap interno do card | **15px** | `gap-[25px]` | `gap-[15px] lg:gap-[25px]` |
| 5 | Avatar | **44px** | 60px | `h-11 w-11 lg:h-[60px] lg:w-[60px]` (nas DUAS variantes: foto e fallback de iniciais; `sizes` do Image pode ficar "60px") |
| 6 | Gap avatar→textos | **10px** | `gap-[15px]` | `gap-[10px] lg:gap-[15px]` |
| 7 | Nome | **18px** | `text-[21px]` | `text-[16px] lg:text-[21px]` (18→16) |
| 8 | Role | 12px | `text-[13px]` | `text-[12px] lg:text-[13px]` (literal, ≤12 não reduz) |
| 9 | Estrelas | **16px** | 18px | `h-4 w-4 lg:h-[18px] lg:w-[18px]` |
| 10 | País | **10px** | `text-[13px]` | `text-[10px] lg:text-[13px]` (literal) |
| 11 | Quote | **12px**/14 | `text-[16px] leading-[1.25]` | `text-[12px] leading-[14px] lg:text-[16px] lg:leading-[1.25]` (literal) |
| 12 | Data | **10px** | `text-[13px]` | `text-[10px] lg:text-[13px]` (literal) |
| 13 | Setas do carrossel | **50px**, espalhadas nas DUAS pontas (`justify-between`, largura cheia) | 60px, `justify-end gap-14` | Base: `w-full justify-between h/w-[50px]` (+ SVG `h-5 w-5`); `lg:` restaura `justify-end gap-[14px]` 60px/`h-6 w-6` |
| 14 | Cores/tokens (bg seção, card, estrelas #FFCD00, setas #2B1543/laranja) | idênticos | já corretos | Nada |
| 15 | Ordem dos reviews em coluna única | Marcus, Liam, Elena, Jessica, David, Tyson | mesma (colunas explícitas empilham na mesma sequência) | Nada |

## Overrides/decisões mantidos

- **Setas desabilitadas** continuam desabilitadas (decisão do GAP-38: os 6 reviews já renderizam todos, paginação real só quando houver mais conteúdo). O Figma mobile mostra as mesmas setas sem indicar comportamento.
- **Dados reais** dos reviews (fotos user-provided, i18n) — o dump repete a mesma copy, sem divergência nova.
- Hover `hover:bg-white/[0.06]` do card — inofensivo em touch, mantém.

## Resumo de fontes

| Elemento | Figma mobile | Base | lg (atual) |
|----------|--------------|------|------------|
| Título | 44px | **40px** | 48px |
| Subtítulo | 18px | **16px** | 21px |
| Nome | 18px | **16px** | 21px |
| Role | 12px | **12px** | 13px |
| Quote | 12px | **12px** | 16px |
| País/data | 10px | **10px** | 13px |

## Sequência de execução (Sonnet)

1. `ReviewsSection.tsx` — header (1-3), card (4-12), carrossel (13).
2. Build + 71 testes + commit atômico + restart dev + addendum no 05-VISUAL-GAPS.md.

**Verificação visual:** DevTools 375px vs screenshots — coluna única de 6 cards compactos (avatar 44, quote 12px), setas 50px nas duas pontas da largura.
