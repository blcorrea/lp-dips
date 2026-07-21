'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface AffiliateLoginFormProps {
  locale:       string;
  initialError: string | null;
}

export default function AffiliateLoginForm({ locale, initialError }: AffiliateLoginFormProps) {
  const t = useTranslations('AffiliateDashboard');

  const [email, setEmail]         = useState('');
  const [error, setError]         = useState<string | null>(initialError);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent]           = useState(false);

  async function handleSubmit() {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      setError(t('invalidEmail'));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await fetch('/api/affiliates/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: trimmed }),
      });
      // Always show success regardless of whether the email matched (anti-enumeration)
      setSent(true);
    } catch {
      setError(t('loginErrorGeneric'));
    } finally {
      setSubmitting(false);
    }
  }

  // ── Sent state ─────────────────────────────────────────────────────────────
  if (sent) {
    return (
      <div className="rounded-[24px] bg-white px-8 py-10 shadow-[0_10px_40px_rgba(86,17,110,0.15)] text-center">
        <div className="text-5xl mb-4">📬</div>
        <h2 className="font-heading text-dips-text-purple-deep text-[26px] font-bold mb-3">
          {t('checkEmailTitle')}
        </h2>
        <p className="text-brand-charcoal/70 text-[15px] leading-relaxed">
          {t('checkEmailBody', { email: email.trim().toLowerCase() })}
        </p>
        <p className="mt-4 text-brand-charcoal/40 text-[13px]">
          {t('checkEmailExpiry')}
        </p>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-[24px] bg-white px-6 py-8 sm:px-8 sm:py-10 shadow-[0_10px_40px_rgba(86,17,110,0.15)]">
      <div className="space-y-5">
        {/* Token error banner (from /verify redirect) */}
        {error && error !== t('invalidEmail') && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
            {error === 'expired' ? t('linkExpired') : t('linkInvalid')}
          </div>
        )}

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-brand-charcoal mb-1">
            {t('labelEmail')} <span className="text-brand-orange">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
            placeholder={t('placeholderEmail')}
            className={`w-full rounded-xl border px-4 py-3 text-[15px] outline-none transition-colors
              focus:border-dips-text-purple-deep focus:ring-2 focus:ring-dips-text-purple-deep/10
              ${error === t('invalidEmail') ? 'border-red-400' : 'border-dips-text-purple-deep/20'}`}
          />
          {error === t('invalidEmail') && (
            <p className="mt-1 text-xs text-red-500">{error}</p>
          )}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full rounded-full bg-brand-orange px-8 py-4 text-base font-bold text-white
            shadow-[0_10px_30px_rgba(242,117,33,0.28)] transition-all duration-300
            hover:scale-[1.02] hover:bg-brand-orange/90
            disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? t('loginSubmitting') : t('loginSubmit')}
        </button>

        <p className="text-center text-sm text-brand-charcoal/50">
          {t('loginNoAccount')}{' '}
          <a href={`/${locale}/affiliates/join`} className="text-dips-text-purple-deep font-semibold hover:underline">
            {t('loginJoinLink')}
          </a>
        </p>
      </div>
    </div>
  );
}
