'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { upload } from '@vercel/blob/client';
import {
  UGC_ACCEPTED_MIME,
  UGC_MAX_BYTES,
  isUgcVideoMime,
  normalizeInstagram,
} from '@/lib/ugc-input';

type Prefill = { name: string; email: string; instagram: string; ref: string };

type Phase = 'idle' | 'creating' | 'uploading' | 'finishing' | 'done';

const EMAIL_REGEX     = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INSTAGRAM_REGEX = /^[A-Za-z0-9._]{1,30}$/;

const inputCls = (hasError: boolean) =>
  `w-full rounded-xl border px-4 py-3 text-[15px] outline-none transition-colors
   focus:border-dips-text-purple-deep focus:ring-2 focus:ring-dips-text-purple-deep/10
   ${hasError ? 'border-red-400' : 'border-dips-text-purple-deep/20'}`;

/** Blob path segment from the user's file name: ASCII-safe, extension kept. */
function safeFileName(name: string): string {
  return name.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^[-.]+/, '').slice(-100) || 'video';
}

export default function SubmitVideoForm({ affiliate }: { affiliate: Prefill | null }) {
  const t = useTranslations('UgcSubmit');
  const params = useParams();
  const locale = (params.locale as string) || 'en';

  const emptyForm = {
    name:       affiliate?.name ?? '',
    email:      affiliate?.email ?? '',
    instagram:  affiliate?.instagram ?? '',
    orderEmail: '',
  };
  const [form, setForm]             = useState(emptyForm);
  const [file, setFile]             = useState<File | null>(null);
  const [accepted, setAccepted]     = useState(false);
  const [errors, setErrors]         = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [phase, setPhase]           = useState<Phase>('idle');
  const [progress, setProgress]     = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const busy = phase === 'creating' || phase === 'uploading' || phase === 'finishing';

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = t('requiredField');
    if (!form.email.trim()) e.email = t('requiredField');
    else if (!EMAIL_REGEX.test(form.email.trim())) e.email = t('invalidEmail');
    const handle = normalizeInstagram(form.instagram);
    if (handle && !INSTAGRAM_REGEX.test(handle)) e.instagram = t('invalidInstagram');
    if (form.orderEmail.trim() && !EMAIL_REGEX.test(form.orderEmail.trim())) e.orderEmail = t('invalidEmail');
    if (!file) e.video = t('requiredField');
    else if (!isUgcVideoMime(file.type)) e.video = t('invalidFile');
    else if (file.size > UGC_MAX_BYTES) e.video = t('fileTooLarge');
    if (!accepted) e.terms = t('termsRequired');
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (busy || !validate() || !file) return;
    setServerError(null);

    try {
      // 1. Create the submission (details + license acceptance).
      setPhase('creating');
      const res = await fetch('/api/ugc', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:           form.name.trim(),
          email:          form.email.trim(),
          instagram:      form.instagram.trim() || null,
          orderEmail:     affiliate ? null : form.orderEmail.trim() || null,
          locale,
          rightsAccepted: accepted,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { id?: string; error?: string; field?: string };
      if (!res.ok || !data.id) {
        if (res.status === 429) setServerError(t('rateLimited'));
        else if (data.error === 'invalid_field' && data.field) {
          setErrors({ [data.field === 'rightsAccepted' ? 'terms' : data.field]: t('errorGeneric') });
        } else setServerError(t('errorGeneric'));
        setPhase('idle');
        return;
      }

      // 2. Upload the video straight to Vercel Blob, scoped to this submission.
      setPhase('uploading');
      setProgress(0);
      const blob = await upload(`ugc/${data.id}/${safeFileName(file.name)}`, file, {
        access:          'public',
        handleUploadUrl: '/api/ugc/upload-token',
        clientPayload:   data.id,
        multipart:       true,
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
      });

      // 3. Confirm — the server re-checks the stored file.
      setPhase('finishing');
      const done = await fetch(`/api/ugc/${data.id}/complete`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ url: blob.url }),
      });
      if (!done.ok) throw new Error('complete failed');

      setPhase('done');
    } catch {
      setServerError(t('errorGeneric'));
      setPhase('idle');
    }
  }

  function resetForAnother() {
    setForm(emptyForm);
    setFile(null);
    setAccepted(false);
    setErrors({});
    setProgress(0);
    setPhase('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (phase === 'done') {
    return (
      <div className="rounded-[24px] bg-white px-8 py-10 shadow-[0_10px_40px_rgba(86,17,110,0.10)] text-center">
        <div className="mb-4 text-5xl">🎉</div>
        <h2 className="font-heading text-dips-text-purple-deep text-[28px] font-bold mb-3">
          {t('successTitle')}
        </h2>
        <p className="text-brand-charcoal/70 text-[16px] leading-relaxed max-w-md mx-auto">
          {t('successMessage')}
        </p>
        <button
          type="button"
          onClick={resetForAnother}
          className="mt-6 inline-block w-full rounded-full bg-brand-orange px-8 py-4 text-base font-bold text-white
            shadow-[0_10px_30px_rgba(242,117,33,0.28)] transition-all duration-300
            hover:scale-[1.02] hover:bg-brand-orange/90"
        >
          {t('sendAnother')}
        </button>
      </div>
    );
  }

  const submitLabel =
    phase === 'creating'  ? t('creating') :
    phase === 'uploading' ? t('uploading', { percent: progress }) :
    phase === 'finishing' ? t('finishing') :
    t('submit');

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-[24px] bg-white px-6 py-8 sm:px-8 sm:py-10 shadow-[0_10px_40px_rgba(86,17,110,0.10)]">
      <h2 className="font-heading text-dips-text-purple-deep text-[24px] sm:text-[28px] font-bold mb-2">
        {t('formTitle')}
      </h2>
      {affiliate && (
        <p className="mb-6 rounded-xl bg-brand-cream/60 px-4 py-3 text-sm text-brand-charcoal/70">
          {t('affiliateNotice', { ref: affiliate.ref })}
        </p>
      )}

      <fieldset disabled={busy} className="space-y-5 mt-4">
        {/* Name */}
        <div>
          <label htmlFor="ugc-name" className="block text-sm font-semibold text-brand-charcoal mb-1">
            {t('labelName')} <span className="text-brand-orange">*</span>
          </label>
          <input
            id="ugc-name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className={inputCls(!!errors.name)}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="ugc-email" className="block text-sm font-semibold text-brand-charcoal mb-1">
            {t('labelEmail')} <span className="text-brand-orange">*</span>
          </label>
          <input
            id="ugc-email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            className={inputCls(!!errors.email)}
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>

        {/* Instagram */}
        <div>
          <label htmlFor="ugc-instagram" className="block text-sm font-semibold text-brand-charcoal mb-1">
            {t('labelInstagram')}
            <span className="ml-1 text-brand-charcoal/40 font-normal text-xs">{t('optional')}</span>
          </label>
          <input
            id="ugc-instagram"
            type="text"
            value={form.instagram}
            onChange={(e) => setForm((p) => ({ ...p, instagram: e.target.value }))}
            placeholder={t('placeholderInstagram')}
            className={inputCls(!!errors.instagram)}
          />
          <p className="mt-1 text-xs text-brand-charcoal/50">{t('instagramHint')}</p>
          {errors.instagram && <p className="mt-1 text-xs text-red-500">{errors.instagram}</p>}
        </div>

        {/* Order email — customers only */}
        {!affiliate && (
          <div>
            <label htmlFor="ugc-order-email" className="block text-sm font-semibold text-brand-charcoal mb-1">
              {t('labelOrderEmail')}
              <span className="ml-1 text-brand-charcoal/40 font-normal text-xs">{t('optional')}</span>
            </label>
            <input
              id="ugc-order-email"
              type="email"
              value={form.orderEmail}
              onChange={(e) => setForm((p) => ({ ...p, orderEmail: e.target.value }))}
              className={inputCls(!!errors.orderEmail)}
            />
            <p className="mt-1 text-xs text-brand-charcoal/50">{t('orderEmailHint')}</p>
            {errors.orderEmail && <p className="mt-1 text-xs text-red-500">{errors.orderEmail}</p>}
          </div>
        )}

        {/* Video */}
        <div>
          <label htmlFor="ugc-video" className="block text-sm font-semibold text-brand-charcoal mb-1">
            {t('labelVideo')} <span className="text-brand-orange">*</span>
          </label>
          <input
            id="ugc-video"
            ref={fileInputRef}
            type="file"
            accept={[...UGC_ACCEPTED_MIME, '.mp4', '.mov', '.webm'].join(',')}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-brand-charcoal file:mr-4 file:rounded-full file:border-0
              file:bg-dips-text-purple-deep file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
          <p className="mt-1 text-xs text-brand-charcoal/50">{t('videoHint')}</p>
          {errors.video && <p className="mt-1 text-xs text-red-500">{errors.video}</p>}
        </div>

        {/* Content license */}
        <div className="rounded-xl border border-dips-text-purple-deep/15 bg-brand-cream/40 px-4 py-4">
          <p className="text-sm font-semibold text-brand-charcoal mb-2">{t('termsTitle')}</p>
          <p className="text-xs leading-relaxed text-brand-charcoal/70">{t('termsBody')}</p>
          <label className="mt-3 flex items-start gap-3 text-sm text-brand-charcoal cursor-pointer">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-brand-orange"
            />
            <span>
              {t('termsAccept')} <span className="text-brand-orange">*</span>
            </span>
          </label>
          {errors.terms && <p className="mt-1 text-xs text-red-500">{errors.terms}</p>}
        </div>

        {serverError && (
          <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {serverError}
          </p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={busy}
          className="w-full rounded-full bg-brand-orange px-8 py-4 text-base font-bold text-white
            shadow-[0_10px_30px_rgba(242,117,33,0.28)] transition-all duration-300
            hover:scale-[1.02] hover:bg-brand-orange/90
            disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitLabel}
        </button>
      </fieldset>
    </div>
  );
}
