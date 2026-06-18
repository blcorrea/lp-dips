# Phase 3: Affiliate Gallery & i18n - Context

**Gathered:** 2026-06-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the affiliate-facing creative gallery as a **"Criativos" section on the existing affiliate dashboard** (`src/app/[locale]/affiliates/dashboard/page.tsx`, a server component), built entirely on the Phase 1 data layer and the active library managed in Phase 2. Specifically:

- A glassmorphism **card grid** of **active creatives only**, ordered by `sortOrder`, fed by `listCreatives({ activeOnly: true })`.
- Each card: media preview (image, or inline-playable video), title, optional description, type badge (photo/video), a **Download** action, and a **"Copiar legenda"** action when the creative has a caption.
- **Download** saves the file to the affiliate's device (images and large videos).
- **Copy caption** copies the post caption to clipboard with a visible "Copiado" confirmation; the button is shown only when a caption exists.
- **Empty state** message when no active creatives exist (instead of the grid).
- Full **i18n** of all new strings in `messages/en.json`, `es.json`, `pt.json` under a new `AffiliateCreatives` namespace.

Covers AFFL-01..05 and I18N-01. The data layer (Phase 1) and admin management surface (Phase 2) are already shipped and out of scope. This is a **dashboard section, not a new route**, and there is **no affiliate-facing API** — the dashboard server component reads creatives directly (per REQUIREMENTS "Out of Scope").

</domain>

<decisions>
## Implementation Decisions

### Video card preview
- **D-01:** Video cards render an **inline, playable `<video>` element** (not poster-only) so affiliates can preview the clip in-card before downloading. Use `thumbnailUrl` as the `poster` still frame when present.
- **D-02:** Playback is **click-to-play with native controls** — videos load **paused** showing the poster still, never autoplay. Keep the grid light: `preload="none"` (or `"metadata"`) and lazy rendering so a grid of videos doesn't hammer bandwidth/CPU. (Rejected: muted autoplay loop — too heavy with many cards.)

### Caption display & copy
- **D-03:** **"Copiar legenda" appears only when `caption` is non-empty**; hide the button entirely when the caption is null/empty. Copy writes the caption text to clipboard with a visible **"Copiado"** confirmation (mirror the `CopyLinkButton` pattern: 2s timeout state).
- **D-04:** When a caption exists, also **show the caption text on the card** (small, line-clamped to ~2-3 lines) so the affiliate can read it before copying. When empty, render neither the text nor the button.
- **D-05:** **Important term clarification:** "legenda"/"caption" here = the **ready-to-post social caption text** the admin typed (call-to-action, hashtags, link) that the affiliate pastes into their post — it is **NOT** burned-in video subtitles. Videos that ship with on-screen subtitles keep them inside the file; that is unrelated to the `caption` field and this feature.

### Download behavior
- **D-06:** Clicking **Download ALWAYS saves the file to the device** (both images and large videos) — it must never just open a preview tab.
- **D-07 (technique — strong recommendation, finalize in research):** The blob lives on a different origin (`*.public.blob.vercel-storage.com`), so a plain `<a download>` will NOT force-save cross-origin (browser previews instead). **Recommended primary path: the `@vercel/blob` `downloadUrl` / download param**, which sets `Content-Disposition: attachment` server-side and avoids a proxy or buffering the file in browser memory. **Fallback:** `fetch → blob → objectURL → a.download` for any case the downloadUrl path doesn't cover. Researcher/planner confirms and locks the exact mechanism.

### Layout & placement
- **D-08:** The "Criativos" section sits **at the end of the dashboard, below the commission history** (order: header → referral link → stats → commission history → **Criativos**). Financial metrics stay on top; creatives are the supporting promo section at the bottom.
- **D-09:** Grid density is **comfortable: 1 col (mobile) → 2 col (tablet) → 3 col (desktop)** — NOT the admin's denser up-to-5-col grid, because the inline video player needs room. Fits the dashboard's `max-w-4xl` container.

### Styling & i18n
- **D-10:** Reuse the **established glassmorphism style** of the dashboard (`rounded-2xl bg-white/10 backdrop-blur-sm`, brand-purple gradient context) so the section feels native. The admin grid's plain white-card style does NOT carry over — this is the affiliate-facing glass treatment.
- **D-11:** All new strings live under a new **`AffiliateCreatives` next-intl namespace** in en/es/pt: section title (PT "Criativos"), Download label (PT "Baixar"), copy label (PT "Copiar legenda"), copied confirmation (PT "Copiado"), empty-state message, and photo/video type labels. Keys parallel the existing `AffiliateDashboard` namespace conventions.

### Claude's Discretion
- New `"use client"` component for the gallery (the dashboard page is a server component; download + copy need client interactivity). Component name, file location under `dashboard/`, and decomposition are the planner/executor's call, following the `CopyLinkButton`/`LogoutButton` sibling pattern.
- Exact translation copy for each string (standard, on-brand phrasings), card spacing, aspect ratio of the media frame, and badge styling — discretion, as long as it matches the glassmorphism dashboard and existing i18n key conventions.
- Whether the type badge text is localized ("Foto"/"Vídeo") or icon-only — recommend localized labels under the namespace per I18N-01.
- Exact `preload` value and lazy-loading mechanism for videos (D-02 intent: keep the grid cheap).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Integration target (the dashboard to extend)
- `src/app/[locale]/affiliates/dashboard/page.tsx` — server component; add the "Criativos" section here, below the commission-history block (D-08). Reads data server-side and passes serialized rows to a client component. Uses `getTranslations({ locale, namespace })`.
- `src/app/[locale]/affiliates/dashboard/CopyLinkButton.tsx` — **direct template** for the copy-with-confirmation interaction (`navigator.clipboard.writeText`, `copied` state + 2s reset, `useTranslations`). Mirror for "Copiar legenda" (D-03).
- `src/app/[locale]/affiliates/dashboard/LogoutButton.tsx` — sibling `"use client"` component pattern under `dashboard/`.

### Data layer (Phase 1 — consume directly, do not modify)
- `src/lib/creatives.ts` — `listCreatives({ activeOnly: true })` returns active creatives ordered by `sortOrder` then `createdAt` (D-12 of Phase 1); `CreativeRow` type (dates as ISO strings, `type` IMAGE|VIDEO, `url`, `thumbnailUrl?`, `caption?`, `fileName`, `mimeType`).
- `src/lib/creatives-constants.ts` — accepted MIME / size constants (moved here in Phase 2; not needed for read-only gallery but note the location).
- `.planning/phases/01-foundation/01-CONTEXT.md` — schema/field decisions; `.planning/phases/02-admin-creatives/02-CONTEXT.md` — admin grid + preview decisions (poster handling, `next/image` for blob thumbnails).

### Patterns to mirror for the card/preview
- `src/app/admin/creatives/CreativesGrid.tsx` — admin reference for media preview: `next/image` for IMAGE and for VIDEO poster (`thumbnailUrl`), placeholder icon when a video has no poster, type badge. The affiliate gallery diverges by adding inline `<video>` playback (D-01) and glassmorphism styling (D-10).

### i18n
- `messages/en.json`, `messages/es.json`, `messages/pt.json` — add the `AffiliateCreatives` namespace (I18N-01). Existing `AffiliateDashboard` namespace is the style/key-naming reference.
- `next.config.mjs` — `*.public.blob.vercel-storage.com` already in `images.remotePatterns` (Phase 1) so `next/image` works for previews.

### Storage / download
- `@vercel/blob` — `downloadUrl` / download param for the cross-origin save-to-device path (D-07).

### Project specs
- `.planning/REQUIREMENTS.md` — AFFL-01..05, I18N-01 acceptance criteria.
- `.planning/PROJECT.md` — core value ("ready-to-post, on-brand creative assets with a copy-paste caption"), key decisions.
- `.planning/codebase/CONVENTIONS.md`, `.planning/codebase/ARCHITECTURE.md` — brownfield conventions.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `CopyLinkButton.tsx`: near-exact template for the copy-caption button (clipboard write + `copied`/`Copiado` confirmation + `useTranslations`).
- `dashboard/page.tsx`: the server component to extend; already wired with `getTranslations`, affiliate session guard, and serialized data passing.
- `CreativesGrid.tsx` (admin): preview logic reference (image vs video poster vs placeholder, type badge) — adapt for inline video + glass styling.
- `listCreatives({ activeOnly: true })`: returns exactly the rows the gallery needs, already ordered.

### Established Patterns
- Affiliate dashboard = server component fetching data, delegating interactivity to small `"use client"` sibling components (`CopyLinkButton`, `LogoutButton`).
- Glassmorphism section shell: `rounded-2xl bg-white/10 backdrop-blur-sm px-6 py-5` over the brand-purple gradient.
- i18n via `getTranslations` (server) / `useTranslations` (client), one namespace per feature area.
- Empty-state pattern already used inline (e.g., `noCommissions` message replaces the table).

### Integration Points
- New `"use client"` gallery component under `src/app/[locale]/affiliates/dashboard/`, rendered at the bottom of the dashboard `page.tsx` (D-08).
- New `AffiliateCreatives` namespace across all three `messages/*.json`.
- Reads Phase 1 `listCreatives`; reads Phase 2-managed blob URLs (no new API route).

</code_context>

<specifics>
## Specific Ideas

- The affiliate grid is the glass-styled counterpart to the admin grid — same data, different audience and treatment. Affiliates "grab and post," so previewing video in-card (click-to-play) and reading the caption before copying matter.
- "Legenda" deliberately means the post caption, not video subtitles (D-05) — the most important clarification from this discussion; downstream agents must not conflate them.

</specifics>

<deferred>
## Deferred Ideas

- Download/usage analytics (who downloaded what) — v2 (ANLY-01/02), out of scope.
- Categories/tags/folders and per-affiliate creative visibility — v2 / out of scope; all active creatives visible to all affiliates.
- Muted autoplay video previews — considered and rejected for v1 (performance); click-to-play only.

None of these belong in Phase 3.

</deferred>

---

*Phase: 3-Affiliate Gallery & i18n*
*Context gathered: 2026-06-18*
