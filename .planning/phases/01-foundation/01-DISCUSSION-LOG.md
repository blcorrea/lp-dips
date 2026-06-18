# Phase 1: Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-17
**Phase:** 1-Foundation
**Areas discussed:** Accepted formats & size, Blob path organization

---

## Gray-area selection

Presented: Accepted formats & size · Video poster/thumbnail · Blob path organization (multiSelect).
User selected **Accepted formats & size** and **Blob path organization**. Video poster left to Claude's discretion.

---

## Accepted formats & size

### Image formats

| Option | Description | Selected |
|--------|-------------|----------|
| jpg, png, webp, gif | Covers photos + animated GIFs | ✓ |
| jpg, png, webp | No GIF, leaner | |
| Any image | Accept any image/* | |

**User's choice:** jpg, png, webp, gif

### Video formats

| Option | Description | Selected |
|--------|-------------|----------|
| mp4, webm, mov | Phone exports (mov) + web | ✓ |
| mp4, webm | Web-compatible only | |
| mp4 only | Maximum compatibility, one format | |

**User's choice:** mp4, webm, mov

### Max file size

| Option | Description | Selected |
|--------|-------------|----------|
| 200 MB | Comfortable for short high-quality video | ✓ |
| 100 MB | More conservative | |
| 500 MB | Very permissive | |

**User's choice:** 200 MB

**Notes:** Limits become exported constants in `creatives.ts`; enforcement happens in the Phase 2 upload layer.

---

## Blob path organization

| Option | Description | Selected |
|--------|-------------|----------|
| creatives/<id>/<file> | Folder per creative (asset + thumbnail together) | ✓ |
| creatives/<id>-<file> | Flat with id prefix | |
| Random Blob path | Let @vercel/blob generate pathname | |

**User's choice:** creatives/<id>/<filename>

**Notes:** Both `blobPath` and `thumbnailBlobPath` persisted so delete removes asset + poster. Hard delete; `active=false` is separate soft-hide.

---

## Claude's Discretion

- Video poster/thumbnail: optional manual upload only, no ffmpeg auto-generation this milestone (`thumbnailUrl`/`thumbnailBlobPath` stay nullable).
- Constant names, helper signatures, and migration internals — left to planner/executor, must match `affiliates.ts` conventions.

## Deferred Ideas

- Automatic video poster generation (ffmpeg/serverless transcode) — future.
- Download analytics, categories/tags, drag-and-drop reorder — already v2 in REQUIREMENTS.md.
