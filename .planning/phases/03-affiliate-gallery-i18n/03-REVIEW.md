---
phase: 03-affiliate-gallery-i18n
reviewed: 2026-06-18T00:00:00Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - src/app/[locale]/affiliates/dashboard/AffiliateCreativesGallery.tsx
  - src/app/[locale]/affiliates/dashboard/page.tsx
  - messages/en.json
  - messages/es.json
  - messages/pt.json
findings:
  critical: 1
  warning: 5
  info: 3
  total: 9
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-06-18T00:00:00Z
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

This phase adds the affiliate-facing creative gallery: a `"use client"` gallery component backed by a server-fetched `listCreatives({ activeOnly: true })` call in the existing affiliate dashboard page. The client/server split is correct — no Prisma or Blob imports cross into the client bundle. i18n coverage under `AffiliateCreatives` is structurally complete and key-parity is maintained across all three locales. XSS surface is clean: caption and title values are rendered as React text nodes, never via `dangerouslySetInnerHTML`.

One critical bug was found: the hidden "no-poster video" branch produces a keyboard-focusable, visually-invisible video element that can receive focus and be announced by screen readers as an unlabelled control, and simultaneously the actual interaction model is broken (clicking the icon placeholder does not activate the hidden video). Four additional warnings cover: a silent clipboard failure that gives no user feedback, an unsafe `row.caption!` non-null assertion, missing accessible names on interactive elements, and locale-hardcoded formatting helpers in the server page. Three info items cover minor quality issues.

---

## Critical Issues

### CR-01: Hidden video is focusable by keyboard and has no accessible label; icon click does not activate it

**File:** `src/app/[locale]/affiliates/dashboard/AffiliateCreativesGallery.tsx:69-79`

**Issue:** The "VIDEO without poster" branch renders a `<Video>` icon `<div>` and then a `<video>` element with `opacity-0 cursor-pointer`. The two elements are siblings inside a `<div>`, not wired together: clicking the icon `<div>` does nothing to the video (there is no `onClick` on the icon container, no `ref` forwarding, no `htmlFor`/`id` relationship). The `opacity-0` video is still in the DOM, participates in tab-order (native focusable element), and has no `aria-label`. A keyboard user will tab to an invisible, unlabelled control; a screen reader will announce it as "video" with no context. On mobile/desktop pointer use the visible icon click is simply dead — the user must happen to click exactly on the invisible overlaid video track. This is both a functional bug (click target is broken) and an accessibility blocker.

**Fix:** Either (a) use a real button that calls `videoRef.current?.play()` and sets a state flag to reveal the video, or (b) render the `<video>` unconditionally and hide the icon placeholder once the video loads, or (c) the simplest correct fix — wrap the icon placeholder inside a `<label>` or make the overlay video the actual top-layer element with a proper `aria-label`:

```tsx
// Simplest fix: give the icon div an onClick that invokes play() on the video
// via a ref, and add aria-label to the video element itself.
const videoRef = useRef<HTMLVideoElement>(null);

// In the no-poster branch:
<>
  <div
    className="flex h-full items-center justify-center cursor-pointer"
    onClick={() => videoRef.current?.play()}
    role="button"
    aria-label={t('videoLabel')}
    tabIndex={0}
    onKeyDown={(e) => e.key === 'Enter' && videoRef.current?.play()}
  >
    <Video className="w-10 h-10 text-white/40" />
  </div>
  <video
    ref={videoRef}
    src={row.url}
    controls
    preload="none"
    aria-label={row.title}
    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
  />
</>
```

Note: since this is inside a `.map()`, `useRef` must be extracted into a child component (`CreativeCard`) to be called at the component level, not inside a loop. The cleanest fix is to extract each card into its own component.

---

## Warnings

### WR-01: Non-null assertion `row.caption!` will throw if `caption` is somehow null/undefined

**File:** `src/app/[locale]/affiliates/dashboard/AffiliateCreativesGallery.tsx:117`

**Issue:** The copy button is guarded by `{row.caption && ...}`, which means TypeScript narrows `row.caption` to `string` inside the block, making the `!` assertion technically redundant. However the assertion is still present and masks the fact that the outer conditional is the only null-safety layer. If the conditional is ever refactored or the check is lifted, the assertion will silently suppress a type error while passing `null` (or empty string) to `navigator.clipboard.writeText(null)`, which throws a `TypeError`. The non-null assertion should be removed in favour of relying on the narrowed type.

**Fix:**
```tsx
// Before
onClick={() => handleCopy(row.id, row.caption!)}

// After — TypeScript already narrowed caption to string inside the {row.caption && ...} block
onClick={() => handleCopy(row.id, row.caption)}
```

### WR-02: Silent clipboard failure gives no user feedback

**File:** `src/app/[locale]/affiliates/dashboard/AffiliateCreativesGallery.tsx:31-33`

**Issue:** The `catch {}` block discards all clipboard errors without any fallback. On browsers that disallow clipboard writes outside of a user-gesture context (or where `navigator.clipboard` is absent — e.g. non-HTTPS localhost, some embedded WebViews), the copy silently fails. The button will not change to "Copied!" and the user has no way to know the copy failed or how to retrieve the caption text. The comment "silent per CopyLinkButton convention" normalises the silence, but CopyLinkButton operates in a different context (it copies a short URL that is also visible on screen). Here the caption text may not be visible in full (it is `line-clamp-3`).

**Fix:** Show the full caption in a fallback UI on failure — either a `window.prompt` fallback (accessible) or a visible error state:
```tsx
async function handleCopy(id: string, caption: string) {
  try {
    await navigator.clipboard.writeText(caption);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  } catch {
    // Fallback: let the user manually copy from a prompt
    window.prompt(t('copyManualFallback'), caption);
  }
}
```
If the project opts to keep the silent failure, the caption must always be fully visible (remove `line-clamp-3`) so users can copy it manually.

### WR-03: Download anchor has no accessible label beyond its text content; button has no `aria-label` distinguishing it from other cards

**File:** `src/app/[locale]/affiliates/dashboard/AffiliateCreativesGallery.tsx:105-121`

**Issue:** When multiple cards are rendered, all download anchors read identically as "Download" and all copy buttons read as "Copy caption" to assistive technology. Screen reader users navigating by links or buttons cannot distinguish which card each action belongs to. WCAG 2.4.6 (Headings and Labels) and 2.4.9 (Link Purpose — Link Only) require that link text be unique or supplemented with an accessible name that identifies the target.

**Fix:** Add `aria-label` to both the anchor and the button, incorporating the creative title:
```tsx
<a
  href={getDownloadUrl(row.url)}
  download={row.fileName}
  aria-label={`${t('download')} ${row.title}`}
  ...
>
  {t('download')}
</a>

<button
  type="button"
  onClick={() => handleCopy(row.id, row.caption)}
  aria-label={`${t('copyCaption')} — ${row.title}`}
  aria-pressed={copiedId === row.id}
  ...
>
  {copiedId === row.id ? t('copied') : t('copyCaption')}
</button>
```

### WR-04: `formatCents` and `formatDate` are hardcoded to `'en-US'` locale regardless of the page locale

**File:** `src/app/[locale]/affiliates/dashboard/page.tsx:24-37`

**Issue:** Both formatting helpers ignore the `locale` variable that is already resolved at the top of the page component. An affiliate browsing in `pt` or `es` will see dates formatted as "Jun 18, 2026" (US format) and currency amounts formatted with a dot decimal separator, both in the American locale. This is a i18n regression introduced when these helpers were written as module-level functions without access to the locale parameter.

**Fix:** Pass `locale` as a parameter to both helpers, or instantiate them inside the component body where `locale` is in scope:
```tsx
function formatCents(cents: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
```
Then at call sites: `formatCents(stats.pendingCents, locale)`, `formatDate(c.createdAt, locale)`.

### WR-05: `tCreatives` translation instance fetched on the server but passed as data (rows) to a client component that independently calls `useTranslations` — the server-side `tCreatives` call is dead code

**File:** `src/app/[locale]/affiliates/dashboard/page.tsx:88`

**Issue:** The server page fetches `tCreatives` at line 88 but only uses it for the section title (`tCreatives('sectionTitle')`, line 172) and empty-state text (`tCreatives('noCreatives')`, line 177). `AffiliateCreativesGallery` (a `"use client"` component) separately calls `useTranslations('AffiliateCreatives')` internally. This is the correct pattern — the client component uses `useTranslations`, not a prop. The `tCreatives` instance obtained from `getTranslations` on the server is used only for those two strings in the server-rendered wrapper, which is also correct. There is no bug here by itself.

However: the comment at line 88 implies `tCreatives` is somehow shared with the gallery component, which it cannot be (a `TFunction` is not serializable). If a future developer follows this comment and tries to pass `tCreatives` as a prop to `AffiliateCreativesGallery`, it will fail at the client boundary. The comment should be removed or clarified to avoid confusion.

**Fix:** Remove the inline comment that implies a relationship:
```tsx
// Before (line 88)
const tCreatives = await getTranslations({ locale, namespace: 'AffiliateCreatives' });

// After — no comment needed; the gallery component handles its own translations
const tCreatives = await getTranslations({ locale, namespace: 'AffiliateCreatives' });
```
(The fetch itself is correct and necessary for the two server-rendered strings. Only the implied shared-state comment is misleading.)

---

## Info

### IN-01: `es.json` — missing exclamation mark on `copied` value (minor inconsistency)

**File:** `messages/es.json:515`

**Issue:** The Spanish `AffiliateCreatives.copied` value is `"Copiado!"` while the English `AffiliateDashboard.copied` is `"Copied!"` and the Portuguese equivalent in both namespaces uses `"Copiado!"`. Independently, in `es.json` the `AffiliateDashboard.copied` is `"¡Copiado!"` (with the Spanish opening exclamation mark, line 490), while `AffiliateCreatives.copied` is `"Copiado!"` (missing the opening `¡`). The two Spanish namespaces are inconsistent with each other. This is a cosmetic issue but creates a jarring inconsistency within the same language.

**Fix:**
```json
// messages/es.json — AffiliateCreatives
"copied": "¡Copiado!"
```

### IN-02: `getDownloadUrl` is called inside `rows.map()` on every render — minor repeated computation

**File:** `src/app/[locale]/affiliates/dashboard/AffiliateCreativesGallery.tsx:106`

**Issue:** `getDownloadUrl` from `@vercel/blob` is called synchronously for each row during every render. While this is not a performance concern at typical gallery sizes (< 50 items), and `getDownloadUrl` is a pure URL transformation, the call happens unconditionally even when the download URL value cannot change between renders (the `rows` prop is immutable). This is a minor code clarity issue rather than a correctness problem — the value could be computed once in `useMemo` or at the row mapping stage.

**Fix:** No urgent action required. If the gallery grows, memoize the download URL per row or compute it in the server component before passing `rows`.

### IN-03: Video `<track>` element absent; no captions available for video creatives

**File:** `src/app/[locale]/affiliates/dashboard/AffiliateCreativesGallery.tsx:59-66` and `73-79`

**Issue:** The comment at line 96 ("Plain text; never `<track>` (D-05)") refers to the caption text field, not to video accessibility tracks. Video elements with `controls` rendered without a `<track kind="captions">` will trigger an axe / Lighthouse accessibility audit failure (`video-caption` rule). For marketing video content this may or may not be legally required depending on jurisdiction, but it will produce audit failures in most accessibility tooling. The design spec (D-05) explicitly forbids using the caption field as a `<track>`, which is correct — but this is distinct from the WCAG 1.2.2 requirement for captions on video. This is noted as Info (not Warning) because the creatives are marketing assets and may not contain spoken dialogue, but it should be tracked.

**Fix:** If videos contain dialogue or important audio, add:
```tsx
<video src={row.url} ...>
  {/* Provide a .vtt track per creative if audio content exists */}
  {row.captionTrackUrl && (
    <track kind="captions" src={row.captionTrackUrl} default />
  )}
</video>
```
Otherwise, add `aria-label={row.title}` to each `<video>` element to satisfy screen reader identification requirements at minimum.

---

_Reviewed: 2026-06-18T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
