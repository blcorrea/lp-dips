'use client';

import { useState } from 'react';
import type { FulfillmentStatus } from '@/lib/orders';

// ── Types ─────────────────────────────────────────────────────────────────────

export type EditFormValues = {
  fulfillmentStatus: FulfillmentStatus;
  carrier:           string;
  trackingNumber:    string;
  trackingUrl:       string;
  shippedAt:         string; // datetime-local string or ''
  internalNotes:     string;
};

type Props = {
  orderId:       string;
  initialValues: EditFormValues;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const FULFILLMENT_OPTIONS: { value: FulfillmentStatus; label: string }[] = [
  { value: 'UNFULFILLED',         label: 'Unfulfilled' },
  { value: 'PARTIALLY_FULFILLED', label: 'Partially Fulfilled' },
  { value: 'FULFILLED',           label: 'Fulfilled' },
  { value: 'RETURNED',            label: 'Returned' },
  { value: 'CANCELLED',           label: 'Cancelled' },
];

// ── Shared field styles ───────────────────────────────────────────────────────

const inputCls =
  'block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 ' +
  'placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

const labelCls = 'block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1';

// ── Component ─────────────────────────────────────────────────────────────────

export default function EditForm({ orderId, initialValues }: Props) {
  const [values, setValues]   = useState<EditFormValues>(initialValues);
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  function set<K extends keyof EditFormValues>(key: K, value: EditFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        fulfillmentStatus: values.fulfillmentStatus,
        carrier:           values.carrier       || null,
        trackingNumber:    values.trackingNumber || null,
        trackingUrl:       values.trackingUrl   || null,
        internalNotes:     values.internalNotes || null,
        shippedAt:         values.shippedAt
          ? new Date(values.shippedAt).toISOString()
          : null,
      };

      const res  = await fetch(`/api/admin/orders/${orderId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      const data = await res.json() as { ok?: boolean; error?: string };

      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? 'Update failed');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* ── Block 5: Logistics ─────────────────────────────────────────────── */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-base font-semibold text-gray-900">Logistics</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Fulfillment Status</label>
            <select
              value={values.fulfillmentStatus}
              onChange={(e) => set('fulfillmentStatus', e.target.value as FulfillmentStatus)}
              className={inputCls}
            >
              {FULFILLMENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Carrier</label>
            <input
              type="text"
              value={values.carrier}
              onChange={(e) => set('carrier', e.target.value)}
              placeholder="UPS, FedEx, USPS…"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Tracking Number</label>
            <input
              type="text"
              value={values.trackingNumber}
              onChange={(e) => set('trackingNumber', e.target.value)}
              placeholder="1Z999AA10123456784"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Tracking URL</label>
            <input
              type="url"
              value={values.trackingUrl}
              onChange={(e) => set('trackingUrl', e.target.value)}
              placeholder="https://…"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Shipped At</label>
            <input
              type="datetime-local"
              value={values.shippedAt}
              onChange={(e) => set('shippedAt', e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
      </section>

      {/* ── Block 6: Internal Notes ────────────────────────────────────────── */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-base font-semibold text-gray-900">Internal Notes</h2>
        <textarea
          rows={4}
          value={values.internalNotes}
          onChange={(e) => set('internalNotes', e.target.value)}
          placeholder="Notes visible only to admins…"
          className={`${inputCls} resize-y`}
        />
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white
                     hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                     focus:ring-offset-2 disabled:opacity-60 transition-colors"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>

        {success && (
          <span className="text-sm font-medium text-green-600">
            ✓ Saved successfully
          </span>
        )}
        {error && (
          <span className="text-sm font-medium text-red-600">
            {error}
          </span>
        )}
      </div>
    </form>
  );
}
