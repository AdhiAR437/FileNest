import { markdownToDocx } from '../lib/markdown-docx';
self.onmessage = async (event: MessageEvent<{ input: string }>) => {
  try { self.postMessage(await markdownToDocx(event.data.input)); }
  catch (e) { self.postMessage({ error: e instanceof Error ? e.message : 'Unable to export this Markdown.' }); }
};
