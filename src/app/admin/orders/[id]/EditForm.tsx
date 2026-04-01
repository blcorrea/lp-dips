'use client';

import { useState } from 'react';
import type { FulfillmentStatus } from '@/lib/orders';

// ── Types ──────────────────────────────────────────────────────────────────

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

// ── Constants ──────────────────────────────────────────────────────────────

const FULFILLMENT_OPTIONS: { value: FulfillmentStatus; label: string }[] = [
  { value: 'UNFULFILLED',         label: 'Unfulfilled' },
  { value: 'PARTIALLY_FULFILLED', label: 'Partially Fulfilled' },
  { value: 'FULFILLED',           label: 'Fulfilled' },
  { value: 'RETURNED',            label: 'Returned' },
  { value: 'CANCELLED',           label: 'Cancelled' },
];

// ── Shared field styles ────────────────────────────────────────────────────

const inputCls =
  'block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 ' +
  'placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

const labelCls = 'block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5';

// ── Component ──────────────────────────────────────────────────────────────

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
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* ── Logistics ─────────────────────────────────────────────────────── */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-gray-500">
          Logistics
        </h2>

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

      {/* ── Internal Notes ────────────────────────────────────────────────── */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
          Internal Notes
        </h2>
        <textarea
          rows={4}
          value={values.internalNotes}
          onChange={(e) => set('internalNotes', e.target.value)}
          placeholder="Notes visible only to admins…"
          className={`${inputCls} resize-y`}
        />
      </section>

      {/* ── Save bar ──────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm
                      flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white
                     hover:bg-blue-700 active:bg-blue-800
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                     min-w-[130px]"
        >
          {saving ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving…
            </span>
          ) : 'Save changes'}
        </button>

        {success && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Saved successfully
          </span>
        )}

        {error && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </span>
        )}
      </div>
    </form>
  );
}
