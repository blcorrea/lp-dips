'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function AffiliateJoinForm() {
  const t = useTranslations('AffiliateJoin');

  const [form, setForm] = useState({
    name: '',
    email: '',
    instagram: '',
    ref: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Auto-generate ref from instagram handle when instagram field changes
  function handleInstagramChange(value: string) {
    const cleaned = value.trim().toLowerCase().replace(/^@/, '').replace(/[\s.]+/g, '-');
    setForm((prev) => ({
      ...prev,
      instagram: value,
      // Only auto-fill ref if user hasn't manually edited it yet
      ref: prev.ref === '' || prev.ref === autoRef(prev.instagram) ? cleaned : prev.ref,
    }));
  }

  function autoRef(instagram: string): string {
    return instagram.trim().toLowerCase().replace(/^@/, '').replace(/[\s.]+/g, '-');
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = t('requiredField');
    if (!form.email.trim()) {
      newErrors.email = t('requiredField');
    } else if (!form.email.includes('@')) {
      newErrors.email = t('invalidEmail');
    }
    if (!form.ref.trim()) {
      newErrors.ref = t('requiredField');
    } else if (!/^[a-z0-9_-]+$/.test(form.ref)) {
      newErrors.ref = t('invalidRef');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch('/api/affiliates/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          instagram: form.instagram.trim() || null,
          ref: form.ref.trim().toLowerCase(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setErrors((prev) => ({ ...prev, ref: t('errorConflict') }));
        } else {
          setServerError(data.error ?? t('errorGeneric'));
        }
        return;
      }

      setSuccess(true);
    } catch {
      setServerError(t('errorGeneric'));
    } finally {
      setSubmitting(false);
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="rounded-[24px] bg-white px-8 py-10 shadow-[0_10px_40px_rgba(86,17,110,0.10)] text-center">
        <div className="mb-4 text-5xl">🎉</div>
        <h2 className="font-heading text-brand-purple text-[28px] font-bold mb-3">
          {t('successTitle')}
        </h2>
        <p className="text-brand-charcoal/70 text-[16px] leading-relaxed max-w-md mx-auto">
          {t('successMessage')}
        </p>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-[24px] bg-white px-6 py-8 sm:px-8 sm:py-10 shadow-[0_10px_40px_rgba(86,17,110,0.10)]">
      <h2 className="font-heading text-brand-purple text-[24px] sm:text-[28px] font-bold mb-6">
        {t('formTitle')}
      </h2>

      <div className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-brand-charcoal mb-1">
            {t('labelName')} <span className="text-brand-orange">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder={t('placeholderName')}
            className={`w-full rounded-xl border px-4 py-3 text-[15px] outline-none transition-colors
              focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/10
              ${errors.name ? 'border-red-400' : 'border-brand-purple/20'}`}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-brand-charcoal mb-1">
            {t('labelEmail')} <span className="text-brand-orange">*</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            placeholder={t('placeholderEmail')}
            className={`w-full rounded-xl border px-4 py-3 text-[15px] outline-none transition-colors
              focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/10
              ${errors.email ? 'border-red-400' : 'border-brand-purple/20'}`}
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>

        {/* Instagram */}
        <div>
          <label className="block text-sm font-semibold text-brand-charcoal mb-1">
            {t('labelInstagram')}
            <span className="ml-1 text-brand-charcoal/40 font-normal text-xs">(optional)</span>
          </label>
          <input
            type="text"
            value={form.instagram}
            onChange={(e) => handleInstagramChange(e.target.value)}
            placeholder={t('placeholderInstagram')}
            className="w-full rounded-xl border border-brand-purple/20 px-4 py-3 text-[15px] outline-none transition-colors
              focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/10"
          />
        </div>

        {/* Ref */}
        <div>
          <label className="block text-sm font-semibold text-brand-charcoal mb-1">
            {t('labelRef')} <span className="text-brand-orange">*</span>
          </label>
          <input
            type="text"
            value={form.ref}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                ref: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
              }))
            }
            placeholder={t('placeholderRef')}
            className={`w-full rounded-xl border px-4 py-3 text-[15px] outline-none transition-colors
              focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/10
              ${errors.ref ? 'border-red-400' : 'border-brand-purple/20'}`}
          />
          <p className="mt-1 text-xs text-brand-charcoal/50">{t('refHint')}</p>
          {errors.ref && <p className="mt-1 text-xs text-red-500">{errors.ref}</p>}
        </div>

        {/* Server error */}
        {serverError && (
          <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {serverError}
          </p>
        )}

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full rounded-full bg-brand-orange px-8 py-4 text-base font-bold text-brand-purple
            shadow-[0_10px_30px_rgba(242,117,33,0.28)] transition-all duration-300
            hover:scale-[1.02] hover:bg-brand-orange/90
            disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? t('submitting') : t('submit')}
        </button>
      </div>
    </div>
  );
}
