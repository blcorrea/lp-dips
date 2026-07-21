# RESP-07 — Footer Mobile (375px) — Plano de Execução

**Fonte:** CSS dump do frame mobile (375×1148, bg #0A0519) + 2 screenshots (2026-07-21). Node `281:730` (não capturado no FIGMA-MOBILE-EXTRACTION original por rate limit — este dump fecha a última lacuna).
**Alvo:** `src/components/LandingFooter.tsx` (worktree). Só classes base; `lg:` intocado.
**Última seção da varredura mobile.** A coluna esquerda (logo → endereço → newsletter) já bate 100% no mobile — inclusive os tamanhos (logo 94×58 igual, endereço 16px = 18→16, título 25px = 28→25, input/botão 46px). Só a ZONA DIREITA (colunas de links + Contact Us) e o texto legal divergem.

## Cross-reference Figma mobile × código atual

| # | Elemento | Figma mobile | Código atual (base) | Ação |
|---|----------|--------------|---------------------|------|
| 1 | Coluna esquerda inteira (logo, endereço, newsletter) | idêntica ao que temos | ✓ | **Nada** |
| 2 | Colunas de links | **empilhadas em 1 coluna** à esquerda, gap ~15px entre grupos | `grid-cols-2 gap-8 sm:grid-cols-3` | `grid-cols-1 gap-[15px] sm:grid-cols-3 sm:gap-8` (a variante 2-col intermediária sai; sm+ mantém as 3 colunas atuais) |
| 3 | Alinhamento da zona direita | à ESQUERDA (screenshot: headings/links/Contact Us tudo à esquerda) | `items-end` (+ Contact Us `text-right`) | `items-start lg:items-end`; Contact Us `text-left lg:text-right` |
| 4 | Headings das colunas | **18px**/22 | `text-[20px]` | `text-[16px] lg:text-[20px]` (18→16) |
| 5 | Links | **14px**/17, gap 2px | `text-[16px] space-y-[5px]` | `text-[13px] space-y-[2px] lg:text-[16px] lg:space-y-[5px]` (14→13) |
| 6 | Heading "Contact Us" | 22px/26 | `text-[20px]` | **Manter 20px** (22→20 já é o mapeamento aprovado no desktop; mobile Figma usa o MESMO 22 do desktop) |
| 7 | E-mail do Contact Us | 18px | `text-[16px]` | **Manter** (18→16 já aplicado) |
| 8 | Texto legal | **12px**/14 | `text-[13px]` | `text-[12px] lg:text-[13px]` (literal, ≤12 não reduz) |
| 9 | Gap entre grupos da zona direita (links → Contact Us) | ~50px | `gap-[50px]` | Nada |
| 10 | Padding do container | ~28-32px | `p-6 lg:p-[50px]` | Nada (24px ≈ ok) |

## Overrides mantidos (vencem o Figma mobile — todos já documentados no GAP-40)

- **Endereço real** da Dips Wellness Corporation (o Figma mobile mostra o placeholder "Dips Labs LLC | 18117 Biscayne Blvd...").
- **info@dipschocolate.com** (Figma: help@dips.co fictício).
- **Wholesale/Accessibility omitidos** (sem páginas reais); "Where to Buy" e "Affiliates" reais mantidos.
- **© "Dips Chocolate"** + disclaimer FDA via i18n (Figma: "Dips Labs LLC").
- Form de newsletter client-only (T-05).

## Resumo de fontes

| Elemento | Figma mobile | Base | lg (atual) |
|----------|--------------|------|------------|
| Headings de coluna | 18px | **16px** | 20px |
| Links | 14px | **13px** | 16px |
| Legal | 12px | **12px** | 13px |
| Todo o resto (newsletter, endereço, Contact Us, email) | = desktop já mapeado | sem mudança | — |

## Sequência de execução (Sonnet)

1. `LandingFooter.tsx` — zona direita: grid 1 coluna (2), alinhamento (3), headings (4), links (5); legal (8).
2. Build + 71 testes + commit atômico + restart dev + addendum no 05-VISUAL-GAPS.md (fechando a varredura mobile das 7 seções).

**Verificação visual:** DevTools 375px vs screenshots — logo/endereço/newsletter iguais, depois Orders/Quick Links/Customer Care empilhados à esquerda, Contact Us à esquerda, legal 12px no rodapé.
