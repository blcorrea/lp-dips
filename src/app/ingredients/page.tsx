'use client';

import { useEffect } from 'react';

/**
 * QR-code redirect page.
 * The packaging QR code points to /ingredients; this page immediately
 * sends the browser to the #ingredients anchor on the English landing page.
 * window.location.replace() is used so this redirect page is not kept in history.
 */
export default function IngredientsRedirect() {
  useEffect(() => {
    window.location.replace('/en#ingredients');
  }, []);

  return (
    <div
      style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        minHeight:      '100vh',
        fontFamily:     'sans-serif',
        color:          '#666',
        fontSize:       '15px',
      }}
    >
      Redirecting…
    </div>
  );
}
