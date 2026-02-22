# Splendid Wren Marketing Website

Marketing website for Splendid Wren Marketing, built with Astro, Tailwind CSS, strict TypeScript, Astro components, and React islands.

## Project Structure

```txt
├── astro-site/   # Production app (Astro + Tailwind + TypeScript + React islands)
└── ...
```

## Current Stack

- Astro
- Tailwind CSS
- TypeScript (strict)
- React islands (`@astrojs/react`)
- Static output (`astro-site/dist`)

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

- Deploy the built static output from `astro-site/dist`.
- See `DEPLOYMENT.md` for security headers, contact endpoint notes, and post-deploy checks.
