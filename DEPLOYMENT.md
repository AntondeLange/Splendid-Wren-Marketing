# Deployment Guide

## Project Sources

- `html-site/`: legacy static source kept as fallback/reference.
- `astro-site/`: current production source (Astro + Tailwind + TypeScript).

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
   - `astro-site/dist/`

## Contact Form Endpoint

The contact form posts to `/api/contact`.

- Current implementation is a placeholder validation endpoint.
- In production, deploy this route as a serverless function and forward validated submissions to your email/CRM provider.
- Keep all secrets (API keys, SMTP credentials, webhook secrets) in server environment variables only.

Recommended server-side controls:

- Strict input validation (name, business name, email, message length)
- Input sanitization before any logging/storage
- Honeypot and rate limiting
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

## Post-Deployment Checklist

- [ ] All routes return `200` (or expected redirects)
- [ ] `robots.txt` and `sitemap.xml` are served
- [ ] Metadata (title/description/OG/Twitter) is correct per page
- [ ] Contact form endpoint rejects invalid input
- [ ] Keyboard navigation and visible focus states work
- [ ] Mobile navigation and responsive layouts render correctly
- [ ] No client-side secrets are exposed
