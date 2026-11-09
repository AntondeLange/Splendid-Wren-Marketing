# Splendid Wren Marketing maintenance — 9 November 2026

This is the current review of the uncommitted candidate on `codex/maintenance-october-2026`. It supersedes the October report for version selection, current validation and release readiness. The checkout already contained the October implementation when this review began. Existing unrelated blog documents/images and the privacy PDF were preserved. No commit, push, merge, Pages publication, billing or retention change was made. After the follow-up approval to proceed, a protected preview was deployed and verified; see [the preview report](PREVIEW-VERIFICATION-2026-11-09.md). Production remains unchanged.

## Production verified before changes

Fresh `git fetch origin main` confirms `origin/main` and HEAD are `edf0d5e661facdbc5f3eb711ac8c7698e010c3ff`. The production domain still maps to `dpl_9CxZe76q2HyuRx5ubk6s7FEcNHAo` at that commit. The project uses Node 24 and `iad1`; anonymous production returns HTTP 200 with the existing CSP. See [identity](maintenance-evidence/2026-11-09/production-identity.json) and [HTTP checks](maintenance-evidence/2026-11-09/live-http.json).

Current production still has the `/about?amp=1` self-redirect (308 to the identical URL). Path-based AMP redirects work. The candidate removes the query-based rule, keeping clean canonicals and path redirects. The approved protected preview now verifies this router change.

## Candidate changes

| Area | Prepared behavior |
| --- | --- |
| Dependencies | Astro 7.4.7; adapter 11.0.20; Sharp 0.35.5; Analytics 2.0.1; Nodemailer 10.1.7. Tailwind/plugin remain 4.3.3 in the lockfile. |
| Runtime | Root/site `.nvmrc`, engines and CI use Node 24; generated function declares `nodejs24.x`, 60-second maximum duration. |
| Images | Build-time Sharp handles trusted local assets. Empty remote allowlists, no AVIF/HEIF/HEIC repository inputs, no uploads, Vercel image service disabled, and `/_image` returns 404. Dynamic contact images use prebuilt static assets. |
| Intro | Homepage is immediately available. `/loader` is an optional, untimed brand page with a native Continue link; reduced-motion support remains. |
| Asset sizes | PNG favicon 609,524 → 1,145 bytes; ICO 285,478 → 1,129; Apple icon 142,034 → 11,879; active loader SVG 1,305,128 → WebP 32,686. Full-size social image is separate from the favicon. |
| Contact | Message limit 10–2,000 UTF-16 code units in UI/script/endpoint. All previous fields, honeypot, validation, Reply-To, origin checks and abuse controls remain. Package links populate a visible allowlisted selector. |
| Native responses | HTML success/error documents preserve HTTP status, no-store/noindex headers, recovery guidance and email fallback; JSON remains available to JavaScript. |
| Retries | UUID plus payload digest reserves delivery; stable Message-ID; accepted replay avoids another send. Automatic fallback only before message submission. Ambiguous DATA/socket failure stops and warns. Network loss retains the same ID. |
| CSP | Analytics SDK injection is in an external bundle; `assetsInlineLimit: 0` prevents reinlining. Script CSP is unchanged; no `unsafe-inline` scripts added. |
| Consent | Unknown/denied loads no optional SDK and defaults server events to denied. Granted enables Google/Vercel measurement; server events additionally need configured credentials. Withdrawal reloads to unload SDKs, including withdrawal in another tab. Native no-JS forms default to denied. |
| Measurement | Separate outbound `brand_audit_click` and newly SMTP-accepted contact `generate_lead`; duplicates and honeypots do not count. Server metric is separately named `lead_accepted_server`. Queries/fragments removed from measurement locations; no name/email/message payloads. Optional Speed Insights shares the referrer safeguard. |
| Privacy | Existing candidate wording describes source/configuration-backed Vercel, Google Fonts, optional analytics, SMTP2GO and external HubSpot flows; removes unsupported active Meta/Stripe claims. Existing broader business assertions remain owner-review items. No provider contractual/retention promise was inferred. |
| Legacy Pages | Unpublished generator maps all 23 sitemap routes and `.html` equivalents, preserves allowlisted package selections and safe fragments, drops other queries, provides canonical/noindex and native links plus 404 fallback. Static Pages cannot emit a true HTTP 301/308. |

## Release selection and audit decisions

Reviewed [Astro 7.4.0](https://github.com/withastro/astro/releases/tag/astro%407.4.0): split build/runtime image services, Node minimum and output changes. The current [Astro changelog](https://raw.githubusercontent.com/withastro/astro/main/packages/astro/CHANGELOG.md) adds relevant fixes after the October candidate's 7.4.2: environment values containing `$`, malformed paths, image endpoint path checks and reliable typecheck failure reporting. The selected 7.4.7 requires Node >=22.23.4; local Node 24.19.0 satisfies this.

Reviewed the [adapter changelog](https://raw.githubusercontent.com/withastro/astro/main/packages/integrations/vercel/CHANGELOG.md), including bundler/native binding changes and newer tracing/redirect fixes. Adapter 11.0.20 declares Astro `^7.0.0`. Both build successfully together. Sharp stays at 0.35.5 because the [librsvg advisory](https://github.com/advisories/GHSA-wq5f-xc86-pv6w) affects versions below that, so stopping at 0.35.4 is insufficient.

The fresh audit of the existing October candidate found eight reported vulnerabilities, including four high. Targeted compatible transitive updates resolve `@vercel/functions` 3.11.0, OIDC 4.0.7, cli-config 0.3.7 and Zod 4.6.7. No blanket audit fix was used.

The remaining build-tracing chain uses a narrowly scoped `@vercel/nft -> glob: 14.0.2` override, resolving minimatch 11.0.5. The [Glob changelog](https://raw.githubusercontent.com/isaacs/node-glob/main/changelog.md) documents v14's matching and internal API changes. Inspection confirms NFT uses the supported public async `glob()` API, rather than the changed internal matcher/walker methods. Successful tracing/build plus serving the bundled function provides local compatibility evidence; The approved remote preview build and all 18 browser tests also passed on Vercel. Remove the override once NFT adopts patched dependencies upstream. The existing routing-utils/path-to-regexp override remains.

Fresh final production audit: **zero vulnerabilities**. This is a point-in-time registry result. [Dependency tree](maintenance-evidence/2026-11-09/dependencies.txt), [audit](maintenance-evidence/2026-11-09/production-audit.json).

## Verification safety incident and correction

The first new native-browser SMTP-unavailable test unexpectedly returned HTTP 202 with the message indicating SMTP acceptance. The compiled Astro server contained local build-time SMTP configuration, and the old `getEnv` preferred that over the harness's empty runtime credentials. **One local test enquiry received SMTP acceptance; inbox delivery is unverified. The no-real-email requirement was therefore not satisfied for this review.** No additional delivery test or provider retry was sent. The initial failure is preserved in [browser-tests-initial-failure.log](maintenance-evidence/2026-11-09/browser-tests-initial-failure.log).

Corrected `getEnv` to honor runtime values, including explicit empty credentials, before build-time fallback. A regression test models a populated build-time value with empty runtime credentials. The browser harness also independently rejects every outbound TCP connection, sets SMTP host to loopback/port 1, blanks credentials and GA API secret, and refuses to reuse an unknown existing server. These safeguards are independent of endpoint credential lookup. The new browser run verifies the native disabled-SMTP path returns 503. All unit tests mock Nodemailer/fetch.

## Current validation

Fresh logs and artifacts are under [maintenance-evidence/2026-11-09](maintenance-evidence/2026-11-09/).

- Clean `npm --prefix astro-site ci`: passed.
- `npm --prefix astro-site run typecheck`: passed, zero errors/warnings/hints.
- `npm --prefix astro-site run build`: passed, including function tracing with the scoped Glob override.
- `npm --prefix astro-site test`: 43 mocked contact/store tests passed. Includes validation boundaries and Unicode limits, fields/Reply-To, honeypot, origin rejection, oversized/malformed/unsupported bodies, duplicate/upload rejection, local/Redis limits and failures, SMTP failures/retries/ambiguity, concurrent/repeated IDs, failed receipt persistence, empty runtime credentials, consent and HTML/JSON.
- `npm --prefix astro-site audit --omit=dev --json`: zero vulnerabilities.
- Browser suite: **18 passed in 32.0 seconds** with outbound TCP disabled in the built-output server. Coverage includes seven viewports (320/375/390/430 portrait, 740×320 landscape, 768×1024 and 1024×768 tablet), keyboard navigation/menu dismissal/focus/scrolling, form errors/counter, native response recovery, reduced motion, consent states and withdrawal across tabs, SDK request generation, query redaction/CSP, all 23 sitemap pages and referenced local assets, canonical URLs and disabled runtime images.
- Five executed legacy redirect-generator cases passed; artifact prepared at `/tmp/splendid-wren-pages-retirement-2026-11-09`, unpublished.
- `git diff --check`: passed.

Analytics tests run the real SDKs and intercept collection endpoints; this verifies generated requests, not ingestion in dashboards. Chromium viewport emulation is not physical-device/Safari/screen-reader testing. Local serving applies production security headers to actual built function/static output, but does not reproduce the Vercel edge router or protection layer.

## Current platform and retention recommendation

Read-only API checks confirm **Hobby / active**, all four deployment retention windows **30 days**, `deploymentsToKeep: 10`, Node 24 and function region `iad1`. [Team](maintenance-evidence/2026-11-09/team.json), [project](maintenance-evidence/2026-11-09/project.json). No settings were changed.

The requested 23 October 2026 deadline is already past on this review date. [Vercel's announcement](https://vercel.com/changelog/deployment-storage-pricing-expands-to-existing-teams) says older Pro deployments could be deleted starting 23 October and describes $0.10/GB-month Deployment/Functions Storage billing. It explicitly leaves existing <=30-day settings unchanged. This is not evidence that this Hobby team has Pro charges. Actual storage totals, account-specific invoice start and deleted historical deployments have not been verified.

[Hobby policy](https://vercel.com/docs/plans/hobby) restricts use to non-commercial personal projects; this business marketing site warrants owner review for an appropriate paid plan. Inventory available rollback targets now, preserve necessary commits/build evidence securely, and review project usage and retention exceptions before relying on an old preview or rollback URL. Keep billing and retention choices separate from code approval.

## Remaining verification and decisions

1. **Protected preview complete after approval.** [The current preview report](PREVIEW-VERIFICATION-2026-11-09.md) records 15 HTTP checks and 18 browser tests passing against the updated candidate. Anonymous protection, CSP, edge AMP redirects/package preservation, canonical/sitemap/assets, SDK request generation and email-disabled native/JSON responses are verified. Production deployment/promotion remains separately pending approval. The production-host `www` rule is outside preview-host coverage.
2. **Durable deduplication/rate limiting.** Existing optional Redis support is ready, but absent durable shared storage, maps are instance-local and disappear on restart; Message-ID alone does not guarantee provider deduplication. October environment-name evidence showed no Redis variables; current configuration presence has not been reread. Approve durable storage separately or explicitly accept this limit before release. SMTP cannot guarantee exactly-once delivery after an ambiguous acknowledgement.
3. **External audit completions blocked on provider evidence/access.** HubSpot is a separate site; no authenticated completion webhook/API integration exists in this repository. Clicks are tracked separately. A click or arbitrary return URL must never count as a completion. Obtain authorized form/confirmation integration and its consent/replay requirements to finish this measurement.
4. **Provider/privacy review.** GA enhanced-measurement settings, ingestion, contracts, retention, newsletter/CRM/business-policy assertions, and physical-device/accessibility checks remain unverified. The privacy edits do not certify those facts.
5. **Pages publication pending approval.** Live legacy HTML is 200 but its root-relative stylesheet is 404. Review/publish the small retirement artifact through an approved Pages workflow; verify legacy paths/packages, then update inbound links and consider eventual retirement. No Pages settings changed.
6. **Production release pending approval.** No branch pushed or PR created because Git integration can deploy pushes. Remote CI has not run. Before release, validate a protected candidate with intended runtime configuration, agree the durable-store decision, confirm a rollback target, and separately approve merge/deployment/promotion. Keep the original production commit available for rebuild; retained deployment availability is not guaranteed indefinitely.
