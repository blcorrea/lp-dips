# GAP-40 — Seção 7 (Footer) — Plano de execução

> Análise no Fable (Copy-as-CSS da seção + print do Figma). Execução: Sonnet.
> Worktree: `C:/dev/dips/lp-dips/.claude/worktrees/agent-a647a13d3da177a22`.
> Arquivos: `src/components/LandingFooter.tsx` + `messages/*.json`.
> Processo padrão: editar → parar dev server → build + 71 testes → commit atômico → restart → addendum no 05-VISUAL-GAPS.md (main repo, `cd` antes).

## Contexto do Figma

Frame 1440×490, bg `#0A0519` (= `dips-purple-deepest` ✓ já usado), **padding 50px**. Linha principal `justify-between`: coluna ESQUERDA (569px, `justify-between` vertical: logo+endereço no topo, bloco de newsletter embaixo) e zona DIREITA (713px, coluna gap 50: linha com 3 colunas de links [Orders / Quick Links / Customer Care] + segunda linha com o bloco "Contact Us" alinhado à direita, sob o Customer Care). Faixa legal embaixo (2 linhas, itálico, sem divisor).

## Overrides funcionais (NÃO copiar do Figma) — links/email/endereço reais vencem

| Figma (placeholder) | Real (manter/usar) |
|---|---|
| `help@dips.co` | `info@dipschocolate.com` (só restilizar: itálico, sublinhado, laranja) |
| "Dips Labs LLC \| 18117 Biscayne Blvd #3022 \| Miami, FL 33160" | "Dips Wellness Corporation \| 8211 NW 64th Street Unit 4 \| Miami, FL 33166" (mesmo formato de pipes do Figma, dados reais) |
| "© 2026 - Dips Labs LLC" | `© {new Date().getFullYear()} – Dips Chocolate.` + rightsReserved (como hoje) |
| "Track Order" (sem página no Figma) | **é real**: linkar pra `/{locale}/orders` (página de consulta de pedidos existe) |
| "Wholesale", "Accessibility" (páginas inexistentes) | **omitir** (sem destino real — não inventar página) |
| "Email Us" | `mailto:info@dipschocolate.com` |

## Mudanças — `LandingFooter.tsx`

1. **Container:** `p-[50px]` (Figma; hoje pt-16 pb-10 + container px-6 — trocar por `mx-auto max-w-[1440px] p-6 lg:p-[50px]`), split `lg:grid-cols-[569fr_713fr]` (hoje `1fr_1.4fr`), coluna esquerda `flex flex-col justify-between` com `gap` generoso no mobile.
2. **Logo:** o footer usa hoje `footer-logo-purple/orange.svg` com `fill + object-contain` — **mesma classe de bug do GAP-24** (as duas camadas esticadas pra caixa toda). Corrigir replicando o fix do header escalado ×1.594 (94×58 vs 59×36), usando os MESMOS assets do header (`logo-purple-part.svg` / `logo-orange-part.svg`, ambos preserveAspectRatio=none): wrapper `relative h-[58px] w-[94px]`; purple `width=94 height=53` `absolute left-0 top-[5px]`; orange `width=34 height=54` `absolute left-[31px] top-0`.
3. **Endereço:** uma linha só, formato pipes (dados reais acima), `font-body text-[16px] italic text-[#706c7b]` (Figma Filson itálico 18→16; hoje é 2 linhas com nome em semibold não-itálico). Gap logo→endereço 25px.
4. **Newsletter** (bloco inferior da coluna esquerda, largura ~495px):
   - "Never Satisfied?" — `font-heading text-[25px] font-bold text-white` (28→25).
   - Subtítulo: **copy do Figma** (não é override): en `"Heighten your routine with updates and... ahem, surprises."` — atualizar a chave `letYourNights` (es: `"Eleva tu rutina con novedades y... ejem, sorpresas."` / pt: `"Eleve sua rotina com novidades e... ahem, surpresas."`), estilo `text-[16px] italic text-[#706c7b]`, gap título→subtítulo 2px.
   - Input: `h-[46px] rounded-full bg-[#1b1728] border border-[#322e3f] px-5 text-[13px] placeholder:text-[#74707f]` (largura ~362px/flex-1). Placeholder: mudar `yourEmail` de "Your Email..." → "Your email" (Figma) nas 3 línguas ("Tu correo" / "Seu e-mail").
   - Botão: `h-[46px] w-[123px] rounded-full bg-brand-orange font-heading text-[14px] font-bold text-white` (Sign Up, AllRoundGothic 16→14; Figma #F15A22 → brand-orange por DSGN-03). Comportamento client-only atual (submitted/successMsg) mantém.
5. **Colunas de links** (zona direita, linha 1, gap 50, justify-end, cada coluna ~198px):
   - Headings: `font-heading text-[20px] font-bold text-white` (Figma AllRoundGothic 22→20; hoje é uppercase 14px lavanda — errado). Title-case do Figma ("Orders", "Quick Links", "Customer Care"). Gap heading→lista 10px, lista `space-y-[5px]`.
   - Links: `font-body text-[16px] text-[#656170] hover:text-brand-orange` (18→16).
   - **Orders:** Track Order → `/{locale}/orders` (chave nova `trackOrder`), Shipping Info → `/shipping-policy`, Refunds and Returns → `/return-policy` (atualizar label `refunds` pra "Refunds and Returns" en, "Reembolsos y Devoluciones", "Reembolsos e Devoluções"), Email Us → `mailto:info@dipschocolate.com` (chave nova `emailUs`).
   - **Quick Links:** F.A.Q.s → `#faq` (label do Figma "F.A.Q.s", chave nova `faqs` — hoje hardcoded "FAQs"), Our Ingredients → `#ingredients` (atualizar `ingredients` → "Our Ingredients"/"Nuestros Ingredientes"/"Nossos Ingredientes"), Where to Buy → `/product/dips-chocolate`.
   - **Customer Care:** Terms and Conditions (atualizar label `terms` pra por extenso "Terms and Conditions"/"Términos y Condiciones"/"Termos e Condições"), Privacy Policy, Affiliates → `/affiliates/join`. **Sem** Wholesale/Accessibility (ver overrides).
6. **Contact Us** (linha 2 da zona direita, bloco ~198px alinhado à direita, sob o Customer Care): heading igual às colunas; único item = email real com estilo do Figma: `font-body text-[16px] italic underline text-brand-orange`. **Remover telefone e supportHours** (não existem no Figma — ver "Flags" abaixo). O `id="footer-contact"` + `scroll-mt` do nav âncora mora hoje no bloco Customer Care — **mover pro bloco Contact Us** (o nav "Contact" deve apontar pra cá).
7. **Faixa legal:** sem `border-t` (Figma não tem divisor), 2 linhas `font-body text-[13px] italic text-[#464253]` (14→13): linha 1 = `© {year} – Dips Chocolate. {rightsReserved}`; linha 2 = **disclaimer FDA novo** (chave `fdaDisclaimer`): en `"* These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease."` (+ traduções es/pt fiéis). **Remover** `madeWith`, `productDesigned`, `registeredIn`/`ageRestriction` da renderização (Figma não os tem — ver "Flags"; deixar as chaves no JSON, só não renderizar).

## i18n — resumo das chaves

Novas: `trackOrder`, `emailUs`, `faqs`, `fdaDisclaimer` (3 línguas). Atualizadas: `letYourNights` (copy nova do Figma), `yourEmail` ("Your email"), `refunds` ("Refunds and Returns"), `ingredients` ("Our Ingredients"), `terms` ("Terms and Conditions"). Intactas: `neverSatisfied`, `signUp`, `successMsg`, títulos das colunas, `rightsReserved`, `privacy`, `affiliates`, `whereToBuy`.

## Tratamento de fontes (padrão)

newsletter 28→25 · headings 22→20 · links/endereço/subtítulo/email 18→16 · placeholder 14→13 · Sign Up 16→14 · legal 14→13.

## Flags pro usuário (decisões Figma-vence que removem conteúdo real — avisar na resposta final, fácil reverter)

1. **Telefone (754-457-6844) e "Support: 24-48 hour response time" removidos** — não existem no Figma.
2. **Linhas legais extras removidas da renderização** (madeWith / productDesigned / registeredIn Florida / ageRestriction 18+) — o Figma só tem © + disclaimer FDA. A do **18+** é a mais sensível (compliance de produto adulto); se o usuário quiser, reintroduzir como 3ª linha no mesmo estilo.

## Verificações finais

- Âncora do nav "Contact" (`#footer-contact`) continua funcionando (agora no bloco Contact Us).
- Todos os links reais navegam (orders, políticas, affiliates, âncoras) — nenhum link morto de Wholesale/Accessibility.
- Logo do footer sem deformação (comparar com o do header).
- Addendum GAP-40 no 05-VISUAL-GAPS.md + commit docs no main. Avisar usuário das 2 flags.
