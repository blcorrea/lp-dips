import nodemailer from 'nodemailer';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type EmailPayload = {
  to:      string;
  subject: string;
  html:    string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Transport — lazy singleton (reused within a single serverless invocation)
// ─────────────────────────────────────────────────────────────────────────────

let _transport: nodemailer.Transporter | null = null;

function getTransport(): nodemailer.Transporter {
  if (_transport) return _transport;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      'Missing SMTP configuration. Set SMTP_HOST, SMTP_USER and SMTP_PASS in your environment.'
    );
  }

  _transport = nodemailer.createTransport({
    host,
    port,
    // port 465 = implicit TLS; port 587 = STARTTLS
    secure: port === 465,
    auth:   { user, pass },
  });

  return _transport;
}

// ─────────────────────────────────────────────────────────────────────────────
// sendEmail
// ─────────────────────────────────────────────────────────────────────────────

export async function sendEmail({ to, subject, html }: EmailPayload): Promise<void> {
  const fromName  = process.env.SMTP_FROM_NAME  ?? 'Dips Chocolate';
  const fromEmail = process.env.SMTP_FROM_EMAIL ?? process.env.SMTP_USER ?? '';
  const from      = `"${fromName}" <${fromEmail}>`;

  const transport = getTransport();
  await transport.sendMail({ from, to, subject, html });
}
