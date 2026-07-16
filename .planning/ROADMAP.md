# Roadmap: DIPS

## Milestones

- ✅ **v1.0 Affiliate Creatives** — Phases 1-3 (shipped 2026-06-18) — [archive](milestones/v1.0-ROADMAP.md)
- 🚧 **v1.1 Landing Page Redesign** — Phases 4-6 (in progress)

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3...): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order. Phase numbering is continuous across milestones (never restarts at 1).

<details>
<summary>✅ v1.0 Affiliate Creatives (Phases 1-3) — SHIPPED 2026-06-18</summary>

- [x] Phase 1: Foundation (1/1 plans) — completed 2026-06-17
- [x] Phase 2: Admin Creatives (2/2 plans) — completed 2026-06-17
- [x] Phase 3: Affiliate Gallery & i18n (1/1 plans) — completed 2026-06-18

Full phase details, goals, and success criteria: [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md)

</details>

### 🚧 v1.1 Landing Page Redesign (In Progress)

**Milestone Goal:** Implementar o novo layout do Figma na landing page (home) — visual novo, funcionalidades intactas (checkout Stripe, atribuição de afiliado, i18n en/es/pt).

- [x] **Phase 4: Design System Foundation** - Tokens do Figma no tema Tailwind, fontes licenciáveis, laranja de CTA normalizado (completed 2026-07-16)
- [ ] **Phase 5: Landing Page Sections** - As 8 seções da home redesenhadas, bundle selector plugado no checkout real, correções de copy do Figma
- [ ] **Phase 6: Responsive, i18n & Regression Verification** - Layout mobile/tablet, tradução en/es/pt, e confirmação de que nada fora do escopo quebrou

### 📋 v2.0 (Planned)

Deferred from v1.0 (see [milestones/v1.0-REQUIREMENTS.md](milestones/v1.0-REQUIREMENTS.md) → v2 Requirements):

- [ ] Analytics — download/usage tracking per creative and per affiliate (ANLY-01, ANLY-02)
- [ ] Organization — categories/tags/folders + drag-and-drop reordering (ORG-01, ORG-02)

Run `/gsd-new-milestone` to scope and plan the next milestone.

## Phase Details

### Phase 4: Design System Foundation

**Goal**: A landing page tem uma fundação visual consistente e reutilizável — tokens, fontes e laranja de CTA normalizados no tema Tailwind — pronta para as seções serem construídas em cima dela
**Depends on**: Phase 3
**Requirements**: DSGN-01, DSGN-02, DSGN-03
**Success Criteria** (what must be TRUE):

  1. O tema Tailwind expõe todos os tokens do Figma (cores, raios, espaçamentos) como tokens nomeados — nenhum hex do Figma fica repetido solto nos componentes das seções
  2. Títulos, corpo/italic e cards/CTAs renderizam com fontes Google Fonts licenciáveis escolhidas como substitutas de All Round Gothic Bold, Filson Pro e Satoshi/DM Sans
  3. Todo CTA da landing usa um único token de laranja normalizado, em vez dos três laranjas do Figma (#fb6c04/#ff6b01/#f15a22)

**Plans**: 3/3 plans complete

- [x] 04-01-PLAN.md — Figma tokens in @theme (32 dips colors, radius, spacing, 16 type roles, --font-card/--font-cta)
- [x] 04-02-PLAN.md — Google font wiring (Plus Jakarta Sans + DM Sans via next/font, applied to storefront layout)
- [x] 04-03-PLAN.md — Migrate 27 Figma assets into public/images/redesign/

**UI hint**: yes

### Phase 5: Landing Page Sections

**Goal**: A home renderiza as 8 seções redesenhadas do Figma (trust bar/header, hero, story, ingredients, bundle selector, reviews, FAQs, footer), com o bundle selector continuando a disparar o checkout Stripe real
**Depends on**: Phase 4
**Requirements**: SECT-01, SECT-02, SECT-03, SECT-04, SECT-05, SECT-06, SECT-07, SECT-08, FUNC-01, FUNC-04
**Success Criteria** (what must be TRUE):

  1. Ao visitar a home, todas as 8 seções aparecem na ordem do Figma (trust bar/header, hero, story, ingredients, bundle selector, reviews, FAQs, footer), fiéis ao layout desktop 1440px
  2. O bundle selector mostra as 3 opções (1x/2x/3x) com 2x pré-selecionado e badge "Most Popular"; clicar em "Buy Now" dispara o checkout Stripe existente com preços vindos do Shopify/Stripe (não hardcoded do design)
  3. A seção Reviews mostra os dados reais de reviews do site (não os placeholders do Figma) em masonry de 3 colunas sobre o fundo roxo #2d1a69
  4. O accordion de FAQs abre/fecha itens, e o item aberto mostra borda laranja e chevron rotacionado
  5. O copy corrigido aparece nas seções afetadas — "Guarantee" (não "Gaurantee"), "Ingredients" (não "Igredients"), "Aphrodisiac" (não "Aphrodiasiac") — e o link de contato no footer usa o email de suporte real (não "help@tabs.co")

**Plans**: 3/5 plans executed
**Wave 1**

- [x] 05-01-PLAN.md — LandingHeader (trust bar + nav) + LandingFooter + new i18n namespaces (SECT-01, SECT-08, FUNC-04)
- [x] 05-03-PLAN.md — Ingredients carousel→split + FAQ shadcn accordion reskins (SECT-04, SECT-07, FUNC-04)
- [x] 05-04-PLAN.md — Reviews #2d1a69 masonry + Bundle selector reskin (pricing locked) (SECT-05, SECT-06, FUNC-01)

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 05-02-PLAN.md — Hero full rebuild (absorbs feature cards) + StorySection split + i18n (SECT-02, SECT-03)

**Wave 3** *(blocked on Wave 2 completion)*

- [ ] 05-05-PLAN.md — Wire page.tsx (8 sections) + scroll-smooth + delete dead components + verify (all SECT, FUNC-01, FUNC-04)

**UI hint**: yes

### Phase 6: Responsive, i18n & Regression Verification

**Goal**: A landing redesenhada funciona em qualquer largura de tela e em qualquer idioma suportado, e nada fora do escopo do redesign quebrou
**Depends on**: Phase 5
**Requirements**: RESP-01, RESP-02, I18N-01, I18N-02, FUNC-02, FUNC-03
**Success Criteria** (what must be TRUE):

  1. Em ~390px (mobile), todas as seções se reorganizam num layout usável, sem scroll horizontal ou sobreposição de conteúdo
  2. Em larguras intermediárias (tablet), o layout se adapta fluidamente sem quebras entre o breakpoint mobile e o desktop
  3. Ao trocar o idioma do site para es ou pt, todo o copy novo da landing aparece traduzido, e nenhuma seção mostra overflow ou corte de texto por causa da expansão de ~30%
  4. Completar uma compra pelo bundle selector redesenhado com um ref code de afiliado presente ainda atribui o pedido/comissão a esse afiliado
  5. As páginas fora do escopo (admin, dashboard/join de afiliados, order confirmation) permanecem visual e funcionalmente inalteradas após o redesign

**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | 1/1 | Complete | 2026-06-17 |
| 2. Admin Creatives | v1.0 | 2/2 | Complete | 2026-06-17 |
| 3. Affiliate Gallery & i18n | v1.0 | 1/1 | Complete | 2026-06-18 |
| 4. Design System Foundation | v1.1 | 3/3 | Complete    | 2026-07-16 |
| 5. Landing Page Sections | v1.1 | 3/5 | In Progress|  |
| 6. Responsive, i18n & Regression Verification | v1.1 | 0/TBD | Not started | - |
