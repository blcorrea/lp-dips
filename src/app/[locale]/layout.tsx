import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';

import { CustomerProvider } from '@/contexts/CustomerContext';
import TrackingProvider from '@/components/TrackingProvider';
import { plusJakartaSans, dmSans } from '@/lib/fonts';

import '../globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.dipschocolate.com'),

  title: {
    default:  'Dips Chocolate — Share it. Feel it. Love it.',
    template: '%s | Dips Chocolate',
  },

  description:
    'A chocolate made to tease. Crafted with pure Arriba Cocoa Nibs and natural aphrodisiac ingredients for indulgent moments.',

  alternates: {
    canonical: 'https://www.dipschocolate.com',
  },

  icons: {
    icon:  '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },

  openGraph: {
    type:        'website',
    siteName:    'Dips Chocolate',
    title:       'Dips Chocolate — Share it. Feel it. Love it.',
    description:
      'A chocolate made to tease. Crafted with pure Arriba Cocoa Nibs and natural aphrodisiac ingredients for indulgent moments.',
    url:         'https://www.dipschocolate.com',
    locale:      'en_US',
    images: [
      {
        url:    'https://www.dipschocolate.com/images/og-image.jpg',
        width:  1200,
        height: 630,
        alt:    'Dips Chocolate — Share it. Feel it. Love it.',
      },
    ],
  },

  twitter: {
    card:        'summary_large_image',
    title:       'Dips Chocolate — Share it. Feel it. Love it.',
    description:
      'A chocolate made to tease. Crafted with pure Arriba Cocoa Nibs and natural aphrodisiac ingredients for indulgent moments.',
    images: ['https://www.dipschocolate.com/images/og-image.jpg'],
  },
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
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${dmSans.variable} scroll-smooth`}
    >
      <body className="antialiased bg-background text-foreground">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <CustomerProvider>
            <TrackingProvider />
            {children}
          </CustomerProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}