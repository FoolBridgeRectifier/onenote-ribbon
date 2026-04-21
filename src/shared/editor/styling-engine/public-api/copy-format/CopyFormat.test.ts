import { copyFormat } from './CopyFormat';

describe('copyFormat — known HTML tags', () => {
  it('returns underline tag definition for <u> wrapped content', () => {
    const sourceText = '<u>underlined text</u>';
    // Content "underlined text" is at offsets [3, 18] inside <u>...</u>
    const result = copyFormat(sourceText, 3, 18);

    expect(result.tagDefinitions.some((td) => td.tagName === 'u')).toBe(true);
  });

  it('returns bold HTML tag definition for <b> wrapped content', () => {
    const sourceText = '<b>bold text</b>';
    const result = copyFormat(sourceText, 3, 12);

    expect(result.tagDefinitions.some((td) => td.tagName === 'b')).toBe(true);
  });
});

describe('copyFormat — unknown HTML tag (return null path, line 32)', () => {
  it('ignores unknown tag names and returns empty tagDefinitions', () => {
    // <div> is not in HTML_TAG_NAME_DEFINITIONS or MARKDOWN_TAG_NAME_DEFINITIONS
    // → tagRangeToTagDefinition returns null → not added to tagDefinitions
    const sourceText = '<div>text</div>';
    // "text" is at [5, 9], enclosed by <div> (openingTagEnd=5, closingTagStart=9)
    const result = copyFormat(sourceText, 5, 9);

    expect(result.tagDefinitions).toHaveLength(0);
  });

  it('ignores span tags without inline style and returns empty tagDefinitions', () => {
    // <span> without style is not in any definition map, and extractStylePropertyFromOpeningTag
    // returns null for a plain <span> → tagRangeToTagDefinition returns null at line 32
    const sourceText = '<span>text</span>';
    // "text" is at [6, 10], enclosed by <span> (openingTagEnd=6, closingTagStart=10)
    const result = copyFormat(sourceText, 6, 10);

    expect(result.tagDefinitions).toHaveLength(0);
  });
});

describe('copyFormat — span with inline style', () => {
  it('builds a span tag definition from the inline style property', () => {
    const sourceText = '<span style="font-family: Arial">text</span>';
    // Content "text" is inside the span: the opening tag ends after ">", closing starts before "</span>"
    const openingEnd = sourceText.indexOf('>') + 1;
    const closingStart = sourceText.lastIndexOf('</');

    const result = copyFormat(sourceText, openingEnd, closingStart);

    expect(result.tagDefinitions.some((td) => td.tagName === 'span')).toBe(true);
  });
});

describe('copyFormat — domain detection', () => {
  it('includes domain in the returned CopiedFormat', () => {
    const sourceText = 'plain text';
    const result = copyFormat(sourceText, 0, sourceText.length);

    expect(result.domain).toBeDefined();
  });
});
