import { convertMarkdownTokensToHtml } from '../convertMarkdownTokensToHtml';

describe('convertMarkdownTokensToHtml', () => {
  it('converts ** bold ** to <b>', () => {
    expect(convertMarkdownTokensToHtml('**bold**')).toBe('<b>bold</b>');
  });

  it('converts __ bold __ to <b>', () => {
    expect(convertMarkdownTokensToHtml('__bold__')).toBe('<b>bold</b>');
  });

  it('converts * italic * to <i>', () => {
    expect(convertMarkdownTokensToHtml('*italic*')).toBe('<i>italic</i>');
  });

  it('converts _ italic _ to <i>', () => {
    expect(convertMarkdownTokensToHtml('_italic_')).toBe('<i>italic</i>');
  });

  it('converts ~~ strike ~~ to <s>', () => {
    expect(convertMarkdownTokensToHtml('~~struck~~')).toBe('<s>struck</s>');
  });

  it('converts == highlight == to <mark>', () => {
    expect(convertMarkdownTokensToHtml('==highlighted==')).toBe('<mark>highlighted</mark>');
  });

  it('converts mixed bold and italic in same text', () => {
    expect(convertMarkdownTokensToHtml('**bold** and *italic*')).toBe('<b>bold</b> and <i>italic</i>');
  });

  it('converts nested italic inside bold', () => {
    expect(convertMarkdownTokensToHtml('**_nested_**')).toBe('<b><i>nested</i></b>');
  });

  it('converts *** combined bold+italic *** to nested tags', () => {
    expect(convertMarkdownTokensToHtml('***combined bold italic***')).toBe('<b><i>combined bold italic</i></b>');
  });

  it('returns plain text unchanged', () => {
    expect(convertMarkdownTokensToHtml('plain text')).toBe('plain text');
  });

  it('leaves existing HTML untouched', () => {
    expect(convertMarkdownTokensToHtml('<u>html</u>')).toBe('<u>html</u>');
  });

  it('escapes regex special characters in delimiters (== with .)', () => {
    // Sanity: text containing regex meta-chars should not match incorrectly.
    expect(convertMarkdownTokensToHtml('a.b')).toBe('a.b');
  });
});
