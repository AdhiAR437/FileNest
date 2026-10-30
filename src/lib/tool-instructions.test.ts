import { describe, expect, it } from 'vitest';
import { tools } from './catalog';
import { toolInstructions } from './tool-instructions';

describe('Published tool instructions', () => {
  it('covers all tools with meaningful, tool-specific steps and a limitation', () => {
    expect(Object.keys(toolInstructions).sort()).toEqual(tools.map(tool => tool.id).sort());
    for (const tool of tools) {
      const { steps, note } = toolInstructions[tool.id];
      expect(steps).toHaveLength(3);
      expect(steps.every(step => step.length >= 20)).toBe(true);
      expect(note.length).toBeGreaterThan(80);
      expect(new Set(steps).size).toBe(3);
    }
  });

  it('avoids the misleading generic PDF and text limits', () => {
    expect(toolInstructions['split-pdf'].steps.join(' ')).toContain('page positions');
    expect(toolInstructions['merge-pdf'].steps.join(' ')).toContain('two or more PDF');
    expect(toolInstructions['markdown-to-pdf'].note).toContain('print workflow');
    expect(toolInstructions['csv-diff'].steps.join(' ')).toContain('key column');
  });
});
