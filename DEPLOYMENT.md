# Deployment Guide

## Project Sources

- `astro-site/`: production source (Astro + Tailwind + TypeScript + minimal progressive enhancement JS).

## Build and Deploy (Astro)

1. Install dependencies:
   ```bash
   cd astro-site
   npm install
   ```
2. Run quality checks:
   ```bash
   npm run typecheck
   npm run lint
   npm run build
   ```
3. Deploy the generated static output from:
   - `astro-site/.vercel/output/`

## Contact Form Endpoint

The contact form posts to `/api/contact`.

- Current implementation validates, sanitizes, and sends email via SMTP.
- Default destination inbox: `sarahm@splendidwrenmarketing.com.au`.
- SMTP2GO defaults are configured in code:
  - `SMTP_HOST=mail-au.smtp2go.com`
  - `SMTP_PORT=587`
  - `SMTP_SECURE=false`
- Keep all secrets (API keys, SMTP credentials, webhook secrets) in server environment variables only.

Required Vercel environment variables:

- `SMTP_USER`
- `SMTP_PASS`

Optional:

- `SMTP_HOST` (override default SMTP2GO host)
- `SMTP_PORT` (override default SMTP2GO port)
- `SMTP_SECURE` (override default `false`)
- `CONTACT_FROM_EMAIL` (defaults to `no-reply@splendidwrenmarketing.com.au`)
- `CONTACT_TO_EMAIL` (defaults to `sarahm@splendidwrenmarketing.com.au`)
- `UPSTASH_REDIS_REST_URL` (optional distributed rate-limit backend URL)
- `UPSTASH_REDIS_REST_TOKEN` (optional distributed rate-limit backend token)
- `PUBLIC_GA_MEASUREMENT_ID` (optional Google Analytics measurement ID override)
- `PUBLIC_GOOGLE_SITE_VERIFICATION` (Google Search Console verification token)
- `PUBLIC_ENABLE_SPEED_INSIGHTS` (set to `true` to enable Vercel Speed Insights)

Recommended server-side controls:

- Strict input validation (name, business name, email, message length)
- Input sanitization before any logging/storage
- Honeypot and rate limiting
- Distributed rate limiting for multi-instance traffic (Upstash Redis when configured)
- Request size limits
- Structured error handling with no stack traces in responses

## Security Headers (Recommended)

Configure these at your host/CDN:

- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: DENY`
- `Permissions-Policy` (disable unused browser features)

Example baseline:

```txt
Content-Security-Policy: default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; media-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
X-Frame-Options: DENY
```

Adjust CSP sources as needed for analytics, forms, or third-party embeds.
Keep executable browser scripts external (for example, under `astro-site/public/scripts/`) so CSP can remain
`script-src 'self' https://www.googletagmanager.com` without `'unsafe-inline'`.

## Post-Deployment Checklist

- [ ] All routes return `200` (or expected redirects)
- [ ] `robots.txt` and `sitemap.xml` are served
- [ ] `sitemap.xml` is generated from `src/pages/sitemap.xml.ts` (no static duplicate in `public/`)
- [ ] Search Console has `https://splendidwrenmarketing.com.au/sitemap.xml` submitted
- [ ] `www` redirects to canonical apex host
- [ ] Metadata (title/description/OG/Twitter) is correct per page
- [ ] Contact form endpoint rejects invalid input
- [ ] Contact form sends email to `sarahm@splendidwrenmarketing.com.au`
- [ ] Keyboard navigation and visible focus states work
- [ ] Mobile navigation and responsive layouts render correctly
- [ ] No client-side secrets are exposed
