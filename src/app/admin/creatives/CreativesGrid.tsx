'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CreativeRow } from '@/lib/creatives';
import {
  ACCEPTED_IMAGE_MIME,
  ACCEPTED_VIDEO_MIME,
  MAX_CREATIVE_BYTES,
} from '@/lib/creatives-constants';
import { upload } from '@vercel/blob/client';
import Image from 'next/image';
import { Video } from 'lucide-react';

// ── Shared input styles (verbatim from AffiliatesTable, label uses font-bold per UI-SPEC) ──

const inputCls =
  'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 ' +
  'placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 ' +
  'focus:ring-blue-500';

const labelCls = 'block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1';

// ── Component ─────────────────────────────────────────────────────────────────

export default function CreativesGrid({ rows }: { rows: CreativeRow[] }) {
  const router = useRouter();

  const [busyId, setBusyId]           = useState<string | null>(null);
  // WR-03: a reorder mutates TWO rows (the clicked card and its neighbor), so
  // disabling only busyId === row.id leaves the neighbor's ▲/▼ clickable and
  // allows an overlapping swap (lost update). Track reorder-in-flight separately
  // and disable ALL reorder controls while a swap is pending.
  const [reordering, setReordering]   = useState(false);
  const [notice, setNotice]           = useState<{ ok: boolean; msg: string } | null>(null);
  const [showCreate, setShowCreate]   = useState(false);
  const [editingId, setEditingId]     = useState<string | null>(null);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);

  // Create form state
  const [form, setForm]         = useState({ title: '', description: '', caption: '' });
  const [assetFile, setAssetFile]   = useState<File | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);

  // Edit form state (per-card)
  const [editForm, setEditForm] = useState({ title: '', description: '', caption: '', active: true });

  // ── Helpers ───────────────────────────────────────────────────────────────

  function flash(ok: boolean, msg: string) {
    setNotice({ ok, msg });
    setTimeout(() => setNotice(null), 4000);
  }

  async function patchCreative(id: string, body: Record<string, unknown>, successMsg: string) {
    setBusyId(id);
    try {
      const res  = await fetch(`/api/admin/creatives/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        flash(true, successMsg);
        router.refresh();
      } else {
        flash(false, data.error ?? 'Update failed.');
      }
    } catch {
      flash(false, 'Network error — please try again.');
    } finally {
      setBusyId(null);
    }
  }

  // WR-03: dedicated reorder handler. Sets `reordering` (not just busyId) so the
  // ▲/▼ controls on EVERY card are disabled while the two-row swap is in flight,
  // preventing a concurrent swap on the neighbor card it also mutates.
  async function reorderCreative(id: string, direction: 'up' | 'down', successMsg: string) {
    setReordering(true);
    try {
      const res  = await fetch(`/api/admin/creatives/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ direction }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        flash(true, successMsg);
        router.refresh();
      } else {
        flash(false, data.error ?? 'Update failed.');
      }
    } catch {
      flash(false, 'Network error — please try again.');
    } finally {
      setReordering(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!assetFile) return;

    // Client-side validation (D-06: reuse constants from creatives.ts)
    const allMimes = [...ACCEPTED_IMAGE_MIME, ...ACCEPTED_VIDEO_MIME] as string[];
    if (!allMimes.includes(assetFile.type)) {
      flash(false, 'Unsupported file type. Use JPEG, PNG, WebP, GIF, MP4, WebM, or MOV.');
      return;
    }
    if (assetFile.size > MAX_CREATIVE_BYTES) {
      flash(false, 'File too large. Maximum size is 200 MB.');
      return;
    }

    setUploading(true);
    try {
      // Step 1: Upload main asset (direct browser → Vercel Blob)
      const assetBlob = await upload(`creatives/${assetFile.name}`, assetFile, {
        access: 'public',
        handleUploadUrl: '/api/admin/creatives/upload-token',
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage * 0.8)),
      });

      // Step 2: Upload poster (video-only, if provided) — SEQUENTIAL, never parallel (Pitfall 4)
      let posterBlob: { url: string; pathname: string } | null = null;
      if (posterFile) {
        const pb = await upload(`creatives/${posterFile.name}`, posterFile, {
          access: 'public',
          handleUploadUrl: '/api/admin/creatives/upload-token',
          onUploadProgress: ({ percentage }) => setProgress(80 + Math.round(percentage * 0.15)),
        });
        posterBlob = { url: pb.url, pathname: pb.pathname };
      }

      // Step 3: Create DB row via POST (avoids onUploadCompleted localhost limitation)
      setProgress(98);
      const res = await fetch('/api/admin/creatives', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:             form.title.trim(),
          description:       form.description.trim() || null,
          caption:           form.caption.trim() || null,
          url:               assetBlob.url,
          blobPath:          assetBlob.pathname,
          fileName:          assetFile.name,
          fileSize:          assetFile.size,
          mimeType:          assetFile.type,
          thumbnailUrl:      posterBlob?.url ?? null,
          thumbnailBlobPath: posterBlob?.pathname ?? null,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        flash(true, `Creative "${form.title}" uploaded.`);
        setShowCreate(false);
        setForm({ title: '', description: '', caption: '' });
        setAssetFile(null);
        setPosterFile(null);
        router.refresh();
      } else {
        // WR-02: log BOTH orphaned blob paths (asset + poster) so neither is
        // silently lost. The project accepts orphaned-blob (RESEARCH Pitfall 2);
        // no automatic remote cleanup, but logging must be complete for manual cleanup.
        console.error('Row creation failed after upload — orphaned blobs:', {
          asset:  assetBlob.pathname,
          poster: posterBlob?.pathname ?? null,
        });
        flash(false, data.error ?? 'Create failed after upload.');
      }
    } catch (err) {
      flash(false, err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  async function handleEdit(e: React.FormEvent, row: CreativeRow) {
    e.preventDefault();
    await patchCreative(
      row.id,
      { title: editForm.title.trim(), description: editForm.description.trim() || null, caption: editForm.caption.trim() || null, active: editForm.active },
      'Creative updated.'
    );
    setEditingId(null);
  }

  async function handleDelete(row: CreativeRow) {
    if (!confirm(`Delete "${row.title}"? This will permanently remove the file from storage.`)) return;
    setBusyId(row.id);
    try {
      const res  = await fetch(`/api/admin/creatives/${row.id}`, { method: 'DELETE' });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        flash(true, 'Creative deleted.');
        router.refresh();
      } else {
        flash(false, data.error ?? 'Delete failed.');
      }
    } catch {
      flash(false, 'Network error — please try again.');
    } finally {
      setBusyId(null);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-3">

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        {notice && (
          <span
            className={`text-xs font-normal ${notice.ok ? 'text-green-700' : 'text-red-600'}`}
            role="status"
            aria-live="polite"
          >
            {notice.ok ? '✓' : '✗'} {notice.msg}
          </span>
        )}
        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className="ml-auto rounded-lg bg-gray-900 px-4 py-2 text-sm font-bold text-white hover:bg-gray-700 transition-colors"
        >
          {showCreate ? 'Close' : '+ Add creative'}
        </button>
      </div>

      {/* ── Inline upload panel ───────────────────────────────────────────── */}
      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-4"
        >
          <div className="sm:grid sm:grid-cols-2 sm:gap-4 space-y-4 sm:space-y-0">
            {/* Title */}
            <div className="sm:col-span-2">
              <label htmlFor="create-title" className={labelCls}>Title *</label>
              <input
                id="create-title"
                required
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className={`${inputCls} w-full`}
              />
            </div>
            {/* Description */}
            <div className="sm:col-span-2">
              <label htmlFor="create-description" className={labelCls}>Description</label>
              <textarea
                id="create-description"
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className={`${inputCls} w-full`}
              />
            </div>
            {/* Caption */}
            <div className="sm:col-span-2">
              <label htmlFor="create-caption" className={labelCls}>Caption</label>
              <textarea
                id="create-caption"
                rows={3}
                value={form.caption}
                onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))}
                className={`${inputCls} w-full`}
              />
            </div>
            {/* Asset file */}
            <div className="sm:col-span-2">
              <label htmlFor="create-file" className={labelCls}>File *</label>
              <input
                id="create-file"
                required
                type="file"
                accept={[...ACCEPTED_IMAGE_MIME, ...ACCEPTED_VIDEO_MIME].join(',')}
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setAssetFile(f);
                  // Clear poster when switching back to image
                  if (f && !f.type.startsWith('video/')) {
                    setPosterFile(null);
                  }
                }}
                className={`${inputCls} w-full`}
              />
            </div>
            {/* Poster — video only, conditionally mounted */}
            {assetFile?.type.startsWith('video/') && (
              <div className="sm:col-span-2">
                <label htmlFor="create-poster" className={labelCls}>Poster (video only)</label>
                <input
                  id="create-poster"
                  type="file"
                  accept={ACCEPTED_IMAGE_MIME.join(',')}
                  onChange={(e) => setPosterFile(e.target.files?.[0] ?? null)}
                  className={`${inputCls} w-full`}
                />
              </div>
            )}
          </div>

          {/* Progress bar — visible only during upload */}
          {uploading && (
            <div>
              <div
                className="h-2 w-full rounded-full bg-gray-200"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-2 rounded-full bg-blue-500 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {progress < 100 ? `Uploading… ${progress}%` : 'Saving…'}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="rounded-lg bg-green-700 px-4 py-2 text-sm font-bold text-white hover:bg-green-800 disabled:opacity-50 transition-colors"
          >
            {uploading ? 'Uploading…' : 'Upload creative'}
          </button>
        </form>
      )}

      {/* ── Card grid / empty state ───────────────────────────────────────── */}
      {rows.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-16 text-center">
          <p className="text-sm text-gray-400">
            No creatives yet. Click <span className="font-bold">+ Add creative</span> to upload one.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
          {rows.map((row, idx) => (
            <div
              key={row.id}
              className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col"
            >
              {/* ── Thumbnail ─────────────────────────────────────────────── */}
              <div className="relative aspect-video w-full bg-gray-100">
                {row.type === 'IMAGE' || (row.type === 'VIDEO' && row.thumbnailUrl) ? (
                  <Image
                    src={row.type === 'IMAGE' ? row.url : row.thumbnailUrl!}
                    alt={row.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 25vw, 20vw"
                  />
                ) : (
                  /* Video without poster */
                  <div className="flex h-full items-center justify-center text-gray-400">
                    <Video className="w-10 h-10" />
                  </div>
                )}

                {/* Type badge — top-left */}
                <span className="absolute top-2 left-2 inline-flex px-2 py-1 rounded-full text-xs font-normal bg-gray-900 text-white">
                  {row.type === 'IMAGE' ? 'Image' : 'Video'}
                </span>

                {/* Active/inactive badge — top-right */}
                <span
                  className={`absolute top-2 right-2 inline-flex px-2 py-1 rounded-full text-xs font-normal ${
                    row.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {row.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* ── Card body ─────────────────────────────────────────────── */}
              <div className="p-4 flex flex-col gap-2 flex-1">
                <p className="text-sm font-bold text-gray-900 truncate">{row.title}</p>
                {row.description && (
                  <p className="text-xs text-gray-500 line-clamp-2">{row.description}</p>
                )}

                {/* ── Controls row ──────────────────────────────────────── */}
                <div className="mt-auto pt-2 flex items-center gap-2 flex-wrap">
                  {/* Reorder ▲ */}
                  <button
                    type="button"
                    aria-label="Move up"
                    disabled={idx === 0 || busyId === row.id || reordering}
                    onClick={() => reorderCreative(row.id, 'up', '')}
                    className="rounded border border-gray-300 bg-white px-2 py-2 text-xs font-normal text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    ▲
                  </button>

                  {/* Reorder ▼ */}
                  <button
                    type="button"
                    aria-label="Move down"
                    disabled={idx === rows.length - 1 || busyId === row.id || reordering}
                    onClick={() => reorderCreative(row.id, 'down', '')}
                    className="rounded border border-gray-300 bg-white px-2 py-2 text-xs font-normal text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    ▼
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    disabled={busyId === row.id}
                    onClick={() => {
                      setEditingId((cur) => (cur === row.id ? null : row.id));
                      setEditForm({
                        title:       row.title,
                        description: row.description ?? '',
                        caption:     row.caption ?? '',
                        active:      row.active,
                      });
                    }}
                    className="rounded border border-gray-300 bg-white px-2 py-2 text-xs font-normal text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    Edit
                  </button>

                  {/* Activate / Deactivate */}
                  <button
                    type="button"
                    disabled={busyId === row.id}
                    onClick={() =>
                      patchCreative(
                        row.id,
                        { active: !row.active },
                        row.active ? `"${row.title}" deactivated.` : `"${row.title}" activated.`
                      )
                    }
                    className={`rounded px-2 py-2 text-xs font-normal border transition-colors disabled:opacity-50 ${
                      row.active
                        ? 'border-red-200 bg-white text-red-700 hover:bg-red-50'
                        : 'border-green-300 bg-white text-green-700 hover:bg-green-50'
                    }`}
                  >
                    {row.active ? 'Deactivate' : 'Activate'}
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    aria-label={`Delete ${row.title}`}
                    disabled={busyId === row.id}
                    onClick={() => handleDelete(row)}
                    className="rounded border border-gray-300 bg-white px-2 py-2 text-xs font-normal text-red-700 hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>

                {/* ── Per-card inline edit panel ─────────────────────────── */}
                {editingId === row.id && (
                  <form
                    onSubmit={(e) => handleEdit(e, row)}
                    className="mt-2 space-y-4 border-t border-gray-100 pt-4"
                  >
                    {/* Title */}
                    <div>
                      <label htmlFor={`edit-title-${row.id}`} className={labelCls}>Title *</label>
                      <input
                        id={`edit-title-${row.id}`}
                        required
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                        className={`${inputCls} w-full`}
                      />
                    </div>
                    {/* Description */}
                    <div>
                      <label htmlFor={`edit-description-${row.id}`} className={labelCls}>Description</label>
                      <textarea
                        id={`edit-description-${row.id}`}
                        rows={2}
                        value={editForm.description}
                        onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                        className={`${inputCls} w-full`}
                      />
                    </div>
                    {/* Caption */}
                    <div>
                      <label htmlFor={`edit-caption-${row.id}`} className={labelCls}>Caption</label>
                      <textarea
                        id={`edit-caption-${row.id}`}
                        rows={3}
                        value={editForm.caption}
                        onChange={(e) => setEditForm((f) => ({ ...f, caption: e.target.value }))}
                        className={`${inputCls} w-full`}
                      />
                    </div>
                    {/* Active checkbox */}
                    <div className="flex items-center gap-2">
                      <input
                        id={`edit-active-${row.id}`}
                        type="checkbox"
                        checked={editForm.active}
                        onChange={(e) => setEditForm((f) => ({ ...f, active: e.target.checked }))}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`edit-active-${row.id}`} className={labelCls + ' mb-0'}>Active</label>
                    </div>

                    {/* Asset replace note (D-08: no file input in edit panel) */}
                    <p className="text-xs text-gray-400">
                      To replace the asset, delete this creative and upload a new one.
                    </p>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={busyId === row.id}
                        className="rounded-lg bg-green-700 px-3 py-2 text-xs font-bold text-white hover:bg-green-800 disabled:opacity-50 transition-colors"
                      >
                        {busyId === row.id ? 'Saving…' : 'Save changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-normal text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Discard changes
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
