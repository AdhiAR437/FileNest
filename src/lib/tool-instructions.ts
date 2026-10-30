import type { ToolId } from './catalog';

// Accurate task steps for each published tool. Keep these aligned with workbench controls.
export const toolInstructions = {
  "markdown-to-pdf": {
    "steps": [
      "Paste Markdown or open a .md or .txt file.",
      "Check the rendered preview for headings, lists, tables and code.",
      "Choose Print / Save PDF, then select Save as PDF in your browser's print dialog."
    ],
    "note": "This is a browser print workflow, not a direct PDF download. Print margins and pagination vary by browser; remote images and embeds are disabled."
  },
  "markdown-to-html": {
    "steps": [
      "Paste your Markdown or load a local text file.",
      "Check the rendered preview and, if needed, inspect the HTML source.",
      "Use Copy HTML for a content fragment or Download HTML for a standalone document."
    ],
    "note": "Scripts and unsafe HTML are removed. Remote images and embedded media are disabled."
  },
  "markdown-to-docx": {
    "steps": [
      "Paste Markdown or load a .md file and review the preview.",
      "Choose Create Word document and check any export warnings.",
      "Download the generated editable .docx file."
    ],
    "note": "Word pagination may differ from the HTML preview. Embedded images and raw HTML are not exported; task checkboxes become text."
  },
  "text-diff": {
    "steps": [
      "Paste or open the original text in the left editor.",
      "Add the updated version on the right; adjust case or whitespace options if needed.",
      "Run the comparison and read the line-by-line additions and removals."
    ],
    "note": "This is a line comparison, not a word-level merge editor. Large or complex inputs may be stopped to keep your browser responsive."
  },
  "json-diff": {
    "steps": [
      "Enter valid JSON for the original and updated documents.",
      "Run the comparison after checking both inputs for JSON syntax errors.",
      "Inspect the changed JSON Pointer paths for added, removed or modified values."
    ],
    "note": "Object key order is ignored but array order matters. Large numeric IDs may lose precision when JSON is parsed; store them as strings."
  },
  "csv-to-json": {
    "steps": [
      "Paste CSV text or open a .csv file, including a header row.",
      "Run the CSV to JSON conversion.",
      "Review the generated records, then copy or download the JSON."
    ],
    "note": "All CSV values remain strings, preserving leading-zero identifiers. This tool does not open .xlsx workbooks; export those as CSV first."
  },
  "json-to-csv": {
    "steps": [
      "Paste a non-empty JSON array of objects or open a local JSON file.",
      "Convert the records into CSV; optional fields become columns.",
      "Review the output, then copy or download the CSV for import into a spreadsheet."
    ],
    "note": "Nested objects become JSON text inside cells. Formula-like values receive a safety prefix, and spreadsheet applications may still reinterpret column types."
  },
  "csv-diff": {
    "steps": [
      "Paste or open the original and updated CSV/TSV exports, including column headers.",
      "Optionally specify a unique key column such as id to match records even when rows move.",
      "Choose Compare CSV, inspect changed rows and columns, and download the full JSON report if needed."
    ],
    "note": "Matching keys must be present, non-empty and unique in each file. A blank key matches by row position; XLSX files are not supported."
  },
  "json-formatter": {
    "steps": [
      "Paste valid JSON or open a .json file.",
      "Choose Beautify, Minify or Validate only; select indentation for Beautify.",
      "Select Process JSON and copy or download the result."
    ],
    "note": "The tool checks JSON syntax, not a business schema. Comments and trailing commas are invalid; formatting preserves the original number spelling."
  },
  "image-converter": {
    "steps": [
      "Choose a still JPG, PNG or WebP image.",
      "Choose JPG, PNG or WebP output, adjusting background and quality where relevant.",
      "Select Convert image, inspect the output preview, then download it."
    ],
    "note": "JPG does not support transparency; transparent pixels use the chosen background. Animated formats and EXIF metadata are not retained."
  },
  "image-compressor": {
    "steps": [
      "Choose a still JPG, PNG or WebP source image.",
      "Select JPG or WebP, adjust quality and optionally enable a target size in KB.",
      "Choose Compress image, compare the actual file sizes and preview, then download."
    ],
    "note": "A target file size is not guaranteed; some images may become larger. This is lossy JPG/WebP compression, not lossless PNG optimization."
  },
  "image-resize": {
    "steps": [
      "Choose a still JPG, PNG or WebP image.",
      "Enter output width and height, using Keep aspect ratio or crop coordinates as needed.",
      "Choose Resize image, inspect the preview and download the result."
    ],
    "note": "Upscaling cannot recover missing detail. Crops must fit within the source image, and JPG will fill transparent pixels."
  },
  "image-diff": {
    "steps": [
      "Choose an original image and an updated image with identical dimensions.",
      "Set a pixel threshold if small RGB differences should be ignored, then choose Compare images.",
      "Inspect side-by-side, overlay and difference views; download the PNG difference mask."
    ],
    "note": "Images are compared pixel by pixel, not semantically. Compression can change many pixels, and the tool does not align or resize inputs."
  },
  "images-to-pdf": {
    "steps": [
      "Choose two or more still images, or a single image, in JPG, PNG or WebP format.",
      "Use the order controls to arrange pages and select A4 or image-sized pages.",
      "Create the PDF and download the finished document."
    ],
    "note": "Each image becomes a picture on its own page; photographed text is not searchable without OCR. Output has image and file-size limits."
  },
  "merge-pdf": {
    "steps": [
      "Choose two or more PDF files from your device.",
      "Use the file-order controls to arrange the documents in the intended sequence.",
      "Select Merge PDF and download the combined PDF; review the resulting page order."
    ],
    "note": "Only page content is copied reliably. Encrypted, signed and interactive-form PDFs are not supported; bookmarks may be lost."
  },
  "split-pdf": {
    "steps": [
      "Choose one PDF to split.",
      "Enter page positions such as 1, 3-5 or leave the selection blank for all pages.",
      "Choose whether to keep pages together or create separate PDFs, then download the PDF or ZIP."
    ],
    "note": "Use page positions starting at 1, not printed page labels. Splitting is not secure redaction and does not sanitize hidden document data."
  },
  "organise-pdf": {
    "steps": [
      "Choose one PDF and inspect its numbered pages.",
      "Use move, rotation or removal controls to arrange the pages; preview pages as needed.",
      "Create and download the reordered PDF, then check the final result."
    ],
    "note": "At least one page must remain. This changes pages, not the text on them; signed forms and bookmarks may not be preserved."
  },
  "pdf-to-images": {
    "steps": [
      "Choose one PDF and enter the page positions to export.",
      "Choose PNG or JPG and an output resolution in DPI.",
      "Export selected pages, then download the resulting ZIP of images."
    ],
    "note": "Higher DPI creates larger images. Exports are limited by page count, pixels and output size; annotations are not included."
  },
  "pdf-to-text": {
    "steps": [
      "Choose a PDF containing a selectable text layer.",
      "Enter the page positions to extract or leave the field blank for all pages.",
      "Choose Extract text and download the plain-text result."
    ],
    "note": "This is not OCR. Text in scans may be missing, and columns, tables and reading order may need manual cleanup."
  }
} satisfies Record<ToolId, { steps: [string, string, string]; note: string }>;
