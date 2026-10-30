import { describe, expect, it } from 'vitest';
import { tools } from './catalog';
import { categories, categoryHref } from './categories';

describe('Tool categories and search landing pages', () => {
  it('keeps every tool in a discoverable group with descriptive content', () => {
    expect(categories).toHaveLength(5);
    expect(new Set(categories.map(group => group.slug)).size).toBe(categories.length);
    const grouped = categories.flatMap(group => group.featured);
    expect(grouped).toHaveLength(tools.length);
    expect(new Set(grouped).size).toBe(tools.length);
    for (const group of categories) {
      expect(group.title.length).toBeGreaterThan(20);
      expect(group.description.length).toBeGreaterThan(90);
      expect(group.introduction.length).toBeGreaterThan(120);
      expect(group.choosing.length).toBeGreaterThan(120);
      expect(categoryHref(group.slug)).toMatch(/^\/categories\/[a-z-]+\/$/);
      for (const id of group.featured) {
        expect(tools.find(tool => tool.id === id)?.category).toBe(group.name);
      }
    }
  });
});
