# Phase 2: Admin Creatives - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-17
**Phase:** 2-Admin Creatives
**Areas discussed:** Management UI shape, Upload flow & form, Item controls & reorder, Nav entry point

---

## Management UI shape

| Option | Description | Selected |
|--------|-------------|----------|
| Card grid w/ previews | Responsive grid of cards with image/video thumbnail + title + controls; previews what affiliates see in Phase 3. | ✓ |
| Data table + thumb | Reuse AffiliatesTable pattern with a small thumbnail column; max code reuse, less visual. | |

**User's choice:** Card grid with previews
**Notes:** Creatives are visual; admin grid doubles as a preview of the Phase 3 affiliate gallery.

---

## Upload flow & form

| Option | Description | Selected |
|--------|-------------|----------|
| Modal dialog | Add-creative modal with file picker + fields + progress; introduces a new modal component. | |
| Inline panel toggle | Reuse AffiliatesTable `showCreate` pattern — inline form panel above the grid. | ✓ |
| Dedicated /new page | Separate `/admin/creatives/new` route; extra navigation + new route. | |

**User's choice:** Deferred to recommendation → Inline panel toggle
**Notes:** Chosen for consistency with existing admin code (least new surface).

| Option (poster) | Description | Selected |
|--------|-------------|----------|
| Optional 2nd file field for video | Poster picker shown only for videos; fallback placeholder/first-frame if omitted. | ✓ |
| Always offer poster field | Poster picker for every upload; simpler conditional, less tailored. | |

**User's choice:** Optional 2nd file field for video
**Notes:** Matches Phase 1 "manual optional poster, no ffmpeg" decision.

---

## Item controls & reorder

| Option (reorder) | Description | Selected |
|--------|-------------|----------|
| Immediate swap on click | Each ▲/▼ PATCHes a sortOrder swap with the neighbor, then router.refresh(). | ✓ |
| Batch "Save order" button | Reorder freely, persist with one save; adds unsaved-state handling. | |

| Option (edit) | Description | Selected |
|--------|-------------|----------|
| Edit modal/panel from card | Edit control opens a metadata-only form; blob not re-editable. | ✓ |
| Inline-editable card fields | Fields editable in place; busier cards, more state. | |

| Option (delete) | Description | Selected |
|--------|-------------|----------|
| Native confirm() dialog | Browser confirm before DELETE; zero new UI. | ✓ |
| Styled confirm dialog | Custom in-app confirmation; nicer, more to build. | |

**User's choice:** Immediate swap on click · Edit modal/panel from card · Native confirm()
**Notes:** All three align with the existing per-action PATCH + router.refresh() admin pattern.

---

## Nav entry point

| Option | Description | Selected |
|--------|-------------|----------|
| Global top-nav link | "Creatives" in the admin header alongside Orders/Affiliates/etc.; most discoverable. | ✓ |
| Button on Affiliates page | Link on /admin/affiliates only (literal ADMIN-07 reading); less discoverable. | |
| Both | Top-nav + affiliates-page entry; most discoverable, more wiring. | |

**User's choice:** Deferred to recommendation → Global top-nav link
**Notes:** Header renders on the affiliates page too, so a global link satisfies ADMIN-07 while being simplest/most discoverable.

---

## Claude's Discretion

- Upload UI placement and nav placement explicitly deferred to recommendation (inline panel; global top-nav link).
- **Flagged for research:** client-upload row-creation strategy — Vercel Blob `onUploadCompleted` cannot reach localhost; researcher to pick a dev-friendly, consistency-safe path.
- API route shape, component decomposition, edit modal-vs-expander, progress styling, and validation/error copy left to planner/executor within existing admin conventions.

## Deferred Ideas

- Drag-and-drop reorder, categories/tags/folders, download analytics — v2 (already in REQUIREMENTS.md).
- Styled in-app confirm dialog — revisit if admin gains a shared modal component.
- Server-side video poster auto-generation (ffmpeg) — deferred at milestone init.
