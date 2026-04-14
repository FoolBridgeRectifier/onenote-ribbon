import {
  createEnclosingHtmlTagFinder,
  HtmlTagRange,
} from '../../editor/enclosing-html-tags/enclosingHtmlTags';

import { extractSpanAndDivState } from '../useEditorState';

// ============================================================
// extractSpanAndDivState
// ============================================================

describe('extractSpanAndDivState', () => {
  const defaults = { defaultFontFamily: 'default', defaultFontSize: '16' };

  it('returns defaults when no span or div tags are present', () => {
    const result = extractSpanAndDivState([], '', defaults.defaultFontFamily, defaults.defaultFontSize);

    expect(result.fontColor).toBeNull();
    expect(result.highlightColor).toBeNull();
    expect(result.fontFamily).toBe('default');
    expect(result.fontSize).toBe('16');
    expect(result.textAlign).toBe('left');
  });

  it('extracts font color from an enclosing span', () => {
    const sourceText = '<span style="color: red">text</span>';
    const tagRanges: HtmlTagRange[] = [
      {
        tagName: 'span',
        openingTagStartOffset: 0,
        openingTagEndOffset: 25,
        closingTagStartOffset: 29,
        closingTagEndOffset: 36,
      },
    ];

    const result = extractSpanAndDivState(tagRanges, sourceText, defaults.defaultFontFamily, defaults.defaultFontSize);

    expect(result.fontColor).toBe('red');
  });

  it('extracts highlight color from a background span', () => {
    const sourceText = '<span style="background: yellow">text</span>';
    const tagRanges: HtmlTagRange[] = [
      {
        tagName: 'span',
        openingTagStartOffset: 0,
        openingTagEndOffset: 33,
        closingTagStartOffset: 37,
        closingTagEndOffset: 44,
      },
    ];

    const result = extractSpanAndDivState(tagRanges, sourceText, defaults.defaultFontFamily, defaults.defaultFontSize);

    expect(result.highlightColor).toBe('yellow');
  });

  it('extracts font family from an enclosing span', () => {
    const sourceText = '<span style="font-family: \'Arial\'">text</span>';
    const tagRanges: HtmlTagRange[] = [
      {
        tagName: 'span',
        openingTagStartOffset: 0,
        openingTagEndOffset: 35,
        closingTagStartOffset: 39,
        closingTagEndOffset: 46,
      },
    ];

    const result = extractSpanAndDivState(tagRanges, sourceText, defaults.defaultFontFamily, defaults.defaultFontSize);

    expect(result.fontFamily).toBe('Arial');
  });

  it('extracts font size from an enclosing span', () => {
    const sourceText = '<span style="font-size: 14pt">text</span>';
    const tagRanges: HtmlTagRange[] = [
      {
        tagName: 'span',
        openingTagStartOffset: 0,
        openingTagEndOffset: 30,
        closingTagStartOffset: 34,
        closingTagEndOffset: 41,
      },
    ];

    const result = extractSpanAndDivState(tagRanges, sourceText, defaults.defaultFontFamily, defaults.defaultFontSize);

    expect(result.fontSize).toBe('14');
  });

  it('extracts text-align from an enclosing div', () => {
    const sourceText = '<div style="text-align: center">text</div>';
    const tagRanges: HtmlTagRange[] = [
      {
        tagName: 'div',
        openingTagStartOffset: 0,
        openingTagEndOffset: 32,
        closingTagStartOffset: 36,
        closingTagEndOffset: 42,
      },
    ];

    const result = extractSpanAndDivState(tagRanges, sourceText, defaults.defaultFontFamily, defaults.defaultFontSize);

    expect(result.textAlign).toBe('center');
  });

  it('ignores invalid text-align values', () => {
    const sourceText = '<div style="text-align: banana">text</div>';
    const tagRanges: HtmlTagRange[] = [
      {
        tagName: 'div',
        openingTagStartOffset: 0,
        openingTagEndOffset: 32,
        closingTagStartOffset: 36,
        closingTagEndOffset: 42,
      },
    ];

    const result = extractSpanAndDivState(tagRanges, sourceText, defaults.defaultFontFamily, defaults.defaultFontSize);

    expect(result.textAlign).toBe('left');
  });

  it('skips span tags without style attribute', () => {
    const sourceText = '<span class="custom">text</span>';
    const tagRanges: HtmlTagRange[] = [
      {
        tagName: 'span',
        openingTagStartOffset: 0,
        openingTagEndOffset: 21,
        closingTagStartOffset: 25,
        closingTagEndOffset: 32,
      },
    ];

    const result = extractSpanAndDivState(tagRanges, sourceText, defaults.defaultFontFamily, defaults.defaultFontSize);

    expect(result.fontColor).toBeNull();
    expect(result.fontFamily).toBe('default');
  });
});

// ============================================================
// Integration: tag finder + state derivation
// ============================================================

describe('editor state detection via tag finder', () => {

  it('detects bold from ** markers', () => {
    const sourceText = '**bold text**';
    const finder = createEnclosingHtmlTagFinder(sourceText);
    const tagRanges = finder.getEnclosingTagRanges({
      cursorPosition: { line: 0, ch: 5 },
    });
    const tagNames = tagRanges.map((range) => range.tagName);

    expect(tagNames).toContain('bold');
  });

  it('detects italic from * markers', () => {
    const sourceText = '*italic text*';
    const finder = createEnclosingHtmlTagFinder(sourceText);
    const tagRanges = finder.getEnclosingTagRanges({
      cursorPosition: { line: 0, ch: 5 },
    });
    const tagNames = tagRanges.map((range) => range.tagName);

    expect(tagNames).toContain('italic');
  });

  it('detects underline from <u> tags', () => {
    const sourceText = '<u>underlined</u>';
    const finder = createEnclosingHtmlTagFinder(sourceText);
    const tagRanges = finder.getEnclosingTagRanges({
      cursorPosition: { line: 0, ch: 5 },
    });
    const tagNames = tagRanges.map((range) => range.tagName);

    expect(tagNames).toContain('u');
  });

  it('detects bold and italic from <b><i> nesting', () => {
    const sourceText = '<b><i>text</i></b>';
    const finder = createEnclosingHtmlTagFinder(sourceText);
    const tagRanges = finder.getEnclosingTagRanges({
      cursorPosition: { line: 0, ch: 7 },
    });
    const tagNames = tagRanges.map((range) => range.tagName);

    expect(tagNames).toContain('b');
    expect(tagNames).toContain('i');
  });

  it('detects strikethrough from ~~ markers', () => {
    const sourceText = '~~struck~~';
    const finder = createEnclosingHtmlTagFinder(sourceText);
    const tagRanges = finder.getEnclosingTagRanges({
      cursorPosition: { line: 0, ch: 5 },
    });
    const tagNames = tagRanges.map((range) => range.tagName);

    expect(tagNames).toContain('strikethrough');
  });

  it('detects highlight from == markers', () => {
    const sourceText = '==highlighted==';
    const finder = createEnclosingHtmlTagFinder(sourceText);
    const tagRanges = finder.getEnclosingTagRanges({
      cursorPosition: { line: 0, ch: 5 },
    });
    const tagNames = tagRanges.map((range) => range.tagName);

    expect(tagNames).toContain('highlight');
  });

  it('detects subscript from <sub> tags', () => {
    const sourceText = '<sub>2</sub>';
    const finder = createEnclosingHtmlTagFinder(sourceText);
    const tagRanges = finder.getEnclosingTagRanges({
      cursorPosition: { line: 0, ch: 5 },
    });
    const tagNames = tagRanges.map((range) => range.tagName);

    expect(tagNames).toContain('sub');
  });

  it('detects superscript from <sup> tags', () => {
    const sourceText = '<sup>2</sup>';
    const finder = createEnclosingHtmlTagFinder(sourceText);
    const tagRanges = finder.getEnclosingTagRanges({
      cursorPosition: { line: 0, ch: 5 },
    });
    const tagNames = tagRanges.map((range) => range.tagName);

    expect(tagNames).toContain('sup');
  });

  it('detects font color from enclosing span', () => {
    const sourceText = '<span style="color: red">colored text</span>';
    const finder = createEnclosingHtmlTagFinder(sourceText);
    const tagRanges = finder.getEnclosingTagRanges({
      cursorPosition: { line: 0, ch: 30 },
    });

    const spanState = extractSpanAndDivState(tagRanges, sourceText, 'default', '16');

    expect(spanState.fontColor).toBe('red');
  });

  it('returns no formatting for plain text', () => {
    const sourceText = 'just plain text here';
    const finder = createEnclosingHtmlTagFinder(sourceText);
    const tagRanges = finder.getEnclosingTagRanges({
      cursorPosition: { line: 0, ch: 5 },
    });

    expect(tagRanges).toHaveLength(0);

    const spanState = extractSpanAndDivState(tagRanges, sourceText, 'default', '16');

    expect(spanState.fontColor).toBeNull();
    expect(spanState.highlightColor).toBeNull();
  });
});
