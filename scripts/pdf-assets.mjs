import { cpSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
const dest = 'public/pdf-assets'; rmSync(dest, { recursive: true, force: true }); mkdirSync(dest, { recursive: true });
for (const folder of ['cmaps', 'standard_fonts', 'wasm']) cpSync(`node_modules/pdfjs-dist/${folder}`, `${dest}/${folder}`, { recursive: true });
copyFileSync('node_modules/pdfjs-dist/LICENSE', `${dest}/LICENSE`);
console.log('Prepared local PDF.js fonts, character maps and decoder assets.');
