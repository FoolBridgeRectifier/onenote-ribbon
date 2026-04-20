import { canSafelyIndent } from '../helpers';

/** Creates a minimal mock editor with the given lines and cursor position. */
function mockEditor(lines: string[], cursorLine: number) {
  return {
    getCursor: () => ({ line: cursorLine, ch: 0 }),
    getLine: (lineNumber: number) => lines[lineNumber] ?? '',
  };
}

describe('canSafelyIndent', () => {
  it('allows indent on the first line (no constraint)', () => {
    const editor = mockEditor(['- Item 1'], 0);
    expect(canSafelyIndent(editor)).toBe(true);
  });

  it('allows indent when at the same depth as previous line', () => {
    const editor = mockEditor(['- Item 1', '- Item 2'], 1);
    expect(canSafelyIndent(editor)).toBe(true);
  });

  it('allows indent when shallower than previous line', () => {
    const editor = mockEditor(['\t- Deep', '- Shallow'], 1);
    expect(canSafelyIndent(editor)).toBe(true);
  });

  it('blocks indent when already deeper than previous line', () => {
    const editor = mockEditor(['- Item 1', '\t- Item 2'], 1);
    expect(canSafelyIndent(editor)).toBe(false);
  });

  it('blocks indent when two levels deeper than previous line', () => {
    const editor = mockEditor(['- Item 1', '\t\t- Item 2'], 1);
    expect(canSafelyIndent(editor)).toBe(false);
  });

  it('skips blank lines when finding previous content line', () => {
    const editor = mockEditor(['- Item 1', '', '- Item 2'], 2);
    expect(canSafelyIndent(editor)).toBe(true);
  });

  it('skips blank lines and blocks if already deeper', () => {
    const editor = mockEditor(['- Item 1', '', '\t- Item 2'], 2);
    expect(canSafelyIndent(editor)).toBe(false);
  });

  it('allows indent when nested items are at the same depth', () => {
    const editor = mockEditor(['- Item 1', '\t- Nested A', '\t- Nested B'], 2);
    expect(canSafelyIndent(editor)).toBe(true);
  });

  it('blocks indent on nested item already one deeper than its sibling', () => {
    const editor = mockEditor(['- Item 1', '\t- Nested A', '\t\t- Deep'], 2);
    expect(canSafelyIndent(editor)).toBe(false);
  });

  it('allows indent with no non-empty previous lines', () => {
    const editor = mockEditor(['', '', '- Item 1'], 2);
    expect(canSafelyIndent(editor)).toBe(true);
  });

  it('handles numbered list items the same way', () => {
    const editor = mockEditor(['1. First', '2. Second'], 1);
    expect(canSafelyIndent(editor)).toBe(true);
  });

  it('blocks numbered list over-indent', () => {
    const editor = mockEditor(['1. First', '\t1. Second'], 1);
    expect(canSafelyIndent(editor)).toBe(false);
  });

  it('allows indent from depth 0 after depth-2 item (returning to shallower)', () => {
    const editor = mockEditor(
      ['- Level 1', '\t- Level 2', '\t\t- Level 3', '- Back to 1'],
      3,
    );
    expect(canSafelyIndent(editor)).toBe(true);
  });

  describe('non-list preceding lines', () => {
    it('blocks indent when first previous non-empty line is a heading', () => {
      // Indenting a root list item after a header creates an orphaned depth-1 item
      const editor = mockEditor(['# Section Header', '', '- item one'], 2);
      expect(canSafelyIndent(editor)).toBe(false);
    });

    it('blocks indent when first previous non-empty line is a paragraph', () => {
      const editor = mockEditor(['Some paragraph text.', '- item one'], 1);
      expect(canSafelyIndent(editor)).toBe(false);
    });

    it('blocks indent when a non-list line separates two list sections', () => {
      // The paragraph terminates the first list; the item below starts a new list
      const editor = mockEditor(
        ['- parent', 'Paragraph break', '- item one'],
        2,
      );
      expect(canSafelyIndent(editor)).toBe(false);
    });

    it('blocks indent when previous line is a heading and item is numbered', () => {
      const editor = mockEditor(['## Sub-heading', '1. first item'], 1);
      expect(canSafelyIndent(editor)).toBe(false);
    });

    it('allows indent when previous list item is separated from header by another list item', () => {
      // Header → root list item → cursor item: cursor item has a valid list parent
      const editor = mockEditor(['# Header', '- parent', '- cursor'], 2);
      expect(canSafelyIndent(editor)).toBe(true);
    });
  });
});
