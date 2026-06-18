# Phase 3: Affiliate Gallery & i18n - Research

**Researched:** 2026-06-18
**Domain:** Next.js 15 server component extension, @vercel/blob download API, next-intl i18n, cross-origin download
**Confidence:** HIGH (all critical findings verified directly from installed packages and codebase)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01:** Video cards render an inline, playable `<video>` element (not poster-only).
**D-02:** Click-to-play with native controls — `preload="none"` or `"metadata"`, never autoplay.
**D-03:** "Copiar legenda" button appears only when `caption` is non-empty; 2s copied confirmation.
**D-04:** Caption text shown on card (line-clamped 2-3 lines) when non-empty.
**D-05:** "legenda"/"caption" = the ready-to-post social text the admin typed — NOT video subtitles.
**D-06:** Download ALWAYS saves to device — must never open preview tab.
**D-07 (to be confirmed by research — see below):** Primary: `@vercel/blob` `getDownloadUrl` / `?download=1` param. Fallback: `fetch → blob → objectURL → a.download`.
**D-08:** "Criativos" section at the bottom of the dashboard (below commission history).
**D-09:** Grid: 1 col mobile → 2 col tablet → 3 col desktop (not the admin's denser grid).
**D-10:** Glassmorphism styling: `rounded-2xl bg-white/10 backdrop-blur-sm` over brand-purple gradient.
**D-11:** New `AffiliateCreatives` next-intl namespace in en/es/pt.

### Claude's Discretion

- New `"use client"` component name, file location under `dashboard/`, and decomposition.
- Exact translation copy for each string.
- Card spacing, aspect ratio of the media frame, badge styling.
- Whether type badge is localized labels or icon-only (recommend localized per I18N-01).
- Exact `preload` value and lazy-loading mechanism for videos.

### Deferred Ideas (OUT OF SCOPE)

- Download/usage analytics (ANLY-01/02) — v2.
- Categories/tags/folders and per-affiliate creative visibility — v2.
- Muted autoplay video previews — rejected.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AFFL-01 | Logged-in affiliate sees "Criativos" section rendered as glassmorphism card grid | Dashboard extension pattern confirmed; `listCreatives({ activeOnly: true })` returns the exact data shape needed |
| AFFL-02 | Affiliate can download a creative file | `getDownloadUrl(blobUrl)` appends `?download=1` forcing `Content-Disposition: attachment`; confirmed in installed `@vercel/blob@2.4.0` |
| AFFL-03 | Affiliate can copy caption to clipboard with "copied" confirmation | `CopyLinkButton.tsx` is the exact template; clipboard API + 2s state reset pattern already proven in production |
| AFFL-04 | Empty state shown when no active creatives exist | Inline empty-state pattern already used in commission history block of the same page |
| AFFL-05 | Only active creatives shown, ordered by `sortOrder` | `listCreatives({ activeOnly: true })` already filters and orders; no new query needed |
| I18N-01 | New `AffiliateCreatives` namespace in en/es/pt messages files | next-intl 4.5.8; `getTranslations`/`useTranslations` pattern confirmed; exact key set and copy determined below |
</phase_requirements>

---

## Summary

Phase 3 extends an existing server component page (`src/app/[locale]/affiliates/dashboard/page.tsx`) with a "Criativos" section that renders the active creative library as a glassmorphism card grid. The data layer is complete (Phase 1) and the admin management surface is complete (Phase 2) — this phase is purely additive UI work.

The two technically non-trivial elements are the cross-origin download mechanism and video lazy-loading in a grid. Both have confirmed solutions in the installed codebase. `@vercel/blob@2.4.0` exports `getDownloadUrl(blobUrl: string): string`, which appends `?download=1` to the CDN URL. The Vercel Blob CDN serves this with `Content-Disposition: attachment`, forcing a save-to-disk in every major browser without buffering the file in memory. This is the correct primary path for both images and large videos (up to 200MB); no proxy and no `fetch → objectURL` memory risk required.

The integration pattern follows the established server-first, small-client-island architecture already used by `CopyLinkButton` and `LogoutButton`: the dashboard server component fetches `CreativeRow[]`, passes the serialized array as a prop to a single new `"use client"` gallery component, and that component handles all interactivity (download click, copy caption, video play). No new API route is needed.

**Primary recommendation:** Create `AffiliateCreativesGallery.tsx` under `src/app/[locale]/affiliates/dashboard/`, import `getDownloadUrl` from `@vercel/blob`, mirror the `CopyLinkButton` copy-with-confirmation pattern, use `<video preload="none" poster={thumbnailUrl} controls>` for video cards, and add the `AffiliateCreatives` namespace to all three messages files.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Fetch active creatives | Frontend Server (SSR) | — | Dashboard is a server component; reads DB directly via `listCreatives`; no API round-trip |
| Render gallery grid | Frontend Server (SSR) | Client (interactivity) | Static structure server-rendered; download/copy/video-play delegated to client island |
| Cross-origin file download | Browser / Client | CDN edge (Content-Disposition) | `getDownloadUrl` produces a URL; browser initiates the save; CDN header forces attachment |
| Copy caption to clipboard | Browser / Client | — | `navigator.clipboard.writeText` is a browser API; must be in `"use client"` component |
| Video in-card playback | Browser / Client | — | HTML `<video>` with native controls is a client DOM element |
| i18n namespace | Frontend Server (SSR) | Client | `getTranslations` for server strings; `useTranslations` in client component |
| Auth gate | Frontend Server (SSR) + Middleware | — | Edge middleware checks cookie presence; server component re-verifies session |

---

## Standard Stack

### Core (already installed — no new dependencies)

| Library | Installed Version | Purpose | Role in Phase 3 |
|---------|------------------|---------|-----------------|
| `@vercel/blob` | 2.4.0 [VERIFIED: npm view + node_modules inspection] | Blob storage client | `getDownloadUrl(url)` for forced download |
| `next-intl` | 4.5.8 [VERIFIED: package.json] | i18n | `getTranslations` (server) + `useTranslations` (client) for `AffiliateCreatives` namespace |
| `next` (Image) | 15.3.6 [VERIFIED: package.json] | Image optimization | `<Image>` for IMAGE creatives and VIDEO poster thumbnails (already configured for blob domain) |
| React | 19.0.0 [VERIFIED: package.json] | UI | `useState` for copied/download state in client component |

**No new packages are needed.** This phase installs nothing new.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `getDownloadUrl` (CDN header) | `fetch → blob → objectURL → a.click()` | The fetch approach buffers the entire file in browser memory — catastrophic for 200MB videos; the CDN header approach streams directly to disk with zero memory overhead. Always use `getDownloadUrl` for this project. |
| Native `<video controls>` | React video player library (e.g., `react-player`) | Library adds bundle weight; native `<video>` with `preload="none"` is sufficient for click-to-play preview — no looping, no autoplay, no custom chrome needed. |
| Inline `<video src={url}>` directly | Proxy route that adds headers | Direct blob URL works in `<video>` tags because the browser reads the stream; no cross-origin restriction on media src (only on download attribute). |

---

## Package Legitimacy Audit

> No new packages are installed in this phase. All libraries used (`@vercel/blob`, `next-intl`, `next/image`) are already installed and were vetted in prior phases.

**Packages removed due to SLOP verdict:** none
**Packages flagged as suspicious SUS:** none

---

## Architecture Patterns

### System Architecture Diagram

```
Affiliate browser → /{locale}/affiliates/dashboard (server component)
                         │
                         ├── getAffiliateSessionId() [cookie → session check]
                         ├── getAffiliateDashboardData(sessionId) [affiliate + stats]
                         └── listCreatives({ activeOnly: true }) [CreativeRow[]]
                                  │
                                  ▼
                    <AffiliateCreativesGallery rows={creatives} />  ["use client"]
                         │
                         ├── IMAGE card
                         │     ├── <Image src={row.url} fill …>
                         │     ├── Download button → getDownloadUrl(row.url) → <a href download>
                         │     └── Copy button (if caption) → navigator.clipboard + "Copiado"
                         │
                         └── VIDEO card
                               ├── <video src={row.url} poster={row.thumbnailUrl} preload="none" controls>
                               ├── Download button → getDownloadUrl(row.url) → <a href download>
                               └── Copy button (if caption) → navigator.clipboard + "Copiado"
                                        │
                                        ▼
                             CDN: *.public.blob.vercel-storage.com
                             (download=1 → Content-Disposition: attachment)
```

### Recommended Project Structure

No new directories needed. New files land alongside existing dashboard client islands:

```
src/app/[locale]/affiliates/dashboard/
├── page.tsx                        # (existing) — add listCreatives call + section JSX
├── CopyLinkButton.tsx              # (existing) — template to mirror
├── LogoutButton.tsx                # (existing) — sibling pattern reference
└── AffiliateCreativesGallery.tsx   # (NEW) "use client" gallery + per-card download/copy

messages/
├── en.json                         # (edit) add AffiliateCreatives namespace
├── es.json                         # (edit) add AffiliateCreatives namespace
└── pt.json                         # (edit) add AffiliateCreatives namespace
```

### Pattern 1: getDownloadUrl for cross-origin forced save

**What:** Vercel Blob CDN supports a `?download=1` query param that causes it to serve the blob with `Content-Disposition: attachment; filename="<filename>"`. `getDownloadUrl(blobUrl)` is the SDK helper that appends this param. The result is a plain HTTPS URL that can be used as an `<a href>` target with `download` attribute — or opened in a new tab — and the browser will save it to disk regardless of content type.

**When to use:** All download actions in this phase. Works for images (JPEG, PNG, WebP, GIF) and all video sizes up to 200MB without buffering in browser memory.

**Verified API** [VERIFIED: node_modules/@vercel/blob/dist/chunk-3D2SZ6M2.js + .d.ts]:

```typescript
// From @vercel/blob TypeScript declarations:
// function getDownloadUrl(blobUrl: string): string
// Appends ?download=1 to the Vercel Blob CDN URL.
// CDN responds with Content-Disposition: attachment.

import { getDownloadUrl } from '@vercel/blob';

// Inside a client component's download handler:
function handleDownload(url: string, fileName: string) {
  const downloadHref = getDownloadUrl(url);
  const a = document.createElement('a');
  a.href = downloadHref;
  a.download = fileName;  // suggests filename; CDN Content-Disposition also carries it
  a.click();
}
```

**Why not `<a href={getDownloadUrl(url)} download>` directly in JSX?**
An anchor with `download` still requires same-origin OR the server sends `Content-Disposition: attachment`. With `getDownloadUrl`, the CDN header is always present, so a direct anchor `<a href={getDownloadUrl(row.url)} download={row.fileName} target="_blank">` also works and avoids the `document.createElement` dance.

**For large videos:** The CDN streams the file to disk — the browser never loads it into memory. Safe for the 200MB max.

**Fallback path (only if getDownloadUrl unexpectedly fails — extremely unlikely):**

```typescript
// fetch → blob → objectURL: DO NOT use for videos — 200MB in browser memory
// Use this path ONLY for files you know are small (< 10MB images)
async function downloadViaFetch(url: string, fileName: string) {
  const res = await fetch(getDownloadUrl(url));  // still use download=1 to get headers
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(objectUrl);
}
```

**Verdict on D-07:** The recommended primary path is confirmed. `@vercel/blob@2.4.0` exports `getDownloadUrl`. A simple `<a href={getDownloadUrl(row.url)} download={row.fileName}>` anchor is sufficient for all file types and sizes. No proxy, no fetch-into-memory fallback required.

### Pattern 2: Video card with lazy preloading

**What:** HTML `<video>` with `preload="none"` loads no data until the user explicitly interacts. Combined with `poster={thumbnailUrl}` (or placeholder icon if absent), the card shows a still frame at zero network cost until play is clicked.

**When to use:** All VIDEO type `CreativeRow` items. Grid of potentially many videos — `preload="none"` is the correct default.

**Pattern** [ASSUMED — standard HTML spec; confirmed by MDN preload attribute]:

```tsx
{row.type === 'VIDEO' && (
  <video
    src={row.url}
    poster={row.thumbnailUrl ?? undefined}
    controls
    preload="none"
    className="w-full aspect-video object-cover rounded-t-2xl bg-black"
  >
    {/* No <source> needed — src attribute is sufficient for mp4/webm */}
  </video>
)}
```

**Note:** `next/image` is NOT used for video elements — it only handles `<img>`. The video URL comes directly from `row.url` (a `*.public.blob.vercel-storage.com` HTTPS URL). No cross-origin restriction applies to `<video src>` — only `<a download>` on cross-origin is restricted, which is solved by `getDownloadUrl`.

### Pattern 3: Mirror CopyLinkButton for caption copy

**What:** Exact same pattern as the existing `CopyLinkButton` — `navigator.clipboard.writeText`, `copied` boolean state with `setTimeout` reset after 2000ms.

**Direct template** [VERIFIED: src/app/[locale]/affiliates/dashboard/CopyLinkButton.tsx]:

```tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface CopyCaptionButtonProps {
  caption: string;
}

export default function CopyCaptionButton({ caption }: CopyCaptionButtonProps) {
  const t = useTranslations('AffiliateCreatives');
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API failure — silent per CopyLinkButton convention
    }
  }

  return (
    <button type="button" onClick={handleCopy} /* glassmorphism styling */>
      {copied ? t('copied') : t('copyCaption')}
    </button>
  );
}
```

This can be inlined inside `AffiliateCreativesGallery.tsx` rather than a separate file (planner's call).

### Pattern 4: next-intl server + client split

**What:** The dashboard `page.tsx` calls `getTranslations({ locale, namespace: 'AffiliateDashboard' })` server-side. The new gallery section needs translations in both server context (section title, empty state rendered by the server component) and client context (copy/download button labels rendered in the client component).

**How it works in this codebase** [VERIFIED: src/app/[locale]/affiliates/dashboard/page.tsx, src/app/[locale]/affiliates/dashboard/CopyLinkButton.tsx]:

- Server component: `const tCreatives = await getTranslations({ locale, namespace: 'AffiliateCreatives' });`
- Client component: `const t = useTranslations('AffiliateCreatives');`

The server component can use the new namespace for the section heading and empty state text. The client gallery component uses `useTranslations`. Both read from the same `AffiliateCreatives` namespace in `messages/*.json`.

**Adding a new namespace:** Only requires adding the JSON block to all three message files. No registration step, no config change needed — next-intl discovers namespaces from the JSON files dynamically.

### Pattern 5: Dashboard extension (server component)

**What:** The dashboard `page.tsx` ends with the commission history block. The new section is appended after it.

**How:** Call `listCreatives({ activeOnly: true })` in the same `async` function body as the existing `getAffiliateDashboardData` call, then render `<AffiliateCreativesGallery>` below the commission history `<div>`.

**Verified shape** [VERIFIED: src/lib/creatives.ts]:

```typescript
// listCreatives returns:
type CreativeRow = {
  id: string;
  title: string;
  description: string | null;
  caption: string | null;       // null = no caption; hide copy button
  type: CreativeType;           // 'IMAGE' | 'VIDEO'
  url: string;                  // CDN URL — pass to getDownloadUrl() for download
  blobPath: string;
  thumbnailUrl: string | null;  // VIDEO poster; can be null → show icon
  thumbnailBlobPath: string | null;
  fileName: string;             // use as download filename suggestion
  fileSize: number;
  mimeType: string;
  sortOrder: number;
  active: boolean;              // always true when activeOnly: true
  createdAt: string;
  updatedAt: string;
};
```

The `active` field will always be `true` in the affiliate gallery because `listCreatives({ activeOnly: true })` filters to active rows only.

### Anti-Patterns to Avoid

- **`fetch → blob → URL.createObjectURL` for video download:** Loads the entire file into browser memory — catastrophic for 200MB videos. Always use `getDownloadUrl` (CDN header approach).
- **`<a href={row.url} download>` without `getDownloadUrl`:** Cross-origin URLs ignore the `download` attribute — the browser opens the file in a preview tab instead of saving it. Must append `?download=1` via `getDownloadUrl`.
- **`autoplay` on `<video>`:** Rejected in D-02. Do not add `autoplay` or `muted autoplay` for any reason.
- **Rendering `<Image>` for a VIDEO card's media frame:** Use `<Image>` only for IMAGE type and for the poster thumbnail in admin preview; the affiliate gallery's VIDEO card must render `<video>` with `src={row.url}`, not a static image.
- **New API route for gallery data:** Explicitly out of scope in REQUIREMENTS.md. The dashboard server component reads creatives directly.
- **Importing from `@/lib/creatives.ts` in a client component:** `creatives.ts` imports `prisma` and `@vercel/blob/del` — server-only modules. The gallery client component receives `CreativeRow[]` as a serialized prop from the server component; it never imports `creatives.ts` directly.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Force-download cross-origin file | Custom proxy route or fetch+objectURL | `getDownloadUrl(url)` from `@vercel/blob` | CDN header approach; zero memory overhead; works for 200MB video; already installed |
| Clipboard write with confirmation | Raw `document.execCommand('copy')` | `navigator.clipboard.writeText` (already in `CopyLinkButton.tsx`) | Modern async API; error-safe; established pattern in the codebase |
| i18n string lookup | String constants or prop drilling | `useTranslations('AffiliateCreatives')` / `getTranslations` | Same namespace mechanism used everywhere in the project |
| Video lazy loading | IntersectionObserver + dynamic src | `preload="none"` on `<video>` | Native browser attribute; simpler; achieves the same goal |

**Key insight:** Every problem in this phase has an established solution already in the installed toolchain. The work is integration, not infrastructure.

---

## Common Pitfalls

### Pitfall 1: Cross-origin download falls back to preview tab

**What goes wrong:** Developer uses `<a href={row.url} download={row.fileName}>` directly. On Safari and Chrome, a cross-origin URL ignores the `download` attribute — the browser navigates to or previews the file instead of saving it.

**Why it happens:** The HTML spec only triggers save-to-disk for `download` on same-origin URLs or when the server sends `Content-Disposition: attachment`. Vercel Blob CDN URLs are a different origin (`*.public.blob.vercel-storage.com`).

**How to avoid:** Always call `getDownloadUrl(row.url)` before building the anchor. The resulting URL has `?download=1`, which causes Vercel's CDN to add `Content-Disposition: attachment`.

**Warning signs:** During manual testing, clicking Download opens the file in a new browser tab instead of triggering a save dialog.

### Pitfall 2: Importing creatives.ts into a client component

**What goes wrong:** `AffiliateCreativesGallery.tsx` tries to call `listCreatives()` directly, causing build error: "Module not found: Can't resolve 'pg'" or similar server-only module errors.

**Why it happens:** `creatives.ts` imports `prisma` (which transitively imports `pg`) and `@vercel/blob` — both server-only. Next.js 15 will refuse to bundle them into a client component.

**How to avoid:** The server component (`page.tsx`) calls `listCreatives`, serializes the result as `CreativeRow[]`, and passes it as a prop. The gallery component only receives the typed array.

### Pitfall 3: Large video buffered in `fetch → objectURL` fallback

**What goes wrong:** Developer adds a `fetch(url).then(res => res.blob())` download path as a "safe fallback." A 200MB video blocks the main thread and may crash the tab on low-memory devices.

**Why it happens:** `blob()` reads the entire response body into memory before creating an objectURL.

**How to avoid:** Do not add a `fetch → objectURL` fallback for this use case. `getDownloadUrl` handles all file types and sizes. The CDN streams the file directly to disk.

### Pitfall 4: Caption field confused with video subtitles

**What goes wrong:** Developer renders a `<track>` element or subtitle overlay using `row.caption`, thinking it contains timed subtitle data.

**Why it happens:** The word "legenda" in Brazilian Portuguese means both "caption" (social media context) and "subtitle" (video context). D-05 clarifies the distinction explicitly.

**How to avoid:** `row.caption` is the ready-to-post social text (hashtags, call-to-action, link) typed by the admin. It is plain text, not VTT/SRT. Render it in a `<p>` element (line-clamped), never as a `<track>` or video overlay.

### Pitfall 5: Missing `AffiliateCreatives` namespace in one of the three message files

**What goes wrong:** Phase ships with the namespace in `pt.json` but not `en.json` or `es.json`. The English or Spanish affiliate dashboard crashes with a next-intl "Missing message: AffiliateCreatives.title" error.

**Why it happens:** Easy to forget one file when adding namespace manually.

**How to avoid:** Update all three files in the same commit. The acceptance criterion I18N-01 explicitly requires all three.

---

## i18n Keys: AffiliateCreatives Namespace

The complete key set and recommended copy, following the `AffiliateDashboard` namespace conventions [VERIFIED: messages/pt.json AffiliateDashboard section]:

### English (en.json)

```json
"AffiliateCreatives": {
  "sectionTitle": "Marketing Creatives",
  "photoLabel": "Photo",
  "videoLabel": "Video",
  "download": "Download",
  "copyCaption": "Copy caption",
  "copied": "Copied!",
  "noCreatives": "No creatives available yet. Check back soon."
}
```

### Spanish (es.json)

```json
"AffiliateCreatives": {
  "sectionTitle": "Creativos",
  "photoLabel": "Foto",
  "videoLabel": "Video",
  "download": "Descargar",
  "copyCaption": "Copiar leyenda",
  "copied": "Copiado!",
  "noCreatives": "Todavía no hay creativos disponibles. Vuelve pronto."
}
```

### Portuguese/pt.json (canonical — matches CONTEXT.md D-11)

```json
"AffiliateCreatives": {
  "sectionTitle": "Criativos",
  "photoLabel": "Foto",
  "videoLabel": "Vídeo",
  "download": "Baixar",
  "copyCaption": "Copiar legenda",
  "copied": "Copiado!",
  "noCreatives": "Nenhum criativo disponível ainda. Volte em breve."
}
```

**Key naming rationale:**
- `sectionTitle` — matches heading keys in `AffiliateDashboard` (e.g., `commissionsTitle`)
- `photoLabel` / `videoLabel` — matches `colDate`/`colOrder` label key pattern
- `download` — short imperative verb (matches `copy`, `logout` in the same namespace)
- `copyCaption` — matches `copy` / `copied` pattern (imperative verb)
- `copied` — same key name used in `AffiliateDashboard.copied` for the link copy (D-11: parallel conventions)
- `noCreatives` — matches `noCommissions` pattern for empty state

---

## Code Examples

### Full download button pattern

```tsx
// Source: @vercel/blob@2.4.0 type declarations + verified function implementation
import { getDownloadUrl } from '@vercel/blob';

// Option A — simple anchor (preferred; no JS handler needed)
<a
  href={getDownloadUrl(row.url)}
  download={row.fileName}
  className="..."
>
  {t('download')}
</a>

// Option B — programmatic (for styled button that is not an anchor)
function handleDownload() {
  const a = document.createElement('a');
  a.href = getDownloadUrl(row.url);
  a.download = row.fileName;
  a.click();
}
```

Option A is preferred — it avoids the `document.createElement` dance and works with keyboard navigation and right-click "Save link as".

### Dashboard extension (page.tsx additions)

```tsx
// Source: src/app/[locale]/affiliates/dashboard/page.tsx (verified structure)
// Add to the imports:
import { listCreatives } from '@/lib/creatives';
import AffiliateCreativesGallery from './AffiliateCreativesGallery';

// Add inside the async page function, after getAffiliateDashboardData:
const creatives = await listCreatives({ activeOnly: true });
const tCreatives = await getTranslations({ locale, namespace: 'AffiliateCreatives' });

// Add at the bottom of the <div className="mx-auto max-w-4xl space-y-8"> block:
<div className="rounded-2xl bg-white/10 backdrop-blur-sm overflow-hidden">
  <div className="px-6 py-4 border-b border-white/10">
    <h2 className="text-white font-semibold text-[16px]">{tCreatives('sectionTitle')}</h2>
  </div>
  {creatives.length === 0 ? (
    <p className="px-6 py-10 text-center text-white/40 text-sm">
      {tCreatives('noCreatives')}
    </p>
  ) : (
    <div className="p-6">
      <AffiliateCreativesGallery rows={creatives} />
    </div>
  )}
</div>
```

### AffiliateCreativesGallery.tsx skeleton

```tsx
// "use client"
// Source: CopyLinkButton.tsx pattern (verified) + CreativesGrid.tsx media logic (verified)
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { getDownloadUrl } from '@vercel/blob';
import Image from 'next/image';
import { Video } from 'lucide-react';
import type { CreativeRow } from '@/lib/creatives';

export default function AffiliateCreativesGallery({ rows }: { rows: CreativeRow[] }) {
  const t = useTranslations('AffiliateCreatives');
  // copiedId tracks which card's caption was just copied (null = none)
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleCopy(id: string, caption: string) {
    try {
      await navigator.clipboard.writeText(caption);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch { /* silent */ }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {rows.map((row) => (
        <div key={row.id} className="rounded-2xl bg-white/10 backdrop-blur-sm overflow-hidden flex flex-col">
          {/* ── Media frame ── */}
          <div className="relative aspect-video w-full bg-black/20">
            {row.type === 'IMAGE' ? (
              <Image src={row.url} alt={row.title} fill className="object-cover" sizes="..." />
            ) : row.thumbnailUrl ? (
              <video src={row.url} poster={row.thumbnailUrl} controls preload="none"
                className="w-full h-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Video className="w-10 h-10 text-white/40" />
                <video src={row.url} controls preload="none" className="absolute inset-0 w-full h-full opacity-0" />
              </div>
            )}
            {/* Type badge */}
            <span className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs bg-black/50 text-white">
              {row.type === 'IMAGE' ? t('photoLabel') : t('videoLabel')}
            </span>
          </div>
          {/* ── Card body ── */}
          <div className="p-4 flex flex-col gap-3 flex-1">
            <p className="text-white font-semibold text-sm">{row.title}</p>
            {row.caption && (
              <p className="text-white/60 text-xs line-clamp-3">{row.caption}</p>
            )}
            <div className="mt-auto flex gap-2 flex-wrap">
              {/* Download — anchor, not button, so keyboard+right-click work */}
              <a href={getDownloadUrl(row.url)} download={row.fileName}
                className="rounded-xl bg-brand-orange px-4 py-2 text-xs font-bold text-brand-purple">
                {t('download')}
              </a>
              {/* Copy caption — only when caption exists */}
              {row.caption && (
                <button type="button" onClick={() => handleCopy(row.id, row.caption!)}
                  className="rounded-xl border border-white/20 px-4 py-2 text-xs font-bold text-white">
                  {copiedId === row.id ? t('copied') : t('copyCaption')}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Note on video-without-poster:** The skeleton shows an approach where the play icon is visible and the `<video>` element sits underneath (opacity-0). An alternative is a pure play-icon div with an `onClick` that reveals the video. Both work; the planner/executor decides.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `<a download>` on cross-origin | `getDownloadUrl` + `?download=1` CDN param | @vercel/blob v2+ | Correct forced-save for cross-origin blobs without proxy |
| next-intl `useIntl().formatMessage()` | `useTranslations('Namespace')` | next-intl v3+ | Direct key access, no ICU string needed for simple strings |
| `preload="auto"` on grid videos | `preload="none"` + poster | Always best practice for grids | Prevents simultaneous bandwidth hammering of all video cards |

**Deprecated/outdated:**

- `document.execCommand('copy')`: Synchronous clipboard API deprecated in all modern browsers. Use `navigator.clipboard.writeText` (already the pattern in `CopyLinkButton.tsx`).
- `downloadUrl` property on `PutBlobResult`: The `put()` result includes a `downloadUrl` field. However, for the gallery case where blobs were uploaded in prior phases, only the `url` field is stored in the database. Use `getDownloadUrl(row.url)` to derive the download URL at render time — do not expect `downloadUrl` in `CreativeRow` (it is not in the type).

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `preload="none"` on `<video>` is the correct lazy-loading mechanism for Next.js 15 — no framework-level wrapper needed | Code Examples | Low — this is standard HTML; no Next.js override exists for video elements |
| A2 | Vercel CDN will serve `Content-Disposition: attachment` for all blob MIME types (JPEG, PNG, WebP, GIF, MP4, WebM, MOV) when `?download=1` is present | Standard Stack (getDownloadUrl) | Medium — if a MIME type is excluded, that download falls back to preview; verify with one image and one video in UAT |
| A3 | The `video-without-poster` case can render the `<video>` element alongside a placeholder icon (opacity approach or toggle) | Code Examples | Low — both approaches render the video; placeholder is cosmetic only |

---

## Open Questions

1. **Video-without-poster layout (planner's discretion)**
   - What we know: Some VIDEO creatives may have `thumbnailUrl: null` (admin did not upload a poster).
   - What's unclear: Whether to show a pure icon placeholder and require a click to reveal the `<video>`, or render the `<video>` at full opacity immediately (which shows a blank black frame until play is pressed).
   - Recommendation: Show `<Video>` icon as placeholder + `<video>` hidden, clicking the icon replaces it with the video element. The admin grid uses the same placeholder-icon approach. This keeps the grid visually consistent when posters are missing.

2. **`copiedId` vs separate `copied` boolean per card**
   - What we know: `CopyLinkButton` uses a single `copied` boolean because it's one card. The gallery is multi-card.
   - What's unclear: Whether to track `copiedId: string | null` (one state atom for all cards) or lift `CopyCaptionButton` into its own component with local state per card.
   - Recommendation: Single `copiedId` atom in the gallery component — simpler state, naturally only one card can be "copied" at a time.

---

## Environment Availability

> Skipped — this phase installs no new packages and has no new external dependencies. All libraries are already installed and operational (confirmed in Phase 1 and Phase 2 UAT).

---

## Security Domain

> `security_enforcement: true` in config. ASVS Level 1 applies.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes (auth gate) | Existing: `getAffiliateSessionId()` + middleware cookie check — no change needed |
| V3 Session Management | no | Session lifecycle unchanged; no new session logic |
| V4 Access Control | yes | `listCreatives({ activeOnly: true })` called inside the already-auth-gated server component; no public API endpoint |
| V5 Input Validation | no | Phase 3 reads data only; no user input is written to the database |
| V6 Cryptography | no | No new crypto operations |

### Known Threat Patterns for this Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Unauthenticated affiliate gallery access | Spoofing / Elevation of privilege | Middleware redirects unauthenticated requests before server component runs; `getAffiliateSessionId()` also checks in server component body |
| Malicious blob URL in `row.url` (admin-injected) | Tampering | Blobs are uploaded by admins who are already authenticated; no user-supplied URLs; `getDownloadUrl` only appends a query param — no re-routing |
| XSS via `row.caption` rendered in JSX | XSS | React escapes JSX string content by default; `{row.caption}` in a `<p>` is safe |
| Clipboard hijack via `navigator.clipboard.writeText` | Information Disclosure | The caption is admin-authored marketing text, not a secret; clipboard write is user-initiated (click handler) |
| Admin uploads malware disguised as image/video | Tampering | Out of scope for Phase 3 (admin MIME validation is Phase 2's responsibility); Phase 3 only reads and links, never executes uploaded content |

**Security summary:** Phase 3 is read-only from the affiliate's perspective. The primary security surface is the auth gate (already established) and ensuring the gallery is only reachable by authenticated affiliates (already guaranteed by middleware + server component guard). No new attack surface is introduced.

---

## Sources

### Primary (HIGH confidence — direct codebase inspection)

- `node_modules/@vercel/blob/dist/chunk-3D2SZ6M2.js` — `getDownloadUrl` function implementation: appends `?download=1`
- `node_modules/@vercel/blob/dist/create-folder-DFjrvss1.d.ts` — TypeScript signature: `function getDownloadUrl(blobUrl: string): string`
- `node_modules/@vercel/blob/dist/index.js` — confirmed `getDownloadUrl` is a named export (v2.4.0 installed)
- `src/app/[locale]/affiliates/dashboard/page.tsx` — server component structure, `getTranslations` usage, commission history empty-state pattern
- `src/app/[locale]/affiliates/dashboard/CopyLinkButton.tsx` — clipboard copy + 2s confirmation pattern
- `src/app/[locale]/affiliates/dashboard/LogoutButton.tsx` — sibling `"use client"` component under dashboard/
- `src/lib/creatives.ts` — `CreativeRow` type definition, `listCreatives` function signature and behavior
- `src/lib/creatives-constants.ts` — accepted MIME types, MAX_CREATIVE_BYTES
- `src/app/admin/creatives/CreativesGrid.tsx` — media preview pattern (IMAGE vs VIDEO poster vs placeholder icon)
- `messages/pt.json` — `AffiliateDashboard` namespace — key naming conventions, PT translations
- `messages/es.json` — ES translations for parity
- `next.config.mjs` — `**.public.blob.vercel-storage.com` in `images.remotePatterns` (confirmed Phase 1)
- `src/i18n/request.ts` — next-intl config: dynamic import from `messages/${locale}.json`
- `src/i18n/routing.ts` — supported locales: `['en', 'es', 'pt']`
- `src/middleware.ts` — affiliate auth gate: cookie presence check + redirect to login
- `.planning/config.json` — `nyquist_validation: false`, `security_enforcement: true`

### Secondary (MEDIUM confidence — documented behavior)
- `@vercel/blob` PutBlobResult.downloadUrl JSDoc: "A URL that will cause browsers to download the file instead of displaying it inline" — confirms CDN behavior

### Tertiary (LOW confidence — assumed)
- HTML spec `preload="none"` behavior for grids — standard browser behavior, not verified by running a test

---

## Metadata

**Confidence breakdown:**
- Download mechanism: HIGH — verified directly from installed package source and type declarations
- Standard stack: HIGH — all libraries confirmed present and at documented versions
- Architecture: HIGH — verified against actual server component and client island files
- i18n patterns: HIGH — verified from actual `request.ts`, `routing.ts`, and existing dashboard usage
- i18n copy/translations: MEDIUM — Spanish and Portuguese copy are planner's best judgment; should be reviewed by a native speaker
- Video lazy loading: MEDIUM — standard HTML, but not run against the actual app

**Research date:** 2026-06-18
**Valid until:** 2026-07-18 (stable tech; `@vercel/blob` and `next-intl` APIs are stable)
