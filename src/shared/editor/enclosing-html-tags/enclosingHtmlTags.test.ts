import {
  createEnclosingHtmlTagFinder,
  getEnclosingHtmlTagNames,
  TextPosition,
} from './enclosingHtmlTags';

function createPosition(line: number, ch: number): TextPosition {
  return { line, ch };
}

describe('enclosingHtmlTags', () => {
  it('returns all nested enclosing tags for a cursor position', () => {
    const sourceText = '<div><u><sub>hello</sub></u></div>';
    const finder = createEnclosingHtmlTagFinder(sourceText);

    const tagNames = finder.getEnclosingTagNames({
      cursorPosition: createPosition(0, 15),
    });

    expect(tagNames).toEqual(['sub', 'u', 'div']);
  });

  it('returns the enclosing tag when a selection is fully inside tag content', () => {
    const sourceText = '<u>abc</u>';
    const finder = createEnclosingHtmlTagFinder(sourceText);

    const tagNames = finder.getEnclosingTagNames({
      leftPosition: createPosition(0, 3),
      rightPosition: createPosition(0, 6),
    });

    expect(tagNames).toEqual(['u']);
  });

  it('returns no tags when a selection crosses a closing tag boundary', () => {
    const sourceText = '<u>abc</u>';
    const finder = createEnclosingHtmlTagFinder(sourceText);

    const tagNames = finder.getEnclosingTagNames({
      leftPosition: createPosition(0, 4),
      rightPosition: createPosition(0, 8),
    });

    expect(tagNames).toEqual([]);
  });

  it('normalizes selection bounds when right comes before left', () => {
    const sourceText = '<sup>value</sup>';
    const finder = createEnclosingHtmlTagFinder(sourceText);

    const tagNames = finder.getEnclosingTagNames({
      leftPosition: createPosition(0, 10),
      rightPosition: createPosition(0, 5),
    });

    expect(tagNames).toEqual(['sup']);
  });

  it('supports multiline cursor positions', () => {
    const sourceText = '<div>\n<sub>line</sub>\n</div>';
    const finder = createEnclosingHtmlTagFinder(sourceText);

    const tagNames = finder.getEnclosingTagNames({
      cursorPosition: createPosition(1, 6),
    });

    expect(tagNames).toEqual(['sub', 'div']);
  });

  it('ignores self-closing and void tags as enclosures', () => {
    const sourceText = '<div>a<br/>b<img src="x"/>c<hr>d</div>';
    const finder = createEnclosingHtmlTagFinder(sourceText);

    const tagNames = finder.getEnclosingTagNames({
      cursorPosition: createPosition(0, 10),
    });

    expect(tagNames).toEqual(['div']);
  });

  it('returns no tags for an unmatched opening tag', () => {
    const sourceText = '<sub>text';
    const finder = createEnclosingHtmlTagFinder(sourceText);

    const tagNames = finder.getEnclosingTagNames({
      cursorPosition: createPosition(0, 7),
    });

    expect(tagNames).toEqual([]);
  });

  it('returns no tags for an unmatched closing tag', () => {
    const sourceText = 'text</sub>';
    const finder = createEnclosingHtmlTagFinder(sourceText);

    const tagNames = finder.getEnclosingTagNames({
      cursorPosition: createPosition(0, 2),
    });

    expect(tagNames).toEqual([]);
  });

  it('clamps out-of-range positions safely', () => {
    const sourceText = '<u>abc</u>';
    const finder = createEnclosingHtmlTagFinder(sourceText);

    const beforeStartTagNames = finder.getEnclosingTagNames({
      cursorPosition: createPosition(-2, -10),
    });
    const afterEndTagNames = finder.getEnclosingTagNames({
      cursorPosition: createPosition(99, 200),
    });

    expect(beforeStartTagNames).toEqual([]);
    expect(afterEndTagNames).toEqual([]);
  });

  it('returns both names and range details in inner-to-outer order', () => {
    const sourceText = '<div><sub>value</sub></div>';
    const finder = createEnclosingHtmlTagFinder(sourceText);

    const tagRanges = finder.getEnclosingTagRanges({
      cursorPosition: createPosition(0, 11),
    });

    expect(tagRanges.map((tagRange) => tagRange.tagName)).toEqual([
      'sub',
      'div',
    ]);
    expect(tagRanges[0].openingTagStartOffset).toBe(5);
    expect(tagRanges[0].openingTagEndOffset).toBe(10);
    expect(tagRanges[0].closingTagStartOffset).toBe(15);
    expect(tagRanges[0].closingTagEndOffset).toBe(21);
  });

  it('reuses a single prebuilt finder across multiple queries', () => {
    const sourceText = '<div><u>one</u><u>two</u></div>';
    const finder = createEnclosingHtmlTagFinder(sourceText);

    const firstTagNames = finder.getEnclosingTagNames({
      cursorPosition: createPosition(0, 9),
    });
    const secondTagNames = finder.getEnclosingTagNames({
      cursorPosition: createPosition(0, 19),
    });

    expect(firstTagNames).toEqual(['u', 'div']);
    expect(secondTagNames).toEqual(['u', 'div']);
  });

  it('detects enclosing markdown bold tags for cursor positions', () => {
    const sourceText = '**bold**';
    const finder = createEnclosingHtmlTagFinder(sourceText);

    const tagNames = finder.getEnclosingTagNames({
      cursorPosition: createPosition(0, 4),
    });

    expect(tagNames).toEqual(['bold']);
  });

  it('detects nested markdown tags in inner-to-outer order', () => {
    const sourceText = '**_text_**';
    const finder = createEnclosingHtmlTagFinder(sourceText);

    const tagNames = finder.getEnclosingTagNames({
      cursorPosition: createPosition(0, 4),
    });

    expect(tagNames).toEqual(['italic', 'bold']);
  });

  it('detects markdown strikethrough and highlight tags', () => {
    const sourceText = '~~==value==~~';
    const finder = createEnclosingHtmlTagFinder(sourceText);

    const tagNames = finder.getEnclosingTagNames({
      cursorPosition: createPosition(0, 6),
    });

    expect(tagNames).toEqual(['highlight', 'strikethrough']);
  });

  it('detects markdown inline code tags', () => {
    const sourceText = '`constValue`';
    const finder = createEnclosingHtmlTagFinder(sourceText);

    const tagNames = finder.getEnclosingTagNames({
      cursorPosition: createPosition(0, 5),
    });

    expect(tagNames).toEqual(['code']);
  });

  it('combines markdown and html enclosing tags', () => {
    const sourceText = '<u>**word**</u>';
    const finder = createEnclosingHtmlTagFinder(sourceText);

    const tagNames = finder.getEnclosingTagNames({
      cursorPosition: createPosition(0, 7),
    });

    expect(tagNames).toEqual(['bold', 'u']);
  });

  it('does not track inner tags when selection wraps across them', () => {
    const sourceText = '<u>as<b>s</b>asgs</u>';
    const finder = createEnclosingHtmlTagFinder(sourceText);

    const tagNames = finder.getEnclosingTagNames({
      leftPosition: createPosition(0, 3),
      rightPosition: createPosition(0, 17),
    });

    expect(tagNames).toEqual(['u']);
  });

  it('tracks inner tags when selection is inside inner tag content', () => {
    const sourceText = '<u>as<b>s</b>asgs</u>';
    const finder = createEnclosingHtmlTagFinder(sourceText);

    const tagNames = finder.getEnclosingTagNames({
      leftPosition: createPosition(0, 8),
      rightPosition: createPosition(0, 9),
    });

    expect(tagNames).toEqual(['b', 'u']);
  });

  it('tracks inner tags when cursor is inside inner tag content', () => {
    const sourceText = '<u>as<b>s</b>asgs</u>';
    const finder = createEnclosingHtmlTagFinder(sourceText);

    const tagNames = finder.getEnclosingTagNames({
      cursorPosition: createPosition(0, 8),
    });

    expect(tagNames).toEqual(['b', 'u']);
  });

  it('provides a convenience function for single-call usage', () => {
    const sourceText = '<div><sup>power</sup></div>';

    const tagNames = getEnclosingHtmlTagNames(sourceText, {
      cursorPosition: createPosition(0, 12),
    });

    expect(tagNames).toEqual(['sup', 'div']);
  });
});
