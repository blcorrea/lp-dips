# Phase 3: Affiliate Gallery & i18n - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-18
**Phase:** 3-Affiliate Gallery & i18n
**Areas discussed:** Video preview, Caption display, Download behavior, Placement & density

---

## Video preview

| Option | Description | Selected |
|--------|-------------|----------|
| Inline playable video | `<video>` element (muted, controls, poster=thumbnailUrl) — preview in-card before download | ✓ |
| Poster + download only | Poster image / placeholder icon like admin grid; no inline playback | |
| You decide | Pick best fit for grid/performance | |

**User's choice:** Inline playable video
**Notes:** Affiliates want to preview clips in-card.

### Playback follow-up

| Option | Description | Selected |
|--------|-------------|----------|
| Click to play, with controls | Loads paused on poster still; native controls; preload none/metadata + lazy | ✓ |
| Muted autoplay loop | Autoplay muted + loop (IG-feed feel); heavier on bandwidth/CPU | |
| You decide | Best-performing default | |

**User's choice:** Click to play, with controls
**Notes:** Keeps a grid of videos cheap; rejected autoplay for performance.

---

## Caption display

| Option | Description | Selected |
|--------|-------------|----------|
| Visible + copy button | Show caption text (clamped) AND "Copiar legenda" button | (resolved below) |
| Copy-only | Only the copy button; caption text not rendered | |
| You decide | Pick based on card layout | |

**User's choice:** Free-text (Other) — initially questioned whether captions are needed at all, believing "legenda" meant subtitles burned into the video.
**Notes:** Clarified the term: **caption = ready-to-post social post text** (paste into the post), NOT video subtitles. With that distinction, user confirmed: **keep the "Copiar legenda" button when a caption exists, hide it when empty.** Caption text also shown clamped on the card when present (Claude's recommendation, user did not object). This is the most important clarification of the discussion (see CONTEXT D-05).

---

## Download behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Save always (you decide technique) | Download always saves to device (img+video); technique decided in research | ✓ |
| Open in new tab | Button only opens file in a tab; user saves manually | |
| Save via Vercel downloadUrl | Lock the `@vercel/blob` downloadUrl (Content-Disposition: attachment) now | |

**User's choice:** "sua recomendação" → Save always, technique = Claude's recommendation
**Notes:** Cross-origin blob means `<a download>` won't force-save. Recommended primary: `@vercel/blob` `downloadUrl`; fallback `fetch→blob→objectURL`. Final mechanism confirmed in research (CONTEXT D-06/D-07).

---

## Placement & density

| Option | Description | Selected |
|--------|-------------|----------|
| Above commission history | header → link → stats → CRIATIVOS → commissions | |
| End, below commissions | header → link → stats → commissions → CRIATIVOS | ✓ |
| Below referral link | header → link → CRIATIVOS → stats → commissions | |

**User's choice:** End, below commissions
**Notes:** Financial metrics stay on top; creatives as supporting promo section at the bottom.

### Density follow-up

| Option | Description | Selected |
|--------|-------------|----------|
| Comfortable (up to 3 col) | 1 → 2 → 3 columns; larger cards, room for inline video | ✓ |
| Dense (4-5 col) | Like admin grid; more per screen but cramped video preview | |
| You decide | Best balance | |

**User's choice:** Comfortable (up to 3 col)
**Notes:** Inline video player needs room; fits the dashboard `max-w-4xl` container.

---

## Claude's Discretion

- Gallery `"use client"` component name/location/decomposition (follow `CopyLinkButton`/`LogoutButton` sibling pattern).
- Exact translation copy per string; card spacing, media aspect ratio, badge styling.
- Localized vs icon-only type badge (recommended localized "Foto"/"Vídeo").
- Exact `preload` value / lazy mechanism for videos.
- Download technique final selection (recommended `@vercel/blob` downloadUrl).

## Deferred Ideas

- Download/usage analytics — v2 (ANLY-01/02).
- Categories/tags/folders, per-affiliate visibility — v2 / out of scope.
- Muted autoplay video previews — rejected for v1 (performance).
