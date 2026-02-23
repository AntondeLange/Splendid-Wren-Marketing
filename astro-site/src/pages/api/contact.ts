import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[\d\s()+-]{6,20}$/;
const DEFAULT_CONTACT_TO_EMAIL = 'sarahm@splendidwrenmarketing.com.au';
const DEFAULT_SMTP_HOST = 'mail-au.smtp2go.com';
const DEFAULT_SMTP_PORT = 2525;

function sanitize(value: FormDataEntryValue | null): string {
  return String(value ?? '')
    .replace(/[<>]/g, '')
    .trim();
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function isTrue(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === 'true';
}

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  to: string;
}

function getSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST?.trim() || DEFAULT_SMTP_HOST;
  const portRaw = process.env.SMTP_PORT?.trim() ?? String(DEFAULT_SMTP_PORT);
  const user = process.env.SMTP_USER?.trim() ?? '';
  const pass = process.env.SMTP_PASS?.trim() ?? '';
  const to = process.env.CONTACT_TO_EMAIL?.trim() || DEFAULT_CONTACT_TO_EMAIL;
  const fromBase = process.env.CONTACT_FROM_EMAIL?.trim() || user || to;
  const port = Number(portRaw);

  if (!user || !pass || !Number.isFinite(port) || port <= 0) {
    return null;
  }

  const secure = process.env.SMTP_SECURE ? isTrue(process.env.SMTP_SECURE) : port === 465;
  const from = fromBase.includes('<') ? fromBase : `Splendid Wren Website <${fromBase}>`;

  return { host, port, secure, user, pass, from, to };
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

export const GET: APIRoute = async () => {
  return json({
    ok: true,
    message: 'Contact API is online.',
  });
};

export const POST: APIRoute = async ({ request }) => {
  const contentType = request.headers.get('content-type') ?? '';
  if (
    !contentType.includes('application/x-www-form-urlencoded') &&
    !contentType.includes('multipart/form-data')
  ) {
    return json({ ok: false, message: 'Unsupported content type.' }, 415);
  }

  const formData = await request.formData();

  if (String(formData.get('website') ?? '').trim()) {
    return json({ ok: true }, 202);
  }

  const name = sanitize(formData.get('name'));
  const businessName = sanitize(formData.get('businessName'));
  const email = sanitize(formData.get('email'));
  const phone = sanitize(formData.get('phone'));
  const message = sanitize(formData.get('message'));

  const errors: string[] = [];

  if (!name) errors.push('Name is required.');
  if (!businessName) errors.push('Business name is required.');
  if (!EMAIL_PATTERN.test(email)) errors.push('Valid email is required.');
  if (!PHONE_PATTERN.test(phone)) errors.push('Valid phone number is required.');
  if (message.length < 10 || message.length > 200) {
    errors.push('Message must be between 10 and 200 characters.');
  }

  if (errors.length > 0) {
    return json({ ok: false, errors }, 400);
  }

  const smtpConfig = getSmtpConfig();
  if (!smtpConfig) {
    return json(
      {
        ok: false,
        message: 'Contact service is not configured yet. Please try again shortly.',
      },
      503,
    );
  }

  const submittedAt = new Date().toISOString();
  const textBody = [
    'New contact form enquiry',
    '',
    `Name: ${name}`,
    `Business Name: ${businessName}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Submitted: ${submittedAt}`,
    '',
    'Message:',
    message,
  ].join('\n');

  const htmlBody = `
    <h2>New contact form enquiry</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Business Name:</strong> ${escapeHtml(businessName)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
    <p><strong>Submitted:</strong> ${escapeHtml(submittedAt)}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replaceAll('\n', '<br />')}</p>
  `;

  try {
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
    });

    await transporter.sendMail({
      from: smtpConfig.from,
      to: smtpConfig.to,
      replyTo: email,
      subject: `Website enquiry: ${businessName}`,
      text: textBody,
      html: htmlBody,
    });
  } catch (error) {
    console.error('Contact email send failed:', error);
    return json(
      {
        ok: false,
        message: 'Unable to send your message right now. Please try again shortly.',
      },
      502,
    );
  }

  return json(
    {
      ok: true,
      message: 'Thanks, your message has been sent. We will reply by email soon.',
    },
    202,
  );
};
