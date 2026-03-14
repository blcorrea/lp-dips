import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';

import { CartProvider } from '@/contexts/CartContext';
import { CustomerProvider } from '@/contexts/CustomerContext';

import '../globals.css';

export const metadata: Metadata = {
  title: 'Dips - Share it. Feel it. Love it.',
  description:
    'A chocolate made to tease. Crafted with pure Arriba Cocoa Nibs and natural aphrodisiac ingredients.',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // garante locale válido
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <CustomerProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </CustomerProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}