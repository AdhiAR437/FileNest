# Public launch checklist

This is an initial development build, not a claim of public-launch readiness.

1. Confirm the GitHub source and lockfile are up to date.
2. Select the domain; add `site` in Astro config and install/configure a sitemap integration. Set canonical metadata using the trusted configured site origin.
3. Add owner/contact information and final terms. Review privacy wording for the actual host and any added services.
4. Choose Cloudflare Pages or Workers Static Assets. Build with `npm run licenses && npm run build` and serve `dist`. Keep transformations browser-local.
5. Apply response headers. `_headers` is for Pages; Workers Static Assets needs its own equivalent header configuration. Test the policy on the actual deployed site, including Worker loading, clipboard, and printing.
6. Verify all routes, file downloads, malformed inputs, large inputs, cancellation, keyboard access, Chrome/Firefox/Safari, and Android/iOS. Browser PDF printing support and pagination vary.
7. Submit the sitemap to Search Console and check indexing. No placeholder sitemap or invented production URLs should ship.
8. Add analytics/ads only after updating the privacy/consent implementation. Never record file contents or filenames.
9. Check production package notices against the bundled output and preserve applicable notices in distributed bundles. The generated catalogue is a starting point, not a universal licence audit for future additions.
10. Review pricing and actual service terms before using paid APIs or enabling payment processing. Use provider-hosted checkout.
