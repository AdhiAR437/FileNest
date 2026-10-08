# Initial build verification

Verified on 8 October 2026.

- Astro/TypeScript diagnostics: zero errors, warnings, or hints.
- Transformation suite: 17 tests passed.
- Production static build: 10 generated routes.
- Version-specific notices generated for installed production packages.
- Build-specific script hashes generated for the Cloudflare Pages security policy.
- Headless Chromium browser checks against the built site with that security policy applied: directory/category/search filtering, text diff including an empty side, JSON order independence, invalid JSON handling, CSV/JSON conversion, leading zeroes, output downloads, sanitised Markdown, HTML download, and browser-print iframe/action.
- Desktop (1440px) and mobile viewport (390px): no horizontal overflow on checked routes. Screenshots visually inspected.
- No browser page exceptions or external requests during these checks.

Not yet verified: GitHub Actions execution on the remote repository, public hosting and final domain, Safari/Firefox, actual Android/iOS browsers, or user-operated Save as PDF dialogs and pagination. Browser PDF export is a print workflow, not direct file generation. Complete the launch checklist before promoting this as a public commercial service.
