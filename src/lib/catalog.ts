export const tools = [
  { id: 'markdown-to-pdf', name: 'Markdown to PDF', category: 'Markdown', symbol: 'MD', description: 'Turn your notes into a clean, print-ready document.', input: 'Markdown', output: 'PDF', kind: 'markdown' },
  { id: 'markdown-to-html', name: 'Markdown to HTML', category: 'Markdown', symbol: '</>', description: 'Preview your Markdown and export a standalone HTML file.', input: 'Markdown', output: 'HTML', kind: 'markdown' },
  { id: 'text-diff', name: 'Text comparison', category: 'Compare', symbol: '±', description: 'See exactly what changed, line by line.', input: 'Text', output: 'Diff', kind: 'diff' },
  { id: 'json-diff', name: 'JSON comparison', category: 'Compare', symbol: '{}', description: 'Find changed values, without the noise of key order.', input: 'JSON', output: 'Diff', kind: 'json' },
  { id: 'csv-to-json', name: 'CSV to JSON', category: 'Data', symbol: '[ ]', description: 'Turn spreadsheet exports into structured JSON.', input: 'CSV', output: 'JSON', kind: 'data' },
  { id: 'json-to-csv', name: 'JSON to CSV', category: 'Data', symbol: '↗', description: 'Make an array of records spreadsheet-ready.', input: 'JSON', output: 'CSV', kind: 'data' },
  { id: 'image-converter', name: 'Image converter', category: 'Images', symbol: '↔', description: 'Convert between JPG, PNG, and WebP with a clear preview.', input: 'Image', output: 'Image', kind: 'image', mode: 'convert' },
  { id: 'image-compressor', name: 'Image compressor', category: 'Images', symbol: '↓', description: 'Adjust JPG or WebP quality, or aim for a target file size.', input: 'Image', output: 'Smaller image', kind: 'image', mode: 'compress' },
  { id: 'image-resize', name: 'Image resize & crop', category: 'Images', symbol: '⌗', description: 'Set pixel dimensions, keep proportions, and crop your image.', input: 'Image', output: 'Resized image', kind: 'image', mode: 'resize' },
] as const;
export type ToolId = typeof tools[number]['id'];
