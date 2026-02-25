# Splendid Wren Marketing (Astro)

Production site built with Astro + Tailwind + TypeScript, using Astro components and targeted vanilla JS enhancement where needed.

## Stack

- Astro (static-first)
- Tailwind CSS
- TypeScript (strict)
- Astro Content Collections for blog content
- Astro image optimization (`astro:assets`)

## Project Structure

- `src/pages/` routes
- `src/layouts/` shared page layouts
- `src/components/` Astro UI components
- `src/lib/` typed constants/helpers
- `src/content/` blog content collections
- `public/` static assets (`robots.txt`, media)

## Local Development

```bash
npm install
npm run dev
```

For local contact form testing, create `astro-site/.env.local` from `astro-site/.env.example` and set SMTP credentials.

## Quality Gates

```bash
npm run typecheck
npm run lint
npm run build
```

## Contact Form Endpoint

The contact form submits to `/api/contact`.

- Route validates and sanitizes input, then sends email via SMTP.
- Default recipient is `sarahm@splendidwrenmarketing.com.au`.
- SMTP2GO defaults are preconfigured:
  - `SMTP_HOST=mail-au.smtp2go.com`
  - `SMTP_PORT=587`
  - `SMTP_SECURE=false`
- Configure these server environment variables in Vercel:
  - `SMTP_USER`
  - `SMTP_PASS`
  - `SMTP_HOST` (optional override)
  - `SMTP_PORT` (optional override)
  - `SMTP_SECURE` (optional override)
  - `CONTACT_FROM_EMAIL` (optional; defaults to `no-reply@splendidwrenmarketing.com.au`)
  - `CONTACT_TO_EMAIL` (optional; defaults to `sarahm@splendidwrenmarketing.com.au`)
  - `PUBLIC_GA_MEASUREMENT_ID` (optional GA4 browser tracking)
  - `GA4_MEASUREMENT_ID` and `GA4_API_SECRET` (optional server-side lead fallback event)

## Analytics Contract

- Event naming, payload rules, and QA checklist live in:
  - `../docs/analytics-event-contract.md`
