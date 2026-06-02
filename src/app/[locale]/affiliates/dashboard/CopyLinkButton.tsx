'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface CopyLinkButtonProps {
  link: string;
}

export default function CopyLinkButton({ link }: CopyLinkButtonProps) {
  const t = useTranslations('AffiliateDashboard');
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select the input
    }
  }

  return (
    <div className="flex gap-2 items-center">
      <input
        type="text"
        readOnly
        value={link}
        className="flex-1 min-w-0 rounded-xl border border-brand-purple/20 bg-white px-4 py-2.5
          text-[14px] text-brand-charcoal outline-none font-mono truncate"
      />
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 rounded-xl bg-brand-orange px-5 py-2.5 text-sm font-bold text-brand-purple
          transition-all duration-200 hover:bg-brand-orange/90 active:scale-95"
      >
        {copied ? t('copied') : t('copy')}
      </button>
    </div>
  );
}
