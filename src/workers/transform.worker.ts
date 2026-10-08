import { compareText, compareJson, csvToJson, jsonToCsv } from '../lib/transforms';
self.onmessage = (event: MessageEvent) => {
  const { id, left, right, whitespace, ignoreCase } = event.data;
  try {
    const result = id === 'text-diff' ? compareText(left, right, whitespace, ignoreCase)
      : id === 'json-diff' ? compareJson(left, right)
      : id === 'csv-to-json' ? csvToJson(left) : jsonToCsv(left);
    self.postMessage({ result });
  } catch (error) {
    self.postMessage({ error: error instanceof Error ? error.message : 'Unable to process this input.' });
  }
};
