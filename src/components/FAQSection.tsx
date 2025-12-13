"use client";

import { useTranslations } from 'next-intl';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import ScrollReveal from './animations/ScrollReveal';

export default function FAQSection() {
    const t = useTranslations('FAQ');
    const faqs = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];

    return (
        <section id="faq" className="py-20 lg:py-32 bg-white">
            <div className="container mx-auto px-4 max-w-4xl">
                <ScrollReveal direction="up" delay={0.1} duration={0.8}>
                    <h2 className="text-4xl lg:text-5xl font-bold text-center text-brand-purple mb-16">
                        {t('title')}
                    </h2>
                </ScrollReveal>

                <Accordion type="single" collapsible className="w-full space-y-4">
                    {faqs.map((q, index) => (
                        <ScrollReveal key={q} direction="up" delay={0.1 + (index * 0.1)} duration={0.6}>
                            <AccordionItem value={`item-${index}`} className="border border-brand-purple/20 rounded-2xl px-8 bg-white overflow-hidden shadow-sm data-[state=open]:border-brand-orange/50 transition-colors">
                                <AccordionTrigger className="text-left text-lg lg:text-xl font-bold text-brand-purple hover:text-brand-orange hover:no-underline py-6 [&[data-state=open]]:text-brand-orange">
                                    {t(q)}
                                </AccordionTrigger>
                                <AccordionContent className="text-gray-600 text-base lg:text-lg leading-relaxed pb-6 pl-2">
                                    {t(q.replace('q', 'a'))}
                                </AccordionContent>
                            </AccordionItem>
                        </ScrollReveal>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}
