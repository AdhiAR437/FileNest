# Public launch checklist

This is an initial development build, not a claim of public-launch readiness.

1. Confirm the GitHub source and lockfile are up to date.
2. Domain purchased: `filepebble.com`. The Astro site origin, canonical/social metadata, robots sitemap reference and sitemap integration are configured. In Cloudflare, open Workers & Pages → the existing FileNest Pages project → Custom domains → Set up a domain, enter `filepebble.com`, and follow the activation prompts. Confirm the domain is in the same Cloudflare account, then verify HTTPS and all routes. Add `www.filepebble.com` as a second custom domain if required; redirect it to the apex using a Cloudflare redirect rule. Keep the existing Pages project and GitHub repository connection.
3. Add owner/contact information and final terms. Review privacy wording for the actual host and any added services.
4. Choose Cloudflare Pages or Workers Static Assets. Build with `npm run licenses && npm run build` and serve `dist`. Keep transformations browser-local.
5. Apply response headers. `_headers` is for Pages; Workers Static Assets needs its own equivalent header configuration. Test the policy on the actual deployed site, including Worker loading, clipboard, and printing.
6. Verify all routes, file downloads, malformed inputs, large inputs, cancellation, keyboard access, Chrome/Firefox/Safari, and Android/iOS. Browser PDF printing support and pagination vary.
7. Submit the sitemap to Search Console and check indexing. No placeholder sitemap or invented production URLs should ship.
8. Add analytics/ads only after updating the privacy/consent implementation. Never record file contents or filenames.
9. Check production package notices against the bundled output and preserve applicable notices in distributed bundles. The generated catalogue is a starting point, not a universal licence audit for future additions.
10. Review pricing and actual service terms before using paid APIs or enabling payment processing. Use provider-hosted checkout.
