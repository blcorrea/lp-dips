import { ReactNode } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';

type LegalPageLayoutProps = {
  title: string;
  locale: string;
  children: ReactNode;
};

export default async function LegalPageLayout({
  title,
  locale,
  children,
}: LegalPageLayoutProps) {
  const t = await getTranslations({ locale, namespace: 'Privacy' });

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="container mx-auto px-6 py-14 lg:py-20">
          <div className="mx-auto max-w-4xl">
            <Link
              href="/"
              className="inline-block text-sm font-medium text-brand-orange hover:underline mb-6"
            >
              ← {t('backToHome')}
            </Link>

            <div className="rounded-[28px] border border-brand-purple/10 bg-brand-cream p-8 lg:p-12 shadow-sm">
              <h1 className="text-brand-purple text-4xl lg:text-5xl font-bold tracking-tight mb-8">
                {title}
              </h1>

              <div className="prose prose-neutral max-w-none prose-headings:text-brand-purple prose-headings:font-bold prose-p:text-brand-charcoal prose-li:text-brand-charcoal">
                {children}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}