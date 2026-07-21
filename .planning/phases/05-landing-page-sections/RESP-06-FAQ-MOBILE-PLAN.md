# RESP-06 — FAQ Mobile (375px) — Plano de Execução

**Fonte:** CSS dump do frame mobile (375×957, bg #1A0A2E) + 1 screenshot (2026-07-21). Node `281:675` (não capturado no FIGMA-MOBILE-EXTRACTION original por rate limit — este dump fecha a lacuna).
**Alvo:** `src/components/FAQSection.tsx` (worktree). Só classes base; `lg:` intocado.
**Seção mais simples até agora:** estrutura idêntica (accordion 1 coluna, q1 aberta com borda laranja cheia, chevron 24px, gap 10px, tokens de card #231435/#39294C já corretos). Só padding do item, tipografia e o padding vertical da seção divergem.

## Cross-reference Figma mobile × código atual

| # | Elemento | Figma mobile | Código atual (base) | Ação |
|---|----------|--------------|---------------------|------|
| 1 | Título "FAQs" | **44px**/53, centrado | `text-[48px]` | `text-[40px] lg:text-[48px]` (44→40) |
| 2 | Subtítulo | **18px**/22 | `text-[21px]` | `text-[16px] lg:text-[21px]` (18→16) |
| 3 | Padding vertical da seção | ~40px | `py-20 lg:py-28` | `py-10 lg:py-28` (o py-20 intermediário era o mesmo valor visual do desktop; base encolhe, lg mantém) |
| 4 | Padding do item | **20px** | `p-card-padding` (25px) | `p-5 lg:p-card-padding` |
| 5 | Pergunta | 16px/19 | `text-[16px]` | `text-[14px] lg:text-[16px]` (16→14, um passo abaixo — mesmo racional do Hero/Story; ainda ≥14, legível) |
| 6 | Resposta | **14px**/17 #EBD9FE | `text-[16px] leading-[1.35]` | `text-[13px] leading-[1.3] lg:text-[16px] lg:leading-[1.35]` (14→13, igual aos parágrafos da Story mobile) |
| 7 | Chevron | 24px, stroke 3 | 24px, stroke 2.5 | **Manter** (diferença de 0.5 de stroke, imperceptível; mexer no seletor arbitrário não vale o churn) |
| 8 | Gap entre itens / q1 aberta com borda laranja / largura / centralização | 10px / sim / 311 (~px-6) / centrado | idênticos | Nada |
| 9 | Hover de borda laranja nas perguntas (pedido do usuário 2026-07-21) | não existe no Figma | implementado | **Manter** (override do usuário) |

## Overrides mantidos

- Copy das perguntas/respostas: override funcional documentado no GAP-39 (o Figma diverge em detalhes finos; a copy real do i18n vence) — o dump mobile repete a copy do desktop, nada novo.
- `whitespace-pre-line` na resposta (a5 quebra a lista de ingredientes) — mantém.
- Hover laranja nas perguntas (item 9).

## Resumo de fontes

| Elemento | Figma mobile | Base | lg (atual) |
|----------|--------------|------|------------|
| Título | 44px | **40px** | 48px |
| Subtítulo | 18px | **16px** | 21px |
| Pergunta | 16px | **14px** | 16px |
| Resposta | 14px | **13px** | 16px |

## Sequência de execução (Sonnet)

1. `FAQSection.tsx` — seção (3), header (1-2), item (4), trigger (5), content (6).
2. Build + 71 testes + commit atômico + restart dev + addendum no 05-VISUAL-GAPS.md.

**Verificação visual:** DevTools 375px vs screenshot — header compacto, q1 aberta com borda laranja, itens de ~64px fechados com padding 20.
