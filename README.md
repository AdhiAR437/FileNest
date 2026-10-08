# FileNest

Private-first file utilities. A static Astro + React + TypeScript website with browser-local transformations and no backend, accounts, uploaded-file storage, analytics, ads, or paid services in the initial implementation.

Live preview: https://filenest-c0y.pages.dev/

## Getting started

Requires Node.js 24 and npm. The lockfile pins the installed versions.

```sh
npm ci
npm run licenses
npm run dev
```

Open the URL printed by Astro. To verify and build:

```sh
npm run check
npm test
npm run licenses
npm run build
```

## Working tools

- Markdown → HTML: sanitised live preview, HTML source, copy, and self-contained HTML download.
- Markdown → PDF: browser print dialog; choose Save as PDF when available. This is not a direct PDF-generation engine.
- Text comparison: unified line differences, optional case and edge-whitespace rules; accepts an empty side.
- JSON comparison: structural comparison with object order ignored, arrays compared by position, JSON Pointer paths, and downloadable change records.
- CSV → JSON: header-based records, quoted field support, string values preserved, duplicate/malformed headers and rows rejected.
- JSON → CSV: union of record fields, nested values serialised as JSON, formula-like values prefixed to reduce spreadsheet formula injection.
- Image converter: JPG/PNG/WebP, preview, quality control and explicit JPEG matte colour.
- Image compressor: JPG/WebP quality adjustment and bounded target-size search; reports unreachable targets and larger output.
- Image resize & crop: pixel dimensions, aspect-ratio lock and optional pixel-coordinate crop.

Image jobs use disposable workers with native ImageBitmap/OffscreenCanvas, a 30-second timeout and cancellation. Still images only: up to 15 MB, 8,000 pixels per side and 12 megapixels total; SVG/GIF/HEIC and animated PNG/WebP are rejected. Output format is checked against browser encoder fallback. EXIF metadata is not retained; browser colour handling and codec support vary. No image dependencies or external APIs are added.

Comparison and data conversion run in disposable Web Workers with cancellation and a six-second timeout. Text diff also has a library timeout. Inputs are limited to 1 MB and text comparison to 100,000 characters per side. Contents live in component memory only and are not retained on reload.

Markdown is sanitised with DOMPurify. Remote image/media elements and executable content are removed. Exported documents retain ordinary links. No external fonts, assets, or conversion APIs are used.

## Hosting

Build command: `npm run licenses && npm run build`. Output: `dist`. Deploy as static assets to Cloudflare Pages or Workers Static Assets. No server entry point is needed. `public/_headers` provides a starting security-header policy for Cloudflare Pages; configure equivalent response headers when using Workers Static Assets.

The build generates `dist/_headers` with hashes for Astro's inline hydration scripts; use that generated file rather than copying the source header template unchanged. The site currently omits canonical URLs and a sitemap because no final domain has been selected. Add the domain to `astro.config.mjs` and configure a sitemap before public indexing. See [docs/LAUNCH.md](docs/LAUNCH.md).

## Repository

Source: https://github.com/AdhiAR437/FileNest

```sh
git clone https://github.com/AdhiAR437/FileNest.git
cd FileNest
npm ci
npm run dev
```

The `.github/workflows/ci.yml` pipeline checks types, transformation tests, generated notices, and the static build.

## Licences

Application source is reserved for its owner; see `LICENSE`. Open-source dependencies retain their own licences. `npm run licenses` generates version-specific installed production dependency notices in `src/data/licenses.json`, served at `/licenses`. New engines, fonts, codecs, and dependencies must be reviewed separately. No `pdf-lib` or PDF.js is installed until PDF processing is implemented.

See [docs/ROADMAP.md](docs/ROADMAP.md) for the development phases.
