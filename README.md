# Splendid Wren Marketing Website

Marketing website for Splendid Wren Marketing, built as a static-first Astro project with Tailwind CSS and strict TypeScript.

## Project Structure

```txt
├── astro-site/   # Current production app (Astro + Tailwind + TypeScript)
├── html-site/    # Legacy static site kept as fallback/reference
└── ...
```

## Current Stack

- Astro
- Tailwind CSS
- TypeScript (strict)
- Static output (`astro-site/dist`)

## Routes

- Home
- About
- How We Work / Pricing
- Blog (Astro content collections)
- Contact
- Tools (stub)
- Terms / Privacy

## Local Development

```bash
cd astro-site
npm install
npm run dev
```

## Quality Checks

```bash
cd astro-site
npm run typecheck
npm run lint
npm run build
```

## Deployment

- Deploy the built static output from `astro-site/dist`.
- Keep `html-site/` only as migration reference/fallback.
- See `DEPLOYMENT.md` for security headers, contact endpoint notes, and post-deploy checks.
