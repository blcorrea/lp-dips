# Figma Extraction — DIPS Landing Page Redesign

**Fonte:** figma.com/design/4BY8f4wh9rfje1ALRbFPoj — página 0:1, frame "Dips Chocolate Website" (257:29), 1440×6163px
**Extraído em:** 2026-07-16
**Assets baixados em:** `scratchpad/figma/assets/` (27 arquivos) → migrados para `public/images/redesign/` na Fase 4

> Recuperado pelo gsd-ui-researcher da Fase 5 em 2026-07-16: este arquivo tinha sido gerado durante a pesquisa da Fase 4, mas nunca foi copiado do scratchpad de sessão para o repo (só os 27 assets binários foram migrados). Copiado aqui para não se perder de novo — é a fonte primária de todos os valores brutos citados em `04-UI-SPEC.md` e `05-UI-SPEC.md`.

## Escopo

APENAS a landing page desktop. **Não existem no Figma:** versão mobile (390px), Order Confirmation, Affiliate Sign-Up. Páginas admin/afiliados/etc. permanecem intocadas.

## Design Tokens (extraídos, sem variables definidas no arquivo)

### Cores
| Token | Valor | Uso |
|---|---|---|
| bg-hero-gradient | `#18012d → #200635 (57.4%) → #250246` | fundo do hero (gradient vertical) |
| bg-dark-deepest | `#0a0519` | Our Story painel direito, Footer |
| bg-dark-section | `#1a0a2e` | Ingredients, FAQs |
| bg-reviews | `#2d1a69` | seção Reviews |
| bg-cream | `#fff8f0` | painel bundle selector (lado claro) |
| card-purple-tint | `rgba(49,34,89,0.25)` border `#392a61` | feature cards hero |
| card-purple-tint-2 | `rgba(38,23,77,0.15)` border `rgba(82,64,130,0.5)` | badge "10,000+ Happy Couples" |
| card-lavender-tint | `rgba(166,145,221,0.15)` border `rgba(212,201,244,0.25)` | mini-badges seções |
| card-ingredient | `#231435` border `#39294c` | cards de ingrediente, FAQ collapsed |
| card-ingredient-hl | `#371629` border `#5b2f2d` | card destacado (cocoa), badges RITUAL etc |
| card-review | `rgba(35,20,53,0.4)` border `rgba(57,41,76,0.4)` | review cards |
| bundle-card-light | `#ffffff` border `#eee6df` | bundle cards não selecionados |
| bundle-card-selected | `#371629` border `#ff6b01` (2px) | bundle card selecionado |
| bundle-summary | `#f6efe9` border `#eee6df` | linha unit price/shipping |
| accent-orange-cta | `#fb6c04` (hero) / `#ff6b01` (bundle) / `#f15a22` (footer/logo) | CTAs — 3 laranjas ligeiramente diferentes! |
| accent-orange-diamond | `#f16b16` | losangos decorativos (quadrado rotate-43) |
| text-lavender | `#ebd9fe` | subtítulos, body em dark |
| text-lavender-muted | `#ae9bda` | nav links, trust bar, texto ingredientes intro |
| text-muted-mauve | `#96838f` | descrições de card, preço/box |
| text-gray-review | `#9499a9` | corpo dos reviews |
| text-footer-muted | `#706c7b` / `#656170` / `#74707f` | footer textos |
| text-footer-fine | `#464253` | copyright/disclaimer |
| text-purple-deep | `#39165e` | texto em cards claros (bundle) |
| headline-lilac | `#cfa9f6` | palavra "Chocolate" no H1 |

### Tipografia (conforme Figma — ver AVISOS)
| Papel | Fonte | Tamanho |
|---|---|---|
| H1 hero | All Round Gothic Bold | 64px |
| H2 seções | All Round Gothic Bold | 54px (Reviews/FAQs/Story) / 48px ("Behind the experience") / 64px (side headers) |
| Subtítulo italic | Filson Pro Regular Italic | 24px (20px "The ingredients") |
| Body | Filson Pro Regular | 24px (Story), 18px (reviews) |
| Card titles | Satoshi Bold | 18-24px |
| Card body | Satoshi Regular | 14-18px |
| Botões CTA | DM Sans Bold | 16px |
| Nav/trust bar | Inter Bold/Medium | 12-14px |
| Footer headings | All Round Gothic Bold | 22px |
| Footer links | Filson Pro Regular | 18px |

### Formas/raios
- Cards: rounded-15px (reviews 18px), border-2
- Botões/pills: rounded-100px (full), altura 50px (CTA), 46px (newsletter)
- Losango decorativo: quadrado 5-8px, bg #f16b16, rotate 43°
- Carousel arrows: círculo 60px (ativo #f16b16, inativo #2b1543)

## Estrutura das seções (medidas-chave)

1. **Trust bar** (topo): h-45px, bg rgba(45,26,105,0.4), 6 itens texto 12px #ae9bda c/ losango
2. **Header**: h-72px, top 67px, px-40px; logo 59×36 + "Premium Chocolate"; nav Menu/Our Story/Order/Contact 14px; CTA "Shop Now" #fb6c04 h-50px
3. **Hero** (1054px): H1 64px ("The" branco + "Chocolate" #cfa9f6 / "that changes the night." branco), sub Filson Italic 24px #ebd9fe, badge social proof c/ 5 estrelas, 3 mini trust items, botões "Buy Now" (laranja) + "How It Works?" (outline #58477e), imagem produto ~822×548 rotate -0.85°, blobs laranja decorativos, 4 feature cards (301-311px w, p-25px) na base
4. **Story split** (699px): esq. foto casal c/ overlay gradient laranja→roxo 20%, H 64px "Made to be Savoured by Two" + 3 badges; dir. bg #0a0519 "Our Story" 54px #ebd9fe + 3 parágrafos Filson 24px branco
5. **Ingredients split** (839px): esq. bg #1a0a2e header "The ingredients / Behind the experience." + 6 cards de ingrediente (icon 44px, nome Satoshi Bold 16px, badge pill RITUAL/STAMINA/SPARK/PRESENCE/UNION/BALANCE 10px); primeiro card (cocoa) destacado #371629 c/ descrição; dir. intro 24px #ae9bda + card expandido cocoa (título 24px, desc, sub-card "Origins & Curiosities")
6. **Bundle split** (699px): esq. bg #fff8f0 c/ 3 bundle cards (637px w): 1x/3x claros (texto #39165e), 2x selecionado (#371629, border #ff6b01, badge flutuante "Most Popular" #ff6b01 Filson Bold 12px); cada card: img produto 111×75, nome 20px, "$29.99 / box" 14px, badge pill discount 9px, preço 20px; resumo Unit Price/Shipping (#f6efe9); CTA "Buy Now ... $59.99" full-width justify-between; dir. foto casal + "Bring the Experience home." 64px right-aligned + 3 badges
7. **Reviews** (1368px, bg #2d1a69): título 54px, sub 24px, 6 cards masonry 3 colunas (390px w, p-25px, rounded-18px): avatar 60px circular, nome All Round Gothic 24px, papel 14px #9499a9, 5 estrelas, bandeira+país, texto 18px #9499a9, data 14px #ebd9fe right; setas carousel
8. **FAQs** (1014px, bg #1a0a2e): título 54px, 6 itens accordion (807px w, p-25px): pergunta All Round Gothic 18px + chevron 24px; item aberto border #ff6b01 c/ resposta Filson 18px #ebd9fe
9. **Footer** (490px, bg #0a0519): logo 94×58, endereço "Dips Labs LLC | 18117 Biscayne Blvd #3022 | Miami, FL 33160" italic 18px; newsletter "Never Satisfied?" 28px + input pill 362px + botão Sign Up #f15a22 123px; 3 colunas links (Orders/Quick Links/Customer Care — inclui **Affiliates**!) 22px headings + 18px links #656170; Contact Us help@dips.co #f15a22 underline; copyright + FDA disclaimer 14px #464253

## AVISOS (divergências e problemas no design)

1. **Fontes**: Figma usa "FONTSPRING DEMO - All Round Gothic Bold" (licença demo!), Filson Pro, Satoshi, Inter e DM Sans — 5 famílias, 3 delas fora do brand book (que pede All Round Gothic + Filson Soft). Briefing autoriza substitutos Google Fonts. Decidir estratégia de fontes antes de implementar. **(Resolvido na Fase 4 — ver 04-UI-SPEC.md: AllRoundGothic/FilsonPro reutilizados como OTFs licenciados existentes; Plus Jakarta Sans substitui Satoshi; DM Sans mantido para CTAs; Inter absorvido pelo FilsonPro Medium.)**
2. **Typos no design** (corrigir na implementação): "Gaurantee"/"Gauranteed" → Guarantee(d); "100% Natural Igredients" → Ingredients; "Aphrodiasiac Herbal Blend" → Aphrodisiac.
3. **Preços**: design mostra 2x=$59.99 c/ "7% Discount" e 3x=$89.99 c/ "16% Discount" mas matematicamente $29.99/box sem desconto real (2×29.99=59.98). Briefing dizia $55.78/$75.57. **Preços reais vêm do Shopify/Stripe — design é só referência visual.** Confirmar copy dos badges com DIPS. **(Fora de escopo do milestone v1.1 — ver REQUIREMENTS.md "Out of Scope": manter os valores/badges já implementados em `ProductPurchaseBox.tsx`, que já refletem preços/descontos reais via Stripe Price IDs.)**
4. **Footer**: mailto aponta pra "help@tabs.co" (sobra do template de referência) mas exibe "help@dips.co". Usar o email real do site atual. **(Já resolvido no `Footer.tsx` atual — usa `info@dipschocolate.com`.)**
5. **Reviews**: conteúdo dos reviews no Figma é placeholder do designer; usar dados reais de `src/data/reviews.ts` / ReviewsSection existente (lembrando F-03: sem platform badges em placeholders).
6. **Links de navegação**: header do design tem "Menu, Our Story, Order, Contact" (âncoras da própria página — briefing pede navegação mínima). Footer tem muitos links (Track Order, Wholesale, etc.) que não existem no site atual — decidir o que mapear/omitir. **(Decidido na Fase 5: header vira exatamente esses 4 links + CTA "Shop Now", sem language switcher/social icons/Affiliates inline — ver 05-UI-SPEC.md.)**
7. **3 laranjas diferentes** (#fb6c04, #ff6b01, #f15a22) — provavelmente descuido do designer; sugerir normalizar para o laranja do brand book #F27521 ou adotar um dos três consistentemente. **(Resolvido na Fase 4 — DSGN-03: todos normalizados para `--color-brand-orange: #f27521`.)**
8. **Idioma**: todo o copy do Figma é EN; traduzir para es/pt via messages/*.json (i18n obrigatório, expansão ~30%).

## Assets baixados (scratchpad/figma/assets/ → public/images/redesign/)

hero-product.png (213KB), story-couple-photo.png (1MB), experience-couple-photo.png, product-box-small.png, blob-vector-1/2.svg, logo-orange-part.svg + logo-purple-part.svg (hero 59×36), footer-logo-orange/purple.svg (94×58), stars-rating.svg + stars-5.svg, arrow-left/right.svg, chevron-down.svg, 6× ing-icon-*.png, 6× review-avatar-*.png (placeholders do designer)
