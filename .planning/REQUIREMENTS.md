# Requirements: DIPS — v1.1 Landing Page Redesign

**Defined:** 2026-07-16
**Core Value (milestone):** A landing page converte visitantes em compradores com o novo visual da marca — sem quebrar nada que já funciona.

## v1.1 Requirements

Requirements deste milestone. Cada um mapeia para fases do roadmap.

### Design System

- [ ] **DSGN-01**: Tokens do Figma (cores, raios, espaçamentos) centralizados no tema Tailwind — sem hexes soltos repetidos pelos componentes
- [x] **DSGN-02**: Fontes licenciáveis definidas e aplicadas para títulos, body/italic e cards/CTAs — All Round Gothic Bold e Filson Pro reutilizam os arquivos .otf já licenciados do site (visualmente idênticos ao Figma, mesma tipografia); Satoshi (sem licença existente) substituído por Plus Jakarta Sans via Google Fonts; DM Sans aplicado como no Figma. Decisão registrada em PROJECT.md e 04-VERIFICATION.md (override aceito 2026-07-16).
- [ ] **DSGN-03**: Laranja de CTA normalizado em um único token (Figma usa #fb6c04, #ff6b01 e #f15a22)

### Seções da Landing

- [ ] **SECT-01**: Trust bar + header novos (nav mínima Menu/Our Story/Order/Contact como âncoras, CTA "Shop Now")
- [x] **SECT-02**: Hero completo (H1 bicolor, subtítulo, badge social proof, 2 CTAs, imagem do produto, blobs decorativos, 4 feature cards)
- [x] **SECT-03**: Seção Story split (foto lifestyle + "Made to be Savoured by Two" / painel "Our Story")
- [x] **SECT-04**: Seção Ingredients split (6 cards com badges RITUAL/STAMINA/SPARK/PRESENCE/UNION/BALANCE, card cocoa expandido com "Origins & Curiosities")
- [ ] **SECT-05**: Bundle selector novo visual (3 cards 1x/2x/3x, 2x default com "Most Popular", resumo unit price/shipping, CTA com total) — plugado no fluxo de checkout existente
- [ ] **SECT-06**: Seção Reviews novo visual (bg #2d1a69, cards masonry 3 colunas) usando os dados reais existentes do site (não os placeholders do Figma)
- [x] **SECT-07**: FAQs accordion (item aberto com borda laranja, chevron)
- [ ] **SECT-08**: Footer novo (newsletter "Never Satisfied?", colunas com links reais do site — incluindo Affiliates —, contato e disclaimer FDA)

### Responsivo

- [ ] **RESP-01**: Layout mobile (~390px) adaptado do desktop com decisões próprias documentadas (Figma não tem versão mobile)
- [ ] **RESP-02**: Comportamento fluido em larguras intermediárias (tablet) sem quebras

### i18n

- [ ] **I18N-01**: Todo o copy novo traduzido em en/es/pt via messages/*.json
- [ ] **I18N-02**: Layouts acomodam expansão de texto ~30% sem overflow

### Preservação Funcional

- [ ] **FUNC-01**: Compra continua funcionando — bundle selector dispara o checkout Stripe existente com preços vindos do Shopify/Stripe (design NÃO é fonte de preço)
- [ ] **FUNC-02**: Atribuição de afiliado (ref code) intacta no fluxo de compra
- [ ] **FUNC-03**: Páginas fora do escopo intocadas: admin, afiliados (dashboard/join), order confirmation
- [x] **FUNC-04**: Correções sobre o Figma aplicadas — typos ("Gaurantee"→"Guarantee", "Igredients"→"Ingredients", "Aphrodiasiac"→"Aphrodisiac"), mailto real (não "help@tabs.co")

## v2 Requirements

Deferidos de milestones anteriores (backlog — não neste roadmap).

### Analytics (creatives)

- **ANLY-01**: Download/usage tracking por creative
- **ANLY-02**: Tracking por afiliado

### Organização (creatives)

- **ORG-01**: Categories/tags/folders
- **ORG-02**: Drag-and-drop reordering

## Out of Scope

Explicitamente excluído deste milestone. Documentado para prevenir scope creep.

| Feature | Reason |
|---------|--------|
| Mobile "fiel ao Figma" | Não existe versão mobile no arquivo; adaptação é por decisão própria (RESP-01) |
| Order Confirmation redesign | Tela do briefing não foi desenhada no Figma |
| Affiliate Sign-Up redesign | Tela do briefing não foi desenhada no Figma |
| Mudança de preços/descontos | Fonte é Shopify/Stripe; badges de desconto do Figma têm matemática inconsistente — aguardando confirmação da DIPS sobre copy |
| Qualquer mudança de funcionalidade | Invariante do milestone: layout muda, comportamento não |
| Analytics/organização de creatives | Backlog v2.0 (ver acima) |

## Traceability

Quais fases cobrem quais requirements. Atualizado na criação do roadmap.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DSGN-01 | Phase 4 | Pending |
| DSGN-02 | Phase 4 | Pending |
| DSGN-03 | Phase 4 | Pending |
| SECT-01 | Phase 5 | Pending |
| SECT-02 | Phase 5 | Complete |
| SECT-03 | Phase 5 | Complete |
| SECT-04 | Phase 5 | Complete |
| SECT-05 | Phase 5 | Pending |
| SECT-06 | Phase 5 | Pending |
| SECT-07 | Phase 5 | Complete |
| SECT-08 | Phase 5 | Pending |
| FUNC-01 | Phase 5 | Pending |
| FUNC-04 | Phase 5 | Complete |
| RESP-01 | Phase 6 | Pending |
| RESP-02 | Phase 6 | Pending |
| I18N-01 | Phase 6 | Pending |
| I18N-02 | Phase 6 | Pending |
| FUNC-02 | Phase 6 | Pending |
| FUNC-03 | Phase 6 | Pending |

**Coverage:**

- v1.1 requirements: 19 total <!-- corrected from initial "18 total" — the section lists DSGN-01..03 (3) + SECT-01..08 (8) + RESP-01..02 (2) + I18N-01..02 (2) + FUNC-01..04 (4) = 19 -->
- Mapped to phases: 19
- Unmapped: 0 ✓

---
*Requirements defined: 2026-07-16*
*Last updated: 2026-07-16 after roadmap creation (Phases 4-6)*
