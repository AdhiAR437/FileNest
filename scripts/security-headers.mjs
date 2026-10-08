import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const hashes = new Set();
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (file.endsWith('.html')) {
      const html = readFileSync(file, 'utf8');
      for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
        if (!/\bsrc\s*=/.test(match[1]) && match[2]) hashes.add(`'sha256-${createHash('sha256').update(match[2]).digest('base64')}'`);
      }
    }
  }
}
walk('dist');
const headers = readFileSync('public/_headers', 'utf8').replace("script-src 'self'", `script-src 'self' ${[...hashes].join(' ')}`);
writeFileSync('dist/_headers', headers);
console.log(`Added ${hashes.size} build-specific inline script hashes to the static security headers.`);
