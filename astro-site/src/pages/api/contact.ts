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
const MAX_FORM_BYTES = 12_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 6;
const rateLimitBuckets = new Map<string, { count: number; startedAt: number }>();

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
  user: string;
  pass: string;
  from: string;
  to: string;
  targets: SmtpTarget[];
}

interface SmtpTarget {
  host: string;
  port: number;
  secure: boolean;
}

interface SmtpLikeError {
  code?: string;
  command?: string;
  responseCode?: number;
  response?: string;
  message?: string;
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

function parsePort(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const port = Number(value);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    return null;
  }

  return port;
}

function uniqueTargets(targets: SmtpTarget[]): SmtpTarget[] {
  const seen = new Set<string>();
  const result: SmtpTarget[] = [];

  for (const target of targets) {
    const key = `${target.host}:${target.port}:${target.secure ? 'secure' : 'starttls'}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(target);
  }

  return result;
}

function resolveSmtpTargets(): SmtpTarget[] {
  const explicitHost = getEnv('SMTP_HOST');
  const explicitPort = parsePort(getEnv('SMTP_PORT'));
  const explicitSecureRaw = getEnv('SMTP_SECURE');
  const explicitSecure = explicitSecureRaw ? isTrue(explicitSecureRaw) : null;

  const hosts = explicitHost ? [explicitHost] : [DEFAULT_SMTP_HOST, 'mail.smtp2go.com'];
  const ports = explicitPort ? [explicitPort] : [DEFAULT_SMTP_PORT, 2525, 8025, 465];
  const targets: SmtpTarget[] = [];

  for (const host of hosts) {
    for (const port of ports) {
      const secure = explicitSecure ?? port === 465;
      targets.push({ host, port, secure });
    }
  }

  return uniqueTargets(targets);
}

function getSmtpConfig(): SmtpConfig | null {
  const user = getEnv('SMTP_USER') ?? '';
  const pass = getEnv('SMTP_PASS') ?? '';
  const to = getEnv('CONTACT_TO_EMAIL') || DEFAULT_CONTACT_TO_EMAIL;
  const fromBase = getEnv('CONTACT_FROM_EMAIL');
  const targets = resolveSmtpTargets();

  if (!user || !pass || targets.length === 0) {
    return null;
  }

  const from = resolveFromAddress(fromBase, user, to);

  return { user, pass, from, to, targets };
}

function normalizeSmtpError(error: unknown): SmtpLikeError {
  if (typeof error !== 'object' || error === null) {
    return {};
  }

  const maybe = error as Record<string, unknown>;
  return {
    code: typeof maybe.code === 'string' ? maybe.code : undefined,
    command: typeof maybe.command === 'string' ? maybe.command : undefined,
    responseCode: typeof maybe.responseCode === 'number' ? maybe.responseCode : undefined,
    response: typeof maybe.response === 'string' ? maybe.response : undefined,
    message: typeof maybe.message === 'string' ? maybe.message : undefined,
  };
}

function mapClientFacingErrorMessage(error: SmtpLikeError): string {
  const code = error.code?.toUpperCase() ?? '';
  const details = `${error.response ?? ''} ${error.message ?? ''}`.toLowerCase();

  if (code === 'EAUTH' || error.responseCode === 535) {
    return 'Email service authentication failed. Please contact support.';
  }

  if (
    details.includes('sender domain not verified') ||
    details.includes('from header sender domain not verified') ||
    details.includes('verified senders')
  ) {
    return 'Email sender is not verified in SMTP2GO. Please verify CONTACT_FROM_EMAIL or the sender domain.';
  }

  if (
    code === 'ETIMEDOUT' ||
    code === 'ECONNECTION' ||
    code === 'ECONNREFUSED' ||
    code === 'ESOCKET' ||
    code === 'EHOSTUNREACH' ||
    code === 'ENOTFOUND'
  ) {
    return 'Email service is temporarily unreachable. Please try again shortly.';
  }

  return 'Unable to send your message right now. Please try again shortly.';
}

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim();
    if (first) {
      return first;
    }
  }

  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(ip);

  if (!bucket || now - bucket.startedAt >= RATE_LIMIT_WINDOW_MS) {
    rateLimitBuckets.set(ip, { count: 1, startedAt: now });
    return false;
  }

  if (bucket.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  bucket.count += 1;
  return false;
}

function isAllowedOrigin(request: Request): boolean {
  const originHeader = request.headers.get('origin');
  if (!originHeader) {
    return true;
  }

  try {
    const origin = new URL(originHeader);
    const requestUrl = new URL(request.url);
    return origin.host === requestUrl.host;
  } catch {
    return false;
  }
}

function json(data: unknown, status = 200, extraHeaders?: Record<string, string>): Response {
  const headers = new Headers({
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });

  if (extraHeaders) {
    for (const [key, value] of Object.entries(extraHeaders)) {
      headers.set(key, value);
    }
  }

  return new Response(JSON.stringify(data), {
    status,
    headers,
  });
}

export const GET: APIRoute = async () => {
  return json({
    ok: true,
    message: 'Contact API is online.',
  });
};

export const POST: APIRoute = async ({ request }) => {
  if (!isAllowedOrigin(request)) {
    return json({ ok: false, message: 'Origin is not allowed.' }, 403);
  }

  const contentLengthHeader = request.headers.get('content-length');
  if (contentLengthHeader) {
    const contentLength = Number(contentLengthHeader);
    if (!Number.isInteger(contentLength) || contentLength < 0) {
      return json({ ok: false, message: 'Invalid content length.' }, 400);
    }

    if (contentLength > MAX_FORM_BYTES) {
      return json({ ok: false, message: 'Request is too large.' }, 413);
    }
  }

  const clientIp = getClientIp(request);
  if (isRateLimited(clientIp)) {
    return json(
      { ok: false, message: 'Too many requests. Please wait a minute and try again.' },
      429,
      { 'retry-after': '60' },
    );
  }

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

  let sendError: SmtpLikeError | null = null;

  for (const target of smtpConfig.targets) {
    try {
      const transporter = nodemailer.createTransport({
        host: target.host,
        port: target.port,
        secure: target.secure,
        auth: {
          user: smtpConfig.user,
          pass: smtpConfig.pass,
        },
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 12000,
      });

      await transporter.sendMail({
        from: smtpConfig.from,
        to: smtpConfig.to,
        replyTo: email,
        subject: `Website enquiry: ${businessName}`,
        text: textBody,
        html: htmlBody,
      });

      sendError = null;
      break;
    } catch (error) {
      sendError = normalizeSmtpError(error);
      console.error('Contact email send failed for SMTP target:', {
        host: target.host,
        port: target.port,
        secure: target.secure,
        code: sendError.code,
        command: sendError.command,
        responseCode: sendError.responseCode,
        response: sendError.response,
        message: sendError.message,
      });
    }
  }

  if (sendError) {
    return json(
      {
        ok: false,
        message: mapClientFacingErrorMessage(sendError),
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
