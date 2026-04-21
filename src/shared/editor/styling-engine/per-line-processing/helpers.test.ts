import { buildTagRanges } from '../../enclosing-html-tags/enclosingHtmlTags';
import { BOLD_HTML_TAG, BOLD_MD_TAG } from '../constants';
import { lineHasMatchingTag, shouldProcessPerLine, buildEffectiveLineRanges } from './helpers';
import type { StructureContext } from '../interfaces';

// ─── lineHasMatchingTag ───────────────────────────────────────────────────────

describe('lineHasMatchingTag — direct HTML tag match (line 57)', () => {
  it('returns true when the HTML tag directly encloses the range', () => {
    // <b>hello</b>: opening ends at 3, closing starts at 8, closing ends at 12
    const sourceText = '<b>hello</b>';
    const allTagRanges = buildTagRanges(sourceText);

    // Range [3, 8] is the content "hello" — enclosed by <b>...</b>
    const result = lineHasMatchingTag(allTagRanges, sourceText, 3, 8, BOLD_HTML_TAG);

    expect(result).toBe(true);
  });
});

describe('lineHasMatchingTag — HTML equivalent enclosing match (line 72)', () => {
  it('returns true via HTML equivalent when markdown tag has HTML encoding in the source', () => {
    // BOLD_MD_TAG has tagName 'bold' (no direct HTML 'bold' tag), but
    // MARKDOWN_TO_HTML_TAG_MAP maps 'bold' → BOLD_HTML_TAG (tagName 'b').
    // findEnclosingMatchingTag for 'b' at [3, 8] in <b>hello</b> succeeds.
    const sourceText = '<b>hello</b>';
    const allTagRanges = buildTagRanges(sourceText);

    const result = lineHasMatchingTag(allTagRanges, sourceText, 3, 8, BOLD_MD_TAG);

    expect(result).toBe(true);
  });
});

describe('lineHasMatchingTag — HTML equivalent delimiter-inclusive match (line 82)', () => {
  it('returns true via HTML equivalent delimiter match when selection spans full tag', () => {
    // Range [0, 12] covers the entire <b>hello</b> tag (including delimiters).
    // findEnclosingMatchingTag for 'b' fails (openingTagEnd=3 > 0).
    // findDelimiterInclusiveMatch for 'b' succeeds (tag span within [0, 12]).
    const sourceText = '<b>hello</b>';
    const allTagRanges = buildTagRanges(sourceText);

    const result = lineHasMatchingTag(allTagRanges, sourceText, 0, sourceText.length, BOLD_MD_TAG);

    expect(result).toBe(true);
  });
});

describe('lineHasMatchingTag — no match', () => {
  it('returns false when no matching tag exists anywhere in the source', () => {
    const sourceText = 'plain text without any tags';
    const allTagRanges = buildTagRanges(sourceText);

    const result = lineHasMatchingTag(
      allTagRanges,
      sourceText,
      0,
      sourceText.length,
      BOLD_HTML_TAG
    );

    expect(result).toBe(false);
  });

  it('returns false for markdown tag when source has no corresponding HTML tag', () => {
    const sourceText = 'plain text without any tags';
    const allTagRanges = buildTagRanges(sourceText);

    const result = lineHasMatchingTag(allTagRanges, sourceText, 0, sourceText.length, BOLD_MD_TAG);

    expect(result).toBe(false);
  });
});

// ─── shouldProcessPerLine ────────────────────────────────────────────────────

describe('shouldProcessPerLine', () => {
  it('returns false when selection spans only one line', () => {
    const context: StructureContext = {
      lines: [
        {
          lineStartOffset: 0,
          lineEndOffset: 10,
          linePrefix: null,
          linePrefixType: 'none',
          contentStartOffset: 0,
          inertZone: null,
        },
      ],
      protectedRanges: [],
      isFullyInert: false,
    };

    expect(shouldProcessPerLine(context)).toBe(false);
  });

  it('returns true when multiple lines span and at least one has a structural prefix', () => {
    const context: StructureContext = {
      lines: [
        {
          lineStartOffset: 0,
          lineEndOffset: 10,
          linePrefix: '- ',
          linePrefixType: 'bullet',
          contentStartOffset: 2,
          inertZone: null,
        },
        {
          lineStartOffset: 11,
          lineEndOffset: 20,
          linePrefix: '- ',
          linePrefixType: 'bullet',
          contentStartOffset: 13,
          inertZone: null,
        },
      ],
      protectedRanges: [],
      isFullyInert: false,
    };

    expect(shouldProcessPerLine(context)).toBe(true);
  });
});

// ─── buildEffectiveLineRanges ─────────────────────────────────────────────────

describe('buildEffectiveLineRanges', () => {
  it('skips inert lines', () => {
    const context: StructureContext = {
      lines: [
        {
          lineStartOffset: 0,
          lineEndOffset: 10,
          linePrefix: null,
          linePrefixType: 'none',
          contentStartOffset: 0,
          inertZone: 'codeBlock',
        },
      ],
      protectedRanges: [],
      isFullyInert: true,
    };

    const ranges = buildEffectiveLineRanges(context, 0, 10);

    expect(ranges).toHaveLength(0);
  });

  it('clips effective range to selection and line boundaries', () => {
    const context: StructureContext = {
      lines: [
        {
          lineStartOffset: 0,
          lineEndOffset: 20,
          linePrefix: null,
          linePrefixType: 'none',
          contentStartOffset: 5,
          inertZone: null,
        },
      ],
      protectedRanges: [],
      isFullyInert: false,
    };

    // Selection starts at 3, but contentStartOffset is 5 → effectiveStart = max(3,5) = 5
    // Selection ends at 15, lineEndOffset is 20 → effectiveEnd = min(15,20) = 15
    const ranges = buildEffectiveLineRanges(context, 3, 15);

    expect(ranges).toHaveLength(1);
    expect(ranges[0]).toEqual({ start: 5, end: 15 });
  });
});
