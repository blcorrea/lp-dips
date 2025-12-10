import type { Metadata } from 'next';
import { Fredoka, Nunito } from "next/font/google"; // Substitutes for All Round Gothic and Filson Soft
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import '../globals.css';
// import { cn } from '@/lib/utils'; // Using shadcn utils

const fontHeading = Fredoka({
    subsets: ["latin"],
    variable: "--font-heading",
    weight: ["700"], // Bold for titles
});

const fontBody = Nunito({
    subsets: ["latin"],
    variable: "--font-body",
});

export const metadata: Metadata = {
    title: 'Dips - Share it. Feel it. Love it.',
    description: 'A chocolate made to tease. Crafted with pure Arriba Cocoa Nibs and natural aphrodisiac ingredients.',
};

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    // Ensure that the incoming `locale` is valid
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!routing.locales.includes(locale as any)) {
        notFound();
    }

    // Providing all messages to the client
    // side is the easiest way to get started
    const messages = await getMessages();

    return (
        <html lang={locale} suppressHydrationWarning>
            <body className={`${fontHeading.variable} ${fontBody.variable} antialiased bg-background text-foreground`}>
                <NextIntlClientProvider messages={messages} locale={locale}>
                    {children}
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
