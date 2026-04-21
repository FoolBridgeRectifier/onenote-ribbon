import type { StructureContext, StylingContext, StylingResult } from '../interfaces';
import { BOLD_HTML_TAG } from '../constants';
import {
  toggleTagPerLine,
  addTagPerLine,
  shouldProcessPerLine,
  buildEffectiveLineRanges,
  lineHasMatchingTag,
} from './PerLineProcessing';

// ─── Test helpers ─────────────────────────────────────────────────────────────

function makeLine(overrides: Partial<StructureContext['lines'][0]>): StructureContext['lines'][0] {
  return {
    lineStartOffset: 0,
    lineEndOffset: 10,
    linePrefix: null,
    linePrefixType: 'bullet',
    contentStartOffset: 0,
    inertZone: null,
    ...overrides,
  };
}

function makeStructureContext(
  lines: Partial<StructureContext['lines'][0]>[],
  isFullyInert = false
): StructureContext {
  return {
    lines: lines.map(makeLine),
    protectedRanges: [],
    isFullyInert,
  };
}

function makeNoOpResult(): StylingResult {
  return { replacements: [], isNoOp: true };
}

function makeReplacementResult(fromOffset: number, toOffset: number, text: string): StylingResult {
  return {
    replacements: [{ fromOffset, toOffset, replacementText: text }],
    isNoOp: false,
  };
}

// ─── toggleTagPerLine ─────────────────────────────────────────────────────────

describe('toggleTagPerLine — empty line ranges', () => {
  it('returns isNoOp immediately when all lines are inert (empty lineRanges)', () => {
    const structureContext = makeStructureContext([
      {
        lineStartOffset: 0,
        lineEndOffset: 10,
        contentStartOffset: 0,
        inertZone: 'codeBlock',
      },
    ]);
    const toggleTagFn = jest.fn();
    const addTagFn = jest.fn();

    const result = toggleTagPerLine(
      'some text',
      0,
      10,
      BOLD_HTML_TAG,
      structureContext,
      toggleTagFn,
      addTagFn
    );

    expect(result.isNoOp).toBe(true);
    expect(result.replacements).toHaveLength(0);
    expect(toggleTagFn).not.toHaveBeenCalled();
    expect(addTagFn).not.toHaveBeenCalled();
  });
});

describe('toggleTagPerLine — all lines have the tag (allHaveTag = true)', () => {
  // Both lines have <b>...</b> wrapping their full content including delimiters.
  // lineHasMatchingTag will find them via delimiter-inclusive match.
  const sourceText = '<b>line1</b>\n<b>line2</b>';

  it('calls toggleTagFn for each line and collects non-noop results', () => {
    const structureContext = makeStructureContext([
      { lineStartOffset: 0, lineEndOffset: 12, contentStartOffset: 0, inertZone: null },
      { lineStartOffset: 13, lineEndOffset: 25, contentStartOffset: 13, inertZone: null },
    ]);

    const toggleTagFn = jest
      .fn()
      .mockImplementation((context: StylingContext) =>
        makeReplacementResult(context.selectionStartOffset, context.selectionEndOffset, 'text')
      );
    const addTagFn = jest.fn();

    const result = toggleTagPerLine(
      sourceText,
      0,
      25,
      BOLD_HTML_TAG,
      structureContext,
      toggleTagFn,
      addTagFn
    );

    expect(toggleTagFn).toHaveBeenCalledTimes(2);
    expect(addTagFn).not.toHaveBeenCalled();
    expect(result.isNoOp).toBe(false);
    expect(result.replacements.length).toBeGreaterThan(0);
  });

  it('returns isNoOp when all toggleTagFn results are isNoOp', () => {
    const structureContext = makeStructureContext([
      { lineStartOffset: 0, lineEndOffset: 12, contentStartOffset: 0, inertZone: null },
      { lineStartOffset: 13, lineEndOffset: 25, contentStartOffset: 13, inertZone: null },
    ]);

    const toggleTagFn = jest.fn().mockReturnValue(makeNoOpResult());
    const addTagFn = jest.fn();

    const result = toggleTagPerLine(
      sourceText,
      0,
      25,
      BOLD_HTML_TAG,
      structureContext,
      toggleTagFn,
      addTagFn
    );

    expect(toggleTagFn).toHaveBeenCalledTimes(2);
    expect(result.isNoOp).toBe(true);
  });
});

describe('toggleTagPerLine — some lines missing the tag (else branch)', () => {
  it('calls addTagFn only for lines missing the tag, skips lines with tag', () => {
    // Line 1 has <b>...</b>, line 2 is plain text without it
    const sourceText = '<b>line1</b>\nline2';

    const structureContext = makeStructureContext([
      { lineStartOffset: 0, lineEndOffset: 12, contentStartOffset: 0, inertZone: null },
      { lineStartOffset: 13, lineEndOffset: 18, contentStartOffset: 13, inertZone: null },
    ]);

    const toggleTagFn = jest.fn();
    const addTagFn = jest.fn().mockReturnValue(makeReplacementResult(13, 18, '<b>line2</b>'));

    const result = toggleTagPerLine(
      sourceText,
      0,
      18,
      BOLD_HTML_TAG,
      structureContext,
      toggleTagFn,
      addTagFn
    );

    // toggleTagFn never called (we're in the else branch)
    expect(toggleTagFn).not.toHaveBeenCalled();
    // addTagFn called only for line 2 (line 1 has the tag → continue)
    expect(addTagFn).toHaveBeenCalledTimes(1);
    expect(result.isNoOp).toBe(false);
  });

  it('returns isNoOp when addTagFn results are all isNoOp in else branch', () => {
    const sourceText = '<b>line1</b>\nline2';
    const structureContext = makeStructureContext([
      { lineStartOffset: 0, lineEndOffset: 12, contentStartOffset: 0, inertZone: null },
      { lineStartOffset: 13, lineEndOffset: 18, contentStartOffset: 13, inertZone: null },
    ]);

    const toggleTagFn = jest.fn();
    const addTagFn = jest.fn().mockReturnValue(makeNoOpResult());

    const result = toggleTagPerLine(
      sourceText,
      0,
      18,
      BOLD_HTML_TAG,
      structureContext,
      toggleTagFn,
      addTagFn
    );

    expect(addTagFn).toHaveBeenCalledTimes(1);
    expect(result.isNoOp).toBe(true);
  });
});

// ─── addTagPerLine ────────────────────────────────────────────────────────────

describe('addTagPerLine — empty line ranges', () => {
  it('returns isNoOp immediately when all lines are inert', () => {
    const structureContext = makeStructureContext([
      {
        lineStartOffset: 0,
        lineEndOffset: 10,
        contentStartOffset: 0,
        inertZone: 'codeBlock',
      },
    ]);
    const addTagFn = jest.fn();

    const result = addTagPerLine('some text', 0, 10, BOLD_HTML_TAG, structureContext, addTagFn);

    expect(result.isNoOp).toBe(true);
    expect(result.replacements).toHaveLength(0);
    expect(addTagFn).not.toHaveBeenCalled();
  });
});

describe('addTagPerLine — with multiple lines', () => {
  it('calls addTagFn for each line and collects non-noop replacements', () => {
    const sourceText = 'line1\nline2';
    const structureContext = makeStructureContext([
      { lineStartOffset: 0, lineEndOffset: 5, contentStartOffset: 0, inertZone: null },
      { lineStartOffset: 6, lineEndOffset: 11, contentStartOffset: 6, inertZone: null },
    ]);

    const addTagFn = jest
      .fn()
      .mockImplementation((context: StylingContext) =>
        makeReplacementResult(
          context.selectionStartOffset,
          context.selectionEndOffset,
          '<b>text</b>'
        )
      );

    const result = addTagPerLine(sourceText, 0, 11, BOLD_HTML_TAG, structureContext, addTagFn);

    expect(addTagFn).toHaveBeenCalledTimes(2);
    expect(result.isNoOp).toBe(false);
    expect(result.replacements).toHaveLength(2);
  });

  it('returns isNoOp when all addTagFn results are isNoOp', () => {
    const sourceText = 'line1\nline2';
    const structureContext = makeStructureContext([
      { lineStartOffset: 0, lineEndOffset: 5, contentStartOffset: 0, inertZone: null },
      { lineStartOffset: 6, lineEndOffset: 11, contentStartOffset: 6, inertZone: null },
    ]);

    const addTagFn = jest.fn().mockReturnValue(makeNoOpResult());

    const result = addTagPerLine(sourceText, 0, 11, BOLD_HTML_TAG, structureContext, addTagFn);

    expect(addTagFn).toHaveBeenCalledTimes(2);
    expect(result.isNoOp).toBe(true);
    expect(result.replacements).toHaveLength(0);
  });
});

// ─── Re-exports from helpers (tested via PerLineProcessing public surface) ────
// These tests ensure Istanbul counts the re-exported functions as covered
// within the PerLineProcessing.ts module boundary.

describe('shouldProcessPerLine — re-export via PerLineProcessing', () => {
  it('returns false for a single line', () => {
    const context = makeStructureContext([
      { lineStartOffset: 0, lineEndOffset: 5, linePrefixType: 'none', inertZone: null },
    ]);
    expect(shouldProcessPerLine(context)).toBe(false);
  });

  it('returns true for two lines where one has a prefix', () => {
    const context = makeStructureContext([
      { lineStartOffset: 0, lineEndOffset: 5, linePrefixType: 'bullet', inertZone: null },
      { lineStartOffset: 6, lineEndOffset: 11, linePrefixType: 'none', inertZone: null },
    ]);
    expect(shouldProcessPerLine(context)).toBe(true);
  });
});

describe('buildEffectiveLineRanges — re-export via PerLineProcessing', () => {
  it('returns the clipped range for a non-inert line', () => {
    const context = makeStructureContext([
      { lineStartOffset: 0, lineEndOffset: 10, contentStartOffset: 2, inertZone: null },
    ]);
    const ranges = buildEffectiveLineRanges(context, 0, 10);
    expect(ranges).toHaveLength(1);
    expect(ranges[0]).toEqual({ start: 2, end: 10 });
  });
});

describe('lineHasMatchingTag — re-export via PerLineProcessing', () => {
  it('returns false when no tags exist in the source', () => {
    // Empty allTagRanges → no match possible
    const result = lineHasMatchingTag([], 'hello world', 0, 5, BOLD_HTML_TAG);
    expect(result).toBe(false);
  });
});
