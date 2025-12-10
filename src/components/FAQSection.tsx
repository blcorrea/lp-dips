"use client";

import { useTranslations } from 'next-intl';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export default function FAQSection() {
    const t = useTranslations('FAQ');
    const faqs = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];

    return (
        <section id="faq" className="py-20 lg:py-32 bg-white">
            <div className="container mx-auto px-4 max-w-4xl">
                <h2 className="text-4xl lg:text-5xl font-bold text-center text-brand-purple mb-16">
                    {t('title')}
                </h2>

                <Accordion type="single" collapsible className="w-full space-y-4">
                    {faqs.map((q, index) => (
                        <AccordionItem key={q} value={`item-${index}`} className="border border-brand-purple/20 rounded-2xl px-8 bg-white overflow-hidden shadow-sm data-[state=open]:border-brand-orange/50 transition-colors">
                            <AccordionTrigger className="text-left text-lg lg:text-xl font-bold text-brand-purple hover:text-brand-orange hover:no-underline py-6 [&[data-state=open]]:text-brand-orange">
                                {t(q)}
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 text-base lg:text-lg leading-relaxed pb-6 pl-2">
                                {t(q.replace('q', 'a'))}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}
