# FileNest build verification

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
