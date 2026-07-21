'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

const AFFILIATE_TYPES = ['INFLUENCER', 'MEDIA_BUYER', 'PARTNER', 'ORGANIC', 'OTHER'] as const;
type AffiliateType = (typeof AFFILIATE_TYPES)[number];

export default function AffiliateJoinForm() {
  const t = useTranslations('AffiliateJoin');
  const params = useParams();
  const locale = (params.locale as string) || 'en';

  const [form, setForm] = useState({
    name:      '',
    email:     '',
    instagram: '',
    ref:       '',
    type:      '' as AffiliateType | '',
  });

  const [errors, setErrors]         = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function handleInstagramChange(value: string) {
    const cleaned = value.trim().toLowerCase().replace(/^@/, '').replace(/[\s.]+/g, '-');
    setForm((prev) => ({
      ...prev,
      instagram: value,
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
    if (!form.type) newErrors.type = t('requiredField');
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
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:      form.name.trim(),
          email:     form.email.trim().toLowerCase(),
          instagram: form.instagram.trim() || null,
          ref:       form.ref.trim().toLowerCase(),
          type:      form.type,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 && data.field === 'email') {
          setErrors((prev) => ({ ...prev, email: t('errorEmailConflict') }));
        } else if (res.status === 409) {
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
        <h2 className="font-heading text-dips-text-purple-deep text-[28px] font-bold mb-3">
          {t('successTitle')}
        </h2>
        <p className="text-brand-charcoal/70 text-[16px] leading-relaxed max-w-md mx-auto">
          {t('successMessage')}
        </p>

        {/* Referral code recap */}
        <div className="mt-6 rounded-2xl bg-brand-cream/60 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-charcoal/50">
            {t('successYourCode')}
          </p>
          <p className="mt-1 font-mono text-lg font-bold text-dips-text-purple-deep break-all">
            {form.ref}
          </p>
        </div>

        {/* Login CTA */}
        <a
          href={`/${locale}/affiliates/login`}
          className="mt-6 inline-block w-full rounded-full bg-brand-orange px-8 py-4 text-base font-bold text-white
            shadow-[0_10px_30px_rgba(242,117,33,0.28)] transition-all duration-300
            hover:scale-[1.02] hover:bg-brand-orange/90"
        >
          {t('successLoginCta')}
        </a>

        <p className="mt-4 text-sm text-brand-charcoal/50 leading-relaxed">
          {t('successLoginHint')}
        </p>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-[24px] bg-white px-6 py-8 sm:px-8 sm:py-10 shadow-[0_10px_40px_rgba(86,17,110,0.10)]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <h2 className="font-heading text-dips-text-purple-deep text-[24px] sm:text-[28px] font-bold">
          {t('formTitle')}
        </h2>

        {/* Already-an-affiliate link — affiliates were reporting they
            couldn't find where to log in from this page (they'd only see
            it after re-applying and hitting the email-conflict error).
            Placed next to the form heading (the highest-intent moment for a
            returning affiliate to pause and look for login instead) rather
            than up in the hero. Mirrors the reverse link already on the
            login page (AffiliateDashboard.loginNoAccount/loginJoinLink). */}
        <a
          href={`/${locale}/affiliates/login`}
          className="text-brand-charcoal/50 text-sm hover:text-brand-charcoal/70 transition-colors"
        >
          {t('alreadyAffiliate')}{' '}
          <span className="font-semibold text-dips-text-purple-deep hover:underline">
            {t('alreadyAffiliateCta')}
          </span>
        </a>
      </div>

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
              focus:border-dips-text-purple-deep focus:ring-2 focus:ring-dips-text-purple-deep/10
              ${errors.name ? 'border-red-400' : 'border-dips-text-purple-deep/20'}`}
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
              focus:border-dips-text-purple-deep focus:ring-2 focus:ring-dips-text-purple-deep/10
              ${errors.email ? 'border-red-400' : 'border-dips-text-purple-deep/20'}`}
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-semibold text-brand-charcoal mb-1">
            {t('labelType')} <span className="text-brand-orange">*</span>
          </label>
          <select
            value={form.type}
            onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as AffiliateType }))}
            className={`w-full rounded-xl border px-4 py-3 text-[15px] outline-none transition-colors bg-white
              focus:border-dips-text-purple-deep focus:ring-2 focus:ring-dips-text-purple-deep/10
              ${errors.type ? 'border-red-400' : 'border-dips-text-purple-deep/20'}
              ${!form.type ? 'text-brand-charcoal/40' : 'text-brand-charcoal'}`}
          >
            <option value="" disabled>{t('placeholderType')}</option>
            {AFFILIATE_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(`typeLabel_${type}` as Parameters<typeof t>[0])}
              </option>
            ))}
          </select>
          {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type}</p>}
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
            className="w-full rounded-xl border border-dips-text-purple-deep/20 px-4 py-3 text-[15px] outline-none transition-colors
              focus:border-dips-text-purple-deep focus:ring-2 focus:ring-dips-text-purple-deep/10"
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
              focus:border-dips-text-purple-deep focus:ring-2 focus:ring-dips-text-purple-deep/10
              ${errors.ref ? 'border-red-400' : 'border-dips-text-purple-deep/20'}`}
          />
          <p className="mt-1 text-xs text-brand-charcoal/50">{t('refHint')}</p>
          {errors.ref && <p className="mt-1 text-xs text-red-500">{errors.ref}</p>}
        </div>

        {serverError && (
          <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {serverError}
          </p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full rounded-full bg-brand-orange px-8 py-4 text-base font-bold text-white
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
