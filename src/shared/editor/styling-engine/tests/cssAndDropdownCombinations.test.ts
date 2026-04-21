import { toggleTag, addTag, removeTag, removeAllTags } from '../stylingEngine';

import { UNDERLINE_TAG, BOLD_MD_TAG, HIGHLIGHT_MD_TAG } from '../constants';

import { buildSpanTagDefinition } from '../tag-manipulation/TagManipulation';
import type { StylingContext, TextReplacement, TagDefinition } from '../interfaces';

// ============================================================
// Test Helpers
// ============================================================

function applyReplacements(sourceText: string, replacements: TextReplacement[]): string {
  let result = sourceText;

  for (const replacement of replacements) {
    result =
      result.slice(0, replacement.fromOffset) +
      replacement.replacementText +
      result.slice(replacement.toOffset);
  }

  return result;
}

function createContext(sourceText: string, startOffset: number, endOffset: number): StylingContext {
  return {
    sourceText,
    selectionStartOffset: startOffset,
    selectionEndOffset: endOffset,
    selectedText: sourceText.slice(startOffset, endOffset),
  };
}

/**
 * Applies a tag to sourceText at the given content offsets, returns the new text.
 * Uses addTag (never removes) so sequential calls always wrap/replace.
 */
function applyAddTag(
  sourceText: string,
  startOffset: number,
  endOffset: number,
  tagDefinition: TagDefinition
): string {
  const context = createContext(sourceText, startOffset, endOffset);
  const result = addTag(context, tagDefinition);
  return applyReplacements(sourceText, result.replacements);
}

/**
 * Finds the start and end offsets of `needle` within `haystack`.
 * Throws if not found — catches test bugs early.
 */
function findOffsets(haystack: string, needle: string): { start: number; end: number } {
  const index = haystack.indexOf(needle);

  if (index === -1) {
    throw new Error(`Could not find "${needle}" in "${haystack}"`);
  }

  return { start: index, end: index + needle.length };
}

// ============================================================
// Reusable Tag Definitions
// ============================================================

const fontColorRed = buildSpanTagDefinition('color', '#ff0000');
const fontColorBlue = buildSpanTagDefinition('color', '#0000ff');
const highlightYellow = buildSpanTagDefinition('background', '#ffff00');
const highlightGreen = buildSpanTagDefinition('background', '#00ff00');
const fontArial = buildSpanTagDefinition('font-family', 'Arial');
const fontCourier = buildSpanTagDefinition('font-family', 'Courier New');
const fontSize24 = buildSpanTagDefinition('font-size', '24pt');
const fontSize12 = buildSpanTagDefinition('font-size', '12pt');
const fontSize8 = buildSpanTagDefinition('font-size', '8pt');
const fontSize72 = buildSpanTagDefinition('font-size', '72pt');
const fontTimesNewRoman = buildSpanTagDefinition('font-family', 'Times New Roman');

// ============================================================
// Alignment Helpers (extracted from AlignButton logic)
// ============================================================

const ALIGN_SPAN_PATTERN =
  /^(#{1,6}\s)?<span style="display:inline-block;width:100%;vertical-align:top;text-align:\s*(\w+)">(.*)<\/span>$/;
const LEGACY_ALIGN_INLINE_BLOCK_SPAN_PATTERN =
  /^(#{1,6}\s)?<span style="display:inline-block;width:100%;text-align:\s*(\w+)">(.*)<\/span>$/;
const LEGACY_ALIGN_DIV_PATTERN = /^(#{1,6}\s)?<div style="text-align:\s*(\w+)">(.*)<\/div>$/;
const LEGACY_ALIGN_BLOCK_SPAN_PATTERN =
  /^(#{1,6}\s)?<span style="display:block;text-align:\s*(\w+)">(.*)<\/span>$/;
const HEADING_PREFIX_PATTERN = /^(#{1,6}\s)/;

function matchAlignWrapper(lineText: string): RegExpMatchArray | null {
  return (
    lineText.match(ALIGN_SPAN_PATTERN) ??
    lineText.match(LEGACY_ALIGN_INLINE_BLOCK_SPAN_PATTERN) ??
    lineText.match(LEGACY_ALIGN_BLOCK_SPAN_PATTERN) ??
    lineText.match(LEGACY_ALIGN_DIV_PATTERN)
  );
}

function splitHeadingPrefix(lineText: string): { prefix: string; content: string } {
  const headingMatch = lineText.match(HEADING_PREFIX_PATTERN);

  if (headingMatch) {
    return { prefix: headingMatch[1], content: lineText.slice(headingMatch[1].length) };
  }

  return { prefix: '', content: lineText };
}

/**
 * Pure-function equivalent of the AlignButton's applyAlignment.
 * Operates on a single line string and returns the transformed line.
 */
function applyAlignmentToLine(lineText: string, alignment: 'left' | 'center' | 'right'): string {
  const alignMatch = matchAlignWrapper(lineText);

  if (alignment === 'left') {
    if (alignMatch) {
      const headingPrefix = alignMatch[1] ?? '';
      return headingPrefix + alignMatch[3];
    }

    return lineText;
  }

  if (alignMatch) {
    const headingPrefix = alignMatch[1] ?? '';
    return `${headingPrefix}<span style="display:inline-block;width:100%;vertical-align:top;text-align: ${alignment}">${alignMatch[3]}</span>`;
  }

  const { prefix, content } = splitHeadingPrefix(lineText);
  return `${prefix}<span style="display:inline-block;width:100%;vertical-align:top;text-align: ${alignment}">${content}</span>`;
}

// ============================================================
// Group 1: Font Family Operations
// ============================================================

describe('Group 1: Font family operations', () => {
  it('applies Arial to plain text', () => {
    const sourceText = 'hello world';
    const { start, end } = findOffsets(sourceText, 'world');
    const result = applyAddTag(sourceText, start, end, fontArial);

    expect(result).toBe('hello <span style="font-family: Arial">world</span>');
  });

  it('replaces Arial with Courier New (same CSS property, not double-wrap)', () => {
    const step1 = applyAddTag('hello world', 6, 11, fontArial);
    expect(step1).toBe('hello <span style="font-family: Arial">world</span>');

    // Recompute offsets for the inner content "world"
    const { start, end } = findOffsets(step1, 'world');
    const step2 = applyAddTag(step1, start, end, fontCourier);

    expect(step2).toBe('hello <span style="font-family: Courier New">world</span>');
    // Must NOT double-wrap
    expect(step2).not.toContain('<span style="font-family: Arial">');
  });

  it('applies font family + font size → two nested spans (different CSS properties)', () => {
    const step1 = applyAddTag('hello world', 6, 11, fontArial);

    const { start, end } = findOffsets(step1, 'world');
    const step2 = applyAddTag(step1, start, end, fontSize24);

    // Both spans should be present — different CSS properties produce nesting
    expect(step2).toContain('font-family: Arial');
    expect(step2).toContain('font-size: 24pt');
    expect(step2).toContain('world');
  });

  it('applies font family + bold → span wraps around markdown bold', () => {
    const step1 = applyAddTag('hello world', 6, 11, fontArial);
    expect(step1).toBe('hello <span style="font-family: Arial">world</span>');

    // Apply bold to the inner content "world"
    const { start, end } = findOffsets(step1, 'world');
    const context = createContext(step1, start, end);
    const boldResult = toggleTag(context, BOLD_MD_TAG);
    const step2 = applyReplacements(step1, boldResult.replacements);

    // Bold inside an HTML-domain span triggers domain conversion: ** → <b>
    expect(step2).toContain('font-family: Arial');
    expect(step2).toContain('<b>world</b>');
  });

  it('applies font family to text already inside <u> tags → span nested inside underline', () => {
    const sourceText = '<u>hello</u>';
    // "hello" starts at offset 3, ends at 8
    const { start, end } = findOffsets(sourceText, 'hello');
    const result = applyAddTag(sourceText, start, end, fontArial);

    expect(result).toContain('<u>');
    expect(result).toContain('</u>');
    expect(result).toContain('font-family: Arial');
    expect(result).toContain('hello');
  });
});

// ============================================================
// Group 2: Font Size Operations
// ============================================================

describe('Group 2: Font size operations', () => {
  it('applies 24pt to plain text', () => {
    const sourceText = 'some text';
    const { start, end } = findOffsets(sourceText, 'text');
    const result = applyAddTag(sourceText, start, end, fontSize24);

    expect(result).toBe('some <span style="font-size: 24pt">text</span>');
  });

  it('replaces 24pt with 12pt (same CSS property, not double-wrap)', () => {
    const step1 = applyAddTag('some text', 5, 9, fontSize24);
    expect(step1).toBe('some <span style="font-size: 24pt">text</span>');

    const { start, end } = findOffsets(step1, 'text');
    const step2 = applyAddTag(step1, start, end, fontSize12);

    expect(step2).toBe('some <span style="font-size: 12pt">text</span>');
    expect(step2).not.toContain('24pt');
  });

  it('applies font size + underline + bold → multi-layer nesting', () => {
    // Start with plain text, add font size
    const step1 = applyAddTag('hello', 0, 5, fontSize24);
    expect(step1).toBe('<span style="font-size: 24pt">hello</span>');

    // Add underline to inner content
    let { start, end } = findOffsets(step1, 'hello');
    let context = createContext(step1, start, end);
    const underlineResult = toggleTag(context, UNDERLINE_TAG);
    const step2 = applyReplacements(step1, underlineResult.replacements);

    // Add bold to inner content
    ({ start, end } = findOffsets(step2, 'hello'));
    context = createContext(step2, start, end);
    const boldResult = toggleTag(context, BOLD_MD_TAG);
    const step3 = applyReplacements(step2, boldResult.replacements);

    expect(step3).toContain('font-size: 24pt');
    expect(step3).toContain('hello');
    // Underline and bold should both be present
    expect(step3).toContain('<u>');
    expect(step3).toContain('</u>');
  });

  it('applies font size to heading line — prefix preserved', () => {
    const sourceText = '## heading text';
    // Select "heading text" (after "## ")
    const { start, end } = findOffsets(sourceText, 'heading text');
    const result = applyAddTag(sourceText, start, end, fontSize24);

    // The heading prefix "## " should remain at the start
    expect(result).toMatch(/^## /);
    expect(result).toContain('font-size: 24pt');
    expect(result).toContain('heading text');
  });
});

// ============================================================
// Group 3: Font Color Operations
// ============================================================

describe('Group 3: Font color operations', () => {
  it('applies red color to plain text', () => {
    const sourceText = 'hello world';
    const { start, end } = findOffsets(sourceText, 'world');
    const result = applyAddTag(sourceText, start, end, fontColorRed);

    expect(result).toBe('hello <span style="color: #ff0000">world</span>');
  });

  it('replaces red with blue (same CSS property)', () => {
    const step1 = applyAddTag('hello world', 6, 11, fontColorRed);

    const { start, end } = findOffsets(step1, 'world');
    const step2 = applyAddTag(step1, start, end, fontColorBlue);

    expect(step2).toBe('hello <span style="color: #0000ff">world</span>');
    expect(step2).not.toContain('#ff0000');
  });

  it('applies font color + highlight color → two different spans', () => {
    const step1 = applyAddTag('hello world', 6, 11, fontColorRed);

    const { start, end } = findOffsets(step1, 'world');
    const step2 = applyAddTag(step1, start, end, highlightYellow);

    expect(step2).toContain('color: #ff0000');
    expect(step2).toContain('background: #ffff00');
    expect(step2).toContain('world');
  });

  it('applies font color + bold → nesting order', () => {
    const step1 = applyAddTag('hello world', 6, 11, fontColorRed);

    const { start, end } = findOffsets(step1, 'world');
    const context = createContext(step1, start, end);
    const boldResult = toggleTag(context, BOLD_MD_TAG);
    const step2 = applyReplacements(step1, boldResult.replacements);

    // Bold inside an HTML-domain span triggers domain conversion: ** → <b>
    expect(step2).toContain('color: #ff0000');
    expect(step2).toContain('<b>world</b>');
  });

  it('applies font color then removes it → clean removal', () => {
    const step1 = applyAddTag('hello world', 6, 11, fontColorRed);
    expect(step1).toBe('hello <span style="color: #ff0000">world</span>');

    const { start, end } = findOffsets(step1, 'world');
    const context = createContext(step1, start, end);
    const removeResult = removeTag(context, fontColorRed);

    expect(removeResult.isNoOp).toBe(false);

    const step2 = applyReplacements(step1, removeResult.replacements);
    expect(step2).toBe('hello world');
  });

  it('applies font color to already underlined text', () => {
    const sourceText = '<u>hello</u>';
    const { start, end } = findOffsets(sourceText, 'hello');
    const result = applyAddTag(sourceText, start, end, fontColorRed);

    expect(result).toContain('<u>');
    expect(result).toContain('</u>');
    expect(result).toContain('color: #ff0000');
    expect(result).toContain('hello');
  });
});

// ============================================================
// Group 4: Highlight Color Operations (span-based, NOT markdown ==)
// ============================================================

describe('Group 4: Highlight color operations (span-based)', () => {
  it('applies yellow highlight via span', () => {
    const sourceText = 'some text';
    const { start, end } = findOffsets(sourceText, 'text');
    const result = applyAddTag(sourceText, start, end, highlightYellow);

    expect(result).toBe('some <span style="background: #ffff00">text</span>');
  });

  it('replaces yellow with green (same background property)', () => {
    const step1 = applyAddTag('some text', 5, 9, highlightYellow);

    const { start, end } = findOffsets(step1, 'text');
    const step2 = applyAddTag(step1, start, end, highlightGreen);

    expect(step2).toBe('some <span style="background: #00ff00">text</span>');
    expect(step2).not.toContain('#ffff00');
  });

  it('applies highlight span + font color span → both present', () => {
    const step1 = applyAddTag('some text', 5, 9, highlightYellow);

    const { start, end } = findOffsets(step1, 'text');
    const step2 = applyAddTag(step1, start, end, fontColorRed);

    expect(step2).toContain('background: #ffff00');
    expect(step2).toContain('color: #ff0000');
    expect(step2).toContain('text');
  });

  it('applies markdown highlight (==) then adds span highlight → interaction', () => {
    // Start with markdown highlight
    const sourceText = 'some text';
    const context = createContext(sourceText, 5, 9);
    const highlightResult = toggleTag(context, HIGHLIGHT_MD_TAG);
    const step1 = applyReplacements(sourceText, highlightResult.replacements);
    expect(step1).toBe('some ==text==');

    // Now apply span-based background highlight to the inner "text"
    const { start, end } = findOffsets(step1, 'text');
    const step2 = applyAddTag(step1, start, end, highlightYellow);

    // The span highlight is an HTML tag applied inside a markdown domain
    // with existing markdown tokens — domain conversion should kick in
    expect(step2).toContain('background: #ffff00');
    expect(step2).toContain('text');
  });

  it('removes span highlight → clean text', () => {
    const step1 = applyAddTag('some text', 5, 9, highlightYellow);
    expect(step1).toBe('some <span style="background: #ffff00">text</span>');

    const { start, end } = findOffsets(step1, 'text');
    const context = createContext(step1, start, end);
    const removeResult = removeTag(context, highlightYellow);

    expect(removeResult.isNoOp).toBe(false);

    const step2 = applyReplacements(step1, removeResult.replacements);
    expect(step2).toBe('some text');
  });
});

// ============================================================
// Group 5: Alignment (span wrapping pattern)
// ============================================================

describe('Group 5: Alignment (span wrapping)', () => {
  it('plain text + center align', () => {
    const result = applyAlignmentToLine('some text', 'center');
    expect(result).toBe(
      '<span style="display:inline-block;width:100%;vertical-align:top;text-align: center">some text</span>'
    );
  });

  it('heading + center align → prefix preserved outside span', () => {
    const result = applyAlignmentToLine('## My Heading', 'center');
    expect(result).toBe(
      '## <span style="display:inline-block;width:100%;vertical-align:top;text-align: center">My Heading</span>'
    );
  });

  it('already aligned center + right → replaces to right', () => {
    const centered = applyAlignmentToLine('some text', 'center');
    const result = applyAlignmentToLine(centered, 'right');

    expect(result).toBe(
      '<span style="display:inline-block;width:100%;vertical-align:top;text-align: right">some text</span>'
    );
    expect(result).not.toContain('center');
  });

  it('already aligned + left → removes span (left is default)', () => {
    const centered = applyAlignmentToLine('some text', 'center');
    const result = applyAlignmentToLine(centered, 'left');

    expect(result).toBe('some text');
    expect(result).not.toContain('<span');
  });

  it('heading with alignment → heading prefix preserved outside span', () => {
    const centered = applyAlignmentToLine('## My Heading', 'center');
    expect(centered).toBe(
      '## <span style="display:inline-block;width:100%;vertical-align:top;text-align: center">My Heading</span>'
    );

    // Change to right
    const rightAligned = applyAlignmentToLine(centered, 'right');
    expect(rightAligned).toBe(
      '## <span style="display:inline-block;width:100%;vertical-align:top;text-align: right">My Heading</span>'
    );

    // Back to left removes the span but keeps heading prefix
    const leftAligned = applyAlignmentToLine(rightAligned, 'left');
    expect(leftAligned).toBe('## My Heading');
  });

  it('h1 through h6 headings all preserve prefix', () => {
    for (let level = 1; level <= 6; level++) {
      const prefix = '#'.repeat(level) + ' ';
      const lineText = `${prefix}Title`;
      const result = applyAlignmentToLine(lineText, 'center');

      expect(result).toBe(
        `${prefix}<span style="display:inline-block;width:100%;vertical-align:top;text-align: center">Title</span>`
      );
    }
  });

  it('plain text left alignment on unaligned text is a no-op', () => {
    const result = applyAlignmentToLine('plain text', 'left');
    expect(result).toBe('plain text');
  });

  it('legacy div alignment is read and migrated to span on change', () => {
    const legacyLine = '<div style="text-align: center">old content</div>';
    const result = applyAlignmentToLine(legacyLine, 'right');
    expect(result).toBe(
      '<span style="display:inline-block;width:100%;vertical-align:top;text-align: right">old content</span>'
    );
  });

  it('legacy div alignment is unwrapped on left', () => {
    const legacyLine = '## <div style="text-align: center">old heading</div>';
    const result = applyAlignmentToLine(legacyLine, 'left');
    expect(result).toBe('## old heading');
  });

  it('legacy display:block span is read and migrated to inline-block on change', () => {
    const legacyLine = '<span style="display:block;text-align: center">old content</span>';
    const result = applyAlignmentToLine(legacyLine, 'right');
    expect(result).toBe(
      '<span style="display:inline-block;width:100%;vertical-align:top;text-align: right">old content</span>'
    );
  });

  it('legacy display:block span is unwrapped on left', () => {
    const legacyLine = '## <span style="display:block;text-align: center">old heading</span>';
    const result = applyAlignmentToLine(legacyLine, 'left');
    expect(result).toBe('## old heading');
  });

  it('legacy inline-block span without vertical-align is migrated on change', () => {
    const legacyLine =
      '<span style="display:inline-block;width:100%;text-align: center">old content</span>';
    const result = applyAlignmentToLine(legacyLine, 'right');
    expect(result).toBe(
      '<span style="display:inline-block;width:100%;vertical-align:top;text-align: right">old content</span>'
    );
  });
});

// ============================================================
// Group 6: Complex Multi-Property Combinations
// ============================================================

describe('Group 6: Complex multi-property combinations', () => {
  it('font color + font size + font family all on same text → 3 nested spans', () => {
    let text = 'hello';

    text = applyAddTag(text, 0, 5, fontColorRed);
    expect(text).toContain('color: #ff0000');

    let offsets = findOffsets(text, 'hello');
    text = applyAddTag(text, offsets.start, offsets.end, fontSize24);
    expect(text).toContain('font-size: 24pt');

    offsets = findOffsets(text, 'hello');
    text = applyAddTag(text, offsets.start, offsets.end, fontArial);
    expect(text).toContain('font-family: Arial');

    // All three CSS properties present
    expect(text).toContain('color: #ff0000');
    expect(text).toContain('font-size: 24pt');
    expect(text).toContain('font-family: Arial');
    expect(text).toContain('hello');

    // Count span tags — should be 3 opening and 3 closing
    const openingSpanCount = (text.match(/<span /g) || []).length;
    const closingSpanCount = (text.match(/<\/span>/g) || []).length;
    expect(openingSpanCount).toBe(3);
    expect(closingSpanCount).toBe(3);
  });

  it('all three spans + bold + underline → 5-level nesting', () => {
    let text = 'hello';

    // Add 3 CSS spans
    text = applyAddTag(text, 0, 5, fontColorRed);
    let offsets = findOffsets(text, 'hello');
    text = applyAddTag(text, offsets.start, offsets.end, fontSize24);
    offsets = findOffsets(text, 'hello');
    text = applyAddTag(text, offsets.start, offsets.end, fontArial);

    // Add underline
    offsets = findOffsets(text, 'hello');
    let context = createContext(text, offsets.start, offsets.end);
    let result = toggleTag(context, UNDERLINE_TAG);
    text = applyReplacements(text, result.replacements);

    // Add bold
    offsets = findOffsets(text, 'hello');
    context = createContext(text, offsets.start, offsets.end);
    result = toggleTag(context, BOLD_MD_TAG);
    text = applyReplacements(text, result.replacements);

    // All formatting layers present
    expect(text).toContain('color: #ff0000');
    expect(text).toContain('font-size: 24pt');
    expect(text).toContain('font-family: Arial');
    expect(text).toContain('<u>');
    expect(text).toContain('hello');
  });

  it('apply all, then removeAllTags → everything stripped to plain text', () => {
    let text = 'hello';

    // Build up layers
    text = applyAddTag(text, 0, 5, fontColorRed);
    let offsets = findOffsets(text, 'hello');
    text = applyAddTag(text, offsets.start, offsets.end, fontSize24);
    offsets = findOffsets(text, 'hello');
    text = applyAddTag(text, offsets.start, offsets.end, fontArial);
    offsets = findOffsets(text, 'hello');
    let context = createContext(text, offsets.start, offsets.end);
    let result = toggleTag(context, UNDERLINE_TAG);
    text = applyReplacements(text, result.replacements);

    // Verify formatting is present before removal
    expect(text).toContain('<span');
    expect(text).toContain('<u>');

    // Now removeAllTags — select the inner content
    offsets = findOffsets(text, 'hello');
    context = createContext(text, offsets.start, offsets.end);
    result = removeAllTags(context);

    expect(result.isNoOp).toBe(false);

    const cleaned = applyReplacements(text, result.replacements);
    expect(cleaned).toBe('hello');
  });

  it('apply font color + highlight color, then removeTag only removes the specific one', () => {
    let text = 'hello';
    text = applyAddTag(text, 0, 5, fontColorRed);

    let offsets = findOffsets(text, 'hello');
    text = applyAddTag(text, offsets.start, offsets.end, highlightYellow);

    expect(text).toContain('color: #ff0000');
    expect(text).toContain('background: #ffff00');

    // Remove only the highlight
    offsets = findOffsets(text, 'hello');
    const context = createContext(text, offsets.start, offsets.end);
    const removeResult = removeTag(context, highlightYellow);
    expect(removeResult.isNoOp).toBe(false);
    text = applyReplacements(text, removeResult.replacements);

    // Font color should remain, highlight should be gone
    expect(text).toContain('color: #ff0000');
    expect(text).not.toContain('background: #ffff00');
    expect(text).toContain('hello');
  });

  it('apply font-size, then apply same property again with different value → replacement', () => {
    let text = 'hello';
    text = applyAddTag(text, 0, 5, fontSize24);
    expect(text).toBe('<span style="font-size: 24pt">hello</span>');

    const offsets = findOffsets(text, 'hello');
    text = applyAddTag(text, offsets.start, offsets.end, fontSize12);

    expect(text).toBe('<span style="font-size: 12pt">hello</span>');
    // Must NOT have two font-size spans
    const spanCount = (text.match(/<span /g) || []).length;
    expect(spanCount).toBe(1);
  });
});

// ============================================================
// Group 7: CSS Property Replacement Edge Cases
// ============================================================

describe('Group 7: CSS property replacement edge cases', () => {
  it('applying same color to already-colored text replaces with identical value', () => {
    const sourceText = '<span style="color: #ff0000">hello</span>';
    const { start, end } = findOffsets(sourceText, 'hello');
    const context = createContext(sourceText, start, end);
    const result = addTag(context, fontColorRed);

    // Engine should detect same-property span and replace (even if value is same)
    const applied = applyReplacements(sourceText, result.replacements);
    expect(applied).toBe('<span style="color: #ff0000">hello</span>');
  });

  it('applying color to text with background span → adds new span, does not touch background', () => {
    const sourceText = '<span style="background: #ffff00">hello</span>';
    const { start, end } = findOffsets(sourceText, 'hello');
    const result = applyAddTag(sourceText, start, end, fontColorRed);

    // Both spans should be present
    expect(result).toContain('background: #ffff00');
    expect(result).toContain('color: #ff0000');
    expect(result).toContain('hello');
  });

  it('applies font-family Times New Roman (multi-word with spaces)', () => {
    const sourceText = 'hello world';
    const { start, end } = findOffsets(sourceText, 'world');
    const result = applyAddTag(sourceText, start, end, fontTimesNewRoman);

    expect(result).toBe('hello <span style="font-family: Times New Roman">world</span>');
  });

  it('applies font-size 8pt (smallest)', () => {
    const sourceText = 'tiny text';
    const { start, end } = findOffsets(sourceText, 'tiny');
    const result = applyAddTag(sourceText, start, end, fontSize8);

    expect(result).toBe('<span style="font-size: 8pt">tiny</span> text');
  });

  it('applies font-size 72pt (largest)', () => {
    const sourceText = 'huge text';
    const { start, end } = findOffsets(sourceText, 'huge');
    const result = applyAddTag(sourceText, start, end, fontSize72);

    expect(result).toBe('<span style="font-size: 72pt">huge</span> text');
  });

  it('replacing font-family preserves the closing </span> correctly', () => {
    const step1 = applyAddTag('word', 0, 4, fontArial);
    expect(step1).toBe('<span style="font-family: Arial">word</span>');

    const { start, end } = findOffsets(step1, 'word');
    const step2 = applyAddTag(step1, start, end, fontTimesNewRoman);

    // Closing tag should still be valid
    expect(step2).toBe('<span style="font-family: Times New Roman">word</span>');
    expect(step2.endsWith('</span>')).toBe(true);
  });

  it('color span replacement does not affect surrounding text', () => {
    const sourceText = 'before <span style="color: #ff0000">middle</span> after';
    const { start, end } = findOffsets(sourceText, 'middle');
    const result = applyAddTag(sourceText, start, end, fontColorBlue);

    expect(result).toBe('before <span style="color: #0000ff">middle</span> after');
  });
});

// ============================================================
// Group 8: Removing CSS-Based Formatting
// ============================================================

describe('Group 8: Removing CSS-based formatting', () => {
  it('apply font color, then removeTag with matching tag definition → clean text', () => {
    const step1 = applyAddTag('hello', 0, 5, fontColorRed);
    expect(step1).toBe('<span style="color: #ff0000">hello</span>');

    const { start, end } = findOffsets(step1, 'hello');
    const context = createContext(step1, start, end);
    const result = removeTag(context, fontColorRed);

    expect(result.isNoOp).toBe(false);
    expect(applyReplacements(step1, result.replacements)).toBe('hello');
  });

  it('apply font color + bold, removeAllTags → both removed', () => {
    let text = 'hello';
    text = applyAddTag(text, 0, 5, fontColorRed);

    let offsets = findOffsets(text, 'hello');
    const context1 = createContext(text, offsets.start, offsets.end);
    const boldResult = toggleTag(context1, BOLD_MD_TAG);
    text = applyReplacements(text, boldResult.replacements);

    // Bold inside an HTML-domain span triggers domain conversion: ** → <b>
    expect(text).toContain('color: #ff0000');
    expect(text).toContain('<b>hello</b>');

    // removeAllTags on the inner "hello"
    offsets = findOffsets(text, 'hello');
    const context2 = createContext(text, offsets.start, offsets.end);
    const removeResult = removeAllTags(context2);

    expect(removeResult.isNoOp).toBe(false);
    const cleaned = applyReplacements(text, removeResult.replacements);
    expect(cleaned).toBe('hello');
  });

  it('apply multiple spans, removeAllTags strips all spans', () => {
    let text = 'hello';
    text = applyAddTag(text, 0, 5, fontColorRed);

    let offsets = findOffsets(text, 'hello');
    text = applyAddTag(text, offsets.start, offsets.end, fontSize24);

    offsets = findOffsets(text, 'hello');
    text = applyAddTag(text, offsets.start, offsets.end, highlightYellow);

    // Verify all formatting is present
    expect(text).toContain('color: #ff0000');
    expect(text).toContain('font-size: 24pt');
    expect(text).toContain('background: #ffff00');

    // Remove everything
    offsets = findOffsets(text, 'hello');
    const context = createContext(text, offsets.start, offsets.end);
    const result = removeAllTags(context);

    expect(result.isNoOp).toBe(false);
    expect(applyReplacements(text, result.replacements)).toBe('hello');
  });

  it('removeTag with non-matching tag definition → isNoOp', () => {
    const sourceText = '<span style="color: #ff0000">hello</span>';
    const { start, end } = findOffsets(sourceText, 'hello');
    const context = createContext(sourceText, start, end);

    // Try to remove a font-size tag, but only color is present
    const result = removeTag(context, fontSize24);
    expect(result.isNoOp).toBe(true);
  });

  it('removeTag on plain text → isNoOp', () => {
    const sourceText = 'plain text';
    const context = createContext(sourceText, 0, 10);
    const result = removeTag(context, fontColorRed);

    expect(result.isNoOp).toBe(true);
  });

  it('removeAllTags on plain text → isNoOp', () => {
    const sourceText = 'plain text';
    const context = createContext(sourceText, 0, 10);
    const result = removeAllTags(context);

    expect(result.isNoOp).toBe(true);
  });

  it('apply font color, removeTag with different color tag def (same property) → still removes', () => {
    const step1 = applyAddTag('hello', 0, 5, fontColorRed);
    expect(step1).toBe('<span style="color: #ff0000">hello</span>');

    // removeTag using fontColorBlue — same CSS property "color"
    const { start, end } = findOffsets(step1, 'hello');
    const context = createContext(step1, start, end);
    const result = removeTag(context, fontColorBlue);

    // The engine matches by CSS property name, not value, so this should remove
    expect(result.isNoOp).toBe(false);
    expect(applyReplacements(step1, result.replacements)).toBe('hello');
  });
});
