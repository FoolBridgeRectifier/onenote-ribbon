import { loadCustomTags, saveCustomTags, buildCustomTagDefinition } from './TagStorage';
import type { CustomTag } from '../customize-modal/interfaces';

// jest-environment-jsdom provides localStorage automatically.
// We reset it between tests to keep tests isolated.
beforeEach(() => {
  localStorage.clear();
});

// ── loadCustomTags ────────────────────────────────────────────────────────────

describe('loadCustomTags', () => {
  it('returns an empty array when localStorage has no entry', () => {
    const result = loadCustomTags();

    expect(result).toEqual([]);
  });

  it('returns parsed tags when localStorage contains valid JSON', () => {
    const tags: CustomTag[] = [
      { id: 'id-1', name: 'Important', color: '#ff0000', calloutType: 'important' },
    ];
    localStorage.setItem('onr-custom-tags', JSON.stringify(tags));

    const result = loadCustomTags();

    expect(result).toEqual(tags);
  });

  it('returns an empty array when localStorage contains invalid JSON', () => {
    localStorage.setItem('onr-custom-tags', '{not valid json}');

    const result = loadCustomTags();

    expect(result).toEqual([]);
  });
});

// ── saveCustomTags ────────────────────────────────────────────────────────────

describe('saveCustomTags', () => {
  it('serializes tags to localStorage under the correct key', () => {
    const tags: CustomTag[] = [
      { id: 'id-2', name: 'Question', color: '#0000ff', calloutType: 'question' },
    ];

    saveCustomTags(tags);

    const stored = localStorage.getItem('onr-custom-tags');
    expect(stored).toBe(JSON.stringify(tags));
  });

  it('overwrites existing entries with the new tag list', () => {
    const first: CustomTag[] = [{ id: 'id-3', name: 'Old', color: '#aaa', calloutType: 'note' }];
    const second: CustomTag[] = [
      { id: 'id-4', name: 'New', color: '#bbb', calloutType: 'important' },
    ];

    saveCustomTags(first);
    saveCustomTags(second);

    const stored = localStorage.getItem('onr-custom-tags');
    expect(stored).toBe(JSON.stringify(second));
  });
});

// ── buildCustomTagDefinition ──────────────────────────────────────────────────

describe('buildCustomTagDefinition', () => {
  it('builds a task-type definition when calloutType is "checkbox"', () => {
    const customTag: CustomTag = {
      id: 'id-5',
      name: 'MyTask',
      color: '#ff0000',
      calloutType: 'checkbox',
    };

    const definition = buildCustomTagDefinition(customTag);

    expect(definition.label).toBe('MyTask');
    expect(definition.action.type).toBe('task');
    // calloutKey for checkbox type uses the task-prefix: format
    expect(definition.calloutKey).toBe('task-prefix:MyTask:');
    if (definition.action.type === 'task') {
      expect(definition.action.taskPrefix).toBe('MyTask:');
    }
  });

  it('builds a callout-type definition when calloutType is not "checkbox"', () => {
    const customTag: CustomTag = {
      id: 'id-6',
      name: 'Important',
      color: '#0000ff',
      calloutType: 'important',
    };

    const definition = buildCustomTagDefinition(customTag);

    expect(definition.label).toBe('Important');
    expect(definition.action.type).toBe('callout');
    // calloutKey for non-checkbox tags is customTag.name (preserves capitalisation)
    expect(definition.calloutKey).toBe('Important');
    if (definition.action.type === 'callout') {
      expect(definition.action.calloutType).toBe('important');
      expect(definition.action.calloutTitle).toBe('Important');
    }
  });

  it('sets swatchColor from the customTag color', () => {
    const customTag: CustomTag = {
      id: 'id-7',
      name: 'Danger',
      color: '#cc0000',
      calloutType: 'danger',
    };

    const definition = buildCustomTagDefinition(customTag);

    expect(definition.swatchColor).toBe('#cc0000');
  });
});
