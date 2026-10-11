# FilePebble build verification

## Launch content and verification setup — 11 October 2026

- Added contact and terms pages, maintainer identification and public GitHub support; updated Cloudflare/privacy wording and footer navigation.
- Added original use cases, examples and three FAQs for every tool: 19 guides and 57 FAQs.
- All 61 transformation tests passed; Astro diagnostics reported zero errors, warnings and hints; production build generates 25 pages and an exact 25-page sitemap.
- Verified canonical URLs, support/terms navigation on every page, CSP script hashes and absence of placeholder Google verification tags.
- Chromium checked contact/terms/privacy, all 19 tool guides, FAQ keyboard/click behaviour, the CSV conversion worker and 320px/390px layouts. No page errors or third-party requests; desktop/mobile guides and desktop contact layout visually inspected.
- Separate QA builds verified valid Search Console/AdSense metadata values emit exact tags without ad scripts, and malformed values fail the build. QA tokens are not in the production output.
- Search Console ownership verification and sitemap submission still require the owner's Google account/DNS record. AdSense review requires the owner's account; ad serving and consent implementation are not active.

## FilePebble domain and branding update — 11 October 2026

- Renamed displayed branding, titles, examples, output filenames and Word creator metadata to FilePebble; the GitHub repository and Pages project remain connected under their existing names.
- Configured `https://filepebble.com` as the trusted site origin, with canonical and social metadata on all 23 pages.
- Generated a sitemap covering exactly the 23 built pages; verified sitemap/robots discovery and build-specific CSP script hashes.
- All 61 tests passed; Astro diagnostics reported zero errors, warnings and hints; production build succeeded.
- Chromium checks passed for directory search/filter, comparison/conversion workers, errors, HTML downloads, Markdown sanitisation, print workflow, mobile overflow and no page errors/external requests. The renamed mobile header was visually inspected at 390px.
- Domain purchase is user-confirmed. Cloudflare custom-domain activation and HTTPS must be checked after the owner completes the dashboard setup.

## Previous tool release

Verified on 8 October 2026.

- Astro/TypeScript diagnostics: zero errors, warnings, or hints.
- Transformation, image, PDF, CSV/JSON utility and Word export suites: 61 tests passed.
- Production static build: 23 generated routes for 19 tools and four site pages.
- Version-specific notices generated for installed production packages.
- Build-specific script hashes generated for the Cloudflare Pages security policy.
- Headless Chromium browser checks against the built site with that security policy applied: directory/category/search filtering, text diff including an empty side, JSON order independence, invalid JSON handling, CSV/JSON conversion, leading zeroes, output downloads, sanitised Markdown, HTML download, and browser-print iframe/action.
- Desktop (1440px) and mobile viewport (390px): no horizontal overflow on checked routes. Screenshots visually inspected.
- No browser page exceptions or external requests during these checks.

- Initial public site checked at https://filenest-c0y.pages.dev/: directory filters, the six original tools, downloads, malformed JSON, and privacy/about/notices pages.
- Image addition checked locally under the generated security policy: JPG/PNG/WebP exports, decoded dimensions and pixels, transparency, white JPEG matte, EXIF orientation, pixel crop and aspect-ratio lock, invalid crop, reachable/unreachable byte targets, cancellation, animated PNG/WebP and disguised SVG rejection. No page errors or external requests. Desktop and 390px viewport screenshots inspected.

- PDF addition checked locally under the generated security policy: images to PDF, ordered merging, selected-page PDF and split ZIPs, reorder/delete/rotation with previews, PNG/JPG page export, text extraction and scanned-page feedback. Downloaded outputs independently verified with pypdf, ZIP inspection and Pillow. PDF output rendered with Poppler and visually inspected. Invalid ranges, forms/encryption rejection, cancellation/retry and 390px layout checked; no browser/CSP errors or external requests.

- Four-tool addition checked locally under the generated security policy: exact-key CSV reports, reordered columns/rows, changed/added/removed rows, duplicate-key errors; JSON pretty/minify/validate and large-integer lexeme preservation; image comparison RGB threshold statistics, alpha-on-white behaviour, dimension errors, overlay/side/difference views and full-resolution PNG download; Word DOCX output, omitted-content warnings, editing invalidation and cancellation. CSV/JSON reports and PNG pixels independently inspected; every DOCX XML/relationship part parsed, unsafe media/links checked, and downloaded Word output rendered with LibreOffice and visually inspected. All four mobile viewport layouts checked.

Not yet verified: GitHub Actions execution on the remote repository, final custom domain, Safari/Firefox, actual Android/iOS browsers, colour-profile fidelity, maximum-size inputs on low-memory devices, or user-operated Save as PDF dialogs and pagination. Browser PDF export is a print workflow, not direct file generation. Complete the launch checklist before promoting this as a public commercial service.
