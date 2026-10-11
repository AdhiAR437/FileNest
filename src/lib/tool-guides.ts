import type { ToolId } from './catalog';

type ToolGuide = {
  overview: string;
  example: { title: string; text: string; note: string };
  faqs: { question: string; answer: string }[];
};

export const toolGuides: Record<ToolId, ToolGuide> = {
  "markdown-to-pdf": {
    "overview": "Turn Markdown notes, a README or a short report into a document you can print or save as PDF. Review headings, lists, code and tables in the local preview first. This is useful for sharing readable notes with someone who does not use a Markdown editor.",
    "example": {
      "title": "A meeting handout",
      "text": "# Project update\n\n## Completed\n- Published the website\n- Added image tools\n\n**Next meeting:** Monday",
      "note": "Paste the Markdown, review it, then choose Print / Save PDF. Your browser controls paper size, margins and the final filename."
    },
    "faqs": [
      {
        "question": "How do I download the PDF?",
        "answer": "Select Save as PDF or your operating system’s PDF destination in the print dialog. Availability depends on your browser and device; this is a print workflow rather than a direct PDF download."
      },
      {
        "question": "Can I include images and complex layouts?",
        "answer": "Remote images and embedded media are disabled. Wide tables and long code lines may paginate differently from the preview. Check print preview and try landscape paper or a simpler layout."
      },
      {
        "question": "Is my Markdown uploaded?",
        "answer": "The current tool renders and prints locally. Downloading the site still sends ordinary requests to Cloudflare, but your Markdown is not sent to a conversion server."
      }
    ]
  },
  "markdown-to-html": {
    "overview": "Create a standalone HTML document from Markdown for documentation, formatted notes or a shareable README. Inspect the rendered preview, switch to HTML source, copy the content fragment or download a complete document with its own basic styling.",
    "example": {
      "title": "A short setup guide",
      "text": "# Setup\n\n1. Install dependencies.\n2. Start the app.\n\n**Tip:** Keep a copy of your original notes.",
      "note": "Download HTML includes a document template and styles. Copy HTML copies the sanitised content fragment."
    },
    "faqs": [
      {
        "question": "Does the exported HTML work offline?",
        "answer": "The document contains its basic styles and can be opened locally. Following an external link still connects to the linked website."
      },
      {
        "question": "Can Markdown run JavaScript?",
        "answer": "Scripts, event handlers and unsafe embedded content are removed. Remote images and media are disabled. This is a document exporter, not an executable web-app builder."
      },
      {
        "question": "Which Markdown features work?",
        "answer": "Headings, emphasis, lists, blockquotes, links, code blocks and tables are supported. Custom editor plugins and embedded media are not included."
      }
    ]
  },
  "markdown-to-docx": {
    "overview": "Create an editable Word document when a colleague needs a .docx file instead of Markdown source. The export supports headings, emphasis, lists, task markers, tables, quotes, code and supported hyperlinks. Review any export warnings before downloading.",
    "example": {
      "title": "An editable checklist",
      "text": "# Release checklist\n\n- [x] Publish the website\n- [ ] Submit the sitemap\n\n| Task | Owner |\n| --- | --- |\n| Testing | Adhi |",
      "note": "Choose Create Word document, wait for the ready message, then Download Word. Task markers are text, not interactive Word form controls."
    },
    "faqs": [
      {
        "question": "Will Word match the preview exactly?",
        "answer": "The preview renders Markdown as HTML. Word uses its own fonts, page layout and pagination, so spacing and page breaks can differ."
      },
      {
        "question": "Are images and raw HTML exported?",
        "answer": "Images and raw HTML are omitted with warnings. Image alt text is retained as a placeholder. Supported external links remain clickable."
      },
      {
        "question": "What are the export limits?",
        "answer": "Use up to 250 KB of UTF-8 Markdown. Output is limited to 10 MB, and tables to 10 columns and 500 rows. Deeply nested or complex documents may be rejected."
      }
    ]
  },
  "text-diff": {
    "overview": "Find added and removed lines between two versions of notes, configuration files, logs or source code. The unified view puts changes together. Optional rules let you ignore letter case or whitespace at line edges when those differences do not matter to your task.",
    "example": {
      "title": "One changed setting",
      "text": "Original:\nmode=preview\nretries=2\n\nUpdated:\nmode=production\nretries=2",
      "note": "The mode line changes; retries stays the same. This compares lines, not the meaning of configuration settings."
    },
    "faqs": [
      {
        "question": "Can one side be empty?",
        "answer": "Yes. Leave one side empty to see all lines as added or removed. Both sides cannot be empty."
      },
      {
        "question": "Does it highlight individual words?",
        "answer": "The current tool compares whole lines. It does not offer word-level highlighting or a merge editor."
      },
      {
        "question": "Why does a comparison time out?",
        "answer": "Large or complex comparisons are stopped to keep the browser responsive. Use up to 100,000 characters per side within the 1 MB input limit, or compare smaller sections."
      }
    ]
  },
  "json-diff": {
    "overview": "Review API responses and configuration changes without differences caused only by indentation or object-key order. The result identifies added, removed and changed values using JSON Pointer paths. Both documents need valid standard JSON.",
    "example": {
      "title": "A changed API field",
      "text": "Original: {\"name\":\"FilePebble\",\"version\":1}\nUpdated:  {\"version\":2,\"name\":\"FilePebble\"}\n\nChanged path: /version",
      "note": "Reordering the object keys does not create a change. Updating the version does."
    },
    "faqs": [
      {
        "question": "Does array order matter?",
        "answer": "Yes. Arrays are compared by position, so reordering items can create differences even when the same values remain."
      },
      {
        "question": "Can I compare very large integer IDs?",
        "answer": "This tool parses numbers with JavaScript precision. Quote IDs beyond the safe-integer range as strings on both sides. The separate JSON formatter preserves original number spelling; this structural comparator does not."
      },
      {
        "question": "What does /items/0/name mean?",
        "answer": "It points to the name field in the first item of the items array. JSON Pointer escapes a slash in a key as ~1 and a tilde as ~0."
      }
    ]
  },
  "csv-to-json": {
    "overview": "Turn a spreadsheet’s CSV export into an array of JSON records. The header row supplies the field names. Values stay as strings to preserve IDs, product codes and leading zeroes rather than guessing types from their appearance.",
    "example": {
      "title": "Keep a leading-zero ID",
      "text": "CSV:\nid,name\n001,Adhi\n\nJSON:\n[{\"id\":\"001\",\"name\":\"Adhi\"}]",
      "note": "The ID stays a string. Apply explicit number or date conversions afterward if your destination needs them."
    },
    "faqs": [
      {
        "question": "Does it open Excel XLSX files?",
        "answer": "No. Export the sheet as CSV first. CSV contains cell values rather than workbook formatting, multiple sheets or formulas."
      },
      {
        "question": "Do quoted commas and multiline fields work?",
        "answer": "Correctly quoted CSV fields are supported. Malformed rows or duplicate headers are rejected. For example, \"Mangaluru, Karnataka\" is one quoted field."
      },
      {
        "question": "Why are numbers in quotes?",
        "answer": "Automatic type conversion is disabled. Keeping strings prevents 001 becoming 1 and avoids guessing how dates or decimals should be interpreted."
      }
    ]
  },
  "json-to-csv": {
    "overview": "Convert a non-empty JSON array of records into CSV for a spreadsheet or import workflow. Fields from all records become columns, including optional properties. Nested objects and arrays become JSON text in a cell rather than multiple expanded columns.",
    "example": {
      "title": "Records with an optional city",
      "text": "JSON:\n[{\"id\":\"001\",\"name\":\"Adhi\"},{\"id\":\"002\",\"name\":\"Maya\",\"city\":\"Udupi\"}]\n\nCSV:\nid,name,city\n001,Adhi,\n002,Maya,Udupi",
      "note": "Missing or null fields become empty cells. Spreadsheet software may reinterpret IDs; import identifier columns as text when needed."
    },
    "faqs": [
      {
        "question": "Can I convert a single object?",
        "answer": "Wrap it in an array, such as [{\"name\":\"Adhi\"}]. The tool requires a non-empty array of objects with record fields."
      },
      {
        "question": "What happens to nested data and large IDs?",
        "answer": "Nested data becomes JSON text inside cells. Numbers are parsed with JavaScript precision, so large IDs should already be strings before conversion."
      },
      {
        "question": "Why does a cell start with an apostrophe?",
        "answer": "Formula-like values are prefixed to reduce spreadsheet formula execution risk. Review the CSV before importing it into a system where exact cell text matters."
      }
    ]
  },
  "csv-diff": {
    "overview": "Find changed records between two CSV or TSV exports. Match by row position or a shared unique key such as an ID. Key matching follows records when row order changes, which helps compare regular exports without treating every moved row as a new record.",
    "example": {
      "title": "Match by ID instead of row order",
      "text": "Original:\nid,city\n001,Mangaluru\n002,Udupi\n\nUpdated:\nid,city\n002,Manipal\n001,Mangaluru\n\nKey column: id",
      "note": "With id matching, only record 002 changes. Record 001 is unchanged even though it moves."
    },
    "faqs": [
      {
        "question": "Can columns be in different orders?",
        "answer": "Yes. Headers identify columns regardless of position. Added and removed columns appear in the report."
      },
      {
        "question": "Why is my key rejected?",
        "answer": "Its header must exist in both files, and its values must be non-empty and unique in each file. Keys match exactly; whitespace and case options apply to compared cells, not key matching."
      },
      {
        "question": "Does the screen show every change?",
        "answer": "The preview shows up to 200 changed rows and shortens long cell text. Download the full JSON report. Inputs allow 1 MB, 10,000 rows and 100 columns per file. XLSX is not supported."
      }
    ]
  },
  "json-formatter": {
    "overview": "Make JSON readable, remove unnecessary whitespace or check syntax. Formatting preserves the original tokens, including number spelling, string escapes, key order and duplicate keys. This helps inspect a payload without rounding a large identifier during formatting.",
    "example": {
      "title": "Format without rounding an ID",
      "text": "Input: {\"id\":9007199254740993,\"active\":true}\n\nFormatted:\n{\n  \"id\": 9007199254740993,\n  \"active\": true\n}",
      "note": "The original digits remain intact. A downstream application with limited number precision may still round them when parsing."
    },
    "faqs": [
      {
        "question": "Are comments and trailing commas allowed?",
        "answer": "No. Standard JSON requires double-quoted keys and strings and does not allow comments or trailing commas."
      },
      {
        "question": "Does it validate a JSON schema?",
        "answer": "No. It checks syntax and the tool’s size/depth limits, not field types or business rules. Duplicate keys are retained rather than rejected."
      },
      {
        "question": "What formatting options are available?",
        "answer": "Beautify with two spaces, four spaces or tabs; minify; or validate only. Use up to 1 MB of input and 200 nesting levels. Large outputs have a shortened screen preview."
      }
    ]
  },
  "image-converter": {
    "overview": "Convert a still JPG, PNG or WebP image into another supported format. PNG can preserve transparency, JPG is widely supported for photographs, and WebP may suit destinations that support it. Review the exported image and its actual size before choosing a format.",
    "example": {
      "title": "Convert a transparent logo to JPG",
      "text": "Source: logo.png with transparent pixels\nOutput: JPG\nBackground: #ffffff\nQuality: 85%",
      "note": "JPG fills transparent areas with the chosen background. Re-encoding cannot recover detail lost in an earlier compressed image."
    },
    "faqs": [
      {
        "question": "Which formats preserve transparency?",
        "answer": "PNG and WebP can preserve it. JPG uses your selected background. The actual encoded output is checked because browser format support varies."
      },
      {
        "question": "Can I use HEIC, SVG or animated GIF?",
        "answer": "No. Still JPG, PNG and WebP are supported. Animated PNG and WebP are also rejected."
      },
      {
        "question": "Is camera metadata retained?",
        "answer": "No. The browser decodes and re-encodes the image; original EXIF metadata is not retained. Colour handling and encoder quality may differ between browsers."
      }
    ]
  },
  "image-compressor": {
    "overview": "Reduce image size by exporting JPG or WebP at adjusted quality. You can also aim for a target such as an attachment limit. Compression trades some detail for fewer bytes; inspect the preview and actual output size, especially when the source is already optimised.",
    "example": {
      "title": "Aim for a 200 KB attachment",
      "text": "Source: a still photograph\nOutput: JPG or WebP\nTarget size: 200 KB\n\nCheck: actual output size and image quality",
      "note": "A target is not guaranteed. If it cannot be reached, reduce dimensions with Image resize and try compressing again."
    },
    "faqs": [
      {
        "question": "Is this lossless PNG optimisation?",
        "answer": "No. The compressor adjusts lossy quality in JPG or WebP. Use Image converter for PNG output."
      },
      {
        "question": "Why was the target not reached?",
        "answer": "Image dimensions and content may require more bytes than the target allows at supported quality settings. The tool reports that outcome instead of claiming success."
      },
      {
        "question": "Can I compress a batch?",
        "answer": "The current tool handles one image per job. Use a still image up to 15 MB and 12 megapixels, with no side longer than 8,000 pixels."
      }
    ]
  },
  "image-resize": {
    "overview": "Set pixel dimensions or crop a rectangle before exporting an image. Lock the aspect ratio to preserve proportions. Coordinate-based cropping helps create a consistent avatar, trim a screenshot or fit a specific upload requirement.",
    "example": {
      "title": "Resize without stretching",
      "text": "Original: 2400 × 1600 pixels\nKeep proportions: on\nNew width: 1200 pixels\nResulting height: 800 pixels",
      "note": "A crop must fit within the original image. Choose a square crop and square output for an avatar; the tool does not automatically find a face."
    },
    "faqs": [
      {
        "question": "Does enlarging make the image sharper?",
        "answer": "No. Browser resampling adds pixels but does not recover missing detail or provide AI enhancement."
      },
      {
        "question": "Why does the crop fail?",
        "answer": "X and Y must be non-negative whole numbers. Width and height must be positive whole numbers, and the rectangle must fit inside the original image."
      },
      {
        "question": "Can I resize a transparent image?",
        "answer": "Yes. Select PNG or WebP for transparency. JPG fills it with your chosen background. Original EXIF metadata is not retained."
      }
    ]
  },
  "image-diff": {
    "overview": "Inspect changes between two equal-size screenshots, design exports or edited pictures. Side-by-side gives context, the overlay slider reveals each version, and the difference mask marks changed pixels. Adjust the RGB threshold to ignore very small colour differences.",
    "example": {
      "title": "Check two screenshot versions",
      "text": "Original: 1200 × 800 pixels\nUpdated: 1200 × 800 pixels\nRGB threshold: 10\n\nPink mask pixels: differences above the threshold",
      "note": "A pixel changes when its largest red, green or blue channel difference exceeds the threshold. This measures pixels, not whether a design change is meaningful."
    },
    "faqs": [
      {
        "question": "Why must dimensions match?",
        "answer": "Corresponding pixels are compared after orientation. The tool does not resize, align or compensate for a shifted image. Resize both versions consistently first."
      },
      {
        "question": "How is transparency compared?",
        "answer": "Images are composited on white. Hidden colour data in fully transparent pixels is not compared as raw source-file data."
      },
      {
        "question": "Why do similar JPGs have many changes?",
        "answer": "Lossy compression and browser colour handling can alter pixels. Try a higher threshold and inspect the overlay. The PNG difference download retains full input dimensions."
      }
    ]
  },
  "images-to-pdf": {
    "overview": "Combine local JPG, PNG or WebP images into a PDF with one image per page. Assemble photographed notes, receipts or scans for sharing. Reorder files before processing and choose A4 pages with margins or pages sized to each image.",
    "example": {
      "title": "Assemble photographed notes",
      "text": "Files in order:\n1. notes-page-1.jpg\n2. notes-page-2.jpg\n3. notes-page-3.jpg\n\nPage size: A4 with margins",
      "note": "Use the order arrows first. The PDF contains pictures; photographed words do not become searchable text without OCR."
    },
    "faqs": [
      {
        "question": "Can pages be portrait and landscape?",
        "answer": "A4 output chooses orientation automatically for each image. Fit image uses image-sized pages without margins, based on 96 DPI."
      },
      {
        "question": "Will this create selectable text?",
        "answer": "No. It places images on PDF pages and does not perform OCR. PDF to text cannot extract words that only exist inside those images."
      },
      {
        "question": "How many images can I combine?",
        "answer": "Up to 20 still images, 15 MB per image, 40 MB combined and 40 megapixels combined, subject to the individual image pixel limits."
      }
    ]
  },
  "merge-pdf": {
    "overview": "Join multiple PDFs in your chosen file order for a report, supporting documents or separate notes. Each input’s pages are copied into a new PDF. Use Organise PDF afterward if individual pages need to be moved, rotated or removed.",
    "example": {
      "title": "Join a report and appendix",
      "text": "First: report.pdf — 8 pages\nSecond: appendix.pdf — 3 pages\n\nResult: 11 pages, report first",
      "note": "Use the file-order arrows before merging. Review the downloaded document because document-level features are not fully preserved."
    },
    "faqs": [
      {
        "question": "What are the merge limits?",
        "answer": "Choose 2–10 PDFs, up to 20 MB each and 40 MB combined, with up to 100 pages in total. Output is limited to 50 MB."
      },
      {
        "question": "Can I merge protected or signed PDFs?",
        "answer": "Encrypted PDFs and PDFs with interactive forms or signatures are rejected. Use an authorised, unsigned and non-interactive copy."
      },
      {
        "question": "Will bookmarks and metadata survive?",
        "answer": "Not all document-level features or metadata are preserved. This copies pages and is not an archival or sanitisation workflow. Review the result."
      }
    ]
  },
  "split-pdf": {
    "overview": "Extract selected pages into one PDF or save separate PDFs in a ZIP. Share a report section or split a document packet using page positions rather than printed labels. Enter individual pages and ascending ranges with a normal hyphen.",
    "example": {
      "title": "Keep selected report pages",
      "text": "Input: a 10-page PDF\nSelection: 1, 3-5\n\nResult: pages 1, 3, 4 and 5",
      "note": "Keep selected pages together, or choose one PDF per page in a ZIP. Select each page only once."
    },
    "faqs": [
      {
        "question": "What does a blank selection do?",
        "answer": "It selects all pages. Enter a range to extract a subset. Page positions start at 1."
      },
      {
        "question": "Can every page become a separate PDF?",
        "answer": "Yes. Choose the separate-PDF option and leave the selection blank. Download and extract the ZIP."
      },
      {
        "question": "Is splitting secure redaction?",
        "answer": "No. It selects pages rather than providing a certified redaction or sanitisation service. Do not rely on it to remove all sensitive information in a PDF."
      }
    ]
  },
  "organise-pdf": {
    "overview": "Reorder, rotate or remove pages and save a new PDF. Correct a sideways scan, rearrange report sections or remove an unwanted page. Previews are rendered on request so a large document does not need a full thumbnail grid.",
    "example": {
      "title": "Correct a three-page packet",
      "text": "Original order: 1, 2, 3\nMove page 3 before page 2.\nRotate page 3 by 90°.\n\nSaved order: 1, 3, 2",
      "note": "Controls refer to original page numbers. Check a preview after changing rotation, and keep at least one page."
    },
    "faqs": [
      {
        "question": "Can I edit words on a page?",
        "answer": "No. This changes page order and rotation or removes pages; it is not a PDF text editor."
      },
      {
        "question": "Why are there no automatic thumbnails?",
        "answer": "The current interface lists pages and renders previews on demand to reduce processing and memory use."
      },
      {
        "question": "Are all PDF features preserved?",
        "answer": "Document-level bookmarks and metadata are not fully preserved. Interactive forms and signatures are unsupported. Removing pages is not a sanitisation guarantee."
      }
    ]
  },
  "pdf-to-images": {
    "overview": "Render selected PDF pages as PNG or JPG and download the images in a ZIP. Use them as page screenshots, presentation visuals or a visual review. Higher DPI produces more pixels, larger files and greater memory use.",
    "example": {
      "title": "Export two report pages",
      "text": "Selected pages: 2, 4\nFormat: PNG\nResolution: 144 DPI\n\nZIP: page-2.png and page-4.png",
      "note": "PNG suits crisp text and diagrams; JPG can use fewer bytes for photos. PDF annotations are excluded from rendering."
    },
    "faqs": [
      {
        "question": "Can I export scanned pages?",
        "answer": "Yes, if the PDF is otherwise supported. Rendering its appearance does not require selectable text and does not run OCR."
      },
      {
        "question": "Why did high-resolution export fail?",
        "answer": "Each page is limited to 12 megapixels, with up to 20 pages per job and 50 MB output. Lower DPI or select fewer pages."
      },
      {
        "question": "Are comments and form fields rendered?",
        "answer": "Annotation rendering is excluded. PDFs with interactive forms or signatures are rejected. Check results if you rely on features beyond ordinary page content."
      }
    ]
  },
  "pdf-to-text": {
    "overview": "Extract a PDF’s selectable text into a plain-text download with page labels. Search report content, copy passages or prepare text for another app. This reads an existing text layer; it cannot recognise words that are only present in scanned images.",
    "example": {
      "title": "Extract a report page",
      "text": "Selected pages: 2\n\nOutput:\n--- Page 2 ---\nQuarterly project update\nCompleted tasks ...",
      "note": "Columns, tables, spacing and reading order may need cleanup. Text positions inside a PDF do not always represent a natural reading sequence."
    },
    "faqs": [
      {
        "question": "Why did no text appear?",
        "answer": "The PDF may contain scans without a text layer. The tool reports when no selectable text is found. OCR is not included."
      },
      {
        "question": "Can I preserve tables and formatting?",
        "answer": "No. This is plain-text extraction, not PDF to Word. It does not reconstruct editable tables, fonts, images or layout."
      },
      {
        "question": "Can I extract only a few pages?",
        "answer": "Yes. Enter positions or ranges such as 1, 3-5. Sources can contain up to 100 pages; extracted text is limited to 5 MB."
      }
    ]
  }
};

