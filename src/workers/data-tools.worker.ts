import { compareCsv, formatJson } from '../lib/data-tools';
self.onmessage = (event: MessageEvent) => {
  try {
    const { mode, left, right, key, trim, ignoreCase, jsonMode, indent } = event.data;
    self.postMessage({ result: mode === 'csv' ? compareCsv(left, right, key, trim, ignoreCase) : formatJson(left, jsonMode, indent) });
  } catch (e) { self.postMessage({ error: e instanceof Error ? e.message : 'Unable to process this input.' }); }
};
