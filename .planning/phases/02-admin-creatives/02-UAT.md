---
status: testing
phase: 02-admin-creatives
source: [02-VERIFICATION.md]
started: 2026-06-17T21:52:48Z
updated: 2026-06-17T21:52:48Z
---

## Current Test

number: 1
name: Provision BLOB_READ_WRITE_TOKEN and confirm the Creatives nav + page load
expected: |
  With BLOB_READ_WRITE_TOKEN in .env.local and `npm run dev` running, the admin
  top-nav shows a "Creatives" link (visible from /admin/affiliates too); clicking it
  loads /admin/creatives showing the empty state.
awaiting: user response

## Tests

### 1. Setup + nav link + page load (ADMIN-07)
expected: BLOB_READ_WRITE_TOKEN is in .env.local (`vercel env pull` or Vercel Dashboard → Storage → Blob → .env.local tab). `npm run dev` running, logged into admin. A "Creatives" link appears in the top nav on every admin page including /admin/affiliates. Clicking it loads /admin/creatives showing the empty state.
result: [pending]

### 2. Upload an image (ADMIN-01)
expected: Click "+ Add creative", choose an IMAGE, enter a title (+ optional description/caption), submit. The progress bar advances; after refresh a card appears with the image preview and "Image" + "Active" badges.
result: [pending]

### 3. Upload a video >4.5MB with optional poster (ADMIN-01, ADMIN-02)
expected: Adding a VIDEO (ideally >4.5MB to confirm the serverless-limit bypass) reveals the poster field (video only). With no poster the card shows the Video placeholder icon; with a poster the poster image shows. Upload succeeds via client-upload to Vercel Blob.
result: [pending]

### 4. Edit metadata (ADMIN-03)
expected: Click Edit on a card, change the title, click "Save changes". The card updates after refresh. The edit panel exposes metadata only (no file re-upload field).
result: [pending]

### 5. Reorder with ▲/▼ (ADMIN-04)
expected: With 2+ cards, ▲/▼ changes order immediately and the new order persists after a manual page reload. ▲ is disabled on the first card, ▼ on the last.
result: [pending]

### 6. Activate / deactivate (ADMIN-05)
expected: Deactivate flips the badge to "Inactive"; Activate flips it back to "Active".
result: [pending]

### 7. Delete with confirmation + blob removal (ADMIN-06)
expected: Delete shows a native confirm(); on accept the card disappears, and the blob(s) are removed from the Vercel Blob store (verify in the Vercel dashboard).
result: [pending]

### 8. Auth guard (ADMIN-02, security)
expected: The /admin/creatives page and /api/admin/creatives* routes are unreachable without an admin session (middleware/route guards return 401 / redirect to login).
result: [pending]

## Summary

total: 8
passed: 0
issues: 0
pending: 8
skipped: 0
blocked: 0

## Gaps
