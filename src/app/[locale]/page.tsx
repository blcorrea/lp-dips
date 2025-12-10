import Header from '@/components/Header';
import Hero from '@/components/Hero';
import AboutSection from '@/components/AboutSection';
import ProductSection from '@/components/ProductSection';
import IngredientsSection from '@/components/IngredientsSection';
import FAQSection from '@/components/FAQSection';
import Footer from '@/components/Footer';

export default function HomePage() {
    return (
        <main className="min-h-screen bg-white selection:bg-brand-orange/20">
            <Header />
            <Hero />
            <AboutSection />
            <ProductSection />
            <IngredientsSection />
            <FAQSection />
            <Footer />
        </main>
    );
}
