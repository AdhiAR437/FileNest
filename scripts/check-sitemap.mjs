import { readFile, access } from 'node:fs/promises';

const origin = 'https://filepebble.com';
const dist = new URL('../dist/', import.meta.url);
const read = (name) => readFile(new URL(name, dist), 'utf8');
const fail = (message) => { console.error('Sitemap check failed:', message); process.exitCode = 1; };

try {
  const index = await read('sitemap-index.xml');
  const robots = await read('robots.txt');
  if (!index.includes('<sitemapindex') || !index.includes(origin + '/sitemap-0.xml')) {
    fail('sitemap-index.xml is missing or does not reference sitemap-0.xml');
  }
  if (!robots.includes('Sitemap: ' + origin + '/sitemap-index.xml')) {
    fail('robots.txt does not reference the production sitemap index');
  }
  const xml = await read('sitemap-0.xml');
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  if (!xml.includes('<urlset') || urls.length === 0) {
    fail('sitemap-0.xml is missing or contains no URLs');
  }
  const guides = [
    '/guides/',
    '/guides/compare-csv-files-by-id/',
    '/guides/merge-pdf-files-in-order/',
    '/guides/split-pdf-extract-pages/',
    '/guides/compress-images-for-sharing/',
    '/guides/convert-json-records-to-csv/',
    '/guides/markdown-to-pdf-print-guide/',
  ];
  for (const guide of guides) {
    if (!urls.includes(origin + guide)) fail('New guide not found in sitemap: ' + guide);
  }
  if (urls.some(url => new URL(url).pathname.startsWith('/licenses'))) {
    fail('The noindex license notices should not be listed in the sitemap.');
  }
  if (new Set(urls).size !== urls.length) fail('Sitemap has duplicate URLs.');
  if (urls.some(url => !new URL(url).pathname.endsWith('/'))) fail('Sitemap URLs must use trailing slashes.');
  const bad = urls.filter((url) => !url.startsWith(origin + '/') || url.includes('&amp;') === false && url.includes('&'));
  if (bad.length) fail('Sitemap has invalid or off-domain URLs: ' + bad.join(', '));
  for (const url of urls) {
    const pathname = new URL(url).pathname;
    const path = decodeURIComponent(pathname).replace(/^\//, '');
    const htmlFile = path === '' ? 'index.html' : path.endsWith('/') ? path + 'index.html' : path.endsWith('.html') ? path : path + '/index.html';
    try { await access(new URL(htmlFile, dist)); }
    catch { fail('Sitemap references a page missing from dist: ' + url); continue; }
    const html = await read(htmlFile);
    if (!html.includes('rel="canonical" href="' + url + '"')) fail('Canonical URL does not match sitemap: ' + url);
  }
  const licenseHtml = await read('licenses/index.html');
  if (!licenseHtml.includes('name="robots" content="noindex,follow"')) fail('License notices must contain a noindex tag.');
  if (!process.exitCode) console.log('Sitemap check passed:', urls.length, 'pages verified, including guides and canonicals.');
} catch (error) { fail(error.message); }
