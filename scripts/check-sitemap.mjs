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
  if (urls.some(u => u.endsWith('/licenses/'))) fail('Compliance notices must not appear in discovery sitemap');
  if (!urls.some(u => u.endsWith('/guides/'))) fail('Guides hub missing from sitemap');
  if (!urls.some(u => u.endsWith('/guides/compare-csv-files-by-id/'))) fail('Guides missing from sitemap');
  if (urls.some(u => new URL(u).pathname !== '/' && !new URL(u).pathname.endsWith('/'))) fail('Noncanonical no-trailing-slash URL in sitemap');
  const bad = urls.filter((url) => !url.startsWith(origin + '/') || url.includes('&amp;') === false && url.includes('&'));
  if (bad.length) fail('Sitemap has invalid or off-domain URLs: ' + bad.join(', '));
  for (const url of urls) {
    const pathname = new URL(url).pathname;
    const path = decodeURIComponent(pathname).replace(/^\//, '');
    const htmlFile = path === '' ? 'index.html' : path.endsWith('/') ? path + 'index.html' : path.endsWith('.html') ? path : path + '/index.html';
    try { await access(new URL(htmlFile, dist)); }
    catch { fail('Sitemap references a page missing from dist: ' + url); }
  }
  if (!process.exitCode) console.log('Sitemap check passed:', urls.length, 'pages verified.');
} catch (error) { fail(error.message); }
