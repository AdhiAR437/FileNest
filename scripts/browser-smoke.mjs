// End-to-end smoke tests for all published tools. Run after "npm run build".
// Usage: npm install --no-save playwright && npx playwright install chromium && node scripts/browser-smoke.mjs
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';
import { PDFDocument } from 'pdf-lib';

const base = 'http://localhost:4321';
const names = [
  'markdown-to-pdf', 'markdown-to-html', 'markdown-to-docx', 'text-diff', 'json-diff',
  'csv-to-json', 'json-to-csv', 'csv-diff', 'json-formatter',
  'image-converter', 'image-compressor', 'image-resize', 'image-diff',
  'images-to-pdf', 'merge-pdf', 'split-pdf', 'organise-pdf', 'pdf-to-images', 'pdf-to-text',
];
const failures = [];
const server = spawn('node_modules/.bin/astro', ['preview', '--host', 'localhost', '--port', '4321'], { stdio: ['ignore', 'pipe', 'pipe'] });
let serverOutput = '';
for (const stream of [server.stdout, server.stderr]) stream.on('data', data => { serverOutput += data.toString(); process.stderr.write(data.toString()); });
let browser;
async function waitForServer() {
  for (let attempt = 0; attempt < 150; attempt++) {
    try { const response = await fetch(base); if (response.ok) return; } catch {}
    if (server.exitCode !== null) throw new Error('Preview server exited early: ' + serverOutput);
    await delay(200);
  }
  throw new Error('Preview server did not start: ' + serverOutput);
}
async function downloadFrom(page, action, suffix) {
  const next = page.waitForEvent('download', { timeout: 15000 });
  await action();
  const download = await next;
  assert(download.suggestedFilename().endsWith(suffix), 'Wrong download extension: ' + download.suggestedFilename());
  const failure = await download.failure();
  assert.equal(failure, null, 'Download failed: ' + failure);
}
async function exercise(page, id, png, pdf) {
  const input = page.locator('#input-left');
  const pdfFile = { name: 'first.pdf', mimeType: 'application/pdf', buffer: pdf };
  const photo = { name: 'image.png', mimeType: 'image/png', buffer: png };
  if (id.startsWith('markdown-')) {
    await input.fill('# Smoke test\n\n**Hello** from FilePebble.');
    await page.locator('.markdown-preview h1').waitFor();
    if (id === 'markdown-to-html') await downloadFrom(page, () => page.getByRole('button', { name: /Download HTML/ }).click(), '.html');
    if (id === 'markdown-to-docx') {
      await page.getByRole('button', { name: /Create Word document/ }).click();
      await page.getByRole('button', { name: /Download Word/ }).waitFor({ timeout: 20000 });
      await downloadFrom(page, () => page.getByRole('button', { name: /Download Word/ }).click(), '.docx');
    }
    if (id === 'markdown-to-pdf') assert(await page.getByRole('button', { name: /Print \/ Save PDF/ }).isEnabled());
  } else if (id === 'text-diff' || id === 'json-diff') {
    await input.fill(id === 'text-diff' ? 'before\n' : '{"x":1}');
    await page.locator('#input-right').fill(id === 'text-diff' ? 'after\n' : '{"x":2}');
    await page.getByRole('button', { name: /Compare changes/ }).click();
    await page.locator('.result-panel').waitFor();
  } else if (id === 'csv-to-json' || id === 'json-to-csv') {
    await input.fill(id === 'csv-to-json' ? 'id,name\n001,One' : '[{"id":"001","name":"One"}]');
    await page.getByRole('button', { name: /Convert file/ }).click();
    await page.locator('.result-panel').waitFor();
    await downloadFrom(page, () => page.getByRole('button', { name: /^Download/ }).click(), id === 'csv-to-json' ? '.json' : '.csv');
  } else if (id === 'csv-diff' || id === 'json-formatter') {
    await page.locator('#data-0').fill(id === 'csv-diff' ? 'id,v\n1,a' : '{"id":9007199254740993}');
    if (id === 'csv-diff') await page.locator('#data-1').fill('id,v\n1,b');
    await page.getByRole('button', { name: id === 'csv-diff' ? /Compare CSV/ : /Process JSON/ }).click();
    await page.locator('.result-panel').waitFor();
    await downloadFrom(page, () => page.getByRole('button', { name: /Download result/ }).click(), '.json');
  } else if (['image-converter','image-compressor','image-resize'].includes(id)) {
    await page.locator('#image-file').setInputFiles(photo);
    await page.locator('.image-previews img').first().waitFor();
    await page.getByRole('button', { name: id === 'image-converter' ? /Convert image/ : id === 'image-compressor' ? /Compress image/ : /Resize image/ }).click();
    await page.getByRole('button', { name: /Download image/ }).waitFor({ timeout: 25000 });
    await downloadFrom(page, () => page.getByRole('button', { name: /Download image/ }).click(), id === 'image-compressor' ? '.webp' : '.png');
  } else if (id === 'image-diff') {
    await page.locator('#compare-image-0').setInputFiles(photo);
    await page.locator('#compare-image-1').setInputFiles(photo);
    await page.getByRole('button', { name: /Compare images/ }).click();
    await page.locator('.result-panel').waitFor({ timeout: 25000 });
    await downloadFrom(page, () => page.getByRole('button', { name: /Download difference/ }).click(), '.png');
  } else {
    if (id === 'images-to-pdf') await page.locator('#pdf-files').setInputFiles(photo);
    else if (id === 'merge-pdf') await page.locator('#pdf-files').setInputFiles([pdfFile, { ...pdfFile, name: 'second.pdf' }]);
    else await page.locator('#pdf-files').setInputFiles(pdfFile);
    await page.locator('.pdf-file-list li').first().waitFor({ timeout: 25000 });
    const action = ({
      'images-to-pdf': /Create PDF/, 'merge-pdf': /Merge PDFs/, 'split-pdf': /Split PDF/,
      'organise-pdf': /Save organised PDF/, 'pdf-to-images': /Export page images/, 'pdf-to-text': /Extract text/
    })[id];
    await page.getByRole('button', { name: action }).click();
    await page.getByRole('button', { name: /Download result/ }).waitFor({ timeout: 45000 });
    await downloadFrom(page, () => page.getByRole('button', { name: /Download result/ }).click(), id === 'pdf-to-images' ? '.zip' : id === 'pdf-to-text' ? '.txt' : '.pdf');
  }
}
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const doc = await PDFDocument.create();
  doc.addPage([240, 320]);
  const pdf = Buffer.from(await doc.save());
  // Let Chromium create a standards-compliant PNG instead of relying on opaque base64 test fixtures.
  const fixturePage = await browser.newPage();
  const pngBytes = await fixturePage.evaluate(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 80; canvas.height = 40;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0088cc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    return Array.from(new Uint8Array(await blob.arrayBuffer()));
  });
  await fixturePage.close();
  const png = Buffer.from(pngBytes);
  // Navigation, theme persistence, and SEO category pages should work on desktop and mobile.
  for (const viewport of [{ width: 1280, height: 850 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    try {
      await page.goto(base + '/');
      await page.evaluate(() => localStorage.setItem('filepebble-theme', 'light'));
      await page.reload();
      await page.locator('#theme-toggle').click();
      assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
      await page.reload();
      assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark', 'Theme not persisted');
      await page.locator('#nav-tool-menu summary').click();
      await page.locator('.tools-dropdown a[href="/tools/merge-pdf/"]').waitFor();
      assert.equal(await page.locator('.dropdown-group').count(), 5, 'Expected five grouped navigation sections');
      const viewportWidth = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      assert(viewportWidth <= 2, 'Navigation creates horizontal scrolling');
      await page.locator('.tools-dropdown a[href="/categories/compare/"]').click();
      await page.locator('.category-list .tool-card').first().waitFor();
      assert.equal(await page.locator('.category-list .tool-card').count(), 4);
      await page.locator('.category-list a[href="/tools/csv-diff/"]').click();
      await page.locator('.tool-switcher').waitFor();
      await page.locator('.tool-switcher-links a[href="/tools/json-diff/"]').click();
      assert(page.url().endsWith('/tools/json-diff/'), 'Tool switcher did not navigate');
      console.log('PASS navigation and persisted dark mode at ' + viewport.width + 'px');
    } catch (error) {
      failures.push({ tool: 'navigation-' + viewport.width, error: String(error) });
      console.error('FAIL navigation-' + viewport.width + ': ' + error);
    } finally { await context.close(); }
  }
  for (const id of names) {
    const context = await browser.newContext({ acceptDownloads: true });
    const page = await context.newPage();
    const browserErrors = [];
    page.on('pageerror', error => browserErrors.push(error.message));
    try {
      const response = await page.goto(base + '/tools/' + id + '/', { waitUntil: 'domcontentloaded' });
      assert.equal(response.status(), 200);
      await page.locator('h1').first().waitFor();
      await page.locator('.workbench').waitFor({ timeout: 15000 });
      await exercise(page, id, png, pdf);
      assert.deepEqual(browserErrors, [], 'Browser runtime errors');
      console.log('PASS ' + id);
    } catch (error) {
      failures.push({ tool: id, error: String(error) });
      console.error('FAIL ' + id + ': ' + error);
    } finally { await context.close(); }
  }
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
console.log('Smoke results: ' + (names.length - failures.length) + '/' + names.length + ' tools passed.');
if (failures.length) {
  failures.forEach(failure => console.error(failure.tool + ': ' + failure.error));
  process.exitCode = 1;
}
