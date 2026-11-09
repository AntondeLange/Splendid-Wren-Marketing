# Regional HR Consultancy case study and GA4 update

The supplied website copy is added at `/blog/the-wisdom-behind-the-re-do-branding-the-regional-hr-consultancy`, dated 9 November 2026. The document does not specify a publication date; this uses the implementation date. The social media section is excluded. The supplied meta description, tags, six sections and six scope items are preserved, and the inline website-link instruction is converted into a link to the supplied URL.

The DOCX contains no embedded media. The separately supplied Stacey Spencer photograph is used as the article and blog-card image, with descriptive alt text and Astro-generated responsive WebP variants. No additional case-study artwork was supplied. Article sharing metadata now uses each article's own image, consistent with its existing BlogPosting structured data.

The browser GA4 default measurement ID changes from `G-TBWM98H36R` to `G-2GR85M2GT9`. The existing consent controls and tracking events remain in place.

Validation completed locally:

- `npm --prefix astro-site run typecheck`: 69 files, no errors, warnings or hints. The lint script uses the same Astro check command.
- `npm --prefix astro-site run build`: passed, including the new article and responsive photograph variants.
- Chromium against the built Vercel output with repository production security headers: article returns 200, all six sections and scope items render, website link and sharing image resolve, social media drafts and instruction placeholders are absent, article links appear on the blog listing, and the sitemap includes the new route.
- Desktop 1440 by 1000 and mobile 390 by 844 browser emulation: no horizontal overflow; screenshots visually inspected. This does not constitute physical-device testing.
- Real Google tag generates a page-view collection request containing `tid=G-2GR85M2GT9` after acceptance. Google collection requests were intercepted and answered locally. No Google requests occurred with unknown consent or after consent withdrawal and reload. No JavaScript errors or CSP violations were observed.
- `git diff --check`: passed.

Evidence: [verification results](client-update-2026-11-09/verification.json), [desktop screenshot](client-update-2026-11-09/article-desktop.png), [mobile screenshot](client-update-2026-11-09/article-mobile.png).

At initial local validation, no commit, push, preview deployment or production deployment had been performed. The user subsequently authorized proceeding with the release. Existing unrelated untracked files were preserved. GA4 property ownership, provider ingestion, remote enhanced-measurement settings and deployed environment overrides are unverified.

The production environment variable metadata was checked using the authenticated Vercel CLI after the connector denied listing access. No `PUBLIC_GA_MEASUREMENT_ID`, `GA4_MEASUREMENT_ID` or `GA4_API_SECRET` is configured, so the new browser source default applies. A future `PUBLIC_GA_MEASUREMENT_ID` override would take precedence and must match the intended property. The optional server-side contact fallback uses separate `GA4_MEASUREMENT_ID` / `GA4_API_SECRET` settings; those settings were not changed or verified. After an approved deployment, accept analytics and confirm the visit in the client's GA4 Realtime view.

To roll back these changes, restore the prior GA default and article metadata line, remove the new image-map entry/import, and remove the new Markdown article and Stacey image. Release or rollback deployment requires separate authorization.
