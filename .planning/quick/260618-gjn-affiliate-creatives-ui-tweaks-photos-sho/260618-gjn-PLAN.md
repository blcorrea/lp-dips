---
phase: quick-260618-gjn
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app/[locale]/affiliates/dashboard/AffiliateCreativesGallery.tsx
  - src/app/admin/creatives/CreativesGrid.tsx
autonomous: true
requirements: []
quick: true
must_haves:
  truths:
    - "Photo creatives in the affiliate gallery display in their full natural aspect ratio (no fixed-height crop, no large empty area)"
    - "Affiliate gallery video cards display their first frame as a poster when no explicit poster is set"
    - "The affiliate gallery card grid is denser: 1 col on mobile scaling up to 4-5 cols on large desktop, with no horizontal scroll"
    - "The admin creatives upload form no longer shows any poster/cover image control"
    - "The Creative DB columns (thumbnailUrl, thumbnailBlobPath) are left untouched — no schema/migration change"
  artifacts:
    - path: "src/app/[locale]/affiliates/dashboard/AffiliateCreativesGallery.tsx"
      provides: "Natural-aspect image rendering + first-frame video poster + denser responsive grid"
    - path: "src/app/admin/creatives/CreativesGrid.tsx"
      provides: "Admin upload form with poster UI/state/upload logic removed"
  key_links:
    - from: "src/app/admin/creatives/CreativesGrid.tsx"
      to: "/api/admin/creatives"
      via: "POST sends thumbnailUrl: null / thumbnailBlobPath: null (no poster collected)"
      pattern: "thumbnailUrl"
---

<objective>
Apply three confirmed Phase 2/3 UAT design-preference UI tweaks to the affiliate creatives feature. All are layout/UX-only — no DB schema changes, no migrations, no i18n string additions/removals.

Purpose: Close the two design-change requests captured in 03-UAT.md Gaps (full-aspect photos, denser 4-5 col grid) and the admin-side request to drop the unnecessary video poster/cover option.

Output: Edited `AffiliateCreativesGallery.tsx` (image aspect + video first-frame poster + grid) and `CreativesGrid.tsx` (poster UI/state/logic removed). DB columns `thumbnailUrl`/`thumbnailBlobPath` remain in the schema, untouched.
</objective>

<execution_context>
@C:/dev/dips/lp-dips/.claude/gsd-core/workflows/execute-plan.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/phases/03-affiliate-gallery-i18n/03-UAT.md
@src/app/[locale]/affiliates/dashboard/AffiliateCreativesGallery.tsx
@src/app/admin/creatives/CreativesGrid.tsx

Notes for the executor:
- The "poster" concept is persisted as the `thumbnailUrl` / `thumbnailBlobPath` columns on the `AffiliateCreative` model (confirmed in `src/lib/creatives.ts` and `src/generated/prisma/client/models/AffiliateCreative.ts`). QUICK MODE: do NOT touch the Prisma schema, do NOT create a migration, do NOT change the API route. Only stop the admin form from collecting/sending a poster — the POST body must send `thumbnailUrl: null` and `thumbnailBlobPath: null`.
- The affiliate gallery `<video>` already uses `preload="none"`; to render a first frame as poster, switch to `preload="metadata"` and append a `#t=0.001` media fragment to the video src so the browser paints the first frame. Keep the existing play-overlay button as a graceful fallback for browsers that do not render a frame.
- No user-facing strings are added or removed. The `AffiliateCreatives` next-intl namespace (en/es/pt) stays intact. The admin form labels are hardcoded English; removing the poster `<label>` block deletes the only poster-facing text and needs no i18n edit.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Full-aspect photos + first-frame video poster in affiliate gallery card</name>
  <files>src/app/[locale]/affiliates/dashboard/AffiliateCreativesGallery.tsx</files>
  <action>
In `CreativeCard`, change image creatives to render in their natural aspect ratio instead of cropped inside the fixed `aspect-video` box.

Image branch (currently the `next/image` with `fill` + `object-cover` inside a `relative aspect-video w-full` wrapper): replace the fixed-height cropped frame for IMAGE so the photo shows in full. Use a non-`fill` `next/image` with intrinsic `width`/`height` and `className="w-full h-auto"` (or `style={{ width: '100%', height: 'auto' }}`), with `sizes` preserved. Provide reasonable intrinsic dimensions (e.g. width=800 height=800) so Next can compute layout — the rendered image scales to the card width and its own natural ratio, matching how the `<video>` preserves its aspect. The IMAGE media frame must NOT use `object-cover` and must NOT be locked to `aspect-video`.

Keep the type badge positioned over the media. The badge currently sits inside the shared media frame as an absolutely-positioned span; keep it anchored top-left over the image (wrap the image in a `relative` container so the absolute badge still anchors correctly).

VIDEO branch: keep the video preserving its aspect (it already does). To show the first frame as the default poster when there is no explicit poster (`row.thumbnailUrl` is null): change the `<video>` from `preload="none"` to `preload="metadata"`, and set the src to render the first frame via a media fragment — i.e. when there is no `row.thumbnailUrl`, use a src ending in `#t=0.001` so the browser paints the initial frame; when `row.thumbnailUrl` exists, keep `poster={row.thumbnailUrl}` as-is. Leave the existing play-overlay button (shown only when `!row.thumbnailUrl && showVideoOverlay`) as a fallback for browsers that do not paint a frame.

Do not change any next-intl keys, the Download anchor, or the Copy-caption logic.
  </action>
  <verify>
    <automated>npx tsc --noEmit -p tsconfig.json</automated>
  </verify>
  <done>
TypeScript compiles. In the affiliate dashboard gallery, an IMAGE creative renders in its full natural aspect (no `object-cover`, no fixed `aspect-video` crop, no large empty area below the image), and a VIDEO creative without a poster shows its first frame (preload="metadata" + `#t=0.001` src). The type badge still appears top-left over the media.
  </done>
</task>

<task type="auto">
  <name>Task 2: Denser 4-5 column responsive grid in affiliate gallery</name>
  <files>src/app/[locale]/affiliates/dashboard/AffiliateCreativesGallery.tsx</files>
  <action>
In `AffiliateCreativesGallery` (the grid wrapper, currently `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4`), change the responsive column count to a denser layout that ends at 4-5 columns on large desktop while staying 1 column on mobile and scaling up smoothly. Use `grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3` — OR keep `grid-cols-1` on the smallest breakpoint if 2 columns feel too cramped on phones (`grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5`). Pick the denser-but-still-readable option; smaller cards are the goal. Reduce the gap to `gap-3` to support the denser layout.

Do NOT introduce any horizontal-scroll container (no `overflow-x-auto`, no fixed min-width on cards). The grid must remain fully fluid/responsive. Update the inline comment near the grid that references "max 3 cols" so it reflects the new 4-5 col target (rephrase by concept; do not leave a stale "3 cols" note).
  </action>
  <verify>
    <automated>npx tsc --noEmit -p tsconfig.json</automated>
  </verify>
  <done>
TypeScript compiles. The gallery grid renders 1 (or 2) columns on mobile and scales up to 4-5 columns on large desktop with smaller cards and no horizontal scroll. The stale "max 3 cols" comment is updated.
  </done>
</task>

<task type="auto">
  <name>Task 3: Remove video poster/cover option from admin creatives upload form</name>
  <files>src/app/admin/creatives/CreativesGrid.tsx</files>
  <action>
Remove the poster/cover upload capability from the admin create form. Specifically:

1. Delete the poster file input block (the `assetFile?.type.startsWith('video/') && (...)` JSX that renders the "Poster (video only)" label + file input).
2. Delete the `posterFile` state declaration (`const [posterFile, setPosterFile] = useState<File | null>(null);`).
3. In `handleCreate`, remove the Step 2 poster-upload block (the `if (posterFile) { ... }` that uploads the poster and builds `posterBlob`) and remove the `posterBlob` variable. Adjust the asset upload progress mapping so it spans the full upload (e.g. `percentage` maps directly toward ~98% rather than `percentage * 0.8` reserving room for a poster upload that no longer happens).
4. In the POST body sent to `/api/admin/creatives`, send `thumbnailUrl: null` and `thumbnailBlobPath: null` (the API and DB columns are unchanged — quick mode keeps the schema intact; the form simply no longer supplies a poster).
5. In the orphaned-blob `console.error` log and the success-path reset, remove references to `posterFile` / `posterBlob` (log only the asset pathname; drop `setPosterFile(null)` from the reset).
6. In the asset-file `onChange` handler, remove the now-pointless "Clear poster when switching back to image" branch that calls `setPosterFile(null)`.

Do NOT modify the Prisma schema, the migration files, or `/api/admin/creatives/route.ts`. Do NOT remove the `thumbnailUrl`/`thumbnailBlobPath` columns. The change is admin-form-only.
  </action>
  <verify>
    <automated>npx tsc --noEmit -p tsconfig.json</automated>
  </verify>
  <done>
TypeScript compiles with no unused-variable errors. The admin upload form shows no poster/cover control. `posterFile` state and all poster upload logic are gone. The POST to `/api/admin/creatives` sends `thumbnailUrl: null` and `thumbnailBlobPath: null`. The Prisma schema and migrations are untouched (no DB change).
  </done>
</task>

</tasks>

<verification>
- `npx tsc --noEmit -p tsconfig.json` passes (no type errors, no unused `posterFile`/`posterBlob`).
- `git diff --stat` shows only the two component files changed; `prisma/schema.prisma` and `prisma/migrations/**` are NOT in the diff.
- Manual: affiliate gallery photos display full/natural aspect; videos without a poster show a first frame; grid is denser (4-5 cols on wide desktop, no horizontal scroll); admin form has no poster control.
</verification>

<success_criteria>
- All three confirmed UAT design tweaks implemented (full-aspect photos, denser 4-5 col grid, admin poster option removed).
- No DB migration or Prisma schema change.
- i18n (en/es/pt) for `AffiliateCreatives` unchanged.
- TypeScript build clean.
</success_criteria>

<output>
Create `.planning/quick/260618-gjn-affiliate-creatives-ui-tweaks-photos-sho/260618-gjn-SUMMARY.md` when done.
</output>
