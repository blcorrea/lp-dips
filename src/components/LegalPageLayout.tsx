import { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";

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
  const t = await getTranslations({ locale, namespace: "Common" });

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream">
      <Header />

      <main className="flex-1 bg-brand-cream">
        <section className="px-6 py-14 lg:py-20 bg-brand-cream">
          <div className="mx-auto max-w-3xl">

            <Link
              href="/"
              className="mb-6 inline-block text-sm font-medium text-brand-orange hover:underline"
            >
              ← {t("backToHome")}
            </Link>

            <div className="rounded-[28px] border border-brand-purple/10 bg-brand-cream p-8 shadow-sm lg:p-12">

              <h1 className="mb-4 text-4xl font-bold tracking-tight text-brand-purple lg:text-5xl">
                {title}
              </h1>

              <div className="mb-10 h-[1px] w-16 bg-brand-orange/40"></div>

              <div className="legal-content">
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