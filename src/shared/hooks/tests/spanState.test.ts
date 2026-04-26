import { extractSpanAndDivState } from '../spanState';
import { buildTextIndex } from '../../editor/text-offset/TextOffset';
import type { DetectedTag } from '../../editor-v2/detection-engine/interfaces';

const DEFAULTS = { fontFamily: 'default', fontSize: '16' };

function makeSpanTag(
  startLine: number,
  startCh: number,
  endCh: number,
  closeStartCh = 0,
  closeEndCh = 0,
  closeLine = startLine
): DetectedTag {
  return {
    type: 'color',
    isHTML: true,
    isSpan: true,
    open: {
      start: { line: startLine, ch: startCh },
      end: { line: startLine, ch: endCh },
    },
    close: {
      start: { line: closeLine, ch: closeStartCh },
      end: { line: closeLine, ch: closeEndCh },
    },
  };
}

describe('extractSpanAndDivState', () => {
  it('returns defaults when no span or div tags are present', () => {
    const sourceText = 'plain text';
    const textIndex = buildTextIndex(sourceText);

    const result = extractSpanAndDivState(
      [],
      sourceText,
      textIndex,
      sourceText,
      DEFAULTS.fontFamily,
      DEFAULTS.fontSize
    );

    expect(result.fontColor).toBeNull();
    expect(result.highlightColor).toBeNull();
    expect(result.fontFamily).toBe('default');
    expect(result.fontSize).toBe('16');
    expect(result.textAlign).toBe('left');
  });

  it('extracts font color from a color span', () => {
    const sourceText = '<span style="color: red">text</span>';
    const textIndex = buildTextIndex(sourceText);
    const tag = makeSpanTag(0, 0, 25);

    const result = extractSpanAndDivState(
      [tag],
      sourceText,
      textIndex,
      sourceText,
      DEFAULTS.fontFamily,
      DEFAULTS.fontSize
    );

    expect(result.fontColor).toBe('red');
  });

  it('extracts highlight color from a background span', () => {
    const sourceText = '<span style="background: yellow">text</span>';
    const textIndex = buildTextIndex(sourceText);
    const tag = makeSpanTag(0, 0, 33);

    const result = extractSpanAndDivState(
      [tag],
      sourceText,
      textIndex,
      sourceText,
      DEFAULTS.fontFamily,
      DEFAULTS.fontSize
    );

    expect(result.highlightColor).toBe('yellow');
  });

  it('extracts font family from a font-family span (stripping quotes)', () => {
    const sourceText = "<span style=\"font-family:'Arial'\">text</span>";
    const textIndex = buildTextIndex(sourceText);
    const tag = makeSpanTag(0, 0, 33);

    const result = extractSpanAndDivState(
      [tag],
      sourceText,
      textIndex,
      sourceText,
      DEFAULTS.fontFamily,
      DEFAULTS.fontSize
    );

    expect(result.fontFamily).toBe('Arial');
  });

  it('extracts font size from a font-size span (stripping pt)', () => {
    const sourceText = '<span style="font-size:12pt">text</span>';
    const textIndex = buildTextIndex(sourceText);
    const tag = makeSpanTag(0, 0, 28);

    const result = extractSpanAndDivState(
      [tag],
      sourceText,
      textIndex,
      sourceText,
      DEFAULTS.fontFamily,
      DEFAULTS.fontSize
    );

    expect(result.fontSize).toBe('12');
  });

  it('extracts text-align from a span when value is valid', () => {
    const sourceText = '<span style="text-align:center">text</span>';
    const textIndex = buildTextIndex(sourceText);
    const tag = makeSpanTag(0, 0, 31);

    const result = extractSpanAndDivState(
      [tag],
      sourceText,
      textIndex,
      sourceText,
      DEFAULTS.fontFamily,
      DEFAULTS.fontSize
    );

    expect(result.textAlign).toBe('center');
  });

  it('ignores invalid text-align values from a span', () => {
    const sourceText = '<span style="text-align:bogus">text</span>';
    const textIndex = buildTextIndex(sourceText);
    const tag = makeSpanTag(0, 0, 30);

    const result = extractSpanAndDivState(
      [tag],
      sourceText,
      textIndex,
      sourceText,
      DEFAULTS.fontFamily,
      DEFAULTS.fontSize
    );

    expect(result.textAlign).toBe('left');
  });

  it('ignores non-span detected tags', () => {
    const sourceText = '**bold**';
    const textIndex = buildTextIndex(sourceText);
    const nonSpanTag: DetectedTag = {
      type: 'bold',
      isHTML: false,
      isSpan: false,
      open: { start: { line: 0, ch: 0 }, end: { line: 0, ch: 2 } },
      close: { start: { line: 0, ch: 6 }, end: { line: 0, ch: 8 } },
    };

    const result = extractSpanAndDivState(
      [nonSpanTag],
      sourceText,
      textIndex,
      sourceText,
      DEFAULTS.fontFamily,
      DEFAULTS.fontSize
    );

    expect(result.fontColor).toBeNull();
  });

  it('detects legacy <div style="text-align:right"> wrappers via per-line scan', () => {
    const sourceText = '<div style="text-align:right">right aligned</div>';
    const textIndex = buildTextIndex(sourceText);

    const result = extractSpanAndDivState(
      [],
      sourceText,
      textIndex,
      sourceText,
      DEFAULTS.fontFamily,
      DEFAULTS.fontSize
    );

    expect(result.textAlign).toBe('right');
  });

  it('ignores legacy <div> wrappers with invalid text-align values', () => {
    const sourceText = '<div style="text-align:banana">x</div>';
    const textIndex = buildTextIndex(sourceText);

    const result = extractSpanAndDivState(
      [],
      sourceText,
      textIndex,
      sourceText,
      DEFAULTS.fontFamily,
      DEFAULTS.fontSize
    );

    expect(result.textAlign).toBe('left');
  });

  it('skips a span tag without an open position', () => {
    const sourceText = '';
    const textIndex = buildTextIndex(sourceText);
    const malformedTag: DetectedTag = { type: 'color', isSpan: true };

    const result = extractSpanAndDivState(
      [malformedTag],
      sourceText,
      textIndex,
      sourceText,
      DEFAULTS.fontFamily,
      DEFAULTS.fontSize
    );

    expect(result.fontColor).toBeNull();
  });
});
