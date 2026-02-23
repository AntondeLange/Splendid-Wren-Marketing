import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

export const prerender = false;

type EnvMap = Record<string, string | undefined>;
const ENV = import.meta.env as EnvMap;
const PROCESS_ENV = (globalThis as { process?: { env?: EnvMap } }).process?.env ?? {};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[\d\s()+-]{6,20}$/;
const DEFAULT_CONTACT_TO_EMAIL = 'sarahm@splendidwrenmarketing.com.au';
const DEFAULT_CONTACT_FROM_EMAIL = 'no-reply@splendidwrenmarketing.com.au';
const DEFAULT_SMTP_HOST = 'mail-au.smtp2go.com';
const DEFAULT_SMTP_PORT = 587;

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

function getEnv(name: string): string | undefined {
  const fromAstro = ENV[name]?.trim();
  if (fromAstro) {
    return fromAstro;
  }

  const fromProcess = PROCESS_ENV[name]?.trim();
  if (fromProcess) {
    return fromProcess;
  }

  return undefined;
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

function extractEmailAddress(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const bracketMatch = trimmed.match(/<([^>]+)>/);
  const candidate = (bracketMatch ? bracketMatch[1] : trimmed).trim();
  return EMAIL_PATTERN.test(candidate) ? candidate : null;
}

function toDisplayAddress(email: string): string {
  return `Splendid Wren Website <${email}>`;
}

function resolveFromAddress(fromBase: string | undefined, user: string, to: string): string {
  const fromBaseEmail = fromBase ? extractEmailAddress(fromBase) : null;
  if (fromBaseEmail) {
    if (fromBase && fromBase.includes('<') && fromBase.includes('>')) {
      return fromBase;
    }

    return toDisplayAddress(fromBaseEmail);
  }

  const userEmail = extractEmailAddress(user);
  if (userEmail) {
    return toDisplayAddress(userEmail);
  }

  const toEmail = extractEmailAddress(to);
  if (toEmail) {
    return toDisplayAddress(toEmail);
  }

  return toDisplayAddress(DEFAULT_CONTACT_FROM_EMAIL);
}

function getSmtpConfig(): SmtpConfig | null {
  const host = getEnv('SMTP_HOST') || DEFAULT_SMTP_HOST;
  const portRaw = getEnv('SMTP_PORT') ?? String(DEFAULT_SMTP_PORT);
  const user = getEnv('SMTP_USER') ?? '';
  const pass = getEnv('SMTP_PASS') ?? '';
  const to = getEnv('CONTACT_TO_EMAIL') || DEFAULT_CONTACT_TO_EMAIL;
  const fromBase = getEnv('CONTACT_FROM_EMAIL');
  const port = Number(portRaw);

  if (!user || !pass || !Number.isFinite(port) || port <= 0) {
    return null;
  }

  const secureEnv = getEnv('SMTP_SECURE');
  const secure = secureEnv ? isTrue(secureEnv) : port === 465;
  const from = resolveFromAddress(fromBase, user, to);

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
