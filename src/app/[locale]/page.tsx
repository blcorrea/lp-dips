import Header from '@/components/Header';
import Hero from '@/components/Hero';
import AboutSection from '@/components/AboutSection';
import IngredientsSection from '@/components/IngredientsSection';
import ProductSection from '@/components/ProductSection';
import WhyDipsSection from "@/components/WhyDipsSection";
import BuySection from '@/components/BuySection';
import FAQSection from '@/components/FAQSection';
import Footer from '@/components/Footer';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <main className="min-h-screen bg-brand-cream selection:bg-brand-orange/20">
      <Header />
      <Hero />
      <AboutSection />
      <IngredientsSection />
      <ProductSection />
      <WhyDipsSection />

      {/* 🔥 NOVA SEÇÃO DE COMPRA */}
      <BuySection locale={locale} />

      <FAQSection />
      <Footer />
    </main>
  );
}