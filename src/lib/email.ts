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
// sendEmail
// ─────────────────────────────────────────────────────────────────────────────

export async function sendEmail(options: EmailPayload): Promise<void> {
  try {
    console.log('📧 Sending email to:', options.to);

    const transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   Number(process.env.SMTP_PORT) || 465,
      // string comparison: process.env values are always strings
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.verify();
    console.log('✅ SMTP connection OK');

    const info = await transporter.sendMail({
      from: `${process.env.SMTP_FROM_NAME ?? 'Dips Chocolate'} <${process.env.SMTP_FROM_EMAIL ?? process.env.SMTP_USER}>`,
      ...options,
    });

    console.log('📨 Email sent:', info.messageId);
  } catch (error) {
    console.error('❌ Email error:', error);
    // Re-throw so callers' .catch() handlers are invoked correctly.
    throw error;
  }
}
