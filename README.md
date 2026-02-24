# Splendid Wren Marketing Website

Marketing website for Splendid Wren Marketing, built with Astro, Tailwind CSS, strict TypeScript, and targeted vanilla JS for progressive enhancement.

## Project Structure

```txt
├── astro-site/   # Production app (Astro + Tailwind + TypeScript)
└── ...
```

## Current Stack

- Astro
- Tailwind CSS
- TypeScript (strict)
- Progressive enhancement with minimal client JS
- Vercel adapter output (`astro-site/.vercel/output`)

## Routes

- Home
- About
- How We Work / Pricing
- Blog (Astro content collections)
- Contact
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

- Deploy with Vercel using `vercel.json`.
- See `DEPLOYMENT.md` for security headers, contact endpoint notes, and post-deploy checks.
