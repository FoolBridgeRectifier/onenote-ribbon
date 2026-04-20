import { buildDomainConversionReplacements } from './DomainConversion';
import { UNDERLINE_TAG } from '../constants';
import type { HtmlTagRange } from '../../enclosing-html-tags/interfaces';

// ── buildDomainConversionReplacements ─────────────────────────────────────────

describe('buildDomainConversionReplacements', () => {
  it('wraps the selection directly when no enclosing markdown tags exist', () => {
    // No tag ranges — falls straight through to wrapTextWithTag
    const replacements = buildDomainConversionReplacements('hello world', 0, 5, UNDERLINE_TAG, []);

    // wrapTextWithTag returns [closing, opening] in last-to-first order
    expect(replacements).toHaveLength(2);
    expect(replacements[0]).toEqual({ fromOffset: 5, toOffset: 5, replacementText: '</u>' });
    expect(replacements[1]).toEqual({ fromOffset: 0, toOffset: 0, replacementText: '<u>' });
  });

  it('wraps the selection directly when enclosing tags are not markdown tags', () => {
    // HTML tag range that is NOT in MARKDOWN_TO_HTML_TAG_MAP → treated as non-markdown
    const htmlTagRange: HtmlTagRange = {
      tagName: 'span',
      openingTagStartOffset: 0,
      openingTagEndOffset: 6,
      closingTagStartOffset: 11,
      closingTagEndOffset: 18,
    };

    const replacements = buildDomainConversionReplacements(
      '<span>hello</span>',
      6,
      11,
      UNDERLINE_TAG,
      [htmlTagRange]
    );

    // "span" is not a markdown tag → falls through to direct wrap
    expect(replacements).toHaveLength(2);
  });

  it('converts the enclosing markdown tag region when a markdown tag encloses the selection', () => {
    // MARKDOWN_TO_HTML_TAG_MAP is keyed by tagName 'bold', 'italic', etc. — not 'b'.
    // Use tagName: 'bold' so the map lookup succeeds and conversion is triggered.
    const boldMarkdownTagRange: HtmlTagRange = {
      tagName: 'bold',
      openingTagStartOffset: 0,
      openingTagEndOffset: 2,
      closingTagStartOffset: 6,
      closingTagEndOffset: 8,
    };

    const sourceText = '**bold**';
    // Selection covers the inner content "bold" (offsets 2–6)
    const replacements = buildDomainConversionReplacements(sourceText, 2, 6, UNDERLINE_TAG, [
      boldMarkdownTagRange,
    ]);

    // Should produce a single replacement covering the full region [0, 8]
    expect(replacements).toHaveLength(1);
    expect(replacements[0].fromOffset).toBe(0);
    expect(replacements[0].toOffset).toBe(8);
    // Replacement text should contain the <u> wrapper
    expect(replacements[0].replacementText).toContain('<u>');
    expect(replacements[0].replacementText).toContain('</u>');
  });

  it('selects the outermost range when multiple enclosing markdown tags exist', () => {
    // Both ranges use tagName 'bold' so they appear in MARKDOWN_TO_HTML_TAG_MAP
    const innerRange: HtmlTagRange = {
      tagName: 'bold',
      openingTagStartOffset: 2,
      openingTagEndOffset: 4,
      closingTagStartOffset: 10,
      closingTagEndOffset: 12,
    };

    const outerRange: HtmlTagRange = {
      tagName: 'bold',
      openingTagStartOffset: 0,
      openingTagEndOffset: 2,
      closingTagStartOffset: 12,
      closingTagEndOffset: 14,
    };

    const sourceText = '**__text__**';
    const replacements = buildDomainConversionReplacements(sourceText, 4, 10, UNDERLINE_TAG, [
      innerRange,
      outerRange,
    ]);

    // Replacement must start at the outermost range start (0) and end at its close (14)
    expect(replacements).toHaveLength(1);
    expect(replacements[0].fromOffset).toBe(0);
    expect(replacements[0].toOffset).toBe(14);
  });
});
