'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { captureAttribution } from '@/lib/tracking';

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

export default function TrackingProvider() {
  const primaryGtagId = GA4_ID ?? GOOGLE_ADS_ID;

  // Capture influencer/UTM attribution from the landing URL on first mount.
  // First-touch wins; persisted in localStorage by captureAttribution.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    captureAttribution(
      window.location.search,
      window.location.pathname + window.location.search
    );
  }, []);

  return (
    <>
      {META_PIXEL_ID && (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">{`
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${META_PIXEL_ID}');
fbq('track','PageView');
          `}</Script>

          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              alt=""
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      )}

      {primaryGtagId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${primaryGtagId}`}
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">{`
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments)}
window.gtag=window.gtag||gtag;
gtag('js',new Date());
${GA4_ID ? `gtag('config','${GA4_ID}');` : ''}
${GOOGLE_ADS_ID ? `gtag('config','${GOOGLE_ADS_ID}');` : ''}
          `}</Script>
        </>
      )}
    </>
  );
}