import { isObsidianEditor } from './helpers';

describe('isObsidianEditor', () => {
  it('returns true when input has a getCursor function', () => {
    const editorLike = { getCursor: () => ({ line: 0, ch: 0 }) };
    expect(isObsidianEditor(editorLike)).toBe(true);
  });

  it('returns false when getCursor is not a function', () => {
    expect(isObsidianEditor({ getCursor: 'not-a-function' })).toBe(false);
  });

  it('returns false for a plain object without getCursor', () => {
    expect(isObsidianEditor({ sourceText: 'hello', selectionStartOffset: 0 })).toBe(false);
  });

  it('returns false for null', () => {
    expect(isObsidianEditor(null)).toBe(false);
  });

  it('returns false for a primitive', () => {
    expect(isObsidianEditor('string')).toBe(false);
  });
});
