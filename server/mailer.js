// Sends form submissions to the EDSCRIPT team by email (SMTP via nodemailer).
//
// Configure with environment variables (Vercel → Project → Settings → Environment Variables,
// or a local .env file in the project root):
//   SMTP_HOST     e.g. smtp.gmail.com / smtp.office365.com / smtp.zoho.in
//   SMTP_PORT     465 (SSL) or 587 (STARTTLS); default 465
//   SMTP_USER     the mailbox that sends, e.g. website@toprockglobal.com
//   SMTP_PASS     its password / app password
//   MAIL_FROM     optional display sender, default "EDSCRIPT Website <SMTP_USER>"
//   MAIL_TO       optional comma-separated recipients, default the two below
import nodemailer from 'nodemailer';

const DEFAULT_TO = [
  'karthikeyan@toprockglobal.com',
  'vinoth@toprockglobal.com',
];

const env = (k) => (process.env[k] || '').trim();

export const mailConfigured = () => Boolean(env('SMTP_HOST') && env('SMTP_USER') && env('SMTP_PASS'));

let transport;
function getTransport() {
  if (!transport) {
    const port = Number(env('SMTP_PORT')) || 465;
    transport = nodemailer.createTransport({
      host: env('SMTP_HOST'),
      port,
      secure: port === 465,
      auth: { user: env('SMTP_USER'), pass: env('SMTP_PASS') },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });
  }
  return transport;
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/**
 * Email one submission to the team.
 * @param {object} opts
 * @param {string} opts.subject
 * @param {string} opts.heading      line shown at the top of the email
 * @param {[string, string][]} opts.rows  label/value pairs, in display order
 * @param {string} opts.replyTo      the submitter's email, so "Reply" goes straight to them
 */
export async function sendSubmission({ subject, heading, rows, replyTo }) {
  const to = env('MAIL_TO') ? env('MAIL_TO').split(',').map((s) => s.trim()).filter(Boolean) : DEFAULT_TO;
  const from = env('MAIL_FROM') || `EDSCRIPT Website <${env('SMTP_USER')}>`;
  const shown = rows.filter(([, v]) => v !== '' && v != null);

  const text = `${heading}\n\n${shown.map(([k, v]) => `${k}: ${v}`).join('\n')}\n`;
  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f4fbfa;font-family:Arial,Helvetica,sans-serif;color:#0b2a28">
  <table role="presentation" width="100%" style="max-width:620px;margin:0 auto;background:#fff;border-radius:14px;border:1px solid #d7efeb;border-collapse:separate">
    <tr><td style="padding:22px 26px;background:#0d6b65;border-radius:14px 14px 0 0;color:#fff;font-size:18px;font-weight:bold">${esc(heading)}</td></tr>
    <tr><td style="padding:10px 26px 22px">
      <table role="presentation" width="100%" style="border-collapse:collapse">
        ${shown.map(([k, v]) => `<tr>
          <td style="padding:10px 12px 10px 0;border-bottom:1px solid #e6f4f2;font-size:13px;color:#4b6b68;white-space:nowrap;vertical-align:top;width:34%">${esc(k)}</td>
          <td style="padding:10px 0;border-bottom:1px solid #e6f4f2;font-size:15px;white-space:pre-wrap">${esc(v)}</td>
        </tr>`).join('')}
      </table>
      <p style="margin:18px 0 0;font-size:12px;color:#7a9592">Sent from the EDSCRIPT website. Reply to this email to answer the person directly.</p>
    </td></tr>
  </table></body></html>`;

  await getTransport().sendMail({ from, to, replyTo, subject, text, html });
}
