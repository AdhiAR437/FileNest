import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const dirs = execFileSync('npm', ['ls', '--all', '--omit=dev', '--parseable'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim().split('\n').slice(1);
const seen = new Set();
const licenses = dirs.flatMap(dir => {
  const pkg = JSON.parse(readFileSync(path.join(dir, 'package.json'), 'utf8'));
  const key = `${pkg.name}@${pkg.version}`;
  if (seen.has(key)) return []; seen.add(key);
  const files = readdirSync(dir).filter(name => /^(license|licence|copying|notice)([-.]|$)/i.test(name));
  const notices = files.flatMap(file => { try { return [{ file, text: readFileSync(path.join(dir, file), 'utf8') }]; } catch { return []; } });
  return [{ name: pkg.name, version: pkg.version, license: typeof pkg.license === 'string' ? pkg.license : JSON.stringify(pkg.license ?? 'See package notices'), notices }];
}).sort((a, b) => a.name.localeCompare(b.name));
mkdirSync('src/data', { recursive: true });
writeFileSync('src/data/licenses.json', JSON.stringify(licenses, null, 2));
console.log(`Generated notices for ${licenses.length} installed production packages.`);
