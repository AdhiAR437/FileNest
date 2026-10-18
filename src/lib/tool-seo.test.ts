import { describe, expect, it } from 'vitest';
import { tools } from './catalog';
import { toolSeo } from './tool-seo';

describe('Search metadata for published tools', () => {
  it('provides unique, useful titles and summaries for every tool', () => {
    const metas = tools.map(tool => toolSeo[tool.id]);
    expect(metas).toHaveLength(19);
    expect(Object.keys(toolSeo).sort()).toEqual(tools.map(tool => tool.id).sort());
    expect(new Set(metas.map(meta => meta.title)).size).toBe(metas.length);
    expect(new Set(metas.map(meta => meta.description)).size).toBe(metas.length);
    for (const { title, description } of metas) {
      expect(title.length).toBeGreaterThan(20);
      expect(title.length).toBeLessThanOrEqual(70);
      expect(title).toContain('FilePebble');
      expect(description.length).toBeGreaterThanOrEqual(90);
      expect(description.length).toBeLessThanOrEqual(170);
    }
  });
});
