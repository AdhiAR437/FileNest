// Run from GitHub Actions or locally with: node scripts/check-production.mjs
// This checks the LIVE site after a Cloudflare Pages deployment. It does not
// submit a sitemap, request indexing, or verify AdSense approval.
const origin = process.env.FILEPEBBLE_ORIGIN || 'https://filepebble.com';
const failures = [];
const results = [];

async function probe(path, tests = []) {
  const url = new URL(path, origin).href;
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      cache: 'no-store',
      headers: { 'User-Agent': 'FilePebble-production-health/1.0 (+https://filepebble.com/)' },
      signal: AbortSignal.timeout(15000),
    });
    const body = await res.text();
    const details = [];
    if (res.status !== 200) details.push(`HTTP ${res.status}`);
    for (const [name, regex] of tests) {
      if (!regex.test(body)) details.push(name);
    }
    results.push({ url, status: res.status, bytes: body.length, failures: details });
    if (details.length) failures.push(`${path}: ${details.join(', ')}`);
    return body;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    results.push({ url, status: 'error', failures: [message] });
    failures.push(`${path}: ${message}`);
    return '';
  }
}

const homepage = await probe('/', [
  ['Guides link missing from global navigation', /href=["']\/guides\/["']/i],
  ['Canonical homepage missing', /rel=["']canonical["']\s+href=["']https:\/\/filepebble\.com\/["']/i],
]);
await probe('/guides/', [
  ['Guides hub lacks a heading', /<h1\b[^>]*>[^<]*guides/i],
  ['CSV guide missing from guide index', /\/guides\/compare-csv-files-by-id\//i],
]);
await probe('/guides/merge-pdf-files-in-order/', [
  ['PDF guide content missing', /merge PDF files in the right order/i],
  ['Guide canonical missing', /href=["']https:\/\/filepebble\.com\/guides\/merge-pdf-files-in-order\/["']/i],
]);
await probe('/guides/compare-csv-files-by-id/', [
  ['CSV guide example missing', /compare two CSV files by ID/i],
]);
await probe('/tools/csv-diff/', [
  ['Tool-to-guide link missing', /\/guides\/compare-csv-files-by-id\//i],
]);
await probe('/licenses/', [
  ['Robots noindex missing', /<meta\s+name=["']robots["']\s+content=["']noindex,follow["']/i],
  ['Required notices absent', /Open.source licence notices|Good tools build on good work/i],
]);
const sitemap = await probe('/sitemap-0.xml', [
  ['Guide hub missing from sitemap', /https:\/\/filepebble\.com\/guides\//i],
  ['CSV guide missing from sitemap', /https:\/\/filepebble\.com\/guides\/compare-csv-files-by-id\//i],
]);
if (/<loc>https:\/\/filepebble\.com\/licenses\/</i.test(sitemap)) failures.push('License notices should not be in the sitemap.');
await probe('/sitemap-index.xml', [['Missing sitemap child', /sitemap-0\.xml/i]]);
await probe('/robots.txt', [['Missing sitemap directive', /Sitemap:\s*https:\/\/filepebble\.com\/sitemap-index\.xml/i]]);

for (const item of results) {
  console.log(`${String(item.status).padEnd(5)} ${item.url} ${item.failures.length ? 'FAIL: ' + item.failures.join('; ') : 'OK'}`);
}
if (failures.length) {
  console.error('\nProduction smoke test FAILED. Check Cloudflare Pages production commit and live response headers.');
  process.exitCode = 1;
} else {
  console.log('\nProduction smoke test passed. Public guides, sitemap, canonicals, licenses and internal links are present.');
}
