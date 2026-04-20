import { detectFormattingDomain } from './domain-detection/DomainDetection';

describe('domainDetection', () => {
  it('returns markdown domain with no tokens for plain text', () => {
    const sourceText = 'hello world';
    const cursorOffset = 5;

    const result = detectFormattingDomain(sourceText, cursorOffset, cursorOffset);

    expect(result).toEqual({
      domain: 'markdown',
      hasMarkdownTokens: false,
      hasHtmlTags: false,
    });
  });

  it('returns markdown domain with markdown tokens when inside **bold**', () => {
    // "**bold**" — content "bold" starts at offset 2, ends at offset 6
    const sourceText = '**bold**';
    const selectionStart = 3;
    const selectionEnd = 5;

    const result = detectFormattingDomain(sourceText, selectionStart, selectionEnd);

    expect(result).toEqual({
      domain: 'markdown',
      hasMarkdownTokens: true,
      hasHtmlTags: false,
    });
  });

  it('returns html domain when inside <u>text</u>', () => {
    // "<u>text</u>" — content "text" starts at offset 3
    const sourceText = '<u>text</u>';
    const selectionStart = 4;
    const selectionEnd = 6;

    const result = detectFormattingDomain(sourceText, selectionStart, selectionEnd);

    expect(result).toEqual({
      domain: 'html',
      hasMarkdownTokens: false,
      hasHtmlTags: true,
    });
  });

  it('returns html domain with both flags when inside <u>**bold**</u>', () => {
    // "<u>**bold**</u>" — "<u>" is 3, "**" is 2, content "bold" starts at 5
    const sourceText = '<u>**bold**</u>';
    const selectionStart = 6;
    const selectionEnd = 8;

    const result = detectFormattingDomain(sourceText, selectionStart, selectionEnd);

    expect(result).toEqual({
      domain: 'html',
      hasMarkdownTokens: true,
      hasHtmlTags: true,
    });
  });

  it('returns html domain for <span> with style attribute', () => {
    // '<span style="color:red">text</span>'
    // Opening tag ends at offset 25, content "text" starts there
    const sourceText = '<span style="color:red">text</span>';
    const selectionStart = 25;
    const selectionEnd = 27;

    const result = detectFormattingDomain(sourceText, selectionStart, selectionEnd);

    expect(result).toEqual({
      domain: 'html',
      hasMarkdownTokens: false,
      hasHtmlTags: true,
    });
  });

  it('returns markdown domain when there are no enclosing tags', () => {
    const sourceText = 'no tags here at all';
    const selectionStart = 3;
    const selectionEnd = 7;

    const result = detectFormattingDomain(sourceText, selectionStart, selectionEnd);

    expect(result).toEqual({
      domain: 'markdown',
      hasMarkdownTokens: false,
      hasHtmlTags: false,
    });
  });

  it('returns html domain for nested HTML-only tags', () => {
    // "<div><sub>text</sub></div>"
    // "<div>" is 5, "<sub>" is 5, content "text" starts at offset 10
    const sourceText = '<div><sub>text</sub></div>';
    const selectionStart = 11;
    const selectionEnd = 13;

    const result = detectFormattingDomain(sourceText, selectionStart, selectionEnd);

    expect(result).toEqual({
      domain: 'html',
      hasMarkdownTokens: false,
      hasHtmlTags: true,
    });
  });

  it('returns markdown domain with tokens for nested markdown ~~==value==~~', () => {
    // "~~==value==~~" — "~~" is 2, "==" is 2, content "value" starts at offset 4
    const sourceText = '~~==value==~~';
    const selectionStart = 5;
    const selectionEnd = 8;

    const result = detectFormattingDomain(sourceText, selectionStart, selectionEnd);

    expect(result).toEqual({
      domain: 'markdown',
      hasMarkdownTokens: true,
      hasHtmlTags: false,
    });
  });
});
