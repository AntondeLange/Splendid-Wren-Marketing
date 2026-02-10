# Splendid Wren Marketing (Astro)

This is the modern Astro + Tailwind + TypeScript rebuild of the legacy `html-site/` implementation.

## Stack

- Astro (static-first)
- Tailwind CSS
- TypeScript (strict)
- Astro Content Collections for blog content
- Astro image optimization (`astro:assets`)

React islands are not currently used to keep client JavaScript minimal.

## Project Structure

- `src/pages/` routes
- `src/layouts/` shared page layouts
- `src/components/` Astro UI components
- `src/components/react/` reserved for future client islands
- `src/lib/` typed constants/helpers
- `src/content/` blog content collections
- `public/` static assets (`robots.txt`, `sitemap.xml`, media)

## Local Development

```bash
npm install
npm run dev
```

## Quality Gates

```bash
npm run typecheck
npm run lint
npm run build
```

## Contact Form Endpoint

The contact form submits to `/api/contact`.

- Current route is a placeholder with validation/sanitization logic for future serverless integration.
- Configure production email/CRM delivery in deployment environment.
