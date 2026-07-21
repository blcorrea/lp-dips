# RESP-02 — Story Mobile (375px) — Plano de Execução

**Fonte:** CSS dump do frame mobile (375×1090 — o layer se chama "Ingredients" no Figma, mas é a seção **Story**: foto 699px + painel "Our Story" 391px) + 2 screenshots (2026-07-21). Node `281:146` em `FIGMA-MOBILE-EXTRACTION.md`.
**Alvo:** `src/components/StorySection.tsx` (worktree). Só classes base mudam; o layout lg atual fica intocado via prefixo.
**Boa notícia estrutural:** a ordem/estrutura mobile do Figma (foto com badge no topo + título + subtítulo, badges na base; painel escuro embaixo) é EXATAMENTE o que o código já faz abaixo de lg. Só medidas/tipografia/empilhamento dos badges divergem.

## Cross-reference Figma mobile × código atual

| # | Elemento | Figma mobile | Código atual (base) | Ação |
|---|----------|--------------|---------------------|------|
| 1 | Altura do painel da foto | **699px** (igual ao desktop) | `min-h-[420px]` | `min-h-[699px]` na base também (o `lg:min-h-[699px]` vira redundante, pode remover) |
| 2 | Título "Made to be Savoured by Two" | **54px**/65 (lh 1.2), 3 linhas | `text-[58px]` fixo | `text-[48px] lg:text-[58px]` (54→48, um passo abaixo — mesma régua do heading-lg desktop) |
| 3 | Subtítulo itálico | **16px**/19 | `text-[21px]` fixo | `text-[14px] lg:text-[21px]` (16→14) |
| 4 | Badge social proof (topo) | padding **12px**, texto 12px | `px-[15px] py-3 text-[14px]` | `p-3 text-[12px] lg:px-[15px] lg:py-3 lg:text-[14px]` |
| 5 | Gap do grupo do topo (badge→título→subtítulo) | **10px** | `gap-4` (16px) | `gap-2.5 lg:gap-4` |
| 6 | Badges da base | **EMPILHADOS em coluna**, gap 15, cada um `w-fit` (127/161/183px) | `flex flex-wrap gap-3` (linha) | `flex-col items-start gap-[15px] lg:flex-row lg:flex-wrap lg:items-center lg:gap-3 lg:justify-between` |
| 7 | Padding dos badges da base | 15px uniforme, h:46 | `px-[15px] py-3` (h≈44) | **Não mexer** — diferença de 2px, imperceptível |
| 8 | Painel "Our Story" — título | **44px**/53 | `text-[48px]` fixo | `text-[40px] lg:text-[48px]` (44→40) |
| 9 | Parágrafos | **14px**/17, gap 10 entre blocos | `text-[21px] leading-[1.35] space-y-5` | `text-[13px] leading-[1.3] space-y-2.5 lg:text-[21px] lg:leading-[1.35] lg:space-y-5` (14→13) |
| 10 | Padding do painel escuro | 25-28px | `p-6 py-12` (py 48px) | `p-6 lg:p-10` (remover o `py-12` — o Figma mobile usa ~25px de respiro, o py-12 atual dobra isso) |
| 11 | Gap título→parágrafos no painel | **10px** | `gap-6` | `gap-2.5 lg:gap-6` |
| 12 | Cor/tokens (gradiente da foto, bg deepest, cores de texto, tokens dos badges) | idênticos ao desktop | já corretos | Nada |
| 13 | Centralização vertical do painel (justify-center) | mobile flui naturalmente (conteúdo preenche) | `justify-center` (pedido do usuário) | **Manter** — inofensivo no mobile, essencial no lg |

## Overrides/decisões mantidos

- `justify-center` do painel direito (pedido explícito do usuário em 2026-07-21) — mantém nas duas larguras.
- Copy dos badges e parágrafos: i18n real atual (o Figma mobile repete a mesma copy do desktop, sem divergência nova).
- `drop-shadow` do título sobre a foto: não existe no dump, mas foi aprovado no desktop para legibilidade — mantém nas duas larguras.

## Resumo de fontes (um passo abaixo)

| Elemento | Figma mobile | Aplicar (base) | lg (atual, intocado) |
|----------|--------------|----------------|----------------------|
| Título da foto | 54px | **48px** | 58px |
| Subtítulo | 16px | **14px** | 21px |
| Badge topo | 12px | **12px** | 14px |
| Badges base | 12px | 13px atual — manter (1px, imperceptível; evita churn) | 13px |
| "Our Story" | 44px | **40px** | 48px |
| Parágrafos | 14px | **13px** | 21px |

## Sequência de execução (Sonnet)

1. `StorySection.tsx` — painel foto: min-height (1), título (2), subtítulo (3), badge topo (4), gap topo (5), badges base em coluna (6).
2. `StorySection.tsx` — painel escuro: título (8), parágrafos (9), padding (10), gap (11).
3. Build + 71 testes + commit atômico no worktree + restart dev + addendum no 05-VISUAL-GAPS.md.

**Verificação visual:** DevTools 375px vs screenshots — foto alta (699px) com badge/título/subtítulo no topo e 3 badges empilhados na base; painel "Our Story" compacto (título 40px lavanda + 3 parágrafos 13px brancos).
