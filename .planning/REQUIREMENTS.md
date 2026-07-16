# Requirements: DIPS — v1.1 Landing Page Redesign

**Defined:** 2026-07-16
**Core Value (milestone):** A landing page converte visitantes em compradores com o novo visual da marca — sem quebrar nada que já funciona.

## v1.1 Requirements

Requirements deste milestone. Cada um mapeia para fases do roadmap.

### Design System

- [ ] **DSGN-01**: Tokens do Figma (cores, raios, espaçamentos) centralizados no tema Tailwind — sem hexes soltos repetidos pelos componentes
- [ ] **DSGN-02**: Fontes substitutas licenciáveis (Google Fonts) definidas e aplicadas para All Round Gothic Bold (títulos), Filson Pro (body/italic) e Satoshi/DM Sans (cards/CTAs)
- [ ] **DSGN-03**: Laranja de CTA normalizado em um único token (Figma usa #fb6c04, #ff6b01 e #f15a22)

### Seções da Landing

- [ ] **SECT-01**: Trust bar + header novos (nav mínima Menu/Our Story/Order/Contact como âncoras, CTA "Shop Now")
- [ ] **SECT-02**: Hero completo (H1 bicolor, subtítulo, badge social proof, 2 CTAs, imagem do produto, blobs decorativos, 4 feature cards)
- [ ] **SECT-03**: Seção Story split (foto lifestyle + "Made to be Savoured by Two" / painel "Our Story")
- [ ] **SECT-04**: Seção Ingredients split (6 cards com badges RITUAL/STAMINA/SPARK/PRESENCE/UNION/BALANCE, card cocoa expandido com "Origins & Curiosities")
- [ ] **SECT-05**: Bundle selector novo visual (3 cards 1x/2x/3x, 2x default com "Most Popular", resumo unit price/shipping, CTA com total) — plugado no fluxo de checkout existente
- [ ] **SECT-06**: Seção Reviews novo visual (bg #2d1a69, cards masonry 3 colunas) usando os dados reais existentes do site (não os placeholders do Figma)
- [ ] **SECT-07**: FAQs accordion (item aberto com borda laranja, chevron)
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
- [ ] **FUNC-04**: Correções sobre o Figma aplicadas — typos ("Gaurantee"→"Guarantee", "Igredients"→"Ingredients", "Aphrodiasiac"→"Aphrodisiac"), mailto real (não "help@tabs.co")

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
| (preenchido pelo roadmap) | | |

**Coverage:**
- v1.1 requirements: 18 total
- Mapped to phases: 0
- Unmapped: 18 ⚠️

---
*Requirements defined: 2026-07-16*
*Last updated: 2026-07-16 after initial definition*
