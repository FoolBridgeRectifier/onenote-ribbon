import {
  convertMarkdownTokensToHtml,
  containsMarkdownTokens,
} from './markdown-to-html-conversion/MarkdownToHtmlConversion';

describe('markdownToHtmlConversion', () => {
  describe('convertMarkdownTokensToHtml', () => {
    it('converts **bold** to <b>bold</b>', () => {
      expect(convertMarkdownTokensToHtml('**bold**')).toBe('<b>bold</b>');
    });

    it('converts __bold__ to <b>bold</b>', () => {
      expect(convertMarkdownTokensToHtml('__bold__')).toBe('<b>bold</b>');
    });

    it('converts *italic* to <i>italic</i>', () => {
      expect(convertMarkdownTokensToHtml('*italic*')).toBe('<i>italic</i>');
    });

    it('converts _italic_ to <i>italic</i>', () => {
      expect(convertMarkdownTokensToHtml('_italic_')).toBe('<i>italic</i>');
    });

    it('converts ~~struck~~ to <s>struck</s>', () => {
      expect(convertMarkdownTokensToHtml('~~struck~~')).toBe('<s>struck</s>');
    });

    it('converts ==highlighted== to <mark>highlighted</mark>', () => {
      expect(convertMarkdownTokensToHtml('==highlighted==')).toBe(
        '<mark>highlighted</mark>',
      );
    });

    it('converts multiple tokens in the same string', () => {
      expect(convertMarkdownTokensToHtml('**bold** and *italic*')).toBe(
        '<b>bold</b> and <i>italic</i>',
      );
    });

    it('converts nested markdown: **_nested_** becomes <b><i>nested</i></b>', () => {
      expect(convertMarkdownTokensToHtml('**_nested_**')).toBe(
        '<b><i>nested</i></b>',
      );
    });

    it('converts ***combined*** to <b><i>combined bold italic</i></b>', () => {
      expect(
        convertMarkdownTokensToHtml('***combined bold italic***'),
      ).toBe('<b><i>combined bold italic</i></b>');
    });

    it('returns plain text unchanged', () => {
      expect(convertMarkdownTokensToHtml('plain text')).toBe('plain text');
    });

    it('returns existing HTML tags unchanged when no markdown tokens present', () => {
      expect(convertMarkdownTokensToHtml('<u>html</u>')).toBe('<u>html</u>');
    });
  });

  describe('containsMarkdownTokens', () => {
    it('returns true for **x**', () => {
      expect(containsMarkdownTokens('**x**')).toBe(true);
    });

    it('returns false for plain text', () => {
      expect(containsMarkdownTokens('plain')).toBe(false);
    });

    it('returns false for HTML-only tags', () => {
      expect(containsMarkdownTokens('<u>html</u>')).toBe(false);
    });

    it('returns true for *italic*', () => {
      expect(containsMarkdownTokens('*italic*')).toBe(true);
    });

    it('returns true for ~~strike~~', () => {
      expect(containsMarkdownTokens('~~strike~~')).toBe(true);
    });
  });
});
