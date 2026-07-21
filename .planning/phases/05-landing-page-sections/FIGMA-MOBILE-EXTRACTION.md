# FIGMA — Mobile Responsive Extraction (parcial)

**Fonte:** figma.com/design/4BY8f4wh9rfje1ALRbFPoj — página "Designs" (0:1), frame **"Dips Chocolate Website // Mobile Responsive" (281:21)**, **375×9587px**
**Extraído:** 2026-07-17 via Figma MCP (5 de 7 seções — rate limit do plano Starter interrompeu antes de FAQs e Footer)
**Screenshots:** `figma-mobile/mobile-1-hero.png` … `mobile-5-reviews.png` (neste diretório)

> ⚠ O designer também adicionou uma página "Documentation" (1:72) com o briefing completo (público-alvo, brand identity #57126E/#F27521/#542B28, princípios de conversão, referência tabs.co). Vale ler ao planejar copy/tom.

## Impacto imediato nos requisitos

**A premissa do RESP-01 mudou.** REQUIREMENTS.md diz: *"Layout mobile (~390px) adaptado do desktop com decisões próprias documentadas (Figma não tem versão mobile)"* — **agora o Figma TEM versão mobile (375px)**. O Out of Scope *"Mobile 'fiel ao Figma' — Não existe versão mobile no arquivo"* ficou obsoleto. RESP-01 deve virar "mobile fiel ao Figma 375px" (discutir e atualizar REQUIREMENTS.md/ROADMAP Fase 6).

**O hambúrguer que a Fase 5 deixou como TODO agora tem design:** o header mobile do Figma mostra logo + tagline + **ícone hambúrguer** à direita (281:61). Fase 6 não precisa mais inventar o padrão.

## Estrutura do frame mobile (node IDs para get_design_context depois)

| # | Node | Seção | Altura | Observações-chave |
|---|------|-------|--------|-------------------|
| 1 | `281:22` | Hero (com trust bar + header) | 1656px | Trust bar: grupo de **1440px de largura clipado em 375** (`281:82`) mostrando ~2 itens ("Made in USA · Premium Arriba Cocoa") → sugere marquee/scroll horizontal (ou artefato de reuso do grupo desktop — decidir na Fase 6). Header: logo + tagline + hambúrguer. Ordem do conteúdo: **imagem do produto PRIMEIRO**, depois badge social proof → H1 alinhado à esquerda → subtítulo itálico **"A Chocolate crafted for connection."** → 3 mini trust items EMPILHADOS com losango laranja ("100% Natural / Satisfaction Gauranteed [sic→Guaranteed, FUNC-04] / 100% Discreet Shipping") → Buy Now + How It Works? lado a lado → **4 feature cards empilhados 1 coluna** (losango + título curto + descrição: "Natural Aphrodisiac / Premium Cocoa / For Couples / Adults Only"). Blobs laranja: um atrás do H1 (borda esquerda), outro no canto inf. direito atrás do último card. |
| 2 | `281:146` | Story | 1154px | Foto full-bleed com badge "10,000+ Happy Couples" no topo, heading "Made to be Savoured by Two", subtítulo itálico, **3 badges empilhados** na base; painel "Our Story" abaixo com 3 parágrafos. (= empilhado, como nosso site já faz abaixo de lg.) |
| 3 | `281:209` | Ingredients | 1097px | Badge social proof → heading **"Behind the experience."** com eyebrow itálico **"The ingredients"** (no mobile o eyebrow vem DEPOIS do heading) → 6 cards compactos horizontais (ícone + nome + badge na MESMA linha; cocoa expandido com descrição e borda laranja) → intro completa **"…Six botanicals, one unforgettable experience."** → card expandido cocoa com Origins & Curiosities. |
| 4 | `281:373` | Bundle | 1429px | **Foto vem PRIMEIRO no mobile** (eyebrow badge "THE DIPS EXPERIENCE" no topo direito, heading "Bring the Experience home." alinhado à direita + subtítulo itálico + 3 badges), painel creme DEPOIS com 3 cards empilhados + resumo Unit Price/Shipping + Buy Now com total no botão. Preços do design continuam placeholder ($59.99/$89.99, badges "0% Discount + Free Shipping" no 1x) — **seguimos usando os preços/badges reais (FUNC-01)**. |
| 5 | `281:529` | Reviews | 2093px | Heading "What People Are Saying" + parágrafo-subtítulo ("We care about what we put in our products…") → reviews em **1 coluna** empilhada → setas de carrossel na base (esq. escura, dir. laranja). Cards do design têm foto/role/flag/data (placeholders — mantemos dados reais por decisão travada). |
| 6 | `281:675` | FAQs | 957px | **NÃO CAPTURADO** (rate limit). Capturar quando o limite resetar. |
| 7 | `281:730` | Footer | 1201px | **NÃO CAPTURADO** (rate limit). Altura 1201px sugere empilhamento total. Capturar quando o limite resetar. |

## Confirmações que o mobile dá para os gaps do desktop (05-VISUAL-GAPS.md)

O design mobile usa a MESMA copy/formatos do desktop, o que confirma vários gaps que estavam "a discutir":

- **GAP-03 confirmado:** subtítulo do Hero é "A Chocolate crafted for connection." (aparece no hero mobile).
- **GAP-04 confirmado:** mini trust items com losango laranja e copy "100% Natural / Satisfaction Guaranteed / 100% Discreet Shipping".
- **GAP-05 confirmado (formato):** feature cards = losango + título curto ("Natural Aphrodisiac", "Premium Cocoa", "For Couples", "Adults Only") + descrição de 1-2 linhas — NÃO as frases longas do `Product.feature1..4` atual. A decisão de "reusar copy verbatim" precisa ser revista: o Figma tem copy própria para esses 4 cards.
- **GAP-09 confirmado:** heading da seção Ingredients é "The ingredients" (itálico) + "Behind the experience." — não "The Art of Temptation".
- **GAP-10 confirmado:** cards de ingrediente são linhas compactas horizontais (ícone + nome + badge na mesma linha), não tiles 2-col.
- **GAP-12 confirmado:** intro completa termina com "Six botanicals, one unforgettable experience."
- **GAP-14 esclarecido:** o eyebrow "THE DIPS EXPERIENCE" existe no Figma — mas como badge sobre a FOTO do bundle, não como header do painel creme.
- **GAP-16 confirmado:** Reviews tem parágrafo-subtítulo e NÃO tem eyebrow "REAL PEOPLE. REAL RESULTS.".

## Pendências

1. Capturar FAQs (`281:675`) e Footer (`281:730`) mobile quando o rate limit do Figma MCP resetar.
2. Rodar `get_design_context` nos nodes acima na hora de implementar a Fase 6 (medidas exatas, espaçamentos, tokens).
3. Discutir e atualizar REQUIREMENTS.md (RESP-01 + Out of Scope) e o goal da Fase 6 no ROADMAP.
4. Decidir comportamento da trust bar mobile (marquee vs wrap) — o Figma sugere overflow horizontal.
