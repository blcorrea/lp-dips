---
status: testing
phase: 03-affiliate-gallery-i18n
source: [03-VERIFICATION.md]
started: 2026-06-18T14:26:19Z
updated: 2026-06-18T14:26:19Z
---

## Current Test

number: 1
name: Section placement + glassmorphism rendering
expected: |
  Logged in as an affiliate, the dashboard shows a "Criativos" section below the
  commission history, styled with the glassmorphism treatment (translucent
  white/10 + backdrop blur) consistent with the rest of the dashboard.
awaiting: user response

## Tests

### 1. Section placement + glassmorphism rendering
expected: As a logged-in affiliate at `/pt/affiliates/dashboard` (and `/en`), a "Criativos" section appears BELOW the commission history, with glassmorphism cards (bg-white/10 + backdrop-blur). Section title is localized.
result: [pending]

### 2. Responsive grid
expected: The card grid is 1 column on mobile (<640px), 2 columns on tablet (≥640px), 3 columns on desktop (≥768px). No horizontal scroll.
result: [pending]

### 3. Media rendering (image + video)
expected: IMAGE creatives render the image (next/image). VIDEO creatives with a poster show the poster and play on click with controls (no autoplay). VIDEO creatives without a poster show a play-icon overlay button; clicking it starts playback.
result: [pending]

### 4. Download saves to disk
expected: Clicking Download (Baixar/Descargar) on any card saves the file to the device — image AND large video — rather than opening a preview tab. Verify with at least one image and one video.
result: [pending]

### 5. Copy caption + confirmation
expected: On a card that has a caption, clicking "Copiar legenda" copies the caption text to the clipboard and the button shows "Copiado" for ~2s. Pasting elsewhere yields the caption text.
result: [pending]

### 6. No caption → no button/text
expected: A creative with an empty caption shows neither the caption text nor the "Copiar legenda" button (requires a caption-less active creative in the DB).
result: [pending]

### 7. Empty state
expected: When there are no active creatives, the section shows the localized empty-state message instead of the grid (requires deactivating/removing all active creatives).
result: [pending]

### 8. Localized type badge
expected: The photo/video type badge is localized — e.g. "Vídeo" at `/pt`, "Video" at `/en`, "Foto" both. Section title and button labels also localized across en/es/pt.
result: [pending]

## Summary

total: 8
passed: 0
issues: 0
pending: 8
skipped: 0
blocked: 0

## Gaps
