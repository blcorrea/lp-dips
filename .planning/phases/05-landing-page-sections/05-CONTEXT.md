# Phase 5: Landing Page Sections - Context

**Gathered:** 2026-07-16
**Status:** Ready for planning
**Mode:** Autonomous (smart discuss — batch table proposals, all 4 areas accepted as recommended)

<domain>
## Phase Boundary

A home renderiza as 8 seções redesenhadas do Figma (trust bar/header, hero, story, ingredients, bundle selector, reviews, FAQs, footer), com o bundle selector continuando a disparar o checkout Stripe real. Full visual/interaction contract is locked in `05-UI-SPEC.md` (checker-approved, 6/6 dimensions) — this document covers only the execution-level decisions the UI-SPEC doesn't resolve.

</domain>

<decisions>
## Implementation Decisions

### Component Cleanup & File Organization
- Delete `WhyDipsSection.tsx` and `ProductSection.tsx` once their content is absorbed into Hero — no dead code left behind
- Delete `AboutSection.tsx` once the new `StorySection.tsx` replaces it in `page.tsx`
- New components (`LandingHeader.tsx`, `LandingFooter.tsx`, `StorySection.tsx`) live flat in `src/components/`, matching all 20 existing components — no new subfolder
- `Hero.tsx` is rewritten in place (same path, same export) rather than renamed to a new file — avoids touching the single import site in `page.tsx`

### Anchor Scroll & Sticky Header Mechanics
- Add `scroll-mt-[72px]` to each anchor-target section (`#hero`, `#story`, `#bundle`, `#footer-contact`) to offset the sticky 72px `LandingHeader`
- Add `scroll-smooth` to the root `<html>` in `src/app/[locale]/layout.tsx`
- Nav links stay hover-only (color shifts to `--color-brand-orange`) — no scroll-spy/active-section highlighting
- `#bundle` anchor links (header "Shop Now" + Hero "Buy Now") scroll to section top only — no auto-focus/highlight of the pre-selected 2x card

### i18n & Copy Migration Mechanics
- Story section's paragraph fold (`About.p1..p4` → a 3-paragraph slot) is hand-written merged copy under a new namespace — not runtime string concatenation — to protect es/pt sentence flow
- New i18n namespaces (`LandingHeader`, `LandingFooter`, `Story`) are top-level, one per component, matching existing convention (`Header`, `Footer`, `Product`, `Ingredients`, etc.)
- Sections reusing existing i18n keys verbatim (Hero's absorbed `Product.feature1..4_*`, Ingredients badges, `FAQ.q1..6`/`a1..6`) keep their OLD namespace names — renaming would be pure churn across 3 locale files for zero behavior change
- The "Aphrodisiac" typo fix (FUNC-04) is spot-verified in es/pt now (quick grep against `messages/es.json`/`messages/pt.json`), not deferred entirely to Phase 6

### Verification & Definition of Done
- Primary correctness gate: `npm run build` (`prisma generate && next build`, catches TS + next-lint issues) plus a manual dev-server browser walkthrough of all 8 sections — no test framework exists in this repo (confirmed via `.planning/codebase/TESTING.md`), and this phase does not introduce one
- FUNC-01 (checkout still works) is proven via code-diff (`BuyNowButton`/`ProductPurchaseBox` pricing logic byte-for-byte untouched) plus one manual Stripe test-mode click-through confirming the checkout redirect fires with correct line items
- Regression protection for the 9 pages sharing `Header.tsx`/`Footer.tsx` is proven via git diff — zero diff on those two files means the 9 pages cannot have regressed
- Plan grouping across the 8 sections is the planner's discretion (group by file dependency / wave-parallelism potential)

### Claude's Discretion
None beyond the above — all 4 grey areas were accepted exactly as recommended, no open-ended items remain.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ProductPurchaseBox.tsx` / `BuyNowButton.tsx` — bundle pricing + Stripe checkout logic, reused untouched (locked pricing architecture, see UI-SPEC §5)
- `src/components/ui/accordion.tsx` (shadcn, already installed) — reused as-is for FAQ, including its existing chevron-rotation CSS
- `ReviewsSection.tsx`'s `Stars`/`ReviewCard`/avatar-initials logic — reused for Hero's social-proof badge (visual reference) and for the Reviews section itself (unchanged data/markup, only background + column count change)

### Established Patterns
- All section components live flat in `src/components/` (no subfolders) — 20 existing components confirm this
- One top-level i18n namespace per component in `messages/{en,es,pt}.json` (e.g. `Header`, `Footer`, `Product`, `Ingredients`, `About`, `FAQ`)
- Data-driven content lives in `src/data/*.ts` (e.g. `reviews.ts`) — components read directly, no fetch layer or API route

### Integration Points
- `src/app/[locale]/page.tsx` — the only file that wires the 8 sections together; `LandingHeader`/`LandingFooter` replace `Header`/`Footer` here ONLY
- `src/app/[locale]/layout.tsx` — root `<html>` tag, target for the `scroll-smooth` addition
- `Header.tsx`/`Footer.tsx` remain wired into the 9 other out-of-scope pages (`product/[slug]`, `products`, `orders`, `orders/[id]`, `profile`, `wishlist`, `checkout/success`, `LegalPageLayout`-based pages) — untouched, per the UI-SPEC's architectural decision

</code_context>

<specifics>
## Specific Ideas

See `.planning/phases/05-landing-page-sections/05-UI-SPEC.md` for the full section-by-section visual/interaction contract (checker-approved, 6/6 dimensions — spacing, typography, color, copywriting, visuals, registry safety). This CONTEXT.md deliberately does not restate it; it covers only the execution-level decisions (file organization, scroll mechanics, i18n migration mechanics, verification approach) the UI-SPEC leaves open.

</specifics>

<deferred>
## Deferred Ideas

- Full es/pt i18n review beyond the single Aphrodisiac spot-check — Phase 6 (I18N-01/02)
- Mobile/tablet nav pattern for `LandingHeader` (hamburger/drawer) — Phase 6 (RESP-01/02), Figma has no mobile frame to follow
- Any Playwright/automated test tooling introduction — out of scope for this milestone; no existing test framework and none requested

</deferred>

---

*Phase: 05-landing-page-sections*
*Context gathered: 2026-07-16 via Smart Discuss (autonomous mode)*
