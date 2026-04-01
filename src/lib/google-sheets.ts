import { google } from 'googleapis';

// ─────────────────────────────────────────────────────────────────────────────
// Data shapes — intentionally decoupled from Prisma and email-templates types.
// ─────────────────────────────────────────────────────────────────────────────

/** Data required to append a new order row (called from webhook on paid order). */
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

/** Data required to update the operational columns of an existing order row. */
export type SheetUpdateData = {
  orderNumber:       string;
  fulfillmentStatus: string;
  carrier:           string | null;
  trackingNumber:    string | null;
  shippedAt:         Date | null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Column header
// ─────────────────────────────────────────────────────────────────────────────
// Columns A–Z (26) = original warehouse fields
// Columns AA–AD (27–30) = operational / logistics fields added later

const SHEET_HEADER: string[] = [
  // ── A–Z: original warehouse columns ──────────────────────────────────────
  'order-id',                           // A  col 1
  'purchase-date',                      // B  col 2
  'payments-date',                      // C  col 3
  'buyer-email',                        // D  col 4
  'buyer-name',                         // E  col 5
  'cpf',                                // F  col 6
  'buyer-phone-number',                 // G  col 7
  'sku',                                // H  col 8
  'product-name',                       // I  col 9
  'quantity-purchased',                 // J  col 10
  'currency',                           // K  col 11
  'item-price',                         // L  col 12
  'item-tax',                           // M  col 13
  'shipping-price',                     // N  col 14
  'ship-service-level',                 // O  col 15
  'ship-service-name',                  // P  col 16
  'recipient-name',                     // Q  col 17
  'ship-address-1',                     // R  col 18
  'ship-address-2',                     // S  col 19
  'ship-city',                          // T  col 20
  'ship-state',                         // U  col 21
  'ship-postal-code',                   // V  col 22
  'ship-country',                       // W  col 23
  'ship-phone-number',                  // X  col 24
  'order-channel',                      // Y  col 25
  'signature-confirmation-recommended', // Z  col 26
  // ── AA–AD: operational columns ─────────────────────────────────────────
  'fulfillment-status',                 // AA col 27
  'carrier',                            // AB col 28
  'tracking-number',                    // AC col 29
  'shipped-at',                         // AD col 30
];

/** Spreadsheet column letter for the first operational column (fulfillment-status). */
const OPS_START_COL  = 'AA';
/** Spreadsheet column letter for the last operational column (shipped-at). */
const OPS_END_COL    = 'AD';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

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

/** Reads env vars, validates them, and returns an authenticated Sheets client. */
function buildClient(sheetName?: string) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const clientEmail   = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  const tab           = sheetName ?? (process.env.GOOGLE_SHEETS_SHEET_NAME ?? 'Orders');

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

  return {
    sheets:        google.sheets({ version: 'v4', auth }),
    spreadsheetId,
    tab,
  };
}

/**
 * Ensures the header row is present and up-to-date.
 *
 * Three cases:
 *  1. A1 is empty  → sheet is new; write the full 30-column header.
 *  2. A1 has value, AA1 is empty  → old 26-col header; extend with the 4 new op cols.
 *  3. A1 and AA1 both have values → header is complete; nothing to do.
 */
async function ensureHeader(
  sheets:        ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  tab:           string,
): Promise<void> {
  const probe = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tab}!A1:${OPS_END_COL}1`,
  });
  const row = probe.data.values?.[0] ?? [];

  if (row.length === 0) {
    // Sheet is empty → write full header
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range:            `${tab}!A1`,
      valueInputOption: 'RAW',
      requestBody:      { values: [SHEET_HEADER] },
    });
  } else if (!row[26]) {
    // Old 26-col header → append the 4 new operational column names
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range:            `${tab}!${OPS_START_COL}1`,
      valueInputOption: 'RAW',
      requestBody:      { values: [SHEET_HEADER.slice(26)] },
    });
  }
  // else: header is complete — nothing to do
}

// ─────────────────────────────────────────────────────────────────────────────
// Exported functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Appends one row per order item to the configured Google Sheet.
 * Automatically writes (or extends) the header row if needed.
 *
 * Throws on missing config or API error; callers MUST wrap in try/catch.
 */
export async function appendOrderToSheet(data: SheetRowData): Promise<void> {
  const { sheets, spreadsheetId, tab } = buildClient();

  await ensureHeader(sheets, spreadsheetId, tab);

  const purchaseDate = fmtDate(data.createdAt);
  const paymentsDate = purchaseDate; // order is already paid when this runs

  // One row per line item; common order fields repeat so the sheet stays filterable.
  const rows: (string | number)[][] = data.items.map((item) => [
    data.orderNumber,                   // A  order-id
    purchaseDate,                       // B  purchase-date
    paymentsDate,                       // C  payments-date
    data.customerEmail,                 // D  buyer-email
    data.customerName ?? '',            // E  buyer-name
    '',                                 // F  cpf (not collected)
    '',                                 // G  buyer-phone-number
    '',                                 // H  sku
    item.productName,                   // I  product-name
    item.quantity,                      // J  quantity-purchased
    data.currency.toUpperCase(),        // K  currency
    fmtMoney(item.unitPrice),           // L  item-price
    '',                                 // M  item-tax (not available per-item)
    fmtMoney(data.shippingCost),        // N  shipping-price
    '',                                 // O  ship-service-level
    '',                                 // P  ship-service-name
    data.shippingName         ?? '',    // Q  recipient-name
    data.shippingAddressLine1 ?? '',    // R  ship-address-1
    data.shippingAddressLine2 ?? '',    // S  ship-address-2
    data.shippingCity         ?? '',    // T  ship-city
    data.shippingState        ?? '',    // U  ship-state
    data.shippingPostalCode   ?? '',    // V  ship-postal-code
    data.shippingCountry      ?? '',    // W  ship-country
    '',                                 // X  ship-phone-number
    'Stripe',                           // Y  order-channel
    '',                                 // Z  signature-confirmation-recommended
    '',                                 // AA fulfillment-status (updated later by admin)
    '',                                 // AB carrier
    '',                                 // AC tracking-number
    '',                                 // AD shipped-at
  ]);

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range:            `${tab}!A:${OPS_END_COL}`,
    valueInputOption: 'USER_ENTERED',
    requestBody:      { values: rows },
  });
}

/**
 * Finds all rows in the sheet whose order-id (column A) matches
 * `data.orderNumber`, then updates the operational columns (AA–AD) with
 * the latest fulfillment data from the admin.
 *
 * - Multi-item orders produce multiple rows per order; all are updated.
 * - If the order is not found in the sheet the function throws (caller logs & ignores).
 * - Also ensures the header includes the operational columns.
 *
 * Throws on missing config, API error, or order-not-found; callers MUST wrap in try/catch.
 */
export async function updateOrderInSheet(data: SheetUpdateData): Promise<void> {
  const { sheets, spreadsheetId, tab } = buildClient();

  await ensureHeader(sheets, spreadsheetId, tab);

  // Fetch the entire order-id column (A) to locate matching rows.
  const colA = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tab}!A:A`,
  });

  const cells = colA.data.values ?? [];
  // Row 1 (index 0) is the header — start scanning from index 1 (row 2).
  const matchingRows: number[] = [];
  for (let i = 1; i < cells.length; i++) {
    if (cells[i]?.[0] === data.orderNumber) {
      matchingRows.push(i + 1); // Sheets rows are 1-indexed
    }
  }

  if (matchingRows.length === 0) {
    throw new Error(
      `Order ${data.orderNumber} not found in Google Sheet "${tab}" — skipping sync`
    );
  }

  // Build the 4-cell ops update for every matching row.
  const opsValues = [
    data.fulfillmentStatus,
    data.carrier        ?? '',
    data.trackingNumber ?? '',
    data.shippedAt ? fmtDate(data.shippedAt) : '',
  ];

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data: matchingRows.map((rowNum) => ({
        range:  `${tab}!${OPS_START_COL}${rowNum}:${OPS_END_COL}${rowNum}`,
        values: [opsValues],
      })),
    },
  });
}
