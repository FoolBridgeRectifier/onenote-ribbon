import { MockEditor } from '../../../test-utils/MockEditor';

import type { ObsidianEditor } from './interfaces';
import {
  buildStylingContextFromEditor,
  applyStylingResult,
} from './editor-integration/EditorIntegration';
import {
  toggleTagInEditor,
  removeAllTagsInEditor,
  copyFormatFromEditor,
} from './editor-integration/helpers';

import type { StylingResult } from './interfaces';

import { UNDERLINE_TAG, BOLD_MD_TAG } from './constants';

// ============================================================
// Test Helper
// ============================================================

/**
 * Creates a mock editor that satisfies the ObsidianEditor interface.
 * Wraps MockEditor to add getCursor(which) and transaction() support,
 * which the base MockEditor does not provide.
 */
function createTestEditor(content: string): ObsidianEditor & { transaction: jest.Mock } {
  const innerEditor = new MockEditor();
  innerEditor.setValue(content);

  // Track selection endpoints separately to support getCursor('from'|'to')
  let selectionFrom: { line: number; ch: number } | null = null;
  let selectionTo: { line: number; ch: number } | null = null;

  /**
   * Applies transaction changes in reverse document order to avoid position shifts.
   * Mimics Obsidian's atomic transaction behavior where all positions reference
   * the original document state.
   */
  const applyTransaction = (spec: {
    changes: Array<{
      from: { line: number; ch: number };
      to: { line: number; ch: number };
      text: string;
    }>;
  }): void => {
    const sortedChanges = [...spec.changes].sort((changeA, changeB) => {
      if (changeA.from.line !== changeB.from.line) {
        return changeB.from.line - changeA.from.line;
      }
      return changeB.from.ch - changeA.from.ch;
    });

    for (const change of sortedChanges) {
      innerEditor.replaceRange(change.text, change.from, change.to);
    }
  };

  return {
    getValue(): string {
      return innerEditor.getValue();
    },

    getCursor(which?: 'from' | 'to' | 'head' | 'anchor'): { line: number; ch: number } {
      if (which === 'from' && selectionFrom !== null) {
        return { ...selectionFrom };
      }

      if (which === 'to' && selectionTo !== null) {
        return { ...selectionTo };
      }

      // Default: return cursor position (equivalent to 'head')
      return innerEditor.getCursor();
    },

    setCursor(position: { line: number; ch: number }): void {
      selectionFrom = null;
      selectionTo = null;
      innerEditor.setCursor(position);
    },

    setSelection(from: { line: number; ch: number }, to: { line: number; ch: number }): void {
      selectionFrom = { ...from };
      selectionTo = { ...to };
      innerEditor.setSelection(from, to);
    },

    getLine(lineNumber: number): string {
      return innerEditor.getLine(lineNumber);
    },

    setLine(lineNumber: number, text: string): void {
      innerEditor.setLine(lineNumber, text);
    },

    getSelection(): string {
      return innerEditor.getSelection();
    },

    replaceSelection(replacement: string): void {
      innerEditor.replaceSelection(replacement);
    },

    lastLine(): number {
      return innerEditor.lastLine();
    },

    transaction: jest.fn(applyTransaction),
  };
}

// ============================================================
// buildStylingContextFromEditor
// ============================================================

describe('buildStylingContextFromEditor', () => {
  it('builds context with correct sourceText, offsets, and selectedText for a selection', () => {
    const editor = createTestEditor('hello world');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });

    const context = buildStylingContextFromEditor(editor);

    expect(context).not.toBeNull();
    expect(context!.sourceText).toBe('hello world');
    expect(context!.selectionStartOffset).toBe(0);
    expect(context!.selectionEndOffset).toBe(5);
    expect(context!.selectedText).toBe('hello');
  });

  it('builds context with cursor only — start equals end and selectedText is empty', () => {
    const editor = createTestEditor('hello');
    editor.setCursor({ line: 0, ch: 3 });

    const context = buildStylingContextFromEditor(editor);

    expect(context).not.toBeNull();
    expect(context!.selectionStartOffset).toBe(3);
    expect(context!.selectionEndOffset).toBe(3);
    expect(context!.selectedText).toBe('');
  });

  it('builds context with correct offsets for a multi-line selection', () => {
    const editor = createTestEditor('line one\nline two');
    editor.setSelection({ line: 0, ch: 5 }, { line: 1, ch: 4 });

    const context = buildStylingContextFromEditor(editor);

    expect(context).not.toBeNull();
    // offset 5 = "one..." on line 0, offset 13 = 9 (line 1 start) + 4
    expect(context!.selectionStartOffset).toBe(5);
    expect(context!.selectionEndOffset).toBe(13);
    expect(context!.selectedText).toBe('one\nline');
  });
});

// ============================================================
// applyStylingResult
// ============================================================

describe('applyStylingResult', () => {
  it('does not mutate the editor when result is isNoOp', () => {
    const editor = createTestEditor('hello');

    const noOpResult: StylingResult = {
      replacements: [],
      isNoOp: true,
    };

    applyStylingResult(editor, 'hello', noOpResult);

    expect(editor.transaction).not.toHaveBeenCalled();
    expect(editor.getValue()).toBe('hello');
  });

  it('applies a single replacement via editor.transaction', () => {
    const editor = createTestEditor('hello');

    const result: StylingResult = {
      replacements: [{ fromOffset: 0, toOffset: 0, replacementText: '<u>' }],
      isNoOp: false,
    };

    applyStylingResult(editor, 'hello', result);

    expect(editor.transaction).toHaveBeenCalledTimes(1);
    expect(editor.transaction).toHaveBeenCalledWith({
      changes: [{ from: { line: 0, ch: 0 }, to: { line: 0, ch: 0 }, text: '<u>' }],
    });
  });

  it('applies multiple replacements in a single transaction call', () => {
    const editor = createTestEditor('hello');

    // Two replacements that wrap "hello" with <u>...</u> (last-to-first order)
    const result: StylingResult = {
      replacements: [
        { fromOffset: 5, toOffset: 5, replacementText: '</u>' },
        { fromOffset: 0, toOffset: 0, replacementText: '<u>' },
      ],
      isNoOp: false,
    };

    applyStylingResult(editor, 'hello', result);

    expect(editor.transaction).toHaveBeenCalledTimes(1);

    const transactionArgument = editor.transaction.mock.calls[0][0];
    expect(transactionArgument.changes).toHaveLength(2);

    expect(editor.getValue()).toBe('<u>hello</u>');
  });
});

// ============================================================
// toggleTagInEditor end-to-end
// ============================================================

describe('toggleTagInEditor end-to-end', () => {
  it('toggles underline ON: wraps plain text with <u> tags', () => {
    const editor = createTestEditor('hello');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });

    toggleTagInEditor(editor, UNDERLINE_TAG);

    expect(editor.getValue()).toBe('<u>hello</u>');
  });

  it('toggles underline OFF: removes <u> tags from underlined text', () => {
    const editor = createTestEditor('<u>hello</u>');
    // Select "hello" at ch:3 to ch:8
    editor.setSelection({ line: 0, ch: 3 }, { line: 0, ch: 8 });

    toggleTagInEditor(editor, UNDERLINE_TAG);

    expect(editor.getValue()).toBe('hello');
  });

  it('toggles bold ON in markdown domain: wraps plain text with **', () => {
    const editor = createTestEditor('hello');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });

    toggleTagInEditor(editor, BOLD_MD_TAG);

    expect(editor.getValue()).toBe('**hello**');
  });
});

// ============================================================
// removeAllTagsInEditor end-to-end
// ============================================================

describe('removeAllTagsInEditor end-to-end', () => {
  it('removes all nested tags from formatted text', () => {
    const editor = createTestEditor('<u><b>hello</b></u>');
    // "hello" is at ch:6 to ch:11
    editor.setSelection({ line: 0, ch: 6 }, { line: 0, ch: 11 });

    removeAllTagsInEditor(editor);

    expect(editor.getValue()).toBe('hello');
  });
});

// ============================================================
// copyFormatFromEditor
// ============================================================

describe('copyFormatFromEditor', () => {
  it('returns tag definitions for text inside formatted tags', () => {
    const editor = createTestEditor('<u><b>text</b></u>');
    // "text" is at ch:6 to ch:10
    editor.setSelection({ line: 0, ch: 6 }, { line: 0, ch: 10 });

    const copiedFormat = copyFormatFromEditor(editor);

    expect(copiedFormat).not.toBeNull();
    expect(copiedFormat!.domain).toBe('html');

    const tagNames = copiedFormat!.tagDefinitions.map((tagDefinition) => tagDefinition.tagName);
    expect(tagNames).toContain('b');
    expect(tagNames).toContain('u');
  });

  it('returns empty tag definitions for plain text', () => {
    const editor = createTestEditor('plain text');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 10 });

    const copiedFormat = copyFormatFromEditor(editor);

    expect(copiedFormat).not.toBeNull();
    expect(copiedFormat!.tagDefinitions).toHaveLength(0);
  });
});

// ============================================================
// Edge Cases
// ============================================================

describe('edge cases', () => {
  it('handles empty editor content — returns a valid context', () => {
    const editor = createTestEditor('');
    editor.setCursor({ line: 0, ch: 0 });

    const context = buildStylingContextFromEditor(editor);

    expect(context).not.toBeNull();
    expect(context!.sourceText).toBe('');
    expect(context!.selectionStartOffset).toBe(0);
    expect(context!.selectionEndOffset).toBe(0);
    expect(context!.selectedText).toBe('');
  });
});
