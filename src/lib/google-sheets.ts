import { google } from 'googleapis';

// ─────────────────────────────────────────────────────────────────────────────
// Data shape — intentionally decoupled from Prisma and email-templates types.
// The caller (webhook) builds this from whatever data it already has.
// ─────────────────────────────────────────────────────────────────────────────

export type SheetRowData = {
  orderNumber:          string;
  createdAt:            Date;
  customerEmail:        string;
  customerName:         string | null;
  total:                number; // cents
  tax:                  number; // cents
  shippingCost:         number; // cents
  currency:             string;
  items: Array<{
    productName: string;
    quantity:    number;
    unitPrice:   number; // cents
  }>;
  shippingName:         string | null;
  shippingAddressLine1: string | null;
  shippingAddressLine2: string | null;
  shippingCity:         string | null;
  shippingState:        string | null;
  shippingPostalCode:   string | null;
  shippingCountry:      string | null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Env-var private keys often store literal \n instead of real newlines. */
function normalisePrivateKey(key: string): string {
  return key.replace(/\\n/g, '\n');
}

function fmtDate(d: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    year:     'numeric',
    month:    '2-digit',
    day:      '2-digit',
  }).format(d);
}

function fmtMoney(cents: number): string {
  return (cents / 100).toFixed(2);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Appends one row per order item to the configured Google Sheet.
 *
 * Throws if any required env var is missing or the Sheets API call fails.
 * The caller is responsible for catching and logging — this function must
 * NEVER be awaited without a try/catch in production paths.
 *
 * Column order (warehouse format):
 *   order-id | purchase-date | payments-date | buyer-email | buyer-name |
 *   cpf | buyer-phone-number | sku | product-name | quantity-purchased |
 *   currency | item-price | item-tax | shipping-price | ship-service-level |
 *   ship-service-name | recipient-name | ship-address-1 | ship-address-2 |
 *   ship-city | ship-state | ship-postal-code | ship-country |
 *   ship-phone-number | order-channel | signature-confirmation-recommended
 */
export async function appendOrderToSheet(data: SheetRowData): Promise<void> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const clientEmail   = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  const sheetName     = process.env.GOOGLE_SHEETS_SHEET_NAME ?? 'Orders';

  if (!spreadsheetId) throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID not configured');
  if (!clientEmail)   throw new Error('GOOGLE_SHEETS_CLIENT_EMAIL not configured');
  if (!privateKeyRaw) throw new Error('GOOGLE_SHEETS_PRIVATE_KEY not configured');

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key:  normalisePrivateKey(privateKeyRaw),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const purchaseDate = fmtDate(data.createdAt);
  // Order is already confirmed as paid at the point this function is called.
  const paymentsDate = purchaseDate;

  // One row per line item; common order fields are repeated on every row so
  // the sheet can be filtered/sorted without losing context.
  const rows: (string | number)[][] = data.items.map((item) => [
    data.orderNumber,                   // order-id
    purchaseDate,                       // purchase-date
    paymentsDate,                       // payments-date
    data.customerEmail,                 // buyer-email
    data.customerName ?? '',            // buyer-name
    '',                                 // cpf (not collected)
    '',                                 // buyer-phone-number (not in data model)
    '',                                 // sku (not in data model)
    item.productName,                   // product-name
    item.quantity,                      // quantity-purchased
    data.currency.toUpperCase(),        // currency
    fmtMoney(item.unitPrice),           // item-price
    '',                                 // item-tax (not available per-item)
    fmtMoney(data.shippingCost),        // shipping-price
    '',                                 // ship-service-level
    '',                                 // ship-service-name
    data.shippingName         ?? '',    // recipient-name
    data.shippingAddressLine1 ?? '',    // ship-address-1
    data.shippingAddressLine2 ?? '',    // ship-address-2
    data.shippingCity         ?? '',    // ship-city
    data.shippingState        ?? '',    // ship-state
    data.shippingPostalCode   ?? '',    // ship-postal-code
    data.shippingCountry      ?? '',    // ship-country
    '',                                 // ship-phone-number (not in data model)
    'Stripe',                           // order-channel
    '',                                 // signature-confirmation-recommended
  ]);

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range:            `${sheetName}!A:Z`,
    valueInputOption: 'USER_ENTERED',
    requestBody:      { values: rows },
  });
}
