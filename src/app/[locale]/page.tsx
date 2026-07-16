import LandingHeader from '@/components/LandingHeader';
import Hero from '@/components/Hero';
import StorySection from '@/components/StorySection';
import IngredientsSection from '@/components/IngredientsSection';
import BuySection from '@/components/BuySection';
import ReviewsSection from '@/components/ReviewsSection';
import FAQSection from '@/components/FAQSection';
import LandingFooter from '@/components/LandingFooter';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <main className="min-h-screen bg-brand-cream selection:bg-brand-orange/20">
      <LandingHeader />
      <Hero />
      <StorySection />
      <IngredientsSection />

      {/* 🔥 NOVA SEÇÃO DE COMPRA */}
      <BuySection locale={locale} />
      <ReviewsSection />
      <FAQSection />
      <LandingFooter />
    </main>
  );
}
