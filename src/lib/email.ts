import nodemailer, { Transporter } from 'nodemailer';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type EmailPayload = {
  to:      string;
  subject: string;
  html:    string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Module-scoped transporter — created once per Node.js instance / cold start
// ─────────────────────────────────────────────────────────────────────────────

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

const transporter: Transporter | null =
  smtpHost && smtpPort && smtpUser && smtpPass
    ? nodemailer.createTransport({
        host:   smtpHost,
        port:   Number(smtpPort),
        secure: Number(smtpPort) === 465,
        auth: { user: smtpUser, pass: smtpPass },
      })
    : null;

// ─────────────────────────────────────────────────────────────────────────────
// sendEmail
// ─────────────────────────────────────────────────────────────────────────────

export async function sendEmail(options: EmailPayload): Promise<void> {
  if (!transporter) {
    throw new Error('SMTP not configured — missing SMTP_HOST/PORT/USER/PASS');
  }

  try {
    console.log('📧 Sending email to:', options.to);

    const info = await transporter.sendMail({
      from: `${process.env.SMTP_FROM_NAME ?? 'Dips Chocolate'} <${process.env.SMTP_FROM_EMAIL ?? smtpUser}>`,
      ...options,
    });

    console.log('📨 Email sent:', info.messageId);
  } catch (error) {
    console.error('❌ Email error:', error);
    // Re-throw so callers' .catch() handlers are invoked correctly.
    throw error;
  }
}
