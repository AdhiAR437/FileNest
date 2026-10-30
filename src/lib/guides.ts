import type { ToolId } from './catalog';

// Hand-maintained guides grounded in features that FilePebble currently ships.
export const guides = [
  { slug: 'compare-csv-files-by-id', title: 'Compare CSV files by a unique ID', description: 'Find changed, added and removed records even when an export is reordered.', toolId: 'csv-diff', category: 'Data' },
  { slug: 'merge-pdf-files-in-order', title: 'Merge PDF files in the right order', description: 'Combine a report and its attachments without losing track of page order.', toolId: 'merge-pdf', category: 'PDF' },
  { slug: 'split-pdf-extract-pages', title: 'Extract selected pages from a PDF', description: 'Choose specific page ranges or save individual pages in a ZIP.', toolId: 'split-pdf', category: 'PDF' },
  { slug: 'compress-images-for-sharing', title: 'Compress images for email and web forms', description: 'Understand JPG, WebP, quality settings and size targets without guessing.', toolId: 'image-compressor', category: 'Images' },
  { slug: 'convert-json-records-to-csv', title: 'Convert JSON records to CSV safely', description: 'Handle missing fields, nested values, leading-zero IDs and spreadsheet risks.', toolId: 'json-to-csv', category: 'Data' },
  { slug: 'markdown-to-pdf-print-guide', title: 'Turn Markdown notes into a printable PDF', description: 'Prepare clean notes, review the preview and use the browser print dialog.', toolId: 'markdown-to-pdf', category: 'Markdown' },
] as const satisfies ReadonlyArray<{ slug: string; title: string; description: string; toolId: ToolId; category: string }>;

export const guideHref = (slug: string) => `/guides/${slug}/`;
