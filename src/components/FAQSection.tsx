"use client";

import { useTranslations } from 'next-intl';
import ScrollReveal from './animations/ScrollReveal';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

export default function FAQSection() {
  const t = useTranslations('FAQ');
  const faqs = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];

  return (
    <section id="faq" className="bg-dips-purple-section py-20 lg:py-28 scroll-mt-[72px]">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          {/* Title */}
          <ScrollReveal direction="up" delay={0.1} duration={0.8}>
            <h2 className="text-center text-dips-text-lavender text-heading-lg font-heading mb-14 lg:mb-16">
              {t('title')}
            </h2>
          </ScrollReveal>

          {/* FAQ Accordion */}
          <ScrollReveal direction="up" delay={0.18} duration={0.7}>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((q) => (
                <AccordionItem
                  key={q}
                  value={q}
                  className="rounded-card border bg-dips-card-ingredient border-dips-card-ingredient-border p-card-padding data-[state=open]:border-l-4 data-[state=open]:border-brand-orange"
                >
                  <AccordionTrigger className="text-card-title-sm font-heading text-dips-text-lavender hover:no-underline py-0">
                    {t(q)}
                  </AccordionTrigger>
                  <AccordionContent className="text-dips-text-lavender leading-relaxed pt-4">
                    {t(q.replace('q', 'a'))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
