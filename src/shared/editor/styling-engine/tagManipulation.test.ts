import {
  wrapTextWithTag,
  unwrapTag,
  buildSpanTagDefinition,
  replaceOpeningTagAttribute,
} from './tag-manipulation/TagManipulation';
import {
  extractStylePropertyFromOpeningTag,
  extractAllStyleProperties,
} from './tag-manipulation/style-parsing/StyleParsing';
import {
  findOverlappingTagRanges,
  splitFormattingAroundProtectedRanges,
} from './tag-manipulation/range-splitting/RangeSplitting';
import { UNDERLINE_TAG, BOLD_MD_TAG } from './constants';
import type { HtmlTagRange } from '../enclosing-html-tags/interfaces';
import type { ProtectedRange } from './interfaces';

describe('tagManipulation', () => {
  // ============================================================
  // wrapTextWithTag
  // ============================================================

  describe('wrapTextWithTag', () => {
    it('wraps with <u> tag producing two insertion replacements in last-to-first order', () => {
      // "some text" at offsets 0..9
      const replacements = wrapTextWithTag(0, 9, UNDERLINE_TAG);

      expect(replacements).toHaveLength(2);

      // First replacement is the closing tag (higher offset)
      expect(replacements[0]).toEqual({
        fromOffset: 9,
        toOffset: 9,
        replacementText: '</u>',
      });

      // Second replacement is the opening tag (lower offset)
      expect(replacements[1]).toEqual({
        fromOffset: 0,
        toOffset: 0,
        replacementText: '<u>',
      });
    });

    it('wraps with markdown ** tag producing two insertion replacements', () => {
      const replacements = wrapTextWithTag(5, 15, BOLD_MD_TAG);

      expect(replacements).toHaveLength(2);

      expect(replacements[0]).toEqual({
        fromOffset: 15,
        toOffset: 15,
        replacementText: '**',
      });

      expect(replacements[1]).toEqual({
        fromOffset: 5,
        toOffset: 5,
        replacementText: '**',
      });
    });

    it('uses a single insertion for cursor-only wrapping to avoid reversed close/open order', () => {
      const replacements = wrapTextWithTag(5, 5, UNDERLINE_TAG);

      expect(replacements).toEqual([
        {
          fromOffset: 5,
          toOffset: 5,
          replacementText: '<u></u>',
        },
      ]);
    });
  });

  // ============================================================
  // unwrapTag
  // ============================================================

  describe('unwrapTag', () => {
    it('unwraps <u>text</u> producing two deletion replacements in last-to-first order', () => {
      // "<u>text</u>" — opening <u> is 0..3, closing </u> is 7..11
      const tagRange: HtmlTagRange = {
        tagName: 'u',
        openingTagStartOffset: 0,
        openingTagEndOffset: 3,
        closingTagStartOffset: 7,
        closingTagEndOffset: 11,
      };

      const replacements = unwrapTag(tagRange);

      expect(replacements).toHaveLength(2);

      expect(replacements[0]).toEqual({
        fromOffset: 7,
        toOffset: 11,
        replacementText: '',
      });

      expect(replacements[1]).toEqual({
        fromOffset: 0,
        toOffset: 3,
        replacementText: '',
      });
    });

    it('unwraps markdown ** range producing two deletion replacements', () => {
      // "**bold**" — opening ** is 10..12, closing ** is 16..18
      const tagRange: HtmlTagRange = {
        tagName: 'bold',
        openingTagStartOffset: 10,
        openingTagEndOffset: 12,
        closingTagStartOffset: 16,
        closingTagEndOffset: 18,
      };

      const replacements = unwrapTag(tagRange);

      expect(replacements).toHaveLength(2);

      expect(replacements[0]).toEqual({
        fromOffset: 16,
        toOffset: 18,
        replacementText: '',
      });

      expect(replacements[1]).toEqual({
        fromOffset: 10,
        toOffset: 12,
        replacementText: '',
      });
    });
  });

  // ============================================================
  // buildSpanTagDefinition
  // ============================================================

  describe('buildSpanTagDefinition', () => {
    it('builds correct TagDefinition for color:red', () => {
      const result = buildSpanTagDefinition('color', 'red');

      expect(result).toEqual({
        tagName: 'span',
        domain: 'html',
        openingMarkup: '<span style="color: red">',
        closingMarkup: '</span>',
        attributes: { color: 'red' },
      });
    });

    it('builds correct TagDefinition for font-family with quoted value', () => {
      const result = buildSpanTagDefinition('font-family', "'Arial'");

      expect(result).toEqual({
        tagName: 'span',
        domain: 'html',
        openingMarkup: '<span style="font-family: \'Arial\'">',
        closingMarkup: '</span>',
        attributes: { 'font-family': "'Arial'" },
      });
    });

    it('builds correct TagDefinition for font-size:14pt', () => {
      const result = buildSpanTagDefinition('font-size', '14pt');

      expect(result).toEqual({
        tagName: 'span',
        domain: 'html',
        openingMarkup: '<span style="font-size: 14pt">',
        closingMarkup: '</span>',
        attributes: { 'font-size': '14pt' },
      });
    });
  });

  // ============================================================
  // extractStylePropertyFromOpeningTag
  // ============================================================

  describe('extractStylePropertyFromOpeningTag', () => {
    it('extracts property from <span style="color:red">', () => {
      const result = extractStylePropertyFromOpeningTag('<span style="color:red">');

      expect(result).toEqual({ propertyName: 'color', propertyValue: 'red' });
    });

    it('handles space after colon in style value', () => {
      const result = extractStylePropertyFromOpeningTag('<span style="color: red">');

      expect(result).toEqual({ propertyName: 'color', propertyValue: 'red' });
    });

    it('extracts font-size property correctly', () => {
      const result = extractStylePropertyFromOpeningTag('<span style="font-size: 14pt">');

      expect(result).toEqual({
        propertyName: 'font-size',
        propertyValue: '14pt',
      });
    });

    it('returns null for tag with no style attribute', () => {
      const result = extractStylePropertyFromOpeningTag('<span class="custom">');

      expect(result).toBeNull();
    });

    it('returns null for non-span tag without style', () => {
      const result = extractStylePropertyFromOpeningTag('<u>');

      expect(result).toBeNull();
    });
  });

  // ============================================================
  // extractAllStyleProperties
  // ============================================================

  describe('extractAllStyleProperties', () => {
    it('extracts single property', () => {
      const result = extractAllStyleProperties('<span style="color: red">');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ propertyName: 'color', propertyValue: 'red' });
    });

    it('extracts multiple properties from alignment span', () => {
      const result = extractAllStyleProperties(
        '<span style="display:inline-block;width:100%;vertical-align:top;text-align: center">'
      );

      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({ propertyName: 'display', propertyValue: 'inline-block' });
      expect(result[1]).toEqual({ propertyName: 'width', propertyValue: '100%' });
      expect(result[2]).toEqual({ propertyName: 'vertical-align', propertyValue: 'top' });
      expect(result[3]).toEqual({ propertyName: 'text-align', propertyValue: 'center' });
    });

    it('handles trailing semicolons', () => {
      const result = extractAllStyleProperties('<span style="color: blue;">');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ propertyName: 'color', propertyValue: 'blue' });
    });

    it('returns empty array for tag without style', () => {
      const result = extractAllStyleProperties('<u>');

      expect(result).toHaveLength(0);
    });

    it('trims whitespace from property names and values', () => {
      const result = extractAllStyleProperties('<span style="  font-size : 14pt ; color : red  ">');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ propertyName: 'font-size', propertyValue: '14pt' });
      expect(result[1]).toEqual({ propertyName: 'color', propertyValue: 'red' });
    });

    it('skips declarations without a colon separator', () => {
      // "display block" has no colon — should be ignored
      const result = extractAllStyleProperties('<span style="display block;color:red">');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ propertyName: 'color', propertyValue: 'red' });
    });

    it('skips declarations with an empty property name', () => {
      // ":red" has colon at index 0, so propertyName is ''
      const result = extractAllStyleProperties('<span style=":red;color:blue">');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ propertyName: 'color', propertyValue: 'blue' });
    });

    it('skips declarations with an empty property value', () => {
      // "color:" has propertyValue '' after trimming
      const result = extractAllStyleProperties('<span style="color:;font-size:14pt">');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ propertyName: 'font-size', propertyValue: '14pt' });
    });
  });

  describe('extractStylePropertyFromOpeningTag — no-match style content branch', () => {
    it('returns null when style attribute exists but content has no colon-separated property', () => {
      // The style attribute exists but contains content that the property regex does not match
      const result = extractStylePropertyFromOpeningTag('<span style="">');

      expect(result).toBeNull();
    });
  });

  // ============================================================
  // replaceOpeningTagAttribute
  // ============================================================

  describe('replaceOpeningTagAttribute', () => {
    it('replaces color:red with color:blue', () => {
      const sourceText = '<span style="color: red">hello</span>';
      const tagRange: HtmlTagRange = {
        tagName: 'span',
        openingTagStartOffset: 0,
        openingTagEndOffset: 25,
        closingTagStartOffset: 30,
        closingTagEndOffset: 37,
      };

      const replacement = replaceOpeningTagAttribute(sourceText, tagRange, 'color', 'blue');

      expect(replacement).toEqual({
        fromOffset: 0,
        toOffset: 25,
        replacementText: '<span style="color: blue">',
      });
    });

    it('replaces font-size:12pt with font-size:16pt', () => {
      const sourceText = 'prefix <span style="font-size: 12pt">text</span> suffix';
      const tagRange: HtmlTagRange = {
        tagName: 'span',
        openingTagStartOffset: 7,
        openingTagEndOffset: 37,
        closingTagStartOffset: 41,
        closingTagEndOffset: 48,
      };

      const replacement = replaceOpeningTagAttribute(sourceText, tagRange, 'font-size', '16pt');

      expect(replacement).toEqual({
        fromOffset: 7,
        toOffset: 37,
        replacementText: '<span style="font-size: 16pt">',
      });
    });
  });

  // ============================================================
  // findOverlappingTagRanges
  // ============================================================

  describe('findOverlappingTagRanges', () => {
    it('returns a matching tag that overlaps the selection', () => {
      // "<u>some text</u>" — content range is 3..12
      const tagRange: HtmlTagRange = {
        tagName: 'u',
        openingTagStartOffset: 0,
        openingTagEndOffset: 3,
        closingTagStartOffset: 12,
        closingTagEndOffset: 16,
      };

      // Selection 5..10 is within the content range 3..12
      const result = findOverlappingTagRanges([tagRange], 5, 10, 'u');

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(tagRange);
    });

    it('returns empty array when tag name does not match', () => {
      const tagRange: HtmlTagRange = {
        tagName: 'u',
        openingTagStartOffset: 0,
        openingTagEndOffset: 3,
        closingTagStartOffset: 12,
        closingTagEndOffset: 16,
      };

      const result = findOverlappingTagRanges([tagRange], 5, 10, 'b');

      expect(result).toHaveLength(0);
    });

    it('returns empty array when there is no overlap', () => {
      // Content range is 3..12
      const tagRange: HtmlTagRange = {
        tagName: 'u',
        openingTagStartOffset: 0,
        openingTagEndOffset: 3,
        closingTagStartOffset: 12,
        closingTagEndOffset: 16,
      };

      // Selection 20..25 is entirely outside the content range
      const result = findOverlappingTagRanges([tagRange], 20, 25, 'u');

      expect(result).toHaveLength(0);
    });

    it('returns a tag that fully encloses the selection', () => {
      // Content range is 3..50
      const tagRange: HtmlTagRange = {
        tagName: 'span',
        openingTagStartOffset: 0,
        openingTagEndOffset: 3,
        closingTagStartOffset: 50,
        closingTagEndOffset: 57,
      };

      // Selection 10..20 is fully inside the content range
      const result = findOverlappingTagRanges([tagRange], 10, 20, 'span');

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(tagRange);
    });
  });

  // ============================================================
  // splitFormattingAroundProtectedRanges
  // ============================================================

  describe('splitFormattingAroundProtectedRanges', () => {
    it('wraps around a single wikilink in the middle of the selection', () => {
      // "Visit [[My Note]] for details"
      // Selection: 0..29, protected [[My Note]] at relative 6..18
      const protectedRanges: ProtectedRange[] = [
        { startOffset: 6, endOffset: 18, tokenType: 'wikilink' },
      ];

      const replacements = splitFormattingAroundProtectedRanges(
        0,
        29,
        protectedRanges,
        UNDERLINE_TAG
      );

      // Gap 1: absolute 0..6 ("Visit ") → closing at 6, opening at 0
      // Gap 2: absolute 18..29 (" for details") → closing at 29, opening at 18
      // Sorted last-to-first: 29, 18, 6, 0
      expect(replacements).toHaveLength(4);

      expect(replacements[0]).toEqual({
        fromOffset: 29,
        toOffset: 29,
        replacementText: '</u>',
      });

      expect(replacements[1]).toEqual({
        fromOffset: 18,
        toOffset: 18,
        replacementText: '<u>',
      });

      expect(replacements[2]).toEqual({
        fromOffset: 6,
        toOffset: 6,
        replacementText: '</u>',
      });

      expect(replacements[3]).toEqual({
        fromOffset: 0,
        toOffset: 0,
        replacementText: '<u>',
      });
    });

    it('wraps only after when protected token is at selection start', () => {
      // "[[Link]] rest of text"
      // Selection: 0..20, protected [[Link]] at relative 0..8
      const protectedRanges: ProtectedRange[] = [
        { startOffset: 0, endOffset: 8, tokenType: 'wikilink' },
      ];

      const replacements = splitFormattingAroundProtectedRanges(
        0,
        20,
        protectedRanges,
        UNDERLINE_TAG
      );

      // No gap before (0..0 is zero-width), gap after: absolute 8..20
      expect(replacements).toHaveLength(2);

      expect(replacements[0]).toEqual({
        fromOffset: 20,
        toOffset: 20,
        replacementText: '</u>',
      });

      expect(replacements[1]).toEqual({
        fromOffset: 8,
        toOffset: 8,
        replacementText: '<u>',
      });
    });

    it('wraps only before when protected token is at selection end', () => {
      // "text before [[Link]]"
      // Selection: 0..20, protected [[Link]] at relative 12..20
      const protectedRanges: ProtectedRange[] = [
        { startOffset: 12, endOffset: 20, tokenType: 'wikilink' },
      ];

      const replacements = splitFormattingAroundProtectedRanges(
        0,
        20,
        protectedRanges,
        UNDERLINE_TAG
      );

      // Gap before: absolute 0..12, no gap after (20..20 is zero-width)
      expect(replacements).toHaveLength(2);

      expect(replacements[0]).toEqual({
        fromOffset: 12,
        toOffset: 12,
        replacementText: '</u>',
      });

      expect(replacements[1]).toEqual({
        fromOffset: 0,
        toOffset: 0,
        replacementText: '<u>',
      });
    });

    it('wraps each gap between multiple protected tokens', () => {
      // "A [[L1]] B [[L2]] C"
      // Selection: 0..19, protected at relative 2..8, 11..17
      const protectedRanges: ProtectedRange[] = [
        { startOffset: 2, endOffset: 8, tokenType: 'wikilink' },
        { startOffset: 11, endOffset: 17, tokenType: 'wikilink' },
      ];

      const replacements = splitFormattingAroundProtectedRanges(
        0,
        19,
        protectedRanges,
        UNDERLINE_TAG
      );

      // Gap 1: 0..2 ("A "), Gap 2: 8..11 (" B "), Gap 3: 17..19 (" C")
      // 3 gaps * 2 replacements = 6, sorted last-to-first
      expect(replacements).toHaveLength(6);

      expect(replacements[0].fromOffset).toBe(19);
      expect(replacements[1].fromOffset).toBe(17);
      expect(replacements[2].fromOffset).toBe(11);
      expect(replacements[3].fromOffset).toBe(8);
      expect(replacements[4].fromOffset).toBe(2);
      expect(replacements[5].fromOffset).toBe(0);
    });

    it('wraps entire selection when there are no protected ranges', () => {
      const replacements = splitFormattingAroundProtectedRanges(5, 15, [], UNDERLINE_TAG);

      expect(replacements).toHaveLength(2);

      expect(replacements[0]).toEqual({
        fromOffset: 15,
        toOffset: 15,
        replacementText: '</u>',
      });

      expect(replacements[1]).toEqual({
        fromOffset: 5,
        toOffset: 5,
        replacementText: '<u>',
      });
    });

    it('skips zero-width gaps between adjacent protected tokens', () => {
      // "[[A]][[B]] tail"
      // Selection: 0..15, protected at relative 0..5 and 5..10 (adjacent, no gap)
      const protectedRanges: ProtectedRange[] = [
        { startOffset: 0, endOffset: 5, tokenType: 'wikilink' },
        { startOffset: 5, endOffset: 10, tokenType: 'wikilink' },
      ];

      const replacements = splitFormattingAroundProtectedRanges(
        0,
        15,
        protectedRanges,
        UNDERLINE_TAG
      );

      // No gap before (0..0), no gap between (5..5), gap after: 10..15
      expect(replacements).toHaveLength(2);

      expect(replacements[0]).toEqual({
        fromOffset: 15,
        toOffset: 15,
        replacementText: '</u>',
      });

      expect(replacements[1]).toEqual({
        fromOffset: 10,
        toOffset: 10,
        replacementText: '<u>',
      });
    });
  });
});
