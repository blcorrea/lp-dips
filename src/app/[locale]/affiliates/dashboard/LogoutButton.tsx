'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

interface LogoutButtonProps {
  locale: string;
}

export default function LogoutButton({ locale }: LogoutButtonProps) {
  const t = useTranslations('AffiliateDashboard');
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/affiliates/logout', { method: 'POST' });
    router.push(`/${locale}/affiliates/login`);
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="text-sm text-white/60 hover:text-white transition-colors"
    >
      {t('logout')}
    </button>
  );
}
