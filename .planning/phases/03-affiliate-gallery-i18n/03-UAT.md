---
status: complete
phase: 03-affiliate-gallery-i18n
source: [03-VERIFICATION.md]
started: 2026-06-18T14:26:19Z
updated: 2026-06-18T14:51:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Section placement + glassmorphism rendering
expected: As a logged-in affiliate at `/pt/affiliates/dashboard` (and `/en`), a "Criativos" section appears BELOW the commission history, with glassmorphism cards (bg-white/10 + backdrop-blur). Section title is localized.
result: pass
note: "User confirmed placement + glassmorphism. Raised two design-change requests covered under Tests 2 and 3 (4-5 column grid; photos shown in full like videos)."

### 2. Responsive grid
expected: The card grid is 1 column on mobile (<640px), 2 columns on tablet (≥640px), 3 columns on desktop (≥768px). No horizontal scroll.
result: pass

### 3. Media rendering (image + video)
expected: IMAGE creatives render the image (next/image). VIDEO creatives with a poster show the poster and play on click with controls (no autoplay). VIDEO creatives without a poster show a play-icon overlay button; clicking it starts playback.
result: pass

### 4. Download saves to disk
expected: Clicking Download (Baixar/Descargar) on any card saves the file to the device — image AND large video — rather than opening a preview tab. Verify with at least one image and one video.
result: pass

### 5. Copy caption + confirmation
expected: On a card that has a caption, clicking "Copiar legenda" copies the caption text to the clipboard and the button shows "Copiado" for ~2s. Pasting elsewhere yields the caption text.
result: pass

### 6. No caption → no button/text
expected: A creative with an empty caption shows neither the caption text nor the "Copiar legenda" button (requires a caption-less active creative in the DB).
result: pass

### 7. Empty state
expected: When there are no active creatives, the section shows the localized empty-state message instead of the grid (requires deactivating/removing all active creatives).
result: pass

### 8. Localized type badge
expected: The photo/video type badge is localized — e.g. "Vídeo" at `/pt`, "Video" at `/en`, "Foto" both. Section title and button labels also localized across en/es/pt.
result: pass

## Summary

total: 8
passed: 8
issues: 0
pending: 0
skipped: 0
blocked: 0
design_change_requests: 2  # captured during testing — see Gaps (layout-only, not functional defects)

## Gaps

- truth: "Photo creatives display in full (natural aspect), like videos do, instead of being cropped in a fixed-height box"
  status: failed
  reason: "User reported (during Test 1): 'a foto pode aparecer por completo, assim como está o vídeo' — current photo card uses object-cover crop in a fixed box while the video preserves natural aspect"
  severity: minor
  test: 3
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "Creative cards are smaller and laid out in a 4-5 column grid on desktop"
  status: failed
  reason: "User reported (during Test 1): 'prefiro que estejam menores mesmo, naquele esquema de 4-5 columns' — current grid is 1/2/3 columns"
  severity: minor
  test: 2
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""
