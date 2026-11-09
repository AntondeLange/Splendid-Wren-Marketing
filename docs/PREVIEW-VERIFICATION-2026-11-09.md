# Protected preview verification — 9 November 2026

The user's follow-up “Proceed” authorized protected preview deployment and verification. Production release, merging, branch pushes, GitHub Pages publication, billing and retention changes remain outside this step.

## Deployment

- **URL:** https://splendid-wren-marketing-387i2n4ki-antons-projects-978e1a78.vercel.app
- **Deployment:** `dpl_GgprvDxo9wJmSVhpkjZSGeSH7YH8`
- **Environment/status:** Preview / READY. The deployment API represents preview target as null; CLI inspection labels it preview.
- **Framework/runtime:** Astro 7.4.7, adapter 11.0.20, Node 24.
- **Remote build:** 28.823 seconds from API building/ready timestamps.
- **Working-tree base:** `edf0d5e661facdbc5f3eb711ac8c7698e010c3ff`; no commit or branch push.
- **Source:** all 110 application/configuration/assets in the saved manifest match the local candidate. Verification scripts/tests and documentation are not required in the deployed runtime snapshot.

A clean temporary staging copy contained only source, public assets, image-preparation script, build/package/Tailwind/TypeScript configuration and the existing project link. Local environment files, authentication files, blog drafts, the privacy PDF, evidence, Git metadata and dependency/build directories were excluded. The first remote attempt failed because the staging copy omitted `tailwind.config.ts`; adding that existing file resolved it without any application change. The failed attempt's log is retained.

## Email and measurement safety

Both build and runtime were supplied deployment-specific overrides: empty SMTP_USER/SMTP_PASS, SMTP_HOST `127.0.0.1`, SMTP_PORT `1`, SMTP_SECURE `false`, empty GA4_API_SECRET, and CONTACT_TO_EMAIL `preview@example.invalid`. No project environment settings were edited. The corrected runtime configuration lookup honors explicit empty values.

Before browser tests, valid JSON and native HTML POSTs both returned **503**, stating the service is not configured. The loopback-only SMTP destination and invalid recipient are additional safeguards. No real email was sent during this preview step. The earlier local verification incident remains documented in the maintenance report and is not erased by this result.

Anonymous preview requests return 302 to Vercel authentication. Browser/HTTP verification uses a short-lived development OIDC token from the same linked project. It was pulled into a private temporary file, never printed or added to the workspace. Authentication is scoped to the exact deployment origin, requests do not follow redirects with the token, traces are disabled, and no protection setting was relaxed.

Google and Vercel SDK collection requests are intercepted by the browser suite. Verification establishes real request generation and redaction/CSP behavior, rather than ingestion into provider dashboards. No test analytics events were intentionally delivered to collection endpoints.

## Results

**15 authenticated/anonymous HTTP checks passed:**

- Anonymous protection, homepage 200, strict existing script CSP, external executable bootstrap and preview noindex header.
- `/amp`, `/about/amp`, `/amp/about` 308 redirects and package preservation through `/amp/contact?package=Momentum`.
- `/about?amp=1` returns canonical content with no redirect loop.
- Contact page no-store, fresh submission UUID and selected package.
- JSON and HTML disabled-SMTP responses, foreign-origin rejection, malformed multipart rejection and oversized-body rejection.
- Vercel Analytics script delivery and the 1,145-byte PNG favicon.

**All 18 protected-preview Chromium tests passed in 61.7 seconds, with no failures, skips or flaky tests.** The suite covers seven viewport sizes, keyboard menu behavior/focus/scrolling/dismissal, field errors and limits, reduced motion and optional branding, no-JavaScript success/error documents, consent unknown/denied/granted/withdrawn and cross-tab withdrawal, actual Google/Vercel request generation with query redaction and no CSP violations, retry IDs/conversion exclusions, all 23 sitemap routes/local assets/canonicals, static contact images and disabled remote AVIF transformation.

## Evidence

- [Deployment identity, supplied safety overrides and unchanged production](maintenance-evidence/2026-11-09/preview-deployment.json)
- [CLI inspection](maintenance-evidence/2026-11-09/preview-inspect.json)
- [Remote build log](maintenance-evidence/2026-11-09/preview-deploy.log)
- [Uploaded source manifest](maintenance-evidence/2026-11-09/preview-source-manifest.json) and [local comparison](maintenance-evidence/2026-11-09/preview-source-comparison.json)
- [HTTP checks](maintenance-evidence/2026-11-09/preview-http-checks.json)
- [Browser log](maintenance-evidence/2026-11-09/preview-browser-tests.log)
- [Browser results](maintenance-evidence/2026-11-09/preview-browser-results.json)
- [320px screenshot](maintenance-evidence/2026-11-09/preview-contact-320x740.png) and [tablet screenshot](maintenance-evidence/2026-11-09/preview-contact-768x1024.png)

## Production and remaining gates

Read-only inspection after deployment confirms the custom domain still resolves to production deployment `dpl_9CxZe76q2HyuRx5ubk6s7FEcNHAo`, commit `edf0d5e661facdbc5f3eb711ac8c7698e010c3ff`. No production promotion/alias change, merge, branch push, Pages publication, billing or retention change occurred.

This preview intentionally cannot send enquiries and must not be promoted unchanged. Production release remains separately authorized work. Remaining decisions include durable shared deduplication/rate limiting, authenticated HubSpot audit completions, GA dashboard configuration/provider ingestion, privacy/provider/business assertions, plan/retention/rollback decisions, and GitHub Pages publication. Chromium emulation does not replace physical-device/Safari/screen-reader testing. The `www` production-host redirect is not exercised against this preview hostname. Remote GitHub Actions remains unrun because no branch was pushed.
