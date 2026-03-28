'use client';

import { useEffect } from 'react';
import { trackViewItem, type TrackingItem } from '@/lib/tracking';

/**
 * Invisible client component that fires a view_item tracking event once on
 * mount. Accepts the same shape as TrackingItem so Server Components can pass
 * product data directly.
 */
export default function TrackViewItem(item: TrackingItem) {
  useEffect(() => {
    trackViewItem(item);
    // item data is static (server-fetched at render time) — no deps needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
