# Phase 5 — Visual Gaps vs Figma (análise pós-walkthrough)

**Gerado:** 2026-07-17 (madrugada, após walkthrough do usuário)
**Status:** ✅ Todos os itens objetivos (RC-1..4, GAP-03/05/07/09/12/14/16/20) corrigidos autonomamente no worktree do 05-05 enquanto o usuário estava fora — ver "Addendum — Correções aplicadas" no fim deste arquivo. Itens de decisão (RESP-01, mobile nav, blobs, footer 4-col, FAQ prefixes, etc.) continuam em aberto para discussão.
**Fonte:** 14 screenshots comparativos (esquerda = nosso site, direita = Figma) + inspeção de código por 4 agentes paralelos (workflow `phase5-visual-gap-rootcause`)

## Estado da execução (contexto para retomar)

- Plano 05-05 está **pausado no checkpoint human-verify** (task 3 de 3). Tasks 1-2 commitadas no worktree.
- O trabalho do 05-05 vive no worktree `C:/dev/dips/lp-dips/.claude/worktrees/agent-a647a13d3da177a22` (branch `worktree-agent-a647a13d3da177a22`) — **ainda NÃO mesclado** em `feature/layout-updates`.
- Waves 1-2 (planos 05-01..05-04) já estão mescladas na branch principal.
- Dev server rodando no worktree em `http://localhost:3000` (background task; morre se a máquina reiniciar).

## ⚠ Aviso metodológico importante — viewport do teste

Os screenshots foram tirados com a janela do browser em **~985px de largura** (metade da tela, lado a lado com o Figma). Os splits de Story/Ingredients/Bundle estão implementados com `lg:` (ativa em **≥1024px**) — ou seja, **abaixo de 1024px eles empilham por design**. Parte do "tudo empilhado" observado é efeito da janela estreita, não bug. **Re-testar com janela maximizada (1440px+)** antes de julgar os splits dessas 3 seções. O Hero, porém, está errado em QUALQUER largura (ver GAP-02).

---

## Causas-raiz confirmadas por inspeção de código

### RC-1 (CRÍTICO, regressão app-wide da Fase 4): tokens `--spacing-{xs..3xl}` sombreiam `max-w-*` do Tailwind v4

No Tailwind v4, `max-w-xl` resolve do namespace `--spacing-*` com prioridade sobre `--container-*`. A Fase 4 definiu `--spacing-xs..3xl` (4-64px) no `@theme` de `globals.css` (linhas 121-128), então **todo `max-w-xs/sm/md/lg/xl/2xl/3xl` do app inteiro virou 4-64px** em vez de 20-48rem. Verificado empiricamente compilando com o tailwindcss 4.1.17 do projeto: `.max-w-xl { max-width: var(--spacing-xl); }` = 32px.

**Blast radius (14 usos, incluindo páginas protegidas por FUNC-03):**

| Arquivo | Classe | Efeito real |
|---|---|---|
| `src/components/LandingFooter.tsx:47,161` | `max-w-xl` | 32px → colapso do footer (uma palavra por linha, input minúsculo) |
| `src/app/[locale]/checkout/success/page.tsx:44` | `max-w-3xl` | 64px — **página de confirmação de pedido (FUNC-03!)** |
| `src/components/LegalPageLayout.tsx:26` | `max-w-3xl` | 64px — privacy/terms/shipping/returns |
| `src/components/AgeVerificationModal.tsx:32` | `max-w-md` | 16px — modal de idade |
| `src/app/admin/login/LoginForm.tsx:47` | `max-w-sm` | 8px — login admin |
| `src/app/admin/account/page.tsx:12`, `wishlist:51`, `orders:48`, `affiliates/login:30`, `affiliates/join:34` (`max-w-xl`), `AffiliateJoinForm:106`, `products:59` (`max-w-2xl`), `Footer.tsx:143` (`max-w-xl`) | vários | todos colapsados |

**Esta regressão existe desde a Fase 4** (quando os tokens entraram) — a verificação da Fase 4 checou build/tokens mas não abriu essas páginas. O footer novo só a expôs.

**Direção de fix (root-cause, não paliativo):** renomear os 7 tokens colidentes no `@theme` (ex.: `--spacing-gap-xs`... ou aliases sem colisão) e atualizar os usos `p-xl/gap-lg/etc.` das seções novas; NÃO trocar os `max-w-*` legítimos um a um.

### RC-2: Trust bar translúcida sobre fundo claro

`LandingHeader` usa `bg-[rgba(45,26,105,0.4)]` (conforme spec), mas a trust bar é irmã ANTERIOR do `<header>` escuro, e o `<main>` em `page.tsx:18` ainda tem `bg-brand-cream` (#f3e9e3). 40% de roxo sobre creme = lavanda claro (~rgb(164,150,178)) com texto #ae9bda ilegível. No Figma a barra translúcida está sobre página roxa escura.

**Direção de fix:** dar backdrop escuro opaco à trust bar (envolvê-la num container `bg-dips-purple-deepest` junto com o header, ou usar a cor pré-composta opaca). Avaliar também trocar o `bg-brand-cream` do `<main>` — a home redesenhada é toda dark.

### RC-3: Hero construído como coluna única centralizada (errado em qualquer largura)

`Hero.tsx:65`: `flex flex-col items-center text-center` sem NENHUMA variante de breakpoint. A imagem do produto (`hero-product.png`, 822×548) é o ÚLTIMO filho, abaixo de todo o texto. Figma 1440px: composição duas colunas — texto à esquerda (alinhado à esquerda), produto à direita. Blobs têm `overflow-hidden` no section (não vazam), mas tamanho/posição não batem com o Figma (Figma: blob menor no canto sup. esquerdo + blob atrás do produto).

### RC-4 (pré-existente, desde 2026-05-28): mojibake + BOM em `messages/en.json`

Entrou no commit `c0d8b25` (maio), muito antes da Fase 5 — o redesign só tornou visível. Arquivo tem BOM UTF-8 (es/pt não têm). 4 valores corrompidos (double-encoding cp1252):

| Key | Corrompido | Correto |
|---|---|---|
| `Ingredients.cocoa_desc` | `cocoa â€“ the` | `cocoa – the` (en dash) — **visível na home nova** |
| `Ingredients.theanine_desc` | `â€œGood moodâ€` + U+009D invisível | `“Good mood”` — **visível na home nova** |
| `ShippingPolicy.shippingOptionsDesc1` | `2â€“5 day` | `2–5 day` |
| `ReturnPolicy.initiatingDesc` | `backâ€”returns` | `back—returns` |

es.json e pt.json estão limpos. **Fix:** corrigir os 4 valores (atenção ao U+009D invisível no theanine_desc) e regravar en.json como UTF-8 sem BOM.

---

## Gaps por seção (esperado = Figma/UI-SPEC · observado = screenshots · evidência = código)

### GAP-01 · Trust bar — fundo claro/ilegível — **ALTA** → RC-2
Copy dos 6 itens difere do Figma, mas isso foi **decisão travada** (nossos 6 itens aprovados) — não é bug.

### GAP-02 · Hero — sem composição em duas colunas — **ALTA** → RC-3
- Texto centralizado full-width; produto abaixo em vez de ao lado. Errado em qualquer breakpoint.
- H1 centralizado vs Figma alinhado à esquerda (consequência do layout).

### GAP-03 · Hero — subtítulo com copy antiga — **MÉDIA**
Renderiza `Hero.subtitle` = "Pleasure in its purest form." (copy antiga). Figma: **"A Chocolate crafted for connection."** A UI-SPEC não travou a string do subtítulo (lacuna da spec). Trocar valor em en/es/pt.

### GAP-04 · Hero — mini trust items sem losango e copy diferente — **BAIXA**
Ours: texto puro "100% Natural Ingredients / Made in the USA / Secure Checkout". Figma: losango laranja + "100% Natural · Satisfaction Guaranteed · 100% Discreet Shipping" (corrigindo o typo "Gauranteed" do Figma, FUNC-04).

### GAP-05 · Hero — feature cards: formato e arranjo — **MÉDIA**
- Implementado `grid sm:grid-cols-2 lg:grid-cols-4` — em 1440px vira 1 linha de 4 (ok); no teste a 985px mostrou 2x2 (efeito viewport).
- Formato do card difere: Figma tem losango laranja + TÍTULO curto + descrição ("Natural Aphrodisiac / Botanically sourced…"). Nosso card usa frases longas do `Product.feature1..4` (decisão travada de reuso de copy — **rediscutir**: o reuso literal não bate com o formato título+descrição do Figma).

### GAP-06 · Hero — blobs decorativos — **MÉDIA** (verificar a 1440px)
420px/380px em offsets fixos; composição não bate com o Figma. Não vazam (overflow-hidden ok).

### GAP-07 · Story — split lg: implementado; conferir a 1440px — **VERIFICAR**
`grid lg:grid-cols-[0.9fr_1.1fr]` existe (StorySection.tsx:14). Aparência empilhada nos prints = viewport 985px. Pontos reais vs Figma:
- Falta badge pill "10,000+ Happy Couples" no topo da foto e o subtítulo itálico "A Chocolate crafted for connection." sob o heading (Figma tem; nosso overlay tem só heading embaixo + 3 badges).

### GAP-08 · Ingredients — split lg: implementado; conferir a 1440px — **VERIFICAR**
`grid grid-cols-1 lg:grid-cols-2` existe (IngredientsSection.tsx:80).

### GAP-09 · Ingredients — heading errado — **ALTA (copy da spec)**
Renderiza `Ingredients.sectionTitle` = **"The Art of Temptation"** (key antiga — deviation documentada do executor 05-03 para não hardcodear inglês). Spec/Figma exige: eyebrow itálico **"The ingredients"** (20px) + **"Behind the experience."** (48px). Fix: criar keys novas com a copy do Figma traduzida nos 3 locales.

### GAP-10 · Ingredients — formato dos cards — **MÉDIA**
Figma: 6 linhas compactas horizontais (ícone + nome + badge na mesma linha, coluna única). Ours: tiles maiores em `sm:grid-cols-2`. Rediscutir fidelidade.

### GAP-11 · Ingredients — mojibake visível — **ALTA** → RC-4
`cocoa_desc` ("â€“") na card expandida; `theanine_desc` também corrompida.

### GAP-12 · Ingredients — intro incompleta — **BAIXA**
Figma acrescenta "Six botanicals, one unforgettable experience." — nossa `Ingredients.subtitle` só tem a 1ª frase.

### GAP-13 · Bundle — split lg: implementado; conferir a 1440px — **VERIFICAR**
`grid lg:grid-cols-[1.2fr_1fr]` existe (BuySection.tsx:28). Preços reais (não os do Figma) = **correto por contrato** (FUNC-01).

### GAP-14 · Bundle — header extra no painel creme — **BAIXA (decisão)**
"THE DIPS EXPERIENCE / Choose your quantity…" não existe no painel do Figma (só cards+resumo+CTA). Manter ou remover?

### GAP-15 · Bundle — ícones sociais sob o Buy Now — **BAIXA (decisão)**
IG/TikTok sob o botão; não existem no Figma.

### GAP-16 · Reviews — eyebrow extra + heading + subtítulo — **MÉDIA**
- Eyebrow "REAL PEOPLE. REAL RESULTS." não existe no Figma **e está hardcoded em inglês no JSX** (ReviewsSection.tsx:131-136, sem i18n — viola invariante en/es/pt). Heading "What people are saying" também hardcoded.
- Figma tem subtítulo-parágrafo sob o heading ("We care about what we put in our products…"); nós não temos.
- Cards com avatar-inicial/sem role/flag/data = **decisão travada** (dados reais, não placeholder) — ok, confirmar amanhã.

### GAP-17 · FAQ — heading e prefixos — **MÉDIA (decisão)**
- `FAQ.title` = "Frequently Asked Questions (F.A.Q.s)"; Figma = "FAQs" (+ subtítulo). Spec deixou em aberto ("either acceptable") — decidir.
- `q1..q6` embutem prefixos literais "Q1:"…"Q6:" nos valores (nos 3 locales); Figma não tem prefixo. Conteúdo é travado, prefixo é formatação — decidir se remove.
- Borda laranja/chevron do item aberto: não verificado nos prints (todos fechados). Testar.

### GAP-18 · Footer — colapso total do layout — **CRÍTICA** → RC-1
`max-w-xl` (=32px) em LandingFooter.tsx:47 (bloco newsletter) e :161 (bloco legal/endereço). Explica exatamente: subtítulo uma-palavra-por-linha, input 46px² minúsculo (w-[362px] esmagado por flex dentro de container de 32px), copyright e endereço colapsados. Grid de links (`max-w-5xl`, sem colisão) renderizou normal — consistente.

### GAP-19 · Footer — estrutura vs Figma — **MÉDIA**
Implementado: tudo empilhado e centralizado (logo → newsletter → grid 3 colunas → legal). Figma: logo+endereço à esquerda com 3 colunas de links à direita na mesma faixa; newsletter em outra zona. Restruturar após RC-1.

### GAP-20 · Footer — "© 2025 – Dips Chocolate" hardcoded — **BAIXA**
JSX tem `© 2025 –` literal; Figma mostra © 2026. Usar ano dinâmico + revisar copy.

**Conteúdo do footer (links reais, email `info@dipschocolate.com`, endereço real, Affiliates presente) = conforme spec travada — não é bug.**

---

## Itens que NÃO são bugs (decisões travadas, confirmar amanhã se mantêm)

1. Preços reais do Stripe (não os $59.99/$89.99 do Figma) — FUNC-01, invariante do milestone.
2. Copy da trust bar (nossos 6 itens aprovados ≠ 6 do Figma).
3. Reviews com dados reais (12 reviews de `src/data/reviews.ts`, sem foto/role/flag/data) vs placeholders do Figma.
4. Links/email/endereço reais no footer (Figma tem links inexistentes e email errado).
5. Conteúdo Q&A do FAQ mantido verbatim.

## Pendências de verificação (não testadas ainda)

- Splits de Story/Ingredients/Bundle e feature cards 1x4 em janela **1440px real**.
- Âncoras do header (scroll suave + offset de 72px sob o header sticky).
- Click-through do checkout Stripe (FUNC-01) — checkpoint do 05-05 continua aberto.
- Página compartilhada (ex. `/en/product/dips-chocolate`) intacta — diff de `Header.tsx`/`Footer.tsx`/`BuyNowButton.tsx` já confirmado zero via git, falta olho humano.

## Addendum 2026-07-17 — Figma agora tem versão MOBILE

O designer adicionou o frame **"Dips Chocolate Website // Mobile Responsive" (281:21, 375×9587px)** — extração parcial em `FIGMA-MOBILE-EXTRACTION.md` (5 de 7 seções capturadas; FAQs/Footer pendentes por rate limit). Consequências:

- **RESP-01 muda de premissa** — mobile agora é "fiel ao Figma", não mais "decisão própria". O hambúrguer do header mobile já tem design.
- **Vários gaps saíram de "a discutir" para "confirmados pelo Figma":** GAP-03 (subtítulo hero = "A Chocolate crafted for connection."), GAP-04 (mini trust com losangos), GAP-05 (feature cards têm copy própria do Figma — título curto + descrição, NÃO o `Product.feature1..4` atual; a decisão de reuso verbatim precisa ser revertida), GAP-09 ("The ingredients / Behind the experience."), GAP-10 (cards compactos horizontais), GAP-12 (intro completa), GAP-16 (Reviews com subtítulo-parágrafo, sem eyebrow).
- **GAP-14 esclarecido:** "THE DIPS EXPERIENCE" existe no Figma como badge sobre a foto do bundle (não como header do painel creme).

## Proposta de ordem de ataque (para discutir)

1. **RC-1** (rename dos tokens colidentes) — destrava GAP-18 e conserta regressão FUNC-03 em 12+ telas.
2. **RC-4** (mojibake + BOM) — 4 strings, risco zero.
3. **RC-2** (trust bar backdrop) + **RC-3/GAP-02** (hero duas colunas) — os dois maiores gaps visuais reais.
4. Copy pack: GAP-03/09/12/16/17 (novas keys i18n ×3 locales numa passada só).
5. Re-walkthrough a 1440px → decidir GAP-05/06/07/08/10/13/14/15/19/20.

---

## Addendum 2026-07-17 (madrugada) — Correções aplicadas autonomamente

Enquanto o usuário estava fora, todo item **objetivamente confirmado** (bug de código ou confirmado pelo Figma mobile) foi corrigido diretamente no worktree do 05-05 (`C:/dev/dips/lp-dips/.claude/worktrees/agent-a647a13d3da177a22`, branch `worktree-agent-a647a13d3da177a22`) — **ainda não mesclado** em `feature/layout-updates`. `npm run build` (exit 0) e `npm test` (71/71) passam após cada mudança; `git diff` contra a base do plano confirma `Header.tsx`/`Footer.tsx`/`BuyNowButton.tsx` com zero diff (FUNC-03 intacto).

| Item | Commit (worktree) | O que mudou |
|---|---|---|
| RC-1 | `a314008` | `--spacing-{xs..3xl}` movidos para fora do `@theme` (viravam `:root` puro) — `max-w-*` volta ao padrão do Tailwind em todo o app |
| RC-4 | `a314008` | 4 strings mojibake + BOM corrigidos em `messages/en.json` |
| RC-2 | `3d3e018` | Trust bar ganhou backdrop opaco `bg-dips-purple-deepest` |
| RC-3 | `1a79a74` | Hero reconstruído como grid 2 colunas em `lg+` (produto à direita, texto à esquerda) |
| GAP-14 | `1390064` | Removido header extra do painel creme; eyebrow "THE DIPS EXPERIENCE" movido pro lado da foto |
| GAP-07 | `1390064` | Adicionado badge "10,000+ Happy Couples" + subtítulo faltando no overlay da Story |
| GAP-03 | `fd4641b` | `Hero.subtitle` → "A Chocolate crafted for connection." (en/es/pt) |
| GAP-05 | `fd4641b` | Feature cards ganharam copy própria (`Hero.feature1..4_title/_desc`) em vez de reusar `Product.feature1..4_*`; formato losango+título+descrição |
| GAP-09 | `0361a9f` | Ingredients: eyebrow "The ingredients" + heading "Behind the experience." (era "The Art of Temptation") |
| GAP-12 | `0361a9f` | Intro da Ingredients completada com "Six botanicals, one unforgettable experience." |
| GAP-16 | `0c5e3a1` | Reviews virou i18n (`Reviews.title`/`Reviews.subtitle`); removido eyebrow hardcoded em inglês que não existe no Figma |
| GAP-20 | `28f3a1f` | Ano do copyright do footer: hardcoded "2025" → `new Date().getFullYear()` |

**Deliberadamente NÃO tocado (decisão sua):** GAP-04 (mini trust items com losango — cosmético, baixo risco mas é decisão de estilo), GAP-06 (blobs — tamanho/posição, gosto), GAP-08/GAP-13 (splits de Ingredients/Bundle — provavelmente OK a 1440px real, só viewport estreito no teste), GAP-10 (formato dos cards de ingrediente — mudança estrutural maior), GAP-15 (ícones sociais no bundle), GAP-17 (heading/prefixos do FAQ — spec já dizia "either acceptable"), GAP-19 (reestruturação do footer em 4 colunas — mudança estrutural maior, sem screenshot do footer mobile ainda), RESP-01/RESP-02 (escopo da Fase 6).

Detalhes completos de cada commit em `.planning/phases/05-landing-page-sections/05-05-SUMMARY.md` (seção "Addendum 2026-07-17").

## Addendum 2026-07-20 — 2ª leva (itens de fidelidade restantes, aprovados pelo usuário)

O usuário confirmou o **princípio-guia: o Figma é a fonte da verdade visual; implementar fielmente sem perguntar sobre fidelidade** (só os overrides funcionais documentados — preços/reviews/links/copy do FAQ reais — sobrepõem o Figma). Sob esse princípio, os gaps que estavam "a discutir" foram resolvidos em direção ao Figma:

| Item | Commit (worktree) | O que mudou |
|---|---|---|
| GAP-15 | `930823d` | Removidos os ícones sociais (Instagram/TikTok) do painel do bundle — não existem no Figma |
| GAP-17 | `fba6155` | Título FAQ → "FAQs" (en) / "Preguntas Frecuentes" / "Perguntas Frequentes"; removidos prefixos "Q1:".."Q6:" do en |
| GAP-04 | `be4d30e` | Mini trust items do Hero com copy do Figma ("100% Natural / Satisfaction Guaranteed / 100% Discreet Shipping") + losango laranja |
| GAP-10 | `f369205` | Cards de ingrediente → lista de coluna única, linhas compactas (ícone \| nome \| badge na mesma linha); badge virou pill outline com losango |
| GAP-19 | `fd4f758` | Footer reestruturado no layout 2-zonas do Figma (marca+endereço+newsletter à esquerda, colunas de links à direita, faixa legal full-width) |

**Ainda decisão sua / fora de escopo da Fase 5:** RESP-01/RESP-02 (responsivo — Fase 6, agora que o Figma tem mobile), e a captura de FAQs/Footer mobile (quota).

## Addendum 2026-07-20 (2ª rodada) — 5 diferenças do walkthrough a 1440px real

O usuário rodou o walkthrough de verdade (janela maximizada) e achou mais 5 diferenças pontuais, todas resolvidas com CSS exato tirado do Figma:

| # | Item | Causa raiz | Commit |
|---|---|---|---|
| GAP-22 | Trust bar não distribuída na largura toda | Era `justify-center` + gap fixo; Figma é `justify-content:space-between` na largura cheia (1390px, padding 25px) | `adeacf1` |
| GAP-23 | Linha visível entre o header e o gradiente do Hero | O nav "Frame 4" no Figma **não tem fill nenhum** — flutua transparente sobre o gradiente. Removido o `bg-dips-purple-deepest` do `<header>` | `adeacf1` |
| GAP-24 | Logo deformada | `logo-purple-part.svg` e `logo-orange-part.svg` são `preserveAspectRatio="none"` e cada um cobre uma **sub-região própria** da caixa 59×36 (não a caixa inteira). O `fill+object-contain` forçava as duas a esticar pra caixa toda, distorcendo a camada laranja (proporção nativa ~21×34, retrato). Corrigido com o tamanho/posição exatos de cada camada (extraídos do próprio dump grande que o usuário já tinha colado) | `adeacf1` |
| GAP-06 (refinamento) | Blob inferior-direito ainda errado após a 1ª correção | A 1ª correção usou **pixels fixos** calculados sobre a tela de referência 1440px do Figma, mas nossa seção é fluida (não trava em 1440px) — qualquer diferença de largura desloca o blob grande (maior, mais perto da borda) proporcionalmente mais que o pequeno. Trocado para **porcentagem** direta (a mesma unidade que o Figma exporta), que escala certo em qualquer largura | `70c6f1f` |
| GAP-25 | H1 em 3 linhas em vez de 2 | Achado no dump: no Figma, "The Chocolate" e "that changes the night." são **duas camadas de texto separadas** — quebra de linha manual do designer, não wrap automático por largura. Corrigido com 2 mudanças: (1) layout do Hero trocado de grid 50/50 pra imagem em overlay absoluto + coluna de texto com ~54% de largura; (2) `<br></br>` forçado depois de "Chocolate" no `Hero.h1` (só en; es/pt sem o marcador, mantêm wrap natural) | `70c6f1f` |

Build + 71 testes verdes depois de cada commit.

## Addendum 2026-07-20 (3ª rodada) — 2 dos 5 acima não fecharam de primeira

Re-teste do usuário mostrou: trust bar (GAP-22) e logo (GAP-24) corretos. Header ("pérola"), blob e H1 continuavam errados — com causas mais profundas do que a 1ª tentativa resolveu.

| # | Item | Causa raiz real | Commit |
|---|---|---|---|
| GAP-27 | Header virou uma faixa clara ("pérola") entre duas faixas escuras | O nav do Figma não tem fill porque, no design, ele é parte do MESMO frame do Hero, desenhado sobre o gradiente. No nosso código, `LandingHeader` é renderizado **antes** da seção Hero no DOM — não sobreposto ao gradiente dela. "Transparente de verdade" mostrava o fundo cru da página (`bg-brand-cream`) atrás. Corrigido dando ao header (e à trust bar) a cor exata do início do gradiente do Hero (`#18012d`, `--color-dips-purple-hero-start`) em vez de transparente — mesma cor no ponto de encontro = sem costura, e continua opaco/legível ao rolar pra seções mais abaixo | `0bdd59f` |
| GAP-26 | Blob inferior-direito ainda com "quina" exposta | O Figma usa `bottom:-11.01%` pra vazar o blob pra fora de um frame **fixo de 1054px** e cortar exatamente nesse ponto via overflow-hidden. Nossa seção Hero é fluida e bem mais alta que 1054px (H1+subtítulo+badges+CTA+cards), então ancorar pela borda inferior corta o blob num ponto totalmente diferente, expondo uma fatia errada da silhueta. Corrigido ancorando os dois blobs pelo **topo** (referência estável, não muda com a altura da seção), com tamanho fixo em pixels nativos, sem depender de corte | `e579ab1` |
| GAP-25 (refinamento) | H1 ainda em 3 linhas mesmo com o `<br/>` forçado | O `<br/>` corrigiu a linha 1 ("The Chocolate" isolado), mas "that changes the night." ainda quebrava em 2 porque a coluna de texto (54%) continuava estreita demais — essa frase sozinha, em 64px AllRoundGothic Bold, precisa de uns 750-850px pra caber numa linha. Troquei o split por porcentagem por uma largura fixa `max-w-[1040px]` (perto do próprio box de 1062px do Figma) e estreitei a imagem (34%/480px) | `e579ab1` |

Build + 71 testes verdes depois de cada commit.

## Addendum 2026-07-20 (4ª rodada) — blob (causa real!) + respiro do topo + imagem pequena

O usuário mandou um print anotado com um traço azul mostrando **exatamente** qual parte do blob deveria aparecer (o corpo arredondado) e qual não (a cauda pontiaguda) — isso resolveu de vez a investigação do blob.

| # | Item | Causa raiz real | Commit |
|---|---|---|---|
| GAP-26 (3ª tentativa, resolvida) | Blob ainda com "quina"/cauda visível | O frame do Hero no Figma é uma caixa **fixa de 1054px** que corta o blob (rotacionado) via overflow-hidden num ponto exato — a caixa local do blob fica em top:659/altura:511, então só os primeiros 395px (1054-659) dela ficam dentro do frame; o resto é cortado. Nossa seção é fluida e bem mais alta que 1054px, então o overflow-hidden da seção nunca chega a cortar essa cauda — a forma inteira aparece, incluindo a parte que o Figma sempre esconde. Corrigido dando ao blob sua **própria janela de corte fixa** (341×395px, com overflow-hidden), independente da altura real da página abaixo dela, com a imagem rotacionada 341×511 dentro na mesma posição relativa que tem no Figma | `bf9cbbd` |
| GAP-28 (novo) | Falta "respiro" no topo da seção + imagem da caixa pequena demais | No Figma, a imagem do produto começa em y:200 enquanto o título começa em y:384 (medido do topo do frame) — um vão de 184px onde só aparecem o blob + o início da imagem antes de qualquer texto. Minha tentativa de centralizar verticalmente a imagem contra o texto eliminou esse vão. Além disso, eu tinha encolhido a imagem pra 34%/480px enquanto ainda perseguia o bug do H1 quebrando em 3 linhas — bem menor que o tamanho real do Figma (57%/822px). Corrigido: imagem ancorada perto do topo (`top-[60px]`, `52%/780px`, bem mais perto do tamanho real) em vez de centralizada, e a coluna de texto ganhou `mt-[180px]` pra reproduzir o vão | `bf9cbbd` |

Build + 71 testes verdes.

**Pendente:** o usuário também apontou diferença nos 4 feature-cards, mas o CSS que ele colou (2x) foi só o wrapper "Hero Section" repetido, não o card específico — os valores exatos dos cards (301/311px, `rgba(49,34,89,.25)`, borda 2px `#392A61`, radius 15px, Satoshi 18px) já foram implementados a partir do dump grande anterior. Aguardando confirmação/novo print após esta rodada, ou o CSS de um card individual se a diferença persistir.

## Addendum 2026-07-20 (fim) — GAP-06 FECHADO via extração manual do Dev Mode

**Descoberta metodológica:** não dependemos de MCP. O usuário puxou o Hero inteiro do Figma "Dev Ready" com **botão direito → Copy as CSS** e colou aqui — isso dá exatamente o que o `get_design_context` daria (medidas, cores, espaçamentos), a custo zero de quota. Fica como o caminho padrão pra especificações exatas.

**GAP-06 (blobs) — RESOLVIDO exato** (commit `e436b0a`):
- Os 2 SVGs estavam com nome trocado vs. posição: `blob-vector-2.svg` = vetor pequeno 193×308 (sup-esq, `left:-54 top:121 rotate(-167.8deg)`); `blob-vector-1.svg` = vetor grande 341×511 (inf-dir, `right:65 bottom:-116 rotate(53.34deg)`). SVGs são `preserveAspectRatio="none"` e não-rotacionados → box dimensionado ao vetor do Figma + rotação aplicada no CSS. Removido o dimming `opacity-70` (Figma não tem).

**Bônus do mesmo dump** (mesmo commit): feature cards do Hero corrigidos de 14-15px → **18px** (Satoshi/font-card; título 700 branco, desc 400 #EBD9FE), losango 8px, borda 2px; botão "How It Works?" ganhou fill `dips-card-tint`. Confirmado já-correto pelo dump: gradiente do hero, bg/borda/raio dos cards, subtítulo, e a laranja normalizada #f27521 (DSGN-03) vs. a #FB6C04 do Figma.

### GAP-21 — H1 "Chocolate" lilás — RESOLVIDO (sem mudança de código)
O CSS do Dev Mode mostrava o H1 todo branco (#FFFFFF), mas o usuário confirmou **visualmente no Figma (Dev Ready, desktop E mobile): "Chocolate" continua lilás** (#cfa9f6). O dump de "Copy as CSS" foi pego no nó de texto **pai** e **achatou a cor do sub-range** (o lilás aplicado só na palavra "Chocolate" se perdeu). Nossa implementação já usa lilás → **nada a mudar**.
**Lição:** pra estilo por-palavra/sub-range, confiar no print/olho, não no Copy-as-CSS do nó pai (que reporta uma cor única).

## Addendum 2026-07-20 (5ª rodada) — causa raiz do offset: frame do Figma inclui o nav

O usuário reportou 4 problemas no novo print: imagem da caixa demorando pra aparecer, blob superior-esquerdo longe da navbar, cards + blob inferior-direito "ainda incorretos", fonte dos cards parecendo maior que deveria.

| # | Item | Causa raiz real | Commit |
|---|---|---|---|
| GAP-29 | Blob superior-esquerdo longe da navbar; blob inferior-direito na posição errada | Todas as coordenadas Y tiradas do dump do Figma (blob pequeno top:121, blob grande top:659, imagem top:200, H1 top:384) são medidas a partir do topo do frame **completo de 1054px**, que no Figma inclui o nav (72px) + trust bar (45px) = 117px desenhados por cima do próprio gradiente. Nosso `LandingHeader` é um componente separado, renderizado **antes** da seção Hero — o topo da nossa seção já corresponde a frame-y:117, não frame-y:0. Cada offset usado direto do dump ficava 117px mais baixo (e proporcionalmente mais longe do nav) do que deveria. Corrigido subtraindo 117px de cada um: blob pequeno 121→4px, blob grande (janela de corte) 659→542px, imagem 200→83px, coluna de texto ajustada pra 187px de margem (mantendo o alvo de 267px pro H1) | `39774b7` |
| GAP-28 (refinamento) | Imagem da caixa não aparecia "logo no início ao lado do H1" | Não era só posição — o `delay` da animação de fade-in da imagem era 0.85s contra 0.15s do H1 (e outros elementos de texto ainda mais cedo). Na prática a imagem ficava invisível por ~1.65s depois do H1 já estar totalmente visível, lendo como "a caixa nunca aparece". Reduzido pra 0.1s, aparecendo primeiro/junto com o texto | `39774b7` |
| Cards — fonte "maior" | Investigado, não é bug | Conferido: 18px/24px line-height batem exatamente com o dump do Figma (Satoshi 700/400 18px); bg `rgba(49,34,89,.25)`, borda 2px `#392a61`, radius 15px (`--radius-card: 0.9375rem`), padding 25px — todos os tokens em `globals.css` batem com o spec. A percepção de "maior" é o efeito esperado da substituição Satoshi→Plus Jakarta Sans (DSGN, decisão já aceita na Fase 4): métricas de fonte diferentes no mesmo tamanho declarado. Não há ajuste de tamanho a fazer sem contradizer o próprio spec extraído — nenhuma mudança de código | — |

Build + 71 testes verdes depois do commit.

## Addendum 2026-07-20 (6ª rodada) — CSS por-camada individual, geometria refeita do zero

Blob superior confirmado resolvido. Pedimos ao usuário CSS individual (não mais o wrapper "Hero Section" inteiro) de: blob inferior, imagem do produto, e um card — isso deu números exatos sem precisar inferir offsets aninhados.

| # | Item | Causa raiz real | Commit |
|---|---|---|---|
| GAP-29 (2º refinamento) | Blob inferior-direito ainda com artefato tipo "pipa"/seta | A janela de corte anterior (341×395) tinha o tamanho da caixa **não-rotacionada**. Rotacionar uma caixa 341×511 em 53.34° produz uma caixa delimitadora de **~614×579** — bem maior — e é ESSA silhueta rotacionada que o frame 1440×1054 do Figma corta, tanto embaixo **quanto à direita** (não só embaixo, como eu assumia). A janela antiga cortava nas linhas erradas. Recalculei os 4 cantos rotacionados a partir do CSS exato da camada (`left:71.81% right:4.49% top:62.52% bottom:-11.01%`, `rotate(53.34deg)`), cruzei com o retângulo de corte do frame, e reconstruí como uma janela externa (542×429px, encostada na borda direita) contendo uma div interna sem corte (614×579) com a imagem real centralizada e rotacionada dentro | `58ec330` |
| Imagem do produto — tamanho | Largura implementada em 52%/780px quando o CSS exato (`width:821.74px` num frame de 1440px) dá **57.06%/822px** — uma aproximação de "olho" de antes de ter o CSS da camada, visivelmente menor que o real | `58ec330` |
| Cards — estrutura (não só fonte) | O CSS exato do card ("Frame 8": 301×127px) mostra `flex-direction: row`, não coluna — o losango fica **ao lado** de um bloco título+descrição empilhado, não numa linha acima de uma descrição de largura total. Isso deixa o texto numa coluna mais estreita (~233px em vez de ~251px), quebrando mais linhas do que o layout em coluna assumia — e lia como "fonte grande demais". Reestruturado pra `flex-row items-center gap-[10px]`, com losango + `flex-col` (título+descrição) dentro | `58ec330` |

Build + 71 testes verdes.

**Metodologia confirmada:** CSS de camada individual (clique na camada específica → Copy as CSS) é muito mais confiável que o dump do frame pai inteiro — elimina a necessidade de inferir offsets aninhados manualmente, que foi a fonte dos erros anteriores.

## Addendum 2026-07-20 (7ª rodada) — dump da SEÇÃO INTEIRA (aninhamento preservado) corrige estrutura do card

O usuário mandou o Copy-as-CSS da **Hero Section inteira** com o aninhamento completo (pai→filho). Isso é o formato ideal — melhor que camadas isoladas, porque o aninhamento diz como os elementos se compõem. Revelou que a "correção" do card na 6ª rodada (`58ec330`) estava **errada na direção oposta**.

| # | Item | Verdade do aninhamento | Commit |
|---|---|---|---|
| GAP-29 (3º refinamento, cards) | Estrutura do card invertida | O card (`Frame 8`, 301×127, padding 25) tem **um único filho**: a pilha de texto (`Frame 5`, 251px). Dentro dela, a linha do título (`Frame 10`, flex-row gap:8px) = `[losango][título]` fica **acima** da descrição (251px, largura cheia, 2 linhas), gap 5px. Ou seja: losango ao lado **só do título**, descrição embaixo em largura cheia — não losango ao lado do bloco título+descrição inteiro (o que a 6ª rodada fez, enganada por um dump de camada isolada). Revertido pro layout em coluna com o losango aninhado na linha do título. Gap entre cards também ajustado pro 25px exato do Figma (era 24px) | `64e08e6` |

**Lição metodológica final:** o dump da **seção inteira com aninhamento** > camadas isoladas > dump do wrapper pai achatado. O aninhamento é o que desambigua a composição. Camadas com nome de texto (`The Chocolate`, `Natural Aphrodisiac`, `Shop Now`) se auto-identificam; só as decorativas genéricas (`Vector`, `Rectangle`, `Group`) precisam de um rótulo entre parênteses.

**Observação (fora do escopo dos 4 pontos atuais):** o dump mostra a navbar (`Frame 4`, 1360×72, `left:40 top:67 border-radius:20px`) como uma **barra flutuante arredondada, recuada 40px das bordas**, começando 22px abaixo da trust bar — a nossa é full-width, encostada, sem raio. Não faz parte das queixas atuais e o usuário não reclamou do header; anotado pra eventual ajuste de fidelidade.

**Próximo passo:** novo walkthrough a **1440px real** (`localhost:3001`) + Stripe click-through para fechar o checkpoint do 05-05 → merge → completar a fase. E me diz o veredito do GAP-21.
