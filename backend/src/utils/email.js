/**
 * Sends transactional email over HTTPS (port 443) using Resend's REST API.
 *
 * Why not SMTP / nodemailer? Serverless hosts like Vercel block outbound
 * SMTP ports (25/465/587) on their free tiers, so nodemailer silently times
 * out there. A plain HTTPS POST has no such restriction and works the same
 * on Render, Vercel, or a normal VPS.
 *
 * Uses Node's built-in fetch (Node 18+), so no extra dependency is needed.
 *
 * ── Swapping providers ───────────────────────────────────────────────────
 * Resend, Brevo, SendGrid, and Mailgun all expose a simple JSON-over-HTTPS
 * API, so switching later just means changing the fetch call below —
 * nothing else in the codebase (auth.js) needs to change.
 *
 *   Brevo:    POST https://api.brevo.com/v3/smtp/email
 *             headers: { 'api-key': BREVO_API_KEY }
 *             body: { sender:{email}, to:[{email}], subject, htmlContent }
 *
 *   SendGrid: POST https://api.sendgrid.com/v3/mail/send
 *             headers: { Authorization: `Bearer ${SENDGRID_API_KEY}` }
 *             body: { personalizations:[{to:[{email}]}], from:{email}, subject,
 *                      content:[{type:'text/html', value: html}] }
 *
 *   Mailgun:  POST https://api.mailgun.net/v3/<domain>/messages  (form-encoded,
 *             Basic auth with 'api' + MAILGUN_API_KEY)
 */

const RESEND_API_URL = 'https://api.resend.com/emails';

async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from   = process.env.EMAIL_FROM || 'Smart Quiz <onboarding@resend.dev>';

  if (!apiKey) {
    // Fail loudly in server logs but don't crash the request — the caller
    // still returns a generic success message to the client either way
    // (see auth.js), so we never reveal whether an email exists.
    console.error('[email] RESEND_API_KEY is not set — skipping send. Add it to your .env.');
    return { skipped: true };
  }

  const res = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }

  return res.json();
}

function resetPasswordEmailHtml(resetUrl) {
  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 480px; margin: auto; padding: 32px 24px; background: #0a0e17; color: #f1f5f9; border-radius: 16px;">
    <h2 style="margin: 0 0 16px; font-size: 22px; color: #ffffff;">Reset your password</h2>
    <p style="margin: 0 0 24px; font-size: 15px; line-height: 24px; color: #94a3b8;">
      We received a request to reset your Smart Quiz password. Click the button below to
      choose a new one. This link expires in 1 hour.
    </p>
    <a href="${resetUrl}"
       style="display: inline-block; background: linear-gradient(90deg,#6366f1,#10b981); color: #ffffff; text-decoration: none; font-weight: 700; padding: 14px 28px; border-radius: 12px; font-size: 15px;">
      Reset Password
    </a>
    <p style="margin: 24px 0 0; font-size: 13px; line-height: 20px; color: #64748b;">
      If you didn't request this, you can safely ignore this email — your password won't change.
    </p>
    <p style="margin: 16px 0 0; font-size: 12px; color: #475569; word-break: break-all;">
      Or paste this link into your browser: ${resetUrl}
    </p>
  </div>`;
}

async function sendPasswordResetEmail(toEmail, resetUrl) {
  return sendEmail({
    to: toEmail,
    subject: 'Reset your Smart Quiz password',
    html: resetPasswordEmailHtml(resetUrl),
  });
}

module.exports = { sendEmail, sendPasswordResetEmail };
