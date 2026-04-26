import { MockEditor } from '../../../../../test-utils/MockEditor';
import {
  computeLineHeightForFontSize,
  extractFontSizesFromLine,
  computeMaxLineHeightForLine,
  applyLineHeightToLine,
} from './lineHeight';

describe('computeLineHeightForFontSize', () => {
  it.each([
    // 1.5× multiplier, ceiled — matches browser "line-height: normal" (verified: 24pt → 48px cm-line,
    // 36pt → 72px cm-line). Always exceeds Georgia glyph height (≈1.32× font-size-px).
    [8, 12],
    [9, 14],
    [10, 15],
    [11, 17],
    [12, 18],
    [14, 21],
    [16, 24],
    [18, 27],
    [20, 30],
    [22, 33],
    [24, 36],
    [28, 42],
    [36, 54],
    [48, 72],
    [72, 108],
  ])('maps %dpt \u2192 %dpt line-height (1.5\u00d7 ceiled)', (sizeInPt, expected) => {
    expect(computeLineHeightForFontSize(sizeInPt)).toBe(expected);
  });

  it('handles decimal font sizes', () => {
    // ceil(10.5 * 1.5) = ceil(15.75) = 16
    expect(computeLineHeightForFontSize(10.5)).toBe(16);
  });
});

describe('extractFontSizesFromLine', () => {
  it('returns empty array for an empty string', () => {
    expect(extractFontSizesFromLine('')).toEqual([]);
  });

  it('returns empty array for plain text with no spans', () => {
    expect(extractFontSizesFromLine('plain text without any spans')).toEqual([]);
  });

  it('returns empty array for spans without font-size', () => {
    expect(extractFontSizesFromLine('<span style="font-family: Arial">text</span>')).toEqual([]);
  });

  it('extracts a single font size', () => {
    expect(extractFontSizesFromLine('<span style="font-size: 12pt">text</span>')).toEqual([12]);
  });

  it('extracts multiple font sizes from a line', () => {
    const line =
      '<span style="font-size: 24pt">big</span> and <span style="font-size: 8pt">small</span>';
    expect(extractFontSizesFromLine(line)).toEqual([24, 8]);
  });

  it('extracts a decimal font size', () => {
    expect(extractFontSizesFromLine('<span style="font-size: 10.5pt">text</span>')).toEqual([10.5]);
  });

  it('extracts font size from nested spans', () => {
    const line =
      '<span style="font-family: Arial"><span style="font-size: 18pt">nested</span></span>';
    expect(extractFontSizesFromLine(line)).toEqual([18]);
  });
});

describe('computeMaxLineHeightForLine', () => {
  it('returns null for plain text with no font-size spans', () => {
    expect(computeMaxLineHeightForLine('plain text')).toBeNull();
  });

  it('returns null for an empty line', () => {
    expect(computeMaxLineHeightForLine('')).toBeNull();
  });

  it('returns null for font sizes at or below the 16pt threshold', () => {
    const line = '<span style="font-size: 16pt">text</span>';
    expect(computeMaxLineHeightForLine(line)).toBeNull();
  });

  it('returns null when all font sizes are below the threshold', () => {
    const line =
      '<span style="font-size: 8pt">tiny</span> and <span style="font-size: 12pt">small</span>';
    expect(computeMaxLineHeightForLine(line)).toBeNull();
  });

  it('returns the line-height for the smallest qualifying font size (18pt)', () => {
    const line = '<span style="font-size: 18pt">text</span>';
    // ceil(18 * 1.5) = 27
    expect(computeMaxLineHeightForLine(line)).toBe(27);
  });

  it('ignores sub-threshold sizes and returns line-height for the large size', () => {
    const line =
      '<span style="font-size: 24pt">big</span> and <span style="font-size: 8pt">small</span>';
    // 8pt is ignored (≤ 16pt); only 24pt counts → ceil(24 * 1.5) = 36
    expect(computeMaxLineHeightForLine(line)).toBe(36);
  });

  it('uses the larger font size when both are above threshold', () => {
    const line =
      '<span style="font-size: 36pt">huge</span> and <span style="font-size: 48pt">bigger</span>';
    // 48pt → ceil(48 * 1.5) = 72
    expect(computeMaxLineHeightForLine(line)).toBe(72);
  });
});

describe('applyLineHeightToLine', () => {
  it('does nothing when the line contains no font-size spans', () => {
    const editor = new MockEditor();
    editor.setValue('plain text');
    editor.setCursor({ line: 0, ch: 0 });

    applyLineHeightToLine(editor as unknown as Parameters<typeof applyLineHeightToLine>[0]);

    expect(editor.getLine(0)).toBe('plain text');
  });

  it('does nothing for font sizes at or below the 16pt threshold', () => {
    const editor = new MockEditor();
    editor.setValue('<span style="font-size: 12pt">small text</span>');
    editor.setCursor({ line: 0, ch: 0 });

    applyLineHeightToLine(editor as unknown as Parameters<typeof applyLineHeightToLine>[0]);

    // No change — 12pt is at or below threshold
    expect(editor.getLine(0)).toBe('<span style="font-size: 12pt">small text</span>');
  });

  it('does nothing for font size exactly at the 16pt threshold', () => {
    const editor = new MockEditor();
    editor.setValue('<span style="font-size: 16pt">medium text</span>');
    editor.setCursor({ line: 0, ch: 0 });

    applyLineHeightToLine(editor as unknown as Parameters<typeof applyLineHeightToLine>[0]);

    expect(editor.getLine(0)).toBe('<span style="font-size: 16pt">medium text</span>');
  });

  it('strips an orphaned line-height wrapper when all remaining fonts are at or below threshold', () => {
    const editor = new MockEditor();
    // Wrapper exists from a previous large font, but only small fonts remain now.
    editor.setValue(
      '<span style="line-height: 27pt"><span style="font-size: 12pt">small text</span></span>'
    );
    editor.setCursor({ line: 0, ch: 0 });

    applyLineHeightToLine(editor as unknown as Parameters<typeof applyLineHeightToLine>[0]);

    // Wrapper is removed; default editor line-height takes over
    expect(editor.getLine(0)).toBe('<span style="font-size: 12pt">small text</span>');
  });

  it('wraps the line in a line-height span matching the font size', () => {
    const editor = new MockEditor();
    editor.setValue('<span style="font-size: 24pt">big text</span>');
    editor.setCursor({ line: 0, ch: 0 });

    applyLineHeightToLine(editor as unknown as Parameters<typeof applyLineHeightToLine>[0]);

    // ceil(24 * 1.5) = 36
    expect(editor.getLine(0)).toBe(
      '<span style="line-height: 36pt"><span style="font-size: 24pt">big text</span></span>'
    );
  });

  it('uses the max line-height when large and small font sizes are mixed', () => {
    const editor = new MockEditor();
    editor.setValue(
      '<span style="font-size: 8pt">small</span> and <span style="font-size: 36pt">huge</span>'
    );
    editor.setCursor({ line: 0, ch: 0 });

    applyLineHeightToLine(editor as unknown as Parameters<typeof applyLineHeightToLine>[0]);

    // 8pt is ignored (≤ 16pt); 36pt → ceil(36 * 1.5) = 54
    expect(editor.getLine(0)).toBe(
      '<span style="line-height: 54pt"><span style="font-size: 8pt">small</span> and <span style="font-size: 36pt">huge</span></span>'
    );
  });

  it('updates an existing line-height wrapper to the new max', () => {
    const editor = new MockEditor();
    editor.setValue(
      '<span style="line-height: 36pt"><span style="font-size: 24pt">big</span> and <span style="font-size: 36pt">huge</span></span>'
    );
    editor.setCursor({ line: 0, ch: 0 });

    applyLineHeightToLine(editor as unknown as Parameters<typeof applyLineHeightToLine>[0]);

    // 36pt → ceil(36 * 1.5) = 54
    expect(editor.getLine(0)).toBe(
      '<span style="line-height: 54pt"><span style="font-size: 24pt">big</span> and <span style="font-size: 36pt">huge</span></span>'
    );
  });

  it('preserves the heading prefix outside the line-height wrapper', () => {
    const editor = new MockEditor();
    editor.setValue('## <span style="font-size: 24pt">Heading text</span>');
    editor.setCursor({ line: 0, ch: 0 });

    applyLineHeightToLine(editor as unknown as Parameters<typeof applyLineHeightToLine>[0]);

    // ceil(24 * 1.5) = 36
    expect(editor.getLine(0)).toBe(
      '## <span style="line-height: 36pt"><span style="font-size: 24pt">Heading text</span></span>'
    );
  });

  it('updates existing wrapper on a heading line with a bigger font size', () => {
    const editor = new MockEditor();
    editor.setValue(
      '## <span style="line-height: 17pt"><span style="font-size: 12pt">Title</span> and <span style="font-size: 24pt">Bigger</span></span>'
    );
    editor.setCursor({ line: 0, ch: 0 });

    applyLineHeightToLine(editor as unknown as Parameters<typeof applyLineHeightToLine>[0]);

    // 12pt is ignored (≤ 16pt); 24pt → ceil(24 * 1.5) = 36
    expect(editor.getLine(0)).toBe(
      '## <span style="line-height: 36pt"><span style="font-size: 12pt">Title</span> and <span style="font-size: 24pt">Bigger</span></span>'
    );
  });

  it('applies line-height to the cursor line, not other lines', () => {
    const editor = new MockEditor();
    editor.setValue('plain line\n<span style="font-size: 18pt">formatted</span>');
    editor.setCursor({ line: 1, ch: 0 });

    applyLineHeightToLine(editor as unknown as Parameters<typeof applyLineHeightToLine>[0]);

    expect(editor.getLine(0)).toBe('plain line');
    // ceil(18 * 1.5) = 27
    expect(editor.getLine(1)).toBe(
      '<span style="line-height: 27pt"><span style="font-size: 18pt">formatted</span></span>'
    );
  });
});
