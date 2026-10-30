import { readdir, readFile, access } from 'node:fs/promises';
import { resolve, join, relative } from 'node:path';

const root = resolve('dist');
const errors = [];
let checked = 0;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (entry.isFile() && entry.name.endsWith('.html')) await checkFile(file);
  }
}

async function checkFile(file) {
  const html = await readFile(file, 'utf8');
  const hrefs = [...html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)].map(match => match[1]);
  for (const href of hrefs) {
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    const url = new URL(href.replaceAll('&amp;', '&'), 'https://filepebble.com');
    const pathname = decodeURIComponent(url.pathname);
    if (pathname.includes('..')) { errors.push(`Unsafe relative path in ${relative(root, file)}: ${href}`); continue; }
    const target = resolve(root, pathname.replace(/^\//, '') || 'index.html', pathname === '/' ? '' : 'index.html');
    if (!target.startsWith(root + '/') && target !== root) {
      errors.push(`Out-of-root link in ${relative(root, file)}: ${href}`); continue;
    }
    try { await access(target); checked++; }
    catch { errors.push(`Broken internal link in ${relative(root, file)}: ${href} (expected ${relative(root, target)})`); }
  }
}

await walk(root);
if (errors.length) {
  for (const error of errors) console.error(error);
  console.error(`Internal-link audit failed: ${errors.length} broken link(s) and ${checked} verified.`);
  process.exitCode = 1;
} else {
  console.log(`Internal-link audit passed: ${checked} page links verified across generated HTML.`);
}
