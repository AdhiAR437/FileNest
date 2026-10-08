import { marked } from 'marked';
import type { Token, Tokens } from 'marked';
import { Document, Paragraph, TextRun, Table, TableRow, TableCell, ExternalHyperlink, Packer, HeadingLevel, NumberFormat, WidthType, BorderStyle, TableLayoutType } from 'docx';
import type { IParagraphOptions, IRunOptions, INumberingOptions } from 'docx';
export const DOCX_INPUT_LIMIT = 250_000;
function entities(text: string) {
  const named: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
  return text.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (whole, code: string) => {
    if (code[0] !== '#') return named[code.toLowerCase()] ?? whole;
    const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1));
    return (n === 9 || n === 10 || n === 13 || (n >= 32 && n <= 0xd7ff) || (n >= 0xe000 && n <= 0xfffd) || (n >= 0x10000 && n <= 0x10ffff)) ? String.fromCodePoint(n) : whole;
  });
}
export async function markdownToDocx(input: string) {
  if (!input.trim() || new TextEncoder().encode(input).length > DOCX_INPUT_LIMIT) throw new Error('Add Markdown up to 250 KB for Word export.');
  const warnings = new Set<string>(); let blocks = 0, inlineCount = 0, listId = 0;
  const cleaned = input.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\ufffe\uffff]/g, () => { warnings.add('Unsupported control characters were removed.'); return ''; }).toWellFormed();
  function textValue(text: string, decode = true) { const value = decode ? entities(text) : text; return value.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\ufffe\uffff]/g, () => { warnings.add('Unsupported control characters were replaced.'); return '\ufffd'; }).toWellFormed(); }
  const numbering: INumberingOptions['config'][number][]= [];
  type Inline = TextRun | ExternalHyperlink;
  function runs(tokens: Token[], style: Omit<IRunOptions, 'text' | 'children'> = {}, depth = 0): Inline[] {
    if (depth > 20) throw new Error('Inline formatting is nested too deeply.');
    const output: Inline[] = [];
    for (const token of tokens) {
      if (++inlineCount > 50000) throw new Error('This document has too many text elements. Export a smaller section.');
      switch (token.type) {
        case 'strong': output.push(...runs((token as Tokens.Strong).tokens, { ...style, bold: true }, depth + 1)); break;
        case 'em': output.push(...runs((token as Tokens.Em).tokens, { ...style, italics: true }, depth + 1)); break;
        case 'del': output.push(...runs((token as Tokens.Del).tokens, { ...style, strike: true }, depth + 1)); break;
        case 'codespan': output.push(new TextRun({ ...style, text: textValue((token as Tokens.Codespan).text, false), font: 'Courier New', size: 20 })); break;
        case 'br': output.push(new TextRun({ break: 1 })); break;
        case 'link': {
          const link = token as Tokens.Link; const content = runs(link.tokens, style, depth + 1);
          if (/^(https?:\/\/|mailto:)/i.test(link.href) && !/[\x00-\x20\ufffe\uffff]/.test(link.href) && link.href === link.href.toWellFormed()) output.push(new ExternalHyperlink({ link: link.href, children: content }));
          else { output.push(...content); warnings.add('Relative or unsupported links were exported as plain text.'); }
          break;
        }
        case 'image': output.push(new TextRun({ ...style, text: `[Image omitted${(token as Tokens.Image).text ? `: ${textValue((token as Tokens.Image).text)}` : ''}]` })); warnings.add('Images were omitted; their alt text is retained.'); break;
        case 'html': warnings.add('Raw HTML was omitted from Word output.'); break;
        default: {
          const text = token as Tokens.Text;
          if (text.tokens) output.push(...runs(text.tokens, style, depth + 1));
          else output.push(new TextRun({ ...style, text: textValue('text' in token ? String(token.text) : token.raw) }));
        }
      }
    }
    return output;
  }
  function paragraph(children: Inline[], options: IParagraphOptions = {}) { return new Paragraph({ children, spacing: { after: 160, line: 276 }, ...options }); }
  function walk(tokens: Token[], depth = 0, options: IParagraphOptions = {}): (Paragraph | Table)[] {
    if (depth > 8) throw new Error('Lists and quotes may be nested up to 8 levels.');
    const output: (Paragraph | Table)[] = [];
    for (const token of tokens) {
      if (++blocks > 5000) throw new Error('This document has too many blocks. Export a smaller section.');
      switch (token.type) {
        case 'space': break;
        case 'heading': {
          const h = token as Tokens.Heading; const headings = [HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3, HeadingLevel.HEADING_4, HeadingLevel.HEADING_5, HeadingLevel.HEADING_6];
          output.push(paragraph(runs(h.tokens), { ...options, heading: headings[h.depth - 1], keepNext: true, spacing: { before: 240, after: 160 } })); break;
        }
        case 'paragraph': case 'text': {
          const p = token as Tokens.Paragraph; output.push(paragraph(runs(p.tokens ?? marked.lexer(p.text, { gfm: true })), options)); break;
        }
        case 'code': {
          const code = token as Tokens.Code;
          for (const line of code.text.split('\n')) output.push(paragraph([new TextRun({ text: textValue(line || ' ', false), font: 'Courier New', size: 20 })], { ...options, spacing: { after: 0, line: 240 } }));
          output.push(paragraph([], { spacing: { after: 160 } })); break;
        }
        case 'blockquote': output.push(...walk((token as Tokens.Blockquote).tokens, depth + 1, { ...options, indent: { left: 360 * (depth + 1) } })); break;
        case 'list': {
          const list = token as Tokens.List, reference = `list-${++listId}`;
          if (list.ordered) numbering.push({ reference, levels: Array.from({ length: 9 }, (_, level) => ({ level, format: NumberFormat.DECIMAL, text: `%${level + 1}.`, start: typeof list.start === 'number' ? list.start : 1, style: { paragraph: { indent: { left: 360 * (level + 1), hanging: 240 } } } })) });
          for (const item of list.items) {
            let first = true;
            for (const part of item.tokens) {
              if (part.type === 'space' || part.type === 'checkbox') continue;
              if (part.type === 'list') { output.push(...walk([part], depth + 1)); continue; }
              const pOptions: IParagraphOptions = first ? list.ordered ? { numbering: { reference, level: depth } } : { bullet: { level: depth } } : { indent: { left: 360 * (depth + 1) } };
              const taskPart = first && item.task && 'tokens' in part ? { ...part, tokens: [{ type: 'text', raw: '', text: item.checked ? '[x] ' : '[ ] ' }, ...(part.tokens as Token[])] } as Token : part;
              const content = walk([taskPart], depth, { ...options, ...pOptions });
              output.push(...content); first = false;
            }
          } break;
        }
        case 'table': {
          const t = token as Tokens.Table;
          if (t.header.length > 10 || t.rows.length > 500) throw new Error('Word tables support up to 10 columns and 500 rows per table.');
          const width = Math.floor(9360 / t.header.length); const border = { style: BorderStyle.SINGLE, size: 4, color: 'D9D9D9' };
          output.push(new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: t.header.map(() => width), layout: TableLayoutType.FIXED, borders: { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border }, rows: [t.header, ...t.rows].map((cells, i) => new TableRow({ tableHeader: i === 0, children: cells.map((cell, col) => new TableCell({ width: { size: width, type: WidthType.DXA }, margins: { top: 100, bottom: 100, left: 120, right: 120 }, shading: i === 0 ? { fill: 'EAEAEA' } : undefined, children: [paragraph(runs(cell.tokens, { bold: i === 0 }), { alignment: t.align[col] ?? 'left', spacing: { after: 0, line: 276 } })] })) })) }));
          output.push(paragraph([])); break;
        }
        case 'hr': output.push(paragraph([new TextRun({ text: '—' })], options)); break;
        case 'html': warnings.add('Raw HTML was omitted from Word output.'); break;
        default: warnings.add('Some unsupported Markdown was exported as plain text.'); output.push(paragraph([new TextRun({ text: textValue(token.raw, false) })], options));
      }
    }
    return output;
  }
  const children = walk(marked.lexer(cleaned, { gfm: true })); if (!children.length) throw new Error('No supported Markdown content remains for Word export.');
  const doc = new Document({ creator: 'FileNest', title: 'Converted Markdown document', numbering: { config: numbering }, styles: { default: { document: { run: { font: 'Calibri', size: 22, color: '000000' }, paragraph: { spacing: { after: 160, line: 276 } } }, heading1: { run: { color: '000000', size: 36, bold: true } }, heading2: { run: { color: '000000', size: 30, bold: true } }, heading3: { run: { color: '000000', size: 26, bold: true } }, heading4: { run: { color: '000000', size: 24, bold: true } }, heading5: { run: { color: '000000', size: 22, bold: true } }, heading6: { run: { color: '000000', size: 22, bold: true } } } }, sections: [{ properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } }, children }] });
  const blob = await Packer.toBlob(doc); if (blob.size > 10 * 1024 * 1024) throw new Error('Word output exceeds 10 MB. Export a smaller document.');
  return { blob, warnings: [...warnings] };
}
