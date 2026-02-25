import type { APIRoute } from 'astro';
import { randomUUID } from 'node:crypto';
import { isIP } from 'node:net';
import nodemailer from 'nodemailer';

export const prerender = false;

type EnvMap = Record<string, string | undefined>;
const ENV = import.meta.env as EnvMap;
const PROCESS_ENV = (globalThis as { process?: { env?: EnvMap } }).process?.env ?? {};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[\d\s()+-]{6,20}$/;
const SERVICE_FOCUS_OPTIONS: Record<string, string> = {
  'small-business-marketing-consulting': 'Small Business Marketing Consulting',
  'ai-marketing-support': 'AI Marketing Support',
  'brand-strategy': 'Brand Strategy',
  'not-sure-yet': 'Not sure yet',
};
const DEFAULT_CONTACT_TO_EMAIL = 'sarahm@splendidwrenmarketing.com.au';
const DEFAULT_CONTACT_FROM_EMAIL = 'no-reply@splendidwrenmarketing.com.au';
const DEFAULT_SMTP_HOST = 'mail-au.smtp2go.com';
const DEFAULT_SMTP_PORT = 587;
const MAX_FORM_BYTES = 12_000;
const MAX_NAME_CHARS = 80;
const MAX_BUSINESS_NAME_CHARS = 120;
const MAX_EMAIL_CHARS = 254;
const MAX_PHONE_CHARS = 20;
const MAX_SUBJECT_BUSINESS_NAME_CHARS = 80;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_WINDOW_SECONDS = Math.ceil(RATE_LIMIT_WINDOW_MS / 1000);
const RATE_LIMIT_MAX_REQUESTS = 6;
const RATE_LIMIT_BACKEND_TIMEOUT_MS = 2_500;
const GA4_EVENT_TIMEOUT_MS = 1_500;
const ALLOWED_FORM_FIELDS = new Set([
  'website',
  'formName',
  'name',
  'businessName',
  'email',
  'phone',
  'serviceFocus',
  'message',
]);
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

function sanitizeHeaderValue(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
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

function getServiceFocusLabel(value: string): string | null {
  return SERVICE_FOCUS_OPTIONS[value] ?? null;
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

interface RateLimitDecision {
  limited: boolean;
  retryAfterSeconds: number;
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

function parseClientIp(rawValue: string | null): string | null {
  if (!rawValue) {
    return null;
  }

  const first = rawValue.split(',')[0]?.trim();
  if (!first) {
    return null;
  }

  const bracketedIpv6 = first.match(/^\[([0-9a-fA-F:]+)\]:(\d+)$/);
  const ipv4WithPort = first.match(/^(\d{1,3}(?:\.\d{1,3}){3}):(\d+)$/);
  const normalizedCandidate = bracketedIpv6?.[1] ?? ipv4WithPort?.[1] ?? first;
  return isIP(normalizedCandidate) ? normalizedCandidate : null;
}

function getClientIp(request: Request): string {
  const candidates = [
    request.headers.get('x-vercel-forwarded-for'),
    request.headers.get('x-real-ip'),
    request.headers.get('x-forwarded-for'),
  ];

  for (const candidate of candidates) {
    const parsedIp = parseClientIp(candidate);
    if (parsedIp) {
      return parsedIp;
    }
  }

  return 'unknown';
}

function estimateFormDataBytes(formData: FormData): number {
  const encoder = new TextEncoder();
  let total = 0;

  for (const [key, value] of formData.entries()) {
    total += encoder.encode(key).length;
    if (typeof value === 'string') {
      total += encoder.encode(value).length;
    } else {
      total += value.size;
    }
  }

  return total;
}

function checkRateLimitInMemory(ip: string): RateLimitDecision {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(ip);

  if (!bucket || now - bucket.startedAt >= RATE_LIMIT_WINDOW_MS) {
    rateLimitBuckets.set(ip, { count: 1, startedAt: now });
    return {
      limited: false,
      retryAfterSeconds: RATE_LIMIT_WINDOW_SECONDS,
    };
  }

  if (bucket.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      limited: true,
      retryAfterSeconds: RATE_LIMIT_WINDOW_SECONDS,
    };
  }

  bucket.count += 1;
  return {
    limited: false,
    retryAfterSeconds: RATE_LIMIT_WINDOW_SECONDS,
  };
}

async function checkRateLimitWithRedis(ip: string): Promise<RateLimitDecision | null> {
  const redisUrl = getEnv('UPSTASH_REDIS_REST_URL');
  const redisToken = getEnv('UPSTASH_REDIS_REST_TOKEN');

  if (!redisUrl || !redisToken || ip === 'unknown') {
    return null;
  }

  const normalizedUrl = redisUrl.replace(/\/$/, '');
  const key = `contact-rate-limit:${ip}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), RATE_LIMIT_BACKEND_TIMEOUT_MS);

  try {
    const response = await fetch(`${normalizedUrl}/pipeline`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${redisToken}`,
        'content-type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify([
        ['INCR', key],
        ['EXPIRE', key, RATE_LIMIT_WINDOW_SECONDS],
      ]),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error('Contact rate-limit backend returned non-OK status.', { status: response.status });
      return null;
    }

    const payload = (await response.json()) as Array<{ result?: unknown }> | null;
    const count = Number(payload?.[0]?.result);

    if (!Number.isFinite(count)) {
      console.error('Contact rate-limit backend returned an invalid counter value.', {
        result: payload?.[0]?.result,
      });
      return null;
    }

    return {
      limited: count > RATE_LIMIT_MAX_REQUESTS,
      retryAfterSeconds: RATE_LIMIT_WINDOW_SECONDS,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Contact rate-limit backend request timed out.');
      return null;
    }

    console.error('Contact rate-limit backend request failed.', error);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function checkRateLimit(ip: string): Promise<RateLimitDecision> {
  const distributedDecision = await checkRateLimitWithRedis(ip);
  if (distributedDecision) {
    return distributedDecision;
  }

  return checkRateLimitInMemory(ip);
}

function hasMatchingHost(rawUrl: string, expectedHost: string): boolean {
  try {
    return new URL(rawUrl).host === expectedHost;
  } catch {
    return false;
  }
}

function isAllowedOrigin(request: Request): boolean {
  const requestHost = new URL(request.url).host;
  const originHeader = request.headers.get('origin');
  if (originHeader) {
    return hasMatchingHost(originHeader, requestHost);
  }

  const refererHeader = request.headers.get('referer');
  if (refererHeader) {
    return hasMatchingHost(refererHeader, requestHost);
  }

  const fetchSite = request.headers.get('sec-fetch-site')?.toLowerCase();
  if (fetchSite) {
    return fetchSite === 'same-origin' || fetchSite === 'same-site' || fetchSite === 'none';
  }

  return false;
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

function logContactOutcome(outcome: string, details: Record<string, string | number | boolean> = {}): void {
  console.info('contact_outcome', {
    outcome,
    ...details,
  });
}

function sanitizeAnalyticsValue(value: string): string {
  return value.trim().replace(/\s+/g, '_').toLowerCase().slice(0, 64) || 'unknown';
}

function getGa4MeasurementId(): string | null {
  const explicit = getEnv('GA4_MEASUREMENT_ID');
  if (explicit) {
    return explicit;
  }

  const publicMeasurementId = getEnv('PUBLIC_GA_MEASUREMENT_ID');
  if (publicMeasurementId) {
    return publicMeasurementId;
  }

  return null;
}

async function sendServerLeadAcceptedEvent(serviceFocus: string): Promise<void> {
  const measurementId = getGa4MeasurementId();
  const apiSecret = getEnv('GA4_API_SECRET');
  if (!measurementId || !apiSecret) {
    return;
  }

  const endpoint =
    `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(measurementId)}` +
    `&api_secret=${encodeURIComponent(apiSecret)}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GA4_EVENT_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        client_id: randomUUID(),
        non_personalized_ads: true,
        events: [
          {
            name: 'lead_accepted_server',
            params: {
              event_source: 'server',
              lead_type: 'contact_form',
              service_focus: sanitizeAnalyticsValue(serviceFocus || 'not_specified'),
              engagement_time_msec: 1,
            },
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error('Server analytics event failed.', { status: response.status });
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Server analytics event timed out.');
      return;
    }

    console.error('Server analytics event request failed.', error);
  } finally {
    clearTimeout(timeoutId);
  }
}

export const GET: APIRoute = async () => {
  return json({
    ok: true,
    message: 'Contact API is online.',
  });
};

export const POST: APIRoute = async ({ request }) => {
  if (!isAllowedOrigin(request)) {
    logContactOutcome('blocked_origin');
    return json({ ok: false, message: 'Origin is not allowed.' }, 403);
  }

  const contentLengthHeader = request.headers.get('content-length');
  if (contentLengthHeader) {
    const contentLength = Number(contentLengthHeader);
    if (!Number.isInteger(contentLength) || contentLength < 0) {
      logContactOutcome('invalid_content_length');
      return json({ ok: false, message: 'Invalid content length.' }, 400);
    }

    if (contentLength > MAX_FORM_BYTES) {
      logContactOutcome('payload_too_large', { source: 'content_length' });
      return json({ ok: false, message: 'Request is too large.' }, 413);
    }
  }

  const clientIp = getClientIp(request);
  const rateLimitDecision = await checkRateLimit(clientIp);
  if (rateLimitDecision.limited) {
    logContactOutcome('rate_limited', { retry_after: rateLimitDecision.retryAfterSeconds });
    return json(
      { ok: false, message: 'Too many requests. Please wait a minute and try again.' },
      429,
      { 'retry-after': String(rateLimitDecision.retryAfterSeconds) },
    );
  }

  const contentType = request.headers.get('content-type') ?? '';
  if (
    !contentType.includes('application/x-www-form-urlencoded') &&
    !contentType.includes('multipart/form-data')
  ) {
    logContactOutcome('unsupported_content_type');
    return json({ ok: false, message: 'Unsupported content type.' }, 415);
  }

  const formData = await request.formData();

  if (estimateFormDataBytes(formData) > MAX_FORM_BYTES) {
    logContactOutcome('payload_too_large', { source: 'form_data' });
    return json({ ok: false, message: 'Request is too large.' }, 413);
  }

  for (const [fieldName, value] of formData.entries()) {
    if (!ALLOWED_FORM_FIELDS.has(fieldName)) {
      logContactOutcome('unsupported_form_field');
      return json({ ok: false, message: 'Unsupported form field.' }, 400);
    }

    if (typeof value !== 'string') {
      logContactOutcome('rejected_file_upload');
      return json({ ok: false, message: 'File uploads are not supported.' }, 415);
    }
  }

  if (String(formData.get('website') ?? '').trim()) {
    logContactOutcome('honeypot_triggered');
    return json({ ok: true }, 202);
  }

  const name = sanitize(formData.get('name'));
  const businessName = sanitize(formData.get('businessName'));
  const email = sanitize(formData.get('email'));
  const phone = sanitize(formData.get('phone'));
  const serviceFocus = sanitize(formData.get('serviceFocus'));
  const message = sanitize(formData.get('message'));
  const serviceFocusLabel = serviceFocus ? getServiceFocusLabel(serviceFocus) : null;

  const errors: string[] = [];

  if (!name) errors.push('Name is required.');
  if (name.length > MAX_NAME_CHARS) errors.push(`Name must be ${MAX_NAME_CHARS} characters or fewer.`);
  if (!businessName) errors.push('Business name is required.');
  if (businessName.length > MAX_BUSINESS_NAME_CHARS) {
    errors.push(`Business name must be ${MAX_BUSINESS_NAME_CHARS} characters or fewer.`);
  }
  if (email.length > MAX_EMAIL_CHARS) errors.push(`Email must be ${MAX_EMAIL_CHARS} characters or fewer.`);
  if (!EMAIL_PATTERN.test(email)) errors.push('Valid email is required.');
  if (phone.length > MAX_PHONE_CHARS) errors.push(`Phone number must be ${MAX_PHONE_CHARS} characters or fewer.`);
  if (phone && !PHONE_PATTERN.test(phone)) errors.push('Valid phone number is required.');
  if (serviceFocus && !serviceFocusLabel) errors.push('Valid service focus is required.');
  if (message.length < 10 || message.length > 200) {
    errors.push('Message must be between 10 and 200 characters.');
  }

  if (errors.length > 0) {
    logContactOutcome('validation_failed', { error_count: errors.length });
    return json({ ok: false, errors }, 400);
  }

  const smtpConfig = getSmtpConfig();
  if (!smtpConfig) {
    logContactOutcome('service_not_configured');
    return json(
      {
        ok: false,
        message: 'Contact service is not configured yet. Please try again shortly.',
      },
      503,
    );
  }

  const submittedAt = new Date().toISOString();
  const subjectBusinessName = sanitizeHeaderValue(businessName).slice(0, MAX_SUBJECT_BUSINESS_NAME_CHARS);
  const textBody = [
    'New contact form enquiry',
    '',
    `Name: ${name}`,
    `Business Name: ${businessName}`,
    `Email: ${email}`,
    `Phone: ${phone || 'Not provided'}`,
    `Service Focus: ${serviceFocusLabel ?? 'Not specified'}`,
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
    <p><strong>Phone:</strong> ${escapeHtml(phone || 'Not provided')}</p>
    <p><strong>Service Focus:</strong> ${escapeHtml(serviceFocusLabel ?? 'Not specified')}</p>
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
        subject: `Website enquiry: ${subjectBusinessName || 'New enquiry'}`,
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
    logContactOutcome('delivery_failed', {
      error_code: sendError.code ?? 'unknown',
      response_code: sendError.responseCode ?? 0,
    });
    return json(
      {
        ok: false,
        message: mapClientFacingErrorMessage(sendError),
      },
      502,
    );
  }

  logContactOutcome('accepted');
  void sendServerLeadAcceptedEvent(serviceFocus);
  return json(
    {
      ok: true,
      message: 'Thanks, your message has been sent. We will reply by email soon.',
    },
    202,
  );
};
