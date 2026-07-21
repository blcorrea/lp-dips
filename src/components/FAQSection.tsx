"use client";

import { useTranslations } from 'next-intl';
import ScrollReveal from './animations/ScrollReveal';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

/*
  FAQ — matched to the Figma frame (1440x1014, bg #1A0A2E = dips-purple-
  section, already correct). Card tokens (bg #231435, border #39294C,
  15px radius, 25px padding) were already exact -- only the header,
  accordion width/spacing, open-state border, and typography needed
  fixing.

  Copy (Q&A) is a documented functional override -- the Figma diverges in
  small wording ("Is this product safe?" vs. ours "Is the product safe?")
  and the real copy wins; NOT changed here. The subtitle is new (didn't
  exist before), reusing the exact Reviews.subtitle translations per
  Figma, which repeats the same sentence under both headers.

  Font sizes one step below the Figma spec (54->48, 24->21, 18->16),
  carrying over the Hero/Story/Ingredients/BuySection/Reviews treatment.
*/

export default function FAQSection() {
  const t = useTranslations('FAQ');
  const faqs = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];

  // Mobile (RESP-06): py-10 (Figma mobile spec is ~40px vertical), was
  // py-20 -- lg keeps py-28.
  return (
    <section id="faq" className="bg-dips-purple-section py-10 lg:py-28 scroll-mt-[72px]">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-[807px]">
          {/* Header. Mobile (RESP-06): title 48->40px, subtitle 21->16px,
              one step below the Figma mobile spec (44px/18px). */}
          <ScrollReveal direction="up" delay={0.1} duration={0.8}>
            <h2 className="text-center text-white text-[40px] lg:text-[48px] font-bold leading-[1.2] font-heading">
              {t('title')}
            </h2>
            <p className="mx-auto mt-4 mb-12 max-w-2xl text-center text-[16px] lg:text-[21px] leading-[1.35] text-dips-text-lavender lg:mb-14">
              {t('subtitle')}
            </p>
          </ScrollReveal>

          {/* FAQ Accordion — 807px wide, 10px gap, first item open by default
              with a full orange border (Figma) instead of a left accent bar.
              Mobile (RESP-06): p-5 (was p-card-padding/25px, Figma mobile
              spec is 20px). */}
          <ScrollReveal direction="up" delay={0.18} duration={0.7}>
            <Accordion type="single" collapsible defaultValue="q1" className="space-y-[10px]">
              {faqs.map((q) => (
                <AccordionItem
                  key={q}
                  value={q}
                  className="rounded-card border-2 bg-dips-card-ingredient border-dips-card-ingredient-border p-5 lg:p-card-padding transition-colors duration-200 hover:border-brand-orange/60 data-[state=open]:border-brand-orange data-[state=open]:hover:border-brand-orange"
                >
                  {/* Mobile (RESP-06): 14px (16->14, one step below). */}
                  <AccordionTrigger className="text-[14px] lg:text-[16px] font-heading text-white hover:no-underline py-0 [&>svg]:h-6 [&>svg]:w-6 [&>svg]:text-white [&>svg]:stroke-[2.5]">
                    {t(q)}
                  </AccordionTrigger>
                  {/* Mobile (RESP-06): 13px/1.3 leading (16->13, one step
                      below the Figma mobile spec's 14px). */}
                  <AccordionContent className="whitespace-pre-line pt-[5px] text-[13px] lg:text-[16px] leading-[1.3] lg:leading-[1.35] text-dips-text-lavender">
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
