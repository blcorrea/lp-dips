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
  const t = await getTranslations({ locale, namespace: 'Common' });

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream">
      <Header />

      <main className="flex-1 bg-brand-cream">
        <section className="container mx-auto px-6 py-14 lg:py-20 bg-brand-cream">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/"
              className="mb-6 inline-block text-sm font-medium text-brand-orange hover:underline"
            >
              ← {t('backToHome')}
            </Link>

            <div className="rounded-[28px] border border-brand-purple/10 bg-brand-cream p-8 shadow-sm lg:p-12">
              <h1 className="mb-4 text-4xl font-bold tracking-tight text-brand-purple lg:text-5xl">
                {title}
              </h1>

              <div className="mb-10 h-[1px] w-16 bg-brand-orange/40" />

              <div
                className="
                  max-w-none text-brand-charcoal
                  [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-brand-purple
                  [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-brand-purple
                  [&_p]:mb-4 [&_p]:text-brand-charcoal [&_p]:leading-relaxed
                  [&_strong]:font-semibold [&_strong]:text-brand-purple
                  [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6
                  [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6
                  [&_li]:mb-2 [&_li]:text-brand-charcoal [&_li]:leading-relaxed
                  [&_a]:text-brand-orange [&_a]:underline-offset-2 hover:[&_a]:underline
                "
              >
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