import type { ToolId } from './catalog';

export const categories = [
  {
    slug: 'compare',
    name: 'Compare',
    title: 'Compare Text, CSV, JSON & Images Online',
    description: 'Find differences between text, CSV exports, JSON data and images. Choose the right comparison method, inspect changes and work locally in your browser.',
    lead: 'Find exactly what changed, not just what moved.',
    introduction: 'Different files need different comparison rules. Compare lines in notes and logs, match CSV exports by a stable ID, inspect JSON value changes by path, or highlight differences between two same-size images. FilePebble runs these comparisons in your browser without sending file contents to a conversion server.',
    choosing: 'For two spreadsheet exports where row order can change, start with CSV comparison and enter a unique key column. For API payloads, JSON comparison ignores object-key order but still considers array order. Text comparison detects line-level edits; image comparison examines pixels, not the visual meaning of an edit.',
    tips: 'Keep a copy of each original. Check the preview against a small known change before relying on a large report. Some compare tools offer a JSON report or downloadable image mask, and they cannot automatically merge or resolve conflicting versions.',
    icon: '↔',
    featured: ['csv-diff', 'json-diff', 'text-diff', 'image-diff'] as ToolId[],
  },
  {
    slug: 'pdf',
    name: 'PDF',
    title: 'Free PDF Merge, Split, Organise & Export Tools',
    description: 'Merge PDF files, split selected pages, reorder and rotate pages, convert PDF pages to images and extract selectable text directly in your browser.',
    lead: 'Put documents back in the right order.',
    introduction: 'Collect supporting PDFs into one document, extract only the pages you need, rearrange an incorrect sequence, turn pages into images or pull out selectable text. FilePebble processes these PDFs locally in supported browsers so you can work without a conversion-server upload.',
    choosing: 'Merge PDF combines multiple files in file order. Split PDF extracts a chosen page selection into one PDF or individual pages in a ZIP. Organise PDF reorders, rotates or removes pages. PDF to images renders pages; PDF to text reads an existing text layer and does not perform OCR.',
    tips: 'Check page count and order after exporting. Password-protected or signed PDFs and interactive forms are unsupported in the page tools. Merging and splitting do not guarantee metadata preservation, certified redaction or sanitisation. Keep the originals until you have inspected the outputs.',
    icon: '▧',
    featured: ['merge-pdf', 'split-pdf', 'organise-pdf', 'images-to-pdf', 'pdf-to-images', 'pdf-to-text'] as ToolId[],
  },
  {
    slug: 'images',
    name: 'Images',
    title: 'Image Converter, Compressor & Resizer Online',
    description: 'Convert JPG, PNG and WebP, adjust image quality, resize or crop pictures, and preview results before downloading. Local image processing with no signup.',
    lead: 'A better-looking image at the size you need.',
    introduction: 'Use the image converter when a file format is incompatible, the compressor when an attachment is too large, and the resizer when you need precise dimensions or a crop. Check the output visually as well as checking the filename and byte count.',
    choosing: 'JPG works well for photographs but cannot retain transparency. PNG is useful for graphics that need transparency or sharp detail. WebP may reduce file size where it is supported. Image compressor exports lossy JPG or WebP; image resize can preserve proportions or crop a region.',
    tips: 'A target size is an aim, not a guarantee. Re-encoding a very compressed photo can make it worse, and enlarging a small photo cannot restore detail. Supported inputs are still JPG, PNG and WebP images within the tool limits; animated and HEIC files are not accepted.',
    icon: '◐',
    featured: ['image-compressor', 'image-converter', 'image-resize'] as ToolId[],
  },
  {
    slug: 'data',
    name: 'Data',
    title: 'JSON Formatter & CSV–JSON Converters Online',
    description: 'Format and validate JSON, convert CSV records to JSON and turn JSON arrays into CSV with practical data-integrity safeguards.',
    lead: 'Clean data without surprising transformations.',
    introduction: 'JSON and CSV are everyday formats for APIs, spreadsheets and data exports. FilePebble makes it easier to inspect JSON syntax, turn CSV rows into records and prepare arrays of JSON objects for spreadsheet import, while keeping source processing in your browser.',
    choosing: 'CSV to JSON uses the CSV header row as property names and leaves values as strings. JSON to CSV accepts a non-empty array of records and includes optional fields. JSON formatter checks syntax and can beautify or minify while preserving original number spelling and key order.',
    tips: 'Treat identifier columns as text when importing CSV in spreadsheet software, or leading zeros can disappear. Nested JSON becomes cell text rather than automatically flattened columns. CSV formula-like values receive an escaping prefix for safety, so check exact values before automated imports.',
    icon: '{ }',
    featured: ['json-formatter', 'csv-to-json', 'json-to-csv'] as ToolId[],
  },
  {
    slug: 'markdown',
    name: 'Markdown',
    title: 'Markdown to PDF, Word & HTML Converters',
    description: 'Preview Markdown and create print-ready PDFs, editable Word documents or standalone HTML pages in your browser with practical export tips.',
    lead: 'Turn plain-text notes into polished documents.',
    introduction: 'Markdown is quick to write but not everyone wants to read a .md file. FilePebble offers a clean preview and export choices based on how the document will be used: printable PDF, editable Word or standalone HTML.',
    choosing: 'Markdown to PDF opens the browser print dialog: use Save as PDF as your destination. Markdown to Word creates an editable DOCX with supported headings, tables, lists and links. Markdown to HTML offers an HTML fragment or a standalone file with basic styles.',
    tips: 'Always inspect tables, long code lines and page breaks before sharing. Word and browser print engines have different pagination and fonts. Remote images and embeds are disabled for the HTML/print workflow, and Word export omits raw HTML and embedded images.',
    icon: 'MD',
    featured: ['markdown-to-pdf', 'markdown-to-docx', 'markdown-to-html'] as ToolId[],
  },
] as const;

export type ToolCategory = typeof categories[number];
export const categoryHref = (slug: string) => `/categories/${slug}/`;
export const categorySlugFromName = (name: string) => {
  const match = categories.find(item => item.name === name);
  return match?.slug ?? 'compare';
};
