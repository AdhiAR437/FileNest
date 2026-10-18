import type { ToolId } from './catalog';

// Human-written metadata matched to each tool's actual supported behavior.
// Avoid generic templates so search visitors know what each tool can do.
export const toolSeo = {
  'markdown-to-pdf': {
    title: "Markdown to PDF Online (Print to PDF) | FilePebble",
    description: "Convert Markdown to a clean, print-ready PDF using your browser's print dialog. Preview headings, lists, code and tables first. Free, no uploads or signup.",
  },
  'markdown-to-html': {
    title: "Markdown to HTML Converter Online | FilePebble",
    description: "Convert Markdown to HTML online. Preview formatted headings, tables and code, then copy clean HTML or download a standalone HTML file. Free and browser-based.",
  },
  'text-diff': {
    title: "Compare Text Online — Free Text Diff | FilePebble",
    description: "Compare two texts line by line to see additions and deletions. Choose to ignore case or edge whitespace. Free online text diff with no file uploads.",
  },
  'json-diff': {
    title: "Compare JSON Online — JSON Diff Tool | FilePebble",
    description: "Compare two JSON objects and see added, removed and changed values by path. Ignore object key order while preserving array order. Free and private.",
  },
  'csv-to-json': {
    title: "CSV to JSON Converter Online | FilePebble",
    description: "Convert CSV files to JSON records online. Preserve leading zeros and IDs as strings, including quoted commas and multiline cells. No signup or server upload.",
  },
  'json-to-csv': {
    title: "JSON to CSV Converter Online | FilePebble",
    description: "Convert a JSON array of records into downloadable CSV for spreadsheets. Include optional fields and safely escape formula-like cells. Runs in your browser.",
  },
  'image-converter': {
    title: "Convert JPG, PNG & WebP Images Online | FilePebble",
    description: "Convert images between JPG, PNG and WebP in your browser. Preview the output, choose quality and preserve transparency with PNG or WebP. No upload needed.",
  },
  'image-compressor': {
    title: "Compress JPG & WebP Images Online | FilePebble",
    description: "Compress JPG or WebP images locally. Adjust quality, aim for a target file size and compare results before downloading. Free and no uploads required.",
  },
  'image-resize': {
    title: "Resize & Crop Images Online for Free | FilePebble",
    description: "Resize JPG, PNG or WebP images by pixel dimensions, keep the aspect ratio or crop a region before export. Free browser tool; files stay on your device.",
  },
  'images-to-pdf': {
    title: "Convert Images to PDF Online for Free | FilePebble",
    description: "Combine JPG, PNG and WebP images into a single PDF. Reorder images and choose page size before download. Free browser conversion; no uploads.",
  },
  'merge-pdf': {
    title: "Merge PDF Files Online for Free | FilePebble",
    description: "Merge multiple PDF documents into one file. Choose their order and combine pages locally in your browser. No account, server uploads or fees.",
  },
  'split-pdf': {
    title: "Split PDF Pages Online for Free | FilePebble",
    description: "Split a PDF by page number or range. Save selected pages as one PDF or separate PDFs in a ZIP file. Free local processing, with no signup.",
  },
  'organise-pdf': {
    title: "Reorder, Rotate & Remove PDF Pages | FilePebble",
    description: "Reorder PDF pages, rotate pages or remove unwanted ones before downloading a new PDF. Free in-browser PDF organiser; no file uploads.",
  },
  'pdf-to-images': {
    title: "PDF to PNG or JPG Images Online | FilePebble",
    description: "Turn selected PDF pages into PNG or JPG images and download them as a ZIP. Choose image resolution, up to 20 pages per job. No file upload.",
  },
  'pdf-to-text': {
    title: "Extract Text from PDF Online (No OCR) | FilePebble",
    description: "Extract selectable text from PDF pages into a downloadable TXT file. Runs locally in your browser. Scanned PDFs need OCR, which is not included.",
  },
  'csv-diff': {
    title: "Compare CSV Files Online — CSV Diff | FilePebble",
    description: "Compare two CSV or TSV files by row position or a unique key. Spot changed cells, added rows and removed columns. Export a detailed JSON report.",
  },
  'image-diff': {
    title: "Compare Images Online — Image Diff | FilePebble",
    description: "Compare two same-size images pixel by pixel. Inspect an overlay, side-by-side view or highlighted difference mask, then download a PNG diff.",
  },
  'markdown-to-docx': {
    title: "Markdown to Word (DOCX) Converter | FilePebble",
    description: "Convert Markdown to an editable Word DOCX file in your browser. Export headings, lists, tables, code and supported links. Free with no file uploads.",
  },
  'json-formatter': {
    title: "JSON Formatter & Validator Online | FilePebble",
    description: "Beautify, minify or validate JSON online while preserving original number digits, escapes and key order. Free local processing, no signup needed.",
  },
} as const satisfies Record<ToolId, { title: string; description: string }>;
