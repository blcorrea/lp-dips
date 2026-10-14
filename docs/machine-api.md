# Machine API

Server-to-server routes for the Dips creatives machine (Python pipeline on the
Hostinger VPS). Base URL: `https://www.dipschocolate.com`.

## Auth

Every request sends:

```
Authorization: Bearer <MACHINE_API_TOKEN>
Content-Type: application/json
```

The token lives in the Vercel env var **`MACHINE_API_TOKEN`**. If it isn't set,
the routes answer `503 not_configured`.

## Errors

Every error body has this shape:

```json
{ "error": "invalid_field", "message": "captions.en is required.", "field": "captions.en" }
```

`error` is a stable code you can branch on. `message` is human-readable and may
change. `field` is only present when a specific input caused the error.

| HTTP | `error` | When |
|---|---|---|
| 400 | `invalid_json` | Body isn't a JSON object |
| 400 | `invalid_field` | A field failed validation (see `field`) |
| 401 | `unauthorized` | Missing or wrong bearer token |
| 503 | `not_configured` | `MACHINE_API_TOKEN` not set on the server |
| 500 | `internal_error` | Unexpected server error, safe to retry |

---

## POST /api/machine/creatives

Adds an approved video (or image) to the affiliate creatives library: the
"Marketing Creatives" gallery on `/{locale}/affiliates/dashboard`.

Vercel caps request bodies at about 4.5 MB, so **the file is not sent in the
body**. Send `sourceUrl` instead: an HTTPS URL the site can `GET` (for example
a short-lived signed link served by Caddy on the VPS). The route streams the
file from there into Vercel Blob. The URL only has to stay valid for the
duration of the call.

### Request

```json
{
  "sourceUrl":   "https://aprovar.72.60.137.151.sslip.io/files/2026-10-14-tue.mp4?sig=…",
  "title":       "Become a Dips creator",
  "captions": {
    "en": "Earn 15% on every sale… #ad",
    "es": "Gana un 15%…",
    "pt": "Ganhe 15%…"
  },
  "description": "Tuesday affiliate recruiting video",
  "externalId":  "machine:2026-10-14:tue",
  "fileName":    "2026-10-14-tue.mp4",
  "active":      true
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| `sourceUrl` | string | yes | Absolute `https://` URL |
| `title` | string | yes | 1–200 chars, shown on the card |
| `captions.en` | string | yes | ≤ 5000 chars. Default caption, also the fallback for es/pt |
| `captions.es` | string | no | ≤ 5000 chars. Shown to `/es` viewers |
| `captions.pt` | string | no | ≤ 5000 chars. Shown to `/pt` viewers |
| `description` | string | no | ≤ 2000 chars, admin-only note |
| `externalId` | string | no, **recommended** | 1–100 chars `[A-Za-z0-9_.:-]`. Makes the call idempotent |
| `fileName` | string | no | Download name. Defaults to the last segment of `sourceUrl` |
| `active` | boolean | no | Default `true` (visible to affiliates immediately) |

File rules:

- Video: `video/mp4`, `video/webm` or `video/quicktime`. Image: `image/jpeg`, `image/png`, `image/webp` or `image/gif`.
- The type comes from the source's `Content-Type`. When that is `application/octet-stream` or missing, it comes from the file extension instead.
- Maximum size is 200 MB, enforced while streaming.

### Responses

`201 Created`: a new creative was stored.

```json
{
  "ok": true,
  "created": true,
  "creative": {
    "id": "cmg…",
    "externalId": "machine:2026-10-14:tue",
    "title": "Become a Dips creator",
    "description": "Tuesday affiliate recruiting video",
    "type": "VIDEO",
    "mimeType": "video/mp4",
    "fileName": "2026-10-14-tue.mp4",
    "fileSize": 48213377,
    "url": "https://….public.blob.vercel-storage.com/creatives/machine/2026-10-14-tue-AbC123.mp4",
    "captions": { "en": "…", "es": "…", "pt": "…" },
    "active": true,
    "sortOrder": 12,
    "createdAt": "2026-10-14T19:02:11.000Z"
  }
}
```

`200 OK` with `"created": false`: a creative with this `externalId` already
exists. It is returned unchanged and nothing is downloaded. Retrying with the
same `externalId` is therefore always safe.

Route-specific errors:

| HTTP | `error` | When |
|---|---|---|
| 413 | `file_too_large` | Source is over 200 MB |
| 415 | `unsupported_media_type` | Source isn't an accepted video or image type |
| 502 | `source_unreachable` | The site couldn't connect to `sourceUrl` (DNS, TLS, timeout after 240 s) |
| 502 | `source_bad_status` | `sourceUrl` answered with a non-2xx status |
| 502 | `storage_failed` | Vercel Blob rejected the upload, safe to retry |

Editing or removing a creative stays in the admin UI (`/admin/creatives`).
