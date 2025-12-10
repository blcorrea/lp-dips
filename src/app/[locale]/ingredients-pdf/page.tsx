"use client";

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function PdfPage() {
    const t = useTranslations('PdfPage');

    return (
        <div className="min-h-screen bg-brand-purple flex flex-col">
            {/* Simple Header */}
            <header className="p-4 bg-brand-dark text-white flex justify-between items-center shadow-md z-10">
                <Link href="/#ingredients" className="text-white hover:text-brand-orange font-bold flex items-center gap-2">
                    ← {t('back')}
                </Link>
                <a
                    href="/lamina_embalagem_dips_1758571399264.pdf"
                    download
                    className="bg-brand-orange text-white px-4 py-2 rounded-full font-bold hover:bg-white hover:text-brand-orange transition-colors text-sm"
                >
                    {t('download')}
                </a>
            </header>

            {/* PDF Viewer */}
            <div className="flex-1 w-full bg-gray-100 flex items-center justify-center p-4">
                <iframe
                    src="/lamina_embalagem_dips_1758571399264.pdf#toolbar=0"
                    className="w-full max-w-5xl h-[80vh] shadow-2xl rounded-lg border border-gray-200"
                    title="Ingredients Info"
                />
            </div>
        </div>
    );
}
