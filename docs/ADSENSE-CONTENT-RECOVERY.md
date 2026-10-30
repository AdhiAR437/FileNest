# FilePebble: content and search quality recovery

Updated: 2026-10-30

## Why this phase exists

Google AdSense flagged filepebble.com as **Needs attention — Low value content** on 26 October 2026.

Search Console baseline supplied by site owner, last 28 days:
- Google Search clicks: 0
- Google Search impressions: 37
- Indexed pages: 26
- Licenses URL variants: 28 of 37 impressions
- Tool pages: 4 impressions in total

The Search Console baseline is not the same as all-site traffic. These figures do **not** demonstrate total visitor count or AdSense acceptance requirements.

## Content improvements shipped in the phase

1. Retain the 19 tool-specific workflows from the earlier phase.
2. Publish original worked examples for CSV diff, PDF merging and splitting, image compression, JSON-to-CSV conversion, and Markdown-to-PDF printing.
3. Maintain an index at `/guides/` and contextual links from the homepage, header, footer, and each supported tool page.
4. Keep each guide accurate to currently shipped controls; do not claim OCR, automatic PDF compression, guaranteed image sizes, or direct PDF download from the Markdown printer.
5. Preserve the required open-source license notices at `/licenses/`, but apply `noindex,follow` and omit that low-search-value compliance page from the XML sitemap. **This does not automatically transfer rankings or impressions to other pages.**
6. Use trailing-slash canonical URLs in links, page metadata and the sitemap.

## Before and after deployment

- GitHub CI should pass `npm run check`, `npm test`, `npm run licenses`, `npm run build`, and `node scripts/browser-smoke.mjs`.
- Confirm `/guides/` and all six guides return 200 and contain useful rendered HTML.
- Confirm the tool page for each guide links to its article and the article links back to a real tool.
- Confirm `https://filepebble.com/sitemap-index.xml` and `/sitemap-0.xml` are readable.
- Verify the rendered canonical tag on a sample tool page and the new guide pages.
- Confirm `/licenses/` still loads but has `noindex,follow`, and it is not in the sitemap.
- Check small-screen navigation and reading experience manually.
- If Cloudflare Pages auto-deploys from `main`, confirm **Production / Success** and the deployed commit in the Cloudflare dashboard. A green GitHub check does not prove a Cloudflare deployment.
- Resubmit the sitemap in Search Console only if needed; unnecessary repeated index requests will not speed up indexing.

## Search Console measurement over time

Use Performance → Search results. Compare 7-day and 28-day values for:
- Impressions and clicks specifically for tool paths (`/tools/`) and article paths (`/guides/`).
- Non-branded queries that reflect user problems (CSV differences, image compression, PDF merging, etc.).
- Average positions **with impression counts**; positions from one or two impressions are not reliable trends.
- URL indexing status for key tools and articles, canonical selection, and exclusions.

If using Cloudflare Web Analytics or another privacy-compatible analytics service, compare total human visits, returning visits and tool use separately; Search Console reports only Google Search exposure.

## AdSense resubmission

Do not resubmit on a fixed calendar date or based on an arbitrary traffic minimum. First verify content accuracy, accessibility, mobile usability, discovery and real interest, then use AdSense's review flow. A new review may still be unsuccessful and Google does not disclose a precise scoring formula.
