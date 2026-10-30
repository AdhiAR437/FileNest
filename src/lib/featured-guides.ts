import type { ToolId } from './catalog';
export const featuredGuides: Partial<Record<ToolId,{slug:string;title:string}>> = {
  "csv-diff": {
    "slug": "compare-csv-files-by-id",
    "title": "Compare CSV files by ID"
  },
  "merge-pdf": {
    "slug": "merge-pdf-files-in-order",
    "title": "Merge PDFs in the right order"
  },
  "image-compressor": {
    "slug": "compress-images-for-email",
    "title": "Compress images for email"
  },
  "markdown-to-pdf": {
    "slug": "markdown-to-pdf-print-guide",
    "title": "Markdown to PDF printing guide"
  },
  "json-to-csv": {
    "slug": "json-to-csv-spreadsheet-guide",
    "title": "Convert JSON records safely to CSV"
  },
  "split-pdf": {
    "slug": "split-pdf-selected-pages",
    "title": "Split PDF pages and ranges"
  }
};
export const allGuides = [
  {
    "slug": "compare-csv-files-by-id",
    "title": "Compare CSV files by ID"
  },
  {
    "slug": "merge-pdf-files-in-order",
    "title": "Merge PDFs in the right order"
  },
  {
    "slug": "compress-images-for-email",
    "title": "Compress images for email"
  },
  {
    "slug": "markdown-to-pdf-print-guide",
    "title": "Markdown to PDF printing guide"
  },
  {
    "slug": "json-to-csv-spreadsheet-guide",
    "title": "Convert JSON records safely to CSV"
  },
  {
    "slug": "split-pdf-selected-pages",
    "title": "Split PDF pages and ranges"
  }
];
