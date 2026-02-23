import type { APIRoute } from 'astro';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[\d\s()+-]{6,20}$/;

function sanitize(value: FormDataEntryValue | null): string {
  return String(value ?? '')
    .replace(/[<>]/g, '')
    .trim();
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
    ok: false,
    message:
      'Contact API placeholder. Deploy this route on a serverless platform for production POST handling.',
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

  // Placeholder only: route validates and sanitizes input but does not persist or forward data yet.
  return json(
    {
      ok: true,
      message:
        'Submission accepted by placeholder endpoint. Configure secure email/CRM delivery in deployment.',
    },
    202,
  );
};
