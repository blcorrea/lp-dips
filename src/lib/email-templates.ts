import { sendEmail } from './email';

// ─────────────────────────────────────────────────────────────────────────────
// Data shapes — intentionally decoupled from the Prisma Order type so these
// functions can be called from both the webhook and the admin API without
// importing the full generated client.
// ─────────────────────────────────────────────────────────────────────────────

export type ConfirmationEmailData = {
  customerEmail:        string;
  customerName:         string | null;
  orderNumber:          string;
  createdAt:            Date;
  total:                number; // cents
  subtotal:             number; // cents
  tax:                  number; // cents
  shippingCost:         number; // cents
  discount:             number; // cents
  currency:             string;
  items: Array<{
    productName: string;
    variantName: string | null;
    quantity:    number;
    unitPrice:   number; // cents
    subtotal:    number; // cents
  }>;
  shippingName:         string | null;
  shippingAddressLine1: string | null;
  shippingAddressLine2: string | null;
  shippingCity:         string | null;
  shippingState:        string | null;
  shippingPostalCode:   string | null;
  shippingCountry:      string | null;
};

export type ShippedEmailData = {
  customerEmail:  string;
  customerName:   string | null;
  orderNumber:    string;
  carrier:        string | null;
  trackingNumber: string | null;
  trackingUrl:    string | null;
  shippedAt:      Date | null;
};

export type WarehouseNotificationData = {
  orderId:              string;
  orderNumber:          string;
  customerName:         string | null;
  customerEmail:        string;
  total:                number; // cents
  currency:             string;
  shippingName:         string | null;
  shippingAddressLine1: string | null;
  shippingAddressLine2: string | null;
  shippingCity:         string | null;
  shippingState:        string | null;
  shippingPostalCode:   string | null;
  shippingCountry:      string | null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Formatting helpers (inline — no external deps)
// ─────────────────────────────────────────────────────────────────────────────

function money(cents: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style:    'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year:     'numeric',
    month:    'long',
    day:      'numeric',
    timeZone: 'UTC',
  }).format(new Date(date));
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year:     'numeric',
    month:    'long',
    day:      'numeric',
    hour:     '2-digit',
    minute:   '2-digit',
    timeZone: 'UTC',
  }).format(new Date(date));
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared layout primitives
// ─────────────────────────────────────────────────────────────────────────────

const PURPLE  = '#56116E';
const ORANGE  = '#f27521';
const CREAM   = '#f3e9e3';
const BEIGE   = '#e4d6cf';
const CHARCOAL = '#313131';

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dips Chocolate</title>
</head>
<body style="margin:0;padding:0;background-color:${CREAM};font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color:${CREAM};padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0"
          style="max-width:600px;width:100%;">

          <!-- ── Header ── -->
          <tr>
            <td style="background-color:${PURPLE};padding:36px 40px;text-align:center;
                       border-radius:12px 12px 0 0;">
              <img
                src="https://www.dipschocolate.com/email-logo.png"
                alt="Dips Chocolate"
                width="180"
                height="auto"
                border="0"
                style="display:block;margin:0 auto;width:180px;max-width:100%;
                       height:auto;border:0;outline:none;text-decoration:none;"
              >
              <p style="margin:14px 0 0;color:${ORANGE};font-size:13px;letter-spacing:2px;
                        font-family:Arial,Helvetica,sans-serif;text-transform:uppercase;">
                Share it. Feel it. Love it.
              </p>
            </td>
          </tr>

          <!-- ── Body ── -->
          <tr>
            <td style="background-color:#ffffff;padding:40px 40px 32px;">
              ${content}
            </td>
          </tr>

          <!-- ── Footer ── -->
          <tr>
            <td style="background-color:${PURPLE};padding:24px 40px;text-align:center;
                       border-radius:0 0 12px 12px;">
              <p style="margin:0 0 6px;color:${BEIGE};font-size:13px;
                        font-family:Arial,Helvetica,sans-serif;">
                Questions? Write to us at
                <a href="mailto:orders@dipschocolate.com"
                   style="color:${ORANGE};text-decoration:none;">
                  orders@dipschocolate.com
                </a>
              </p>
              <p style="margin:0;color:${PURPLE};filter:brightness(1.8);font-size:11px;
                        font-family:Arial,Helvetica,sans-serif;opacity:0.6;">
                © Dips Chocolate · dipschocolate.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}


// ─────────────────────────────────────────────────────────────────────────────
// Order Confirmation template
// ─────────────────────────────────────────────────────────────────────────────

function buildConfirmationHtml(data: ConfirmationEmailData): string {
  const name      = data.customerName ?? 'there';
  const firstName = name.split(' ')[0];

  // ── Items rows ──────────────────────────────────────────────────────────────
  const itemRows = data.items.map((item) => {
    const variant = item.variantName ? ` <span style="color:#888;font-size:13px;">(${item.variantName})</span>` : '';
    return `
      <tr>
        <td style="padding:10px 0;color:${CHARCOAL};font-size:15px;border-bottom:1px solid ${BEIGE};">
          ${item.productName}${variant}
        </td>
        <td style="padding:10px 0;color:${CHARCOAL};font-size:15px;text-align:center;
                   border-bottom:1px solid ${BEIGE};">
          ${item.quantity}
        </td>
        <td style="padding:10px 0;color:${CHARCOAL};font-size:15px;text-align:right;
                   border-bottom:1px solid ${BEIGE};">
          ${money(item.subtotal, data.currency)}
        </td>
      </tr>`;
  }).join('');

  // ── Totals block ────────────────────────────────────────────────────────────
  const totalsRows: string[] = [];
  if (data.tax > 0) {
    totalsRows.push(`
      <tr>
        <td colspan="2" style="padding:4px 0;font-size:14px;color:#888;
                               font-family:Arial,Helvetica,sans-serif;">Tax</td>
        <td style="padding:4px 0;font-size:14px;color:#888;text-align:right;
                   font-family:Arial,Helvetica,sans-serif;">${money(data.tax, data.currency)}</td>
      </tr>`);
  }
  if (data.discount > 0) {
    totalsRows.push(`
      <tr>
        <td colspan="2" style="padding:4px 0;font-size:14px;color:#888;
                               font-family:Arial,Helvetica,sans-serif;">Discount</td>
        <td style="padding:4px 0;font-size:14px;color:${ORANGE};text-align:right;
                   font-family:Arial,Helvetica,sans-serif;">−${money(data.discount, data.currency)}</td>
      </tr>`);
  }
  totalsRows.push(`
    <tr>
      <td colspan="2" style="padding:12px 0 0;font-size:17px;font-weight:700;
                             color:${PURPLE};font-family:Arial,Helvetica,sans-serif;">
        Total
      </td>
      <td style="padding:12px 0 0;font-size:17px;font-weight:700;text-align:right;
                 color:${PURPLE};font-family:Arial,Helvetica,sans-serif;">
        ${money(data.total, data.currency)}
      </td>
    </tr>`);

  // ── Shipping address ────────────────────────────────────────────────────────
  const addressParts = [
    data.shippingAddressLine1,
    data.shippingAddressLine2,
    [data.shippingCity, data.shippingState, data.shippingPostalCode].filter(Boolean).join(', '),
    data.shippingCountry,
  ].filter(Boolean);

  const addressBlock = addressParts.length > 0
    ? `<p style="margin:0;color:${CHARCOAL};font-size:15px;line-height:1.7;">
        ${data.shippingName ? `<strong>${data.shippingName}</strong><br>` : ''}
        ${addressParts.join('<br>')}
       </p>`
    : `<p style="margin:0;color:#888;font-size:14px;">Address not provided.</p>`;

  const body = `
    <!-- Greeting -->
    <p style="margin:0 0 24px;font-size:22px;color:${PURPLE};font-weight:700;
               font-family:Arial,Helvetica,sans-serif;">
      Hi ${firstName}! 🍫
    </p>
    <p style="margin:0 0 24px;font-size:16px;color:${CHARCOAL};line-height:1.6;">
      Your order has been confirmed and we're getting it ready. Thank you for choosing Dips Chocolate!
    </p>

    <!-- Order meta -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
      style="background-color:${CREAM};border-radius:8px;padding:16px 20px;margin-bottom:28px;">
      <tr>
        <td style="font-size:13px;color:#888;font-family:Arial,Helvetica,sans-serif;
                   text-transform:uppercase;letter-spacing:1px;">Order</td>
        <td style="font-size:15px;color:${PURPLE};font-weight:700;text-align:right;
                   font-family:Arial,Helvetica,sans-serif;">#${data.orderNumber}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#888;font-family:Arial,Helvetica,sans-serif;
                   text-transform:uppercase;letter-spacing:1px;padding-top:8px;">Date</td>
        <td style="font-size:15px;color:${CHARCOAL};text-align:right;padding-top:8px;
                   font-family:Arial,Helvetica,sans-serif;">${formatDate(data.createdAt)}</td>
      </tr>
    </table>

    <!-- Items -->
    <p style="margin:0 0 12px;font-size:13px;color:#888;text-transform:uppercase;
               letter-spacing:1px;font-family:Arial,Helvetica,sans-serif;">Items</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
      <thead>
        <tr>
          <th style="padding:0 0 8px;font-size:12px;color:#888;text-align:left;
                     font-weight:400;font-family:Arial,Helvetica,sans-serif;
                     text-transform:uppercase;letter-spacing:1px;">Product</th>
          <th style="padding:0 0 8px;font-size:12px;color:#888;text-align:center;
                     font-weight:400;font-family:Arial,Helvetica,sans-serif;
                     text-transform:uppercase;letter-spacing:1px;">Qty</th>
          <th style="padding:0 0 8px;font-size:12px;color:#888;text-align:right;
                     font-weight:400;font-family:Arial,Helvetica,sans-serif;
                     text-transform:uppercase;letter-spacing:1px;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
      <tfoot>
        ${totalsRows.join('')}
      </tfoot>
    </table>

    <div style="margin:28px 0;border-top:1px solid ${BEIGE};"></div>

    <!-- Shipping address -->
    <p style="margin:0 0 12px;font-size:13px;color:#888;text-transform:uppercase;
               letter-spacing:1px;font-family:Arial,Helvetica,sans-serif;">Ships to</p>
    ${addressBlock}

    <div style="margin:28px 0;border-top:1px solid ${BEIGE};"></div>

    <!-- Closing note -->
    <p style="margin:0;font-size:15px;color:${CHARCOAL};line-height:1.7;">
      We'll send you another email as soon as your order ships. In the meantime, feel free to reach us at
      <a href="mailto:orders@dipschocolate.com" style="color:${ORANGE};">orders@dipschocolate.com</a> —
      we're always happy to help.
    </p>
    <p style="margin:20px 0 0;font-size:15px;color:${PURPLE};font-style:italic;">
      With love,<br>
      <strong style="font-style:normal;">Dips Chocolate</strong>
    </p>
  `;

  return emailWrapper(body);
}

// ─────────────────────────────────────────────────────────────────────────────
// Order Shipped template
// ─────────────────────────────────────────────────────────────────────────────

function buildShippedHtml(data: ShippedEmailData): string {
  const name      = data.customerName ?? 'there';
  const firstName = name.split(' ')[0];

  const trackingBlock = data.trackingNumber
    ? `
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background-color:${CREAM};border-radius:8px;padding:16px 20px;margin-bottom:28px;">
        ${data.carrier ? `
        <tr>
          <td style="font-size:13px;color:#888;font-family:Arial,Helvetica,sans-serif;
                     text-transform:uppercase;letter-spacing:1px;">Carrier</td>
          <td style="font-size:15px;color:${CHARCOAL};text-align:right;
                     font-family:Arial,Helvetica,sans-serif;">${data.carrier}</td>
        </tr>` : ''}
        <tr>
          <td style="font-size:13px;color:#888;font-family:Arial,Helvetica,sans-serif;
                     text-transform:uppercase;letter-spacing:1px;
                     ${data.carrier ? 'padding-top:8px;' : ''}">Tracking #</td>
          <td style="font-size:15px;color:${CHARCOAL};text-align:right;
                     font-family:Arial,Helvetica,sans-serif;
                     ${data.carrier ? 'padding-top:8px;' : ''}">
            ${data.trackingNumber}
          </td>
        </tr>
        ${data.shippedAt ? `
        <tr>
          <td style="font-size:13px;color:#888;font-family:Arial,Helvetica,sans-serif;
                     text-transform:uppercase;letter-spacing:1px;padding-top:8px;">Shipped on</td>
          <td style="font-size:15px;color:${CHARCOAL};text-align:right;padding-top:8px;
                     font-family:Arial,Helvetica,sans-serif;">${formatDateTime(data.shippedAt)}</td>
        </tr>` : ''}
      </table>
      ${data.trackingUrl ? `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
        <tr>
          <td align="center">
            <a href="${data.trackingUrl}"
               style="display:inline-block;background-color:${ORANGE};color:#ffffff;
                      font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;
                      padding:14px 36px;border-radius:100px;text-decoration:none;
                      letter-spacing:0.5px;">
              Track my order →
            </a>
          </td>
        </tr>
      </table>` : ''}`
    : `<p style="margin:0 0 28px;font-size:15px;color:${CHARCOAL};">
        Tracking information will be available soon.
       </p>`;

  const body = `
    <!-- Greeting -->
    <p style="margin:0 0 24px;font-size:22px;color:${PURPLE};font-weight:700;
               font-family:Arial,Helvetica,sans-serif;">
      Good news, ${firstName}! 🚀
    </p>
    <p style="margin:0 0 24px;font-size:16px;color:${CHARCOAL};line-height:1.6;">
      Your Dips Chocolate order <strong>#${data.orderNumber}</strong> is on its way.
      We hope it brings plenty of joy (and maybe a little mischief).
    </p>

    ${trackingBlock}

    <div style="margin:28px 0;border-top:1px solid ${BEIGE};"></div>

    <p style="margin:0;font-size:15px;color:${CHARCOAL};line-height:1.7;">
      Questions about your shipment? Reach us at
      <a href="mailto:orders@dipschocolate.com" style="color:${ORANGE};">orders@dipschocolate.com</a>
      and we'll sort it out right away.
    </p>
    <p style="margin:20px 0 0;font-size:15px;color:${PURPLE};font-style:italic;">
      With love,<br>
      <strong style="font-style:normal;">Dips Chocolate</strong>
    </p>
  `;

  return emailWrapper(body);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export async function sendOrderConfirmationEmail(
  data: ConfirmationEmailData
): Promise<void> {
  if (!data.customerEmail) return;

  await sendEmail({
    to:      data.customerEmail,
    subject: `Your Dips Chocolate order #${data.orderNumber} is confirmed! 🍫`,
    html:    buildConfirmationHtml(data),
  });
}

export async function sendOrderShippedEmail(
  data: ShippedEmailData
): Promise<void> {
  if (!data.customerEmail) return;

  await sendEmail({
    to:      data.customerEmail,
    subject: `Your Dips Chocolate order #${data.orderNumber} has shipped! 🚀`,
    html:    buildShippedHtml(data),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Warehouse / Logistics internal notification
// ─────────────────────────────────────────────────────────────────────────────

function buildWarehouseHtml(
  data: WarehouseNotificationData & { sheetUrl: string; adminUrl: string }
): string {
  const addressLines = [
    data.shippingName,
    data.shippingAddressLine1,
    data.shippingAddressLine2,
    [data.shippingCity, data.shippingState, data.shippingPostalCode]
      .filter(Boolean)
      .join(', '),
    data.shippingCountry,
  ].filter((line): line is string => Boolean(line && line.trim().length > 0));

  const addressHtml = addressLines.length
    ? addressLines.map((l) => escapeHtml(l)).join('<br>')
    : '<em style="color:#888;">(no shipping address)</em>';

  const linkRows: string[] = [];
  if (data.adminUrl) {
    linkRows.push(
      `<li style="margin:4px 0;">Admin order: <a href="${escapeAttr(data.adminUrl)}">${escapeHtml(data.adminUrl)}</a></li>`
    );
  }
  if (data.sheetUrl) {
    linkRows.push(
      `<li style="margin:4px 0;">Google Sheet: <a href="${escapeAttr(data.sheetUrl)}">${escapeHtml(data.sheetUrl)}</a></li>`
    );
  }
  const linksBlock = linkRows.length
    ? `<h3 style="margin:24px 0 8px;color:${PURPLE};font-size:16px;">Links</h3>
       <ul style="margin:0;padding-left:20px;color:${CHARCOAL};font-size:14px;
                  font-family:Arial,Helvetica,sans-serif;">
         ${linkRows.join('')}
       </ul>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>New Dips order</title></head>
<body style="margin:0;padding:24px;background:#f5f5f5;
             font-family:Arial,Helvetica,sans-serif;color:${CHARCOAL};">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;
              padding:28px 32px;border:1px solid #e5e5e5;">
    <h2 style="margin:0 0 4px;color:${PURPLE};font-size:20px;">
      New Dips order received
    </h2>
    <p style="margin:0 0 20px;color:#666;font-size:14px;">
      Order <strong>#${escapeHtml(data.orderNumber)}</strong>
    </p>

    <table cellpadding="0" cellspacing="0" border="0"
           style="width:100%;font-size:14px;color:${CHARCOAL};">
      <tr>
        <td style="padding:6px 0;color:#666;width:160px;">Order number</td>
        <td style="padding:6px 0;"><strong>${escapeHtml(data.orderNumber)}</strong></td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#666;">Customer name</td>
        <td style="padding:6px 0;">${escapeHtml(data.customerName ?? '—')}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#666;">Customer email</td>
        <td style="padding:6px 0;">${escapeHtml(data.customerEmail)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#666;">Total</td>
        <td style="padding:6px 0;"><strong>${money(data.total, data.currency)}</strong></td>
      </tr>
    </table>

    <h3 style="margin:24px 0 8px;color:${PURPLE};font-size:16px;">Shipping address</h3>
    <p style="margin:0;font-size:14px;line-height:1.5;color:${CHARCOAL};">
      ${addressHtml}
    </p>

    ${linksBlock}
  </div>
</body>
</html>`;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(input: string): string {
  return escapeHtml(input);
}

/**
 * Sends an internal notification to the warehouse/logistics inbox.
 *
 * No-op (returns silently) when WAREHOUSE_NOTIFICATION_EMAIL is unset, so this
 * is safe to call unconditionally from the Stripe webhook. Callers should
 * still wrap the call in try/catch — SMTP failures must never break the
 * webhook critical path.
 */
export async function sendWarehouseNotificationEmail(
  data: WarehouseNotificationData
): Promise<void> {
  const to = process.env.WAREHOUSE_NOTIFICATION_EMAIL?.trim();
  if (!to) return;

  const siteUrl  = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? '';
  const sheetUrl = process.env.WAREHOUSE_SHEET_URL?.trim() ?? '';
  const adminUrl = siteUrl ? `${siteUrl}/admin/orders/${data.orderId}` : '';

  await sendEmail({
    to,
    subject: `New Dips order received: ${data.orderNumber}`,
    html:    buildWarehouseHtml({ ...data, sheetUrl, adminUrl }),
  });
}
