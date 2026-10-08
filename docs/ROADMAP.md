# FileNest development roadmap

## Phase 1 — Foundation and first tools

- [x] Static, multi-route Astro/React application; TypeScript and lockfile.
- [x] Responsive tool directory with search/category filtering.
- [x] Markdown preview, HTML export, browser-print PDF export.
- [x] Unified text comparison and structural JSON comparison.
- [x] CSV/JSON transformations and downloads.
- [x] Local workers, cancellation, input limits, sanitisation, privacy copy.
- [x] Automated transformation tests and GitHub Actions configuration.
- [x] Generated dependency licence notices.
- [x] Publish the verified starter source to AdhiAR437/FileNest.
- [ ] Add final domain, sitemap, canonical metadata, operator contact, and final terms.
- [x] Initial Cloudflare Pages deployment and basic verification at https://filenest-c0y.pages.dev/.

## Phase 2 — Images

- [x] Image resize/crop and JPG/PNG/WebP conversion with transparency rules.
- [x] JPG/WebP compression with target-size feedback and an explicit unattainable-target outcome.
- [x] Worker processing, cancellation, input/output limits, previews and download verification.
- [x] Chromium orientation, alpha, JPEG matte and crop pixel checks; desktop/mobile viewport layouts.
- [ ] Batch processing and real-device memory testing; Firefox/Safari and colour-profile fidelity checks.

## Phase 3 — PDF essentials

- [x] Review/install pdf-lib, PDF.js and fflate; implement images → PDF and merge/split.
- [x] On-demand page previews, reorder/delete/rotate, PDF → images/text.
- [x] Size/page-count limits, progress and cancellation; Chromium output verification.
- [ ] Broader PDF fidelity corpus, full thumbnail grid, Firefox/Safari and low-memory mobile testing.

## Phase 4 — Audience and revenue

- Search Console; unique instructions and representative examples for tool pages.
- Privacy-reviewed analytics for aggregate tool outcomes, never file contents.
- User validation, completion rates, search impressions, and failure-rate tracking.
- Ad network approval, privacy/consent work, and advertising only after a useful launch.
- Validate optional batch/preset subscriptions. Provider-hosted checkout and payment fees.

## Phase 5 — Advanced tools, based on observed demand

- [x] CSV key-column comparison, image comparison and Markdown → DOCX.
- [x] JSON beautify/minify/validate with original number lexemes retained.
- [ ] Batch image processing and PDF compression.
- Carefully scoped OCR and PDF/DOCX text comparison.
- Paid server-based Office conversion only after measuring fidelity and operating cost.

No traffic or revenue is guaranteed. Prioritise tools that acquire users and complete their tasks successfully.
