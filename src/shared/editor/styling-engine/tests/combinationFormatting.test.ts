import { toggleTag, addTag, removeTag, removeAllTags } from '../StylingEngine';

import {
  UNDERLINE_TAG,
  SUBSCRIPT_TAG,
  SUPERSCRIPT_TAG,
  BOLD_MD_TAG,
  ITALIC_MD_TAG,
  STRIKETHROUGH_MD_TAG,
  HIGHLIGHT_MD_TAG,
} from '../constants';

import { buildSpanTagDefinition } from '../tag-manipulation/TagManipulation';
import type { StylingContext, TextReplacement } from '../interfaces';

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
 * Finds the start and end offsets of a plain-text needle within a source string.
 * Used to locate "world" (or other content) after formatting has changed offsets.
 */
function findContentOffsets(text: string, needle: string): { start: number; end: number } {
  const start = text.indexOf(needle);

  if (start === -1) {
    throw new Error(`Could not find "${needle}" in "${text}"`);
  }

  return { start, end: start + needle.length };
}

/**
 * Applies a formatting operation and returns the resulting text along with
 * updated offsets for the content word, ready for chaining another operation.
 */
function applyAndRelocate(
  sourceText: string,
  startOffset: number,
  endOffset: number,
  operation: (context: StylingContext) => {
    replacements: TextReplacement[];
    isNoOp: boolean;
  }
): { resultText: string; isNoOp: boolean } {
  const context = createContext(sourceText, startOffset, endOffset);
  const result = operation(context);

  if (result.isNoOp) {
    return { resultText: sourceText, isNoOp: true };
  }

  const resultText = applyReplacements(sourceText, result.replacements);
  return { resultText, isNoOp: false };
}

// ============================================================
// Group 1: Multi-format stacking
// ============================================================

describe('Group 1: Multi-format stacking', () => {
  it('Bold + Italic → produces ***world***', () => {
    // Step 1: Apply bold to "world"
    const step1 = applyAndRelocate('hello world', 6, 11, (context) =>
      toggleTag(context, BOLD_MD_TAG)
    );

    expect(step1.isNoOp).toBe(false);
    expect(step1.resultText).toBe('hello **world**');

    // Step 2: Apply italic to "world" inside bold
    const offsets = findContentOffsets(step1.resultText, 'world');
    const step2 = applyAndRelocate(step1.resultText, offsets.start, offsets.end, (context) =>
      toggleTag(context, ITALIC_MD_TAG)
    );

    expect(step2.isNoOp).toBe(false);
    expect(step2.resultText).toBe('hello ***world***');
  });

  it('Bold + Italic + Underline → domain conversion to HTML', () => {
    // Step 1: Bold
    const step1 = applyAndRelocate('hello world', 6, 11, (context) =>
      toggleTag(context, BOLD_MD_TAG)
    );

    expect(step1.resultText).toBe('hello **world**');

    // Step 2: Italic
    const offsets2 = findContentOffsets(step1.resultText, 'world');
    const step2 = applyAndRelocate(step1.resultText, offsets2.start, offsets2.end, (context) =>
      toggleTag(context, ITALIC_MD_TAG)
    );

    expect(step2.resultText).toBe('hello ***world***');

    // Step 3: Underline triggers domain conversion from MD to HTML
    const offsets3 = findContentOffsets(step2.resultText, 'world');
    const step3 = applyAndRelocate(step2.resultText, offsets3.start, offsets3.end, (context) =>
      toggleTag(context, UNDERLINE_TAG)
    );

    expect(step3.isNoOp).toBe(false);
    // MD *** converts to <b><i> and the whole thing gets wrapped in <u>
    expect(step3.resultText).toBe('hello <u><b><i>world</i></b></u>');
  });

  it('Bold + Strikethrough → nested MD markers', () => {
    // Step 1: Bold
    const step1 = applyAndRelocate('hello world', 6, 11, (context) =>
      toggleTag(context, BOLD_MD_TAG)
    );

    expect(step1.resultText).toBe('hello **world**');

    // Step 2: Strikethrough inside bold
    const offsets = findContentOffsets(step1.resultText, 'world');
    const step2 = applyAndRelocate(step1.resultText, offsets.start, offsets.end, (context) =>
      toggleTag(context, STRIKETHROUGH_MD_TAG)
    );

    expect(step2.isNoOp).toBe(false);
    expect(step2.resultText).toBe('hello **~~world~~**');
  });

  it('Highlight + Strikethrough → nested MD markers', () => {
    // Step 1: Highlight
    const step1 = applyAndRelocate('hello world', 6, 11, (context) =>
      toggleTag(context, HIGHLIGHT_MD_TAG)
    );

    expect(step1.resultText).toBe('hello ==world==');

    // Step 2: Strikethrough inside highlight
    const offsets = findContentOffsets(step1.resultText, 'world');
    const step2 = applyAndRelocate(step1.resultText, offsets.start, offsets.end, (context) =>
      toggleTag(context, STRIKETHROUGH_MD_TAG)
    );

    expect(step2.isNoOp).toBe(false);
    expect(step2.resultText).toBe('hello ==~~world~~==');
  });

  it('Underline + Subscript → nested HTML tags', () => {
    // Step 1: Underline
    const step1 = applyAndRelocate('hello world', 6, 11, (context) =>
      toggleTag(context, UNDERLINE_TAG)
    );

    expect(step1.resultText).toBe('hello <u>world</u>');

    // Step 2: Subscript inside underline
    const offsets = findContentOffsets(step1.resultText, 'world');
    const step2 = applyAndRelocate(step1.resultText, offsets.start, offsets.end, (context) =>
      toggleTag(context, SUBSCRIPT_TAG)
    );

    expect(step2.isNoOp).toBe(false);
    expect(step2.resultText).toBe('hello <u><sub>world</sub></u>');
  });

  it('Superscript + Bold → triggers domain conversion to HTML bold', () => {
    // Step 1: Superscript (HTML domain)
    const step1 = applyAndRelocate('hello world', 6, 11, (context) =>
      toggleTag(context, SUPERSCRIPT_TAG)
    );

    expect(step1.resultText).toBe('hello <sup>world</sup>');

    // Step 2: Bold in HTML domain → should use <b> instead of **
    const offsets = findContentOffsets(step1.resultText, 'world');
    const step2 = applyAndRelocate(step1.resultText, offsets.start, offsets.end, (context) =>
      toggleTag(context, BOLD_MD_TAG)
    );

    expect(step2.isNoOp).toBe(false);
    // In HTML domain, MD bold is substituted with HTML <b>
    expect(step2.resultText).toBe('hello <sup><b>world</b></sup>');
  });
});

// ============================================================
// Group 2: Toggle off in combinations
// ============================================================

describe('Group 2: Toggle off in combinations', () => {
  it('Apply Bold + Italic, then toggle Bold off → only italic remains', () => {
    // Step 1: Bold
    const step1 = applyAndRelocate('hello world', 6, 11, (context) =>
      toggleTag(context, BOLD_MD_TAG)
    );

    // Step 2: Italic
    const offsets2 = findContentOffsets(step1.resultText, 'world');
    const step2 = applyAndRelocate(step1.resultText, offsets2.start, offsets2.end, (context) =>
      toggleTag(context, ITALIC_MD_TAG)
    );

    expect(step2.resultText).toBe('hello ***world***');

    // Step 3: Toggle bold off
    const offsets3 = findContentOffsets(step2.resultText, 'world');
    const step3 = applyAndRelocate(step2.resultText, offsets3.start, offsets3.end, (context) =>
      toggleTag(context, BOLD_MD_TAG)
    );

    expect(step3.isNoOp).toBe(false);
    expect(step3.resultText).toBe('hello *world*');
  });

  it('Apply Underline + Bold, then toggle Underline off → only bold remains (HTML bold)', () => {
    // Step 1: Underline
    const step1 = applyAndRelocate('hello world', 6, 11, (context) =>
      toggleTag(context, UNDERLINE_TAG)
    );

    expect(step1.resultText).toBe('hello <u>world</u>');

    // Step 2: Bold (in HTML domain, so it becomes <b>)
    const offsets2 = findContentOffsets(step1.resultText, 'world');
    const step2 = applyAndRelocate(step1.resultText, offsets2.start, offsets2.end, (context) =>
      toggleTag(context, BOLD_MD_TAG)
    );

    expect(step2.resultText).toBe('hello <u><b>world</b></u>');

    // Step 3: Toggle underline off — bold remains
    const offsets3 = findContentOffsets(step2.resultText, 'world');
    const step3 = applyAndRelocate(step2.resultText, offsets3.start, offsets3.end, (context) =>
      toggleTag(context, UNDERLINE_TAG)
    );

    expect(step3.isNoOp).toBe(false);
    expect(step3.resultText).toBe('hello <b>world</b>');
  });

  it('Apply Bold + Italic + Underline, then removeAllTags → plain text', () => {
    // Step 1: Bold
    const step1 = applyAndRelocate('hello world', 6, 11, (context) =>
      toggleTag(context, BOLD_MD_TAG)
    );

    // Step 2: Italic
    const offsets2 = findContentOffsets(step1.resultText, 'world');
    const step2 = applyAndRelocate(step1.resultText, offsets2.start, offsets2.end, (context) =>
      toggleTag(context, ITALIC_MD_TAG)
    );

    // Step 3: Underline (triggers domain conversion)
    const offsets3 = findContentOffsets(step2.resultText, 'world');
    const step3 = applyAndRelocate(step2.resultText, offsets3.start, offsets3.end, (context) =>
      toggleTag(context, UNDERLINE_TAG)
    );

    expect(step3.resultText).toBe('hello <u><b><i>world</i></b></u>');

    // Step 4: removeAllTags
    const offsets4 = findContentOffsets(step3.resultText, 'world');
    const context4 = createContext(step3.resultText, offsets4.start, offsets4.end);
    const result4 = removeAllTags(context4);

    expect(result4.isNoOp).toBe(false);
    expect(applyReplacements(step3.resultText, result4.replacements)).toBe('hello world');
  });
});

// ============================================================
// Group 3: CSS property combinations
// ============================================================

describe('Group 3: CSS property combinations', () => {
  it('Font color + highlight color on same text → two nested spans', () => {
    const fontColorTag = buildSpanTagDefinition('color', '#ff0000');
    const highlightColorTag = buildSpanTagDefinition('background', '#00ff00');

    // Step 1: Font color
    const step1 = applyAndRelocate('hello world', 6, 11, (context) =>
      addTag(context, fontColorTag)
    );

    expect(step1.isNoOp).toBe(false);
    expect(step1.resultText).toBe('hello <span style="color: #ff0000">world</span>');

    // Step 2: Highlight color (different CSS property → new span, not replacement)
    const offsets = findContentOffsets(step1.resultText, 'world');
    const step2 = applyAndRelocate(step1.resultText, offsets.start, offsets.end, (context) =>
      addTag(context, highlightColorTag)
    );

    expect(step2.isNoOp).toBe(false);
    expect(step2.resultText).toBe(
      'hello <span style="color: #ff0000"><span style="background: #00ff00">world</span></span>'
    );
  });

  it('Font family + font size on same text → two nested spans', () => {
    const fontFamilyTag = buildSpanTagDefinition('font-family', 'Arial');
    const fontSizeTag = buildSpanTagDefinition('font-size', '24pt');

    // Step 1: Font family
    const step1 = applyAndRelocate('hello world', 6, 11, (context) =>
      addTag(context, fontFamilyTag)
    );

    expect(step1.resultText).toBe('hello <span style="font-family: Arial">world</span>');

    // Step 2: Font size
    const offsets = findContentOffsets(step1.resultText, 'world');
    const step2 = applyAndRelocate(step1.resultText, offsets.start, offsets.end, (context) =>
      addTag(context, fontSizeTag)
    );

    expect(step2.isNoOp).toBe(false);
    expect(step2.resultText).toBe(
      'hello <span style="font-family: Arial"><span style="font-size: 24pt">world</span></span>'
    );
  });

  it('Font color + bold → span wrapping HTML bold', () => {
    const fontColorTag = buildSpanTagDefinition('color', '#ff0000');

    // Step 1: Font color (HTML domain)
    const step1 = applyAndRelocate('hello world', 6, 11, (context) =>
      addTag(context, fontColorTag)
    );

    expect(step1.resultText).toBe('hello <span style="color: #ff0000">world</span>');

    // Step 2: Bold in HTML domain → should use <b>
    const offsets = findContentOffsets(step1.resultText, 'world');
    const step2 = applyAndRelocate(step1.resultText, offsets.start, offsets.end, (context) =>
      toggleTag(context, BOLD_MD_TAG)
    );

    expect(step2.isNoOp).toBe(false);
    // In HTML domain, MD bold gets substituted with <b>
    expect(step2.resultText).toBe('hello <span style="color: #ff0000"><b>world</b></span>');
  });

  it('Font size + underline + bold → triple nesting', () => {
    const fontSizeTag = buildSpanTagDefinition('font-size', '24pt');

    // Step 1: Font size
    const step1 = applyAndRelocate('hello world', 6, 11, (context) => addTag(context, fontSizeTag));

    expect(step1.resultText).toBe('hello <span style="font-size: 24pt">world</span>');

    // Step 2: Underline
    const offsets2 = findContentOffsets(step1.resultText, 'world');
    const step2 = applyAndRelocate(step1.resultText, offsets2.start, offsets2.end, (context) =>
      toggleTag(context, UNDERLINE_TAG)
    );

    expect(step2.isNoOp).toBe(false);
    expect(step2.resultText).toBe('hello <span style="font-size: 24pt"><u>world</u></span>');

    // Step 3: Bold (in HTML domain)
    const offsets3 = findContentOffsets(step2.resultText, 'world');
    const step3 = applyAndRelocate(step2.resultText, offsets3.start, offsets3.end, (context) =>
      toggleTag(context, BOLD_MD_TAG)
    );

    expect(step3.isNoOp).toBe(false);
    expect(step3.resultText).toBe('hello <span style="font-size: 24pt"><u><b>world</b></u></span>');
  });
});

// ============================================================
// Group 4: Line prefix + formatting combinations
// ============================================================

describe('Group 4: Line prefix + formatting combinations', () => {
  it('Heading + Bold → heading prefix preserved', () => {
    const sourceText = '## Heading text';
    // Select "text" (offsets 11-15)
    const offsets = findContentOffsets(sourceText, 'text');
    const step1 = applyAndRelocate(sourceText, offsets.start, offsets.end, (context) =>
      toggleTag(context, BOLD_MD_TAG)
    );

    expect(step1.isNoOp).toBe(false);
    expect(step1.resultText).toBe('## Heading **text**');
  });

  it('Todo + Underline → todo prefix preserved', () => {
    const sourceText = '- [ ] todo item';
    const offsets = findContentOffsets(sourceText, 'item');
    const step1 = applyAndRelocate(sourceText, offsets.start, offsets.end, (context) =>
      toggleTag(context, UNDERLINE_TAG)
    );

    expect(step1.isNoOp).toBe(false);
    expect(step1.resultText).toBe('- [ ] todo <u>item</u>');
  });

  it('Callout + Italic → callout prefix preserved', () => {
    const sourceText = '> callout text';
    const offsets = findContentOffsets(sourceText, 'text');
    const step1 = applyAndRelocate(sourceText, offsets.start, offsets.end, (context) =>
      toggleTag(context, ITALIC_MD_TAG)
    );

    expect(step1.isNoOp).toBe(false);
    expect(step1.resultText).toBe('> callout *text*');
  });

  it('Numbered list + Strikethrough → prefix preserved', () => {
    const sourceText = '1. numbered item';
    const offsets = findContentOffsets(sourceText, 'item');
    const step1 = applyAndRelocate(sourceText, offsets.start, offsets.end, (context) =>
      toggleTag(context, STRIKETHROUGH_MD_TAG)
    );

    expect(step1.isNoOp).toBe(false);
    expect(step1.resultText).toBe('1. numbered ~~item~~');
  });

  it('Bullet + Bold + Italic (triple combo on list item)', () => {
    const sourceText = '- list item';
    // Select "item"
    const offsets1 = findContentOffsets(sourceText, 'item');

    // Step 1: Bold
    const step1 = applyAndRelocate(sourceText, offsets1.start, offsets1.end, (context) =>
      toggleTag(context, BOLD_MD_TAG)
    );

    expect(step1.resultText).toBe('- list **item**');

    // Step 2: Italic
    const offsets2 = findContentOffsets(step1.resultText, 'item');
    const step2 = applyAndRelocate(step1.resultText, offsets2.start, offsets2.end, (context) =>
      toggleTag(context, ITALIC_MD_TAG)
    );

    expect(step2.resultText).toBe('- list ***item***');

    // Step 3: Underline (triggers domain conversion)
    const offsets3 = findContentOffsets(step2.resultText, 'item');
    const step3 = applyAndRelocate(step2.resultText, offsets3.start, offsets3.end, (context) =>
      toggleTag(context, UNDERLINE_TAG)
    );

    expect(step3.isNoOp).toBe(false);
    // Domain conversion converts *** to <b><i> and wraps in <u>
    expect(step3.resultText).toBe('- list <u><b><i>item</i></b></u>');
  });
});

// ============================================================
// Group 5: Clear formatting on complex combinations
// ============================================================

describe('Group 5: Clear formatting on complex combinations', () => {
  it('Apply Bold + Italic + Underline + Font color, then removeAllTags → plain text', () => {
    const fontColorTag = buildSpanTagDefinition('color', '#ff0000');

    // Step 1: Bold
    const step1 = applyAndRelocate('hello world', 6, 11, (context) =>
      toggleTag(context, BOLD_MD_TAG)
    );

    // Step 2: Italic
    const offsets2 = findContentOffsets(step1.resultText, 'world');
    const step2 = applyAndRelocate(step1.resultText, offsets2.start, offsets2.end, (context) =>
      toggleTag(context, ITALIC_MD_TAG)
    );

    // Step 3: Underline (triggers domain conversion)
    const offsets3 = findContentOffsets(step2.resultText, 'world');
    const step3 = applyAndRelocate(step2.resultText, offsets3.start, offsets3.end, (context) =>
      toggleTag(context, UNDERLINE_TAG)
    );

    expect(step3.resultText).toBe('hello <u><b><i>world</i></b></u>');

    // Step 4: Add font color
    const offsets4 = findContentOffsets(step3.resultText, 'world');
    const step4 = applyAndRelocate(step3.resultText, offsets4.start, offsets4.end, (context) =>
      addTag(context, fontColorTag)
    );

    expect(step4.isNoOp).toBe(false);
    expect(step4.resultText).toBe(
      'hello <u><b><i><span style="color: #ff0000">world</span></i></b></u>'
    );

    // Step 5: removeAllTags
    const offsets5 = findContentOffsets(step4.resultText, 'world');
    const context5 = createContext(step4.resultText, offsets5.start, offsets5.end);
    const result5 = removeAllTags(context5);

    expect(result5.isNoOp).toBe(false);
    expect(applyReplacements(step4.resultText, result5.replacements)).toBe('hello world');
  });

  it('Apply Bold + Highlight, then removeTag(BOLD_MD_TAG) → only highlight remains', () => {
    // Step 1: Bold
    const step1 = applyAndRelocate('hello world', 6, 11, (context) =>
      toggleTag(context, BOLD_MD_TAG)
    );

    // Step 2: Highlight
    const offsets2 = findContentOffsets(step1.resultText, 'world');
    const step2 = applyAndRelocate(step1.resultText, offsets2.start, offsets2.end, (context) =>
      toggleTag(context, HIGHLIGHT_MD_TAG)
    );

    expect(step2.resultText).toBe('hello **==world==**');

    // Step 3: Remove bold specifically
    const offsets3 = findContentOffsets(step2.resultText, 'world');
    const context3 = createContext(step2.resultText, offsets3.start, offsets3.end);
    const result3 = removeTag(context3, BOLD_MD_TAG);

    expect(result3.isNoOp).toBe(false);
    expect(applyReplacements(step2.resultText, result3.replacements)).toBe('hello ==world==');
  });

  it('Apply font color span on heading, removeAllTags → heading prefix + plain text', () => {
    const fontColorTag = buildSpanTagDefinition('color', '#ff0000');

    const sourceText = '## Heading text';
    const offsets1 = findContentOffsets(sourceText, 'text');

    // Step 1: Add font color to "text"
    const step1 = applyAndRelocate(sourceText, offsets1.start, offsets1.end, (context) =>
      addTag(context, fontColorTag)
    );

    expect(step1.resultText).toBe('## Heading <span style="color: #ff0000">text</span>');

    // Step 2: removeAllTags on "text"
    const offsets2 = findContentOffsets(step1.resultText, 'text');
    const context2 = createContext(step1.resultText, offsets2.start, offsets2.end);
    const result2 = removeAllTags(context2);

    expect(result2.isNoOp).toBe(false);
    expect(applyReplacements(step1.resultText, result2.replacements)).toBe('## Heading text');
  });
});

// ============================================================
// Group 6: Edge cases
// ============================================================

describe('Group 6: Edge cases', () => {
  it('Apply same tag twice (toggleTag Bold twice) → returns to original', () => {
    // Step 1: Bold
    const step1 = applyAndRelocate('hello world', 6, 11, (context) =>
      toggleTag(context, BOLD_MD_TAG)
    );

    expect(step1.resultText).toBe('hello **world**');

    // Step 2: Toggle bold again — should remove
    const offsets = findContentOffsets(step1.resultText, 'world');
    const step2 = applyAndRelocate(step1.resultText, offsets.start, offsets.end, (context) =>
      toggleTag(context, BOLD_MD_TAG)
    );

    expect(step2.isNoOp).toBe(false);
    expect(step2.resultText).toBe('hello world');
  });

  it('Apply Bold on already bold+italic text → removes bold, leaves italic', () => {
    // Start with bold+italic text
    const sourceText = '***world***';
    // "world" is at offsets 3-8
    const offsets = findContentOffsets(sourceText, 'world');

    const step1 = applyAndRelocate(sourceText, offsets.start, offsets.end, (context) =>
      toggleTag(context, BOLD_MD_TAG)
    );

    expect(step1.isNoOp).toBe(false);
    expect(step1.resultText).toBe('*world*');
  });

  it('Zero-width selection (cursor) + toggleTag → inserts empty tag pair', () => {
    const sourceText = 'hello world';
    // Cursor at position 6 (just before "world"), zero-width selection
    const context = createContext(sourceText, 6, 6);

    const result = toggleTag(context, BOLD_MD_TAG);

    expect(result.isNoOp).toBe(false);
    const applied = applyReplacements(sourceText, result.replacements);
    expect(applied).toBe('hello ****world');
  });

  it('Apply formatting to text containing wikilink: splits around link', () => {
    const sourceText = 'hello [[link]] world';
    // Select from "hello" to "world" (0-20)
    const context = createContext(sourceText, 0, 20);

    const result = toggleTag(context, UNDERLINE_TAG);

    expect(result.isNoOp).toBe(false);
    const applied = applyReplacements(sourceText, result.replacements);
    // Formatting should split around the wikilink
    expect(applied).toBe('<u>hello </u>[[link]]<u> world</u>');
  });

  it('Apply formatting to text containing inline code → not detected as inert for partial-line selections', () => {
    // BUG: Inert zone detection operates at the line level. Inline code makes a line inert
    // only if the entire line falls within the inert range. A selection inside inline code
    // on a line that also contains non-code text is NOT detected as inert.
    // Expected: isNoOp should be true (formatting inside inline code is semantically wrong).
    // Actual: the engine allows it because the line is not fully inert.
    const sourceText = 'hello `code` world';
    const context = createContext(sourceText, 7, 11);

    const result = toggleTag(context, BOLD_MD_TAG);

    // Asserts actual (buggy) behavior: engine wraps content inside backticks
    expect(result.isNoOp).toBe(false);
    const applied = applyReplacements(sourceText, result.replacements);
    expect(applied).toBe('hello `**code**` world');
  });

  it('Toggle underline twice → returns to original', () => {
    // Step 1: Add underline
    const step1 = applyAndRelocate('hello world', 6, 11, (context) =>
      toggleTag(context, UNDERLINE_TAG)
    );

    expect(step1.resultText).toBe('hello <u>world</u>');

    // Step 2: Toggle underline again — should remove
    const offsets = findContentOffsets(step1.resultText, 'world');
    const step2 = applyAndRelocate(step1.resultText, offsets.start, offsets.end, (context) =>
      toggleTag(context, UNDERLINE_TAG)
    );

    expect(step2.isNoOp).toBe(false);
    expect(step2.resultText).toBe('hello world');
  });

  it('removeAllTags on plain text → no-op', () => {
    const context = createContext('hello world', 6, 11);
    const result = removeAllTags(context);

    expect(result.isNoOp).toBe(true);
    expect(result.replacements).toHaveLength(0);
  });

  it('Bold then Strikethrough then remove Strikethrough → only bold remains', () => {
    // Step 1: Bold
    const step1 = applyAndRelocate('hello world', 6, 11, (context) =>
      toggleTag(context, BOLD_MD_TAG)
    );

    // Step 2: Strikethrough
    const offsets2 = findContentOffsets(step1.resultText, 'world');
    const step2 = applyAndRelocate(step1.resultText, offsets2.start, offsets2.end, (context) =>
      toggleTag(context, STRIKETHROUGH_MD_TAG)
    );

    expect(step2.resultText).toBe('hello **~~world~~**');

    // Step 3: Remove strikethrough
    const offsets3 = findContentOffsets(step2.resultText, 'world');
    const context3 = createContext(step2.resultText, offsets3.start, offsets3.end);
    const result3 = removeTag(context3, STRIKETHROUGH_MD_TAG);

    expect(result3.isNoOp).toBe(false);
    expect(applyReplacements(step2.resultText, result3.replacements)).toBe('hello **world**');
  });

  it('Span attribute replacement: change font color on already colored text', () => {
    const redTag = buildSpanTagDefinition('color', '#ff0000');
    const blueTag = buildSpanTagDefinition('color', '#0000ff');

    // Step 1: Red color
    const step1 = applyAndRelocate('hello world', 6, 11, (context) => addTag(context, redTag));

    expect(step1.resultText).toBe('hello <span style="color: #ff0000">world</span>');

    // Step 2: Change to blue (addTag replaces same CSS property)
    const offsets = findContentOffsets(step1.resultText, 'world');
    const step2 = applyAndRelocate(step1.resultText, offsets.start, offsets.end, (context) =>
      addTag(context, blueTag)
    );

    expect(step2.isNoOp).toBe(false);
    expect(step2.resultText).toBe('hello <span style="color: #0000ff">world</span>');
  });

  it('Multiple CSS properties then removeAllTags strips everything', () => {
    const fontColorTag = buildSpanTagDefinition('color', '#ff0000');
    const fontSizeTag = buildSpanTagDefinition('font-size', '24pt');

    // Step 1: Font color
    const step1 = applyAndRelocate('hello world', 6, 11, (context) =>
      addTag(context, fontColorTag)
    );

    // Step 2: Font size
    const offsets2 = findContentOffsets(step1.resultText, 'world');
    const step2 = applyAndRelocate(step1.resultText, offsets2.start, offsets2.end, (context) =>
      addTag(context, fontSizeTag)
    );

    expect(step2.resultText).toBe(
      'hello <span style="color: #ff0000"><span style="font-size: 24pt">world</span></span>'
    );

    // Step 3: removeAllTags
    const offsets3 = findContentOffsets(step2.resultText, 'world');
    const context3 = createContext(step2.resultText, offsets3.start, offsets3.end);
    const result3 = removeAllTags(context3);

    expect(result3.isNoOp).toBe(false);
    expect(applyReplacements(step2.resultText, result3.replacements)).toBe('hello world');
  });
});

// ============================================================
// Group 7: Bullet list + formatting combinations
// ============================================================

describe('Group 7: Bullet list + formatting combinations', () => {
  // -- Highlight on bullet content --

  it('Bullet + Highlight → prefix preserved', () => {
    const source = '- list item';
    const offsets = findContentOffsets(source, 'item');
    const result = applyAndRelocate(source, offsets.start, offsets.end, (context) =>
      toggleTag(context, HIGHLIGHT_MD_TAG)
    );

    expect(result.isNoOp).toBe(false);
    expect(result.resultText).toBe('- list ==item==');
  });

  // -- Subscript on bullet content --

  it('Bullet + Subscript → prefix preserved', () => {
    const source = '- H2O formula';
    const offsets = findContentOffsets(source, '2');
    const result = applyAndRelocate(source, offsets.start, offsets.end, (context) =>
      toggleTag(context, SUBSCRIPT_TAG)
    );

    expect(result.isNoOp).toBe(false);
    expect(result.resultText).toBe('- H<sub>2</sub>O formula');
  });

  // -- Superscript on bullet content --

  it('Bullet + Superscript → prefix preserved', () => {
    const source = '- E=mc2 energy';
    const offsets = findContentOffsets(source, '2');
    const result = applyAndRelocate(source, offsets.start, offsets.end, (context) =>
      toggleTag(context, SUPERSCRIPT_TAG)
    );

    expect(result.isNoOp).toBe(false);
    expect(result.resultText).toBe('- E=mc<sup>2</sup> energy');
  });

  // -- Font color (span CSS) on bullet content --

  it('Bullet + Font color → prefix preserved', () => {
    const source = '- colored text';
    const fontColorTag = buildSpanTagDefinition('color', '#ff0000');
    const offsets = findContentOffsets(source, 'colored');
    const result = applyAndRelocate(source, offsets.start, offsets.end, (context) =>
      addTag(context, fontColorTag)
    );

    expect(result.isNoOp).toBe(false);
    expect(result.resultText).toBe('- <span style="color: #ff0000">colored</span> text');
  });

  // -- Background color (span CSS) on bullet content --

  it('Bullet + Background color → prefix preserved', () => {
    const source = '- highlighted text';
    const backgroundColorTag = buildSpanTagDefinition('background-color', '#ffff00');
    const offsets = findContentOffsets(source, 'highlighted');
    const result = applyAndRelocate(source, offsets.start, offsets.end, (context) =>
      addTag(context, backgroundColorTag)
    );

    expect(result.isNoOp).toBe(false);
    expect(result.resultText).toBe(
      '- <span style="background-color: #ffff00">highlighted</span> text'
    );
  });

  // -- Font size (span CSS) on bullet content --

  it('Bullet + Font size → prefix preserved', () => {
    const source = '- sized text';
    const fontSizeTag = buildSpanTagDefinition('font-size', '24pt');
    const offsets = findContentOffsets(source, 'sized');
    const result = applyAndRelocate(source, offsets.start, offsets.end, (context) =>
      addTag(context, fontSizeTag)
    );

    expect(result.isNoOp).toBe(false);
    expect(result.resultText).toBe('- <span style="font-size: 24pt">sized</span> text');
  });

  // -- removeAllTags on formatted bullet content --

  it('Bullet + removeAllTags → strips formatting, preserves prefix', () => {
    const source = '- **bold** text';
    const offsets = findContentOffsets(source, 'bold');
    const context = createContext(source, offsets.start, offsets.end);
    const result = removeAllTags(context);

    expect(result.isNoOp).toBe(false);
    expect(applyReplacements(source, result.replacements)).toBe('- bold text');
  });

  // -- removeAllTags on multi-formatted bullet content --

  it('Bullet + stacked formats + removeAllTags → strips all, preserves prefix', () => {
    const source = '- <u><b>styled</b></u> text';
    const offsets = findContentOffsets(source, 'styled');
    const context = createContext(source, offsets.start, offsets.end);
    const result = removeAllTags(context);

    expect(result.isNoOp).toBe(false);
    expect(applyReplacements(source, result.replacements)).toBe('- styled text');
  });

  // -- Nested bullet + font color --

  it('Nested bullet + Font color → indented prefix preserved', () => {
    const source = '  - nested item';
    const fontColorTag = buildSpanTagDefinition('color', '#00ff00');
    const offsets = findContentOffsets(source, 'nested');
    const result = applyAndRelocate(source, offsets.start, offsets.end, (context) =>
      addTag(context, fontColorTag)
    );

    expect(result.isNoOp).toBe(false);
    expect(result.resultText).toBe('  - <span style="color: #00ff00">nested</span> item');
  });

  // -- Numbered list + highlight --

  it('Numbered list + Highlight → prefix preserved', () => {
    const source = '1. numbered item';
    const offsets = findContentOffsets(source, 'item');
    const result = applyAndRelocate(source, offsets.start, offsets.end, (context) =>
      toggleTag(context, HIGHLIGHT_MD_TAG)
    );

    expect(result.isNoOp).toBe(false);
    expect(result.resultText).toBe('1. numbered ==item==');
  });

  // -- Task + subscript --

  it('Task + Subscript → task prefix preserved', () => {
    const source = '- [ ] H2O formula';
    const offsets = findContentOffsets(source, '2');
    const result = applyAndRelocate(source, offsets.start, offsets.end, (context) =>
      toggleTag(context, SUBSCRIPT_TAG)
    );

    expect(result.isNoOp).toBe(false);
    expect(result.resultText).toBe('- [ ] H<sub>2</sub>O formula');
  });

  // -- Bullet + bold + highlight stacked --

  it('Bullet + Bold then Highlight → both applied, prefix preserved', () => {
    const source = '- list item';
    const offsets1 = findContentOffsets(source, 'item');

    // Step 1: Bold
    const step1 = applyAndRelocate(source, offsets1.start, offsets1.end, (context) =>
      toggleTag(context, BOLD_MD_TAG)
    );

    expect(step1.resultText).toBe('- list **item**');

    // Step 2: Highlight on "item" inside bold
    const offsets2 = findContentOffsets(step1.resultText, 'item');
    const step2 = applyAndRelocate(step1.resultText, offsets2.start, offsets2.end, (context) =>
      toggleTag(context, HIGHLIGHT_MD_TAG)
    );

    expect(step2.resultText).toBe('- list **==item==**');
  });

  // -- Bullet + font color + font size stacked --

  it('Bullet + Font color then Font size → both spans, prefix preserved', () => {
    const source = '- styled text';
    const fontColorTag = buildSpanTagDefinition('color', '#ff0000');
    const fontSizeTag = buildSpanTagDefinition('font-size', '18pt');

    // Step 1: Font color
    const step1 = applyAndRelocate(source, 2, 8, (context) => addTag(context, fontColorTag));

    expect(step1.resultText).toBe('- <span style="color: #ff0000">styled</span> text');

    // Step 2: Font size on "styled" inside color span
    const offsets2 = findContentOffsets(step1.resultText, 'styled');
    const step2 = applyAndRelocate(step1.resultText, offsets2.start, offsets2.end, (context) =>
      addTag(context, fontSizeTag)
    );

    expect(step2.resultText).toBe(
      '- <span style="color: #ff0000"><span style="font-size: 18pt">styled</span></span> text'
    );
  });

  // -- Bullet + removeAllTags on span CSS formatted content --

  it('Bullet + span CSS + removeAllTags → strips spans, preserves prefix', () => {
    const source = '- <span style="color: #ff0000">colored</span> text';
    const offsets = findContentOffsets(source, 'colored');
    const context = createContext(source, offsets.start, offsets.end);
    const result = removeAllTags(context);

    expect(result.isNoOp).toBe(false);
    expect(applyReplacements(source, result.replacements)).toBe('- colored text');
  });
});

// ============================================================
// Group 8: Multi-line list formatting
// ============================================================

describe('Group 8: Multi-line list formatting', () => {
  it('Bold on multi-line bullet list → each line content individually wrapped', () => {
    const source = '- Item one\n- Item two\n- Item three';
    const context = createContext(source, 0, source.length);
    const result = toggleTag(context, BOLD_MD_TAG);

    expect(result.isNoOp).toBe(false);
    expect(applyReplacements(source, result.replacements)).toBe(
      '- **Item one**\n- **Item two**\n- **Item three**'
    );
  });

  it('Toggle bold off on multi-line bold list → removes per line', () => {
    const source = '- **Item one**\n- **Item two**\n- **Item three**';
    const context = createContext(source, 0, source.length);
    const result = toggleTag(context, BOLD_MD_TAG);

    expect(result.isNoOp).toBe(false);
    expect(applyReplacements(source, result.replacements)).toBe(
      '- Item one\n- Item two\n- Item three'
    );
  });

  it('Underline on multi-line numbered list → each line independently wrapped', () => {
    const source = '1. First\n2. Second';
    const context = createContext(source, 0, source.length);
    const result = toggleTag(context, UNDERLINE_TAG);

    expect(result.isNoOp).toBe(false);
    expect(applyReplacements(source, result.replacements)).toBe(
      '1. <u>First</u>\n2. <u>Second</u>'
    );
  });

  it('addTag font color on multi-line bullets → per-line spans', () => {
    const source = '- Item one\n- Item two';
    const fontColorTag = buildSpanTagDefinition('color', '#ff0000');
    const context = createContext(source, 0, source.length);
    const result = addTag(context, fontColorTag);

    expect(result.isNoOp).toBe(false);
    expect(applyReplacements(source, result.replacements)).toBe(
      '- <span style="color: #ff0000">Item one</span>\n- <span style="color: #ff0000">Item two</span>'
    );
  });

  it('Partial selection across two bullet lines → wraps content portions only', () => {
    const source = '- Item one\n- Item two';
    // Select from middle of "one" to middle of "Item" on line 2
    // "one" starts at offset 7, "Item" on line 2 starts at offset 13
    const context = createContext(source, 7, 17);
    const result = toggleTag(context, BOLD_MD_TAG);

    expect(result.isNoOp).toBe(false);
    expect(applyReplacements(source, result.replacements)).toBe('- Item **one**\n- **Item** two');
  });

  it('Bold on mixed bullet + plain text lines → per-line wrap', () => {
    const source = '- Item one\nPlain text\n- Item two';
    const context = createContext(source, 0, source.length);
    const result = toggleTag(context, BOLD_MD_TAG);

    expect(result.isNoOp).toBe(false);
    expect(applyReplacements(source, result.replacements)).toBe(
      '- **Item one**\n**Plain text**\n- **Item two**'
    );
  });

  it('Toggle bold adds to lines missing bold, skips lines already bold', () => {
    const source = '- **Item one**\n- Item two\n- **Item three**';
    const context = createContext(source, 0, source.length);
    const result = toggleTag(context, BOLD_MD_TAG);

    expect(result.isNoOp).toBe(false);
    // Only line 2 gets bold added; lines 1 and 3 already have it
    expect(applyReplacements(source, result.replacements)).toBe(
      '- **Item one**\n- **Item two**\n- **Item three**'
    );
  });

  it('Italic on multi-line todo list → prefix preserved per line', () => {
    const source = '- [ ] Task one\n- [ ] Task two';
    const context = createContext(source, 0, source.length);
    const result = toggleTag(context, ITALIC_MD_TAG);

    expect(result.isNoOp).toBe(false);
    expect(applyReplacements(source, result.replacements)).toBe(
      '- [ ] *Task one*\n- [ ] *Task two*'
    );
  });

  it('removeAllTags on multi-line formatted bullets → strips all per line', () => {
    const source = '- **bold one**\n- *italic two*';
    const context = createContext(source, 0, source.length);
    const result = removeAllTags(context);

    expect(result.isNoOp).toBe(false);
    expect(applyReplacements(source, result.replacements)).toBe('- bold one\n- italic two');
  });

  it('Highlight on multi-line callout list → per-line wrap after prefix', () => {
    const source = '> Line one\n> Line two';
    const context = createContext(source, 0, source.length);
    const result = toggleTag(context, HIGHLIGHT_MD_TAG);

    expect(result.isNoOp).toBe(false);
    expect(applyReplacements(source, result.replacements)).toBe('> ==Line one==\n> ==Line two==');
  });

  it('Header + bullet list full selection + bold → keeps structure on every line', () => {
    const source = '## Header line\n- list item one\n- list item two';
    const context = createContext(source, 0, source.length);
    const result = toggleTag(context, BOLD_MD_TAG);

    expect(result.isNoOp).toBe(false);
    expect(applyReplacements(source, result.replacements)).toBe(
      '## **Header line**\n- **list item one**\n- **list item two**'
    );
  });

  it('Todo bullet + hashtag + italic across lines → hashtag remains outside formatting', () => {
    const source = '- [ ] Task one #todo\n- [ ] Task two #todo';
    const context = createContext(source, 0, source.length);
    const result = toggleTag(context, ITALIC_MD_TAG);

    expect(result.isNoOp).toBe(false);
    expect(applyReplacements(source, result.replacements)).toBe(
      '- [ ] *Task one *#todo\n- [ ] *Task two *#todo'
    );
  });

  it('Bullet list mixed HTML + MD + plain content + bold → no list-prefix breakage', () => {
    const source = '- <u>html underlined</u>\n- **markdown bold**\n- plain';
    const context = createContext(source, 0, source.length);
    const result = toggleTag(context, BOLD_MD_TAG);

    expect(result.isNoOp).toBe(false);
    expect(applyReplacements(source, result.replacements)).toBe(
      '- **<u>html underlined</u>**\n- **markdown bold**\n- **plain**'
    );
  });
});
