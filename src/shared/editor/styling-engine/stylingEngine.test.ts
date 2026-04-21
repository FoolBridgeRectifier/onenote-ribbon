import { toggleTag, addTag, removeTag, removeAllTags, copyFormat } from './stylingEngine';

import {
  UNDERLINE_TAG,
  SUBSCRIPT_TAG,
  SUPERSCRIPT_TAG,
  BOLD_MD_TAG,
  ITALIC_MD_TAG,
  STRIKETHROUGH_MD_TAG,
  HIGHLIGHT_MD_TAG,
  BOLD_HTML_TAG,
} from './constants';

import { buildSpanTagDefinition } from './tag-manipulation/TagManipulation';
import type { StylingContext, TextReplacement } from './interfaces';

// ============================================================
// Test Helpers
// ============================================================

function applyReplacements(sourceText: string, replacements: TextReplacement[]): string {
  let result = sourceText;

  // Replacements are already in last-to-first order
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

// ============================================================
// toggleTag
// ============================================================

describe('toggleTag', () => {
  // --- Removal cases (tag already present) ---

  describe('removing existing tags', () => {
    it('removes <u> tags when selecting the underlined content', () => {
      const sourceText = '<u>hello</u>';
      const context = createContext(sourceText, 3, 8);

      const result = toggleTag(context, UNDERLINE_TAG);

      expect(result.isNoOp).toBe(false);
      expect(applyReplacements(sourceText, result.replacements)).toBe('hello');
    });

    it('removes ** delimiters when toggling bold on bold text', () => {
      const sourceText = '**bold**';
      const context = createContext(sourceText, 2, 6);

      const result = toggleTag(context, BOLD_MD_TAG);

      expect(result.isNoOp).toBe(false);
      expect(applyReplacements(sourceText, result.replacements)).toBe('bold');
    });

    it('removes <sub> tags when toggling subscript', () => {
      const sourceText = '<sub>2</sub>';
      const context = createContext(sourceText, 5, 6);

      const result = toggleTag(context, SUBSCRIPT_TAG);

      expect(result.isNoOp).toBe(false);
      expect(applyReplacements(sourceText, result.replacements)).toBe('2');
    });

    it('removes <sup> tags when toggling superscript', () => {
      const sourceText = '<sup>3</sup>';
      const context = createContext(sourceText, 5, 6);

      const result = toggleTag(context, SUPERSCRIPT_TAG);

      expect(result.isNoOp).toBe(false);
      expect(applyReplacements(sourceText, result.replacements)).toBe('3');
    });

    it('switches subscript to superscript instead of nesting both tags', () => {
      const sourceText = '<sub>2</sub>';
      const context = createContext(sourceText, 5, 6);

      const result = toggleTag(context, SUPERSCRIPT_TAG);

      expect(result.isNoOp).toBe(false);
      expect(applyReplacements(sourceText, result.replacements)).toBe('<sup>2</sup>');
    });

    it('switches superscript to subscript instead of nesting both tags', () => {
      const sourceText = '<sup>2</sup>';
      const context = createContext(sourceText, 5, 6);

      const result = toggleTag(context, SUBSCRIPT_TAG);

      expect(result.isNoOp).toBe(false);
      expect(applyReplacements(sourceText, result.replacements)).toBe('<sub>2</sub>');
    });

    it('removes * delimiters when toggling italic on italic text', () => {
      const sourceText = '*italic*';
      const context = createContext(sourceText, 1, 7);

      const result = toggleTag(context, ITALIC_MD_TAG);

      expect(result.isNoOp).toBe(false);
      expect(applyReplacements(sourceText, result.replacements)).toBe('italic');
    });

    it('removes ~~ delimiters when toggling strikethrough', () => {
      const sourceText = '~~strike~~';
      const context = createContext(sourceText, 2, 8);

      const result = toggleTag(context, STRIKETHROUGH_MD_TAG);

      expect(result.isNoOp).toBe(false);
      expect(applyReplacements(sourceText, result.replacements)).toBe('strike');
    });

    it('removes == delimiters when toggling highlight', () => {
      const sourceText = '==highlight==';
      const context = createContext(sourceText, 2, 11);

      const result = toggleTag(context, HIGHLIGHT_MD_TAG);

      expect(result.isNoOp).toBe(false);
      expect(applyReplacements(sourceText, result.replacements)).toBe('highlight');
    });

    it('removes outer <b> tag when selecting text inside nested <b><i>text</i></b>', () => {
      const sourceText = '<b><i>text</i></b>';
      // "text" is at offsets 6-10
      const context = createContext(sourceText, 6, 10);

      const result = toggleTag(context, BOLD_HTML_TAG);

      expect(result.isNoOp).toBe(false);
      expect(applyReplacements(sourceText, result.replacements)).toBe('<i>text</i>');
    });

    it('removes <u> tags when selection includes the delimiters (Ctrl+A / delimiter-inclusive)', () => {
      const sourceText = '<u>hello</u>';
      // Selection spans entire text including <u> and </u>
      const context = createContext(sourceText, 0, 12);

      const result = toggleTag(context, UNDERLINE_TAG);

      expect(result.isNoOp).toBe(false);
      expect(applyReplacements(sourceText, result.replacements)).toBe('hello');
    });

    it('removes ** delimiters when selection includes the asterisks (delimiter-inclusive)', () => {
      const sourceText = '**bold**';
      // Selection spans entire text including ** on both sides
      const context = createContext(sourceText, 0, 8);

      const result = toggleTag(context, BOLD_MD_TAG);

      expect(result.isNoOp).toBe(false);
      expect(applyReplacements(sourceText, result.replacements)).toBe('bold');
    });

    it('removes only bold from ***text*** leaving italic markers intact', () => {
      const sourceText = '***both***';
      // Content "both" is at offsets 3-7 (inside all 3 asterisks)
      const context = createContext(sourceText, 3, 7);

      const result = toggleTag(context, BOLD_MD_TAG);

      expect(result.isNoOp).toBe(false);
      expect(applyReplacements(sourceText, result.replacements)).toBe('*both*');
    });

    it('removes only italic from ***text*** leaving bold markers intact', () => {
      const sourceText = '***both***';
      const context = createContext(sourceText, 3, 7);

      const result = toggleTag(context, ITALIC_MD_TAG);

      expect(result.isNoOp).toBe(false);
      expect(applyReplacements(sourceText, result.replacements)).toBe('**both**');
    });
  });

  // --- Addition cases (tag not present) ---

  describe('adding new tags', () => {
    it('wraps plain text with <u> when toggling underline', () => {
      const sourceText = 'hello';
      const context = createContext(sourceText, 0, 5);

      const result = toggleTag(context, UNDERLINE_TAG);

      expect(result.isNoOp).toBe(false);
      expect(applyReplacements(sourceText, result.replacements)).toBe('<u>hello</u>');
    });

    it('wraps plain text with ** when toggling bold in MD domain', () => {
      const sourceText = 'hello';
      const context = createContext(sourceText, 0, 5);

      const result = toggleTag(context, BOLD_MD_TAG);

      expect(result.isNoOp).toBe(false);
      expect(applyReplacements(sourceText, result.replacements)).toBe('**hello**');
    });

    it('wraps plain text with * when toggling italic in MD domain', () => {
      const sourceText = 'hello';
      const context = createContext(sourceText, 0, 5);

      const result = toggleTag(context, ITALIC_MD_TAG);

      expect(result.isNoOp).toBe(false);
      expect(applyReplacements(sourceText, result.replacements)).toBe('*hello*');
    });

    it('wraps plain text with <sub> when toggling subscript', () => {
      const sourceText = 'H2O';
      const context = createContext(sourceText, 1, 2);

      const result = toggleTag(context, SUBSCRIPT_TAG);

      expect(result.isNoOp).toBe(false);
      expect(applyReplacements(sourceText, result.replacements)).toBe('H<sub>2</sub>O');
    });
  });

  // --- Domain conversion cases ---

  describe('domain conversion', () => {
    it('converts MD bold to HTML and wraps with <u> when adding underline inside **bold**', () => {
      const sourceText = '**bold**';
      // Selecting "bold" at offsets 2-6
      const context = createContext(sourceText, 2, 6);

      const result = toggleTag(context, UNDERLINE_TAG);

      expect(result.isNoOp).toBe(false);

      const applied = applyReplacements(sourceText, result.replacements);
      // MD tokens get converted to HTML, then wrapped with <u>
      expect(applied).toBe('<u><b>bold</b></u>');
    });

    it('converts MD italic to HTML and wraps with <sub> when adding subscript inside *italic*', () => {
      const sourceText = '*italic*';
      // Selecting "italic" at offsets 1-7
      const context = createContext(sourceText, 1, 7);

      const result = toggleTag(context, SUBSCRIPT_TAG);

      expect(result.isNoOp).toBe(false);

      const applied = applyReplacements(sourceText, result.replacements);
      expect(applied).toBe('<sub><i>italic</i></sub>');
    });

    it('substitutes HTML <b> when toggling MD bold inside an HTML domain', () => {
      const sourceText = '<u>text</u>';
      // Selecting "text" at offsets 3-7
      const context = createContext(sourceText, 3, 7);

      const result = toggleTag(context, BOLD_MD_TAG);

      expect(result.isNoOp).toBe(false);

      const applied = applyReplacements(sourceText, result.replacements);
      // MD bold gets substituted with HTML <b> in HTML domain
      expect(applied).toBe('<u><b>text</b></u>');
    });

    it('substitutes HTML <i> when toggling MD italic inside an HTML domain', () => {
      const sourceText = '<u>text</u>';
      const context = createContext(sourceText, 3, 7);

      const result = toggleTag(context, ITALIC_MD_TAG);

      expect(result.isNoOp).toBe(false);

      const applied = applyReplacements(sourceText, result.replacements);
      expect(applied).toBe('<u><i>text</i></u>');
    });

    it('substitutes HTML <s> when toggling MD strikethrough inside an HTML domain', () => {
      const sourceText = '<u>text</u>';
      const context = createContext(sourceText, 3, 7);

      const result = toggleTag(context, STRIKETHROUGH_MD_TAG);

      expect(result.isNoOp).toBe(false);

      const applied = applyReplacements(sourceText, result.replacements);
      expect(applied).toBe('<u><s>text</s></u>');
    });
  });

  // --- Inert zone cases ---

  describe('inert zones', () => {
    it('returns isNoOp for selection inside a code block', () => {
      const sourceText = '```\nconst x = 1;\n```';
      // Selecting inside the code block at offsets 4-17
      const context = createContext(sourceText, 4, 17);

      const result = toggleTag(context, BOLD_MD_TAG);

      expect(result.isNoOp).toBe(true);
      expect(result.replacements).toHaveLength(0);
    });

    it('returns isNoOp for selection inside a table line', () => {
      const sourceText = '| cell1 | cell2 |';
      const context = createContext(sourceText, 2, 7);

      const result = toggleTag(context, UNDERLINE_TAG);

      expect(result.isNoOp).toBe(true);
      expect(result.replacements).toHaveLength(0);
    });

    it('returns isNoOp for selection inside a math block', () => {
      const sourceText = '$$\nx^2 + y^2 = z^2\n$$';
      const context = createContext(sourceText, 3, 19);

      const result = toggleTag(context, BOLD_MD_TAG);

      expect(result.isNoOp).toBe(true);
      expect(result.replacements).toHaveLength(0);
    });
  });

  // --- Protected range cases ---

  describe('protected ranges', () => {
    it('splits formatting around a wikilink in the selection', () => {
      const sourceText = 'Visit [[Note]] here';
      // Selecting the full text 0-19
      const context = createContext(sourceText, 0, 19);

      const result = toggleTag(context, UNDERLINE_TAG);

      expect(result.isNoOp).toBe(false);

      const applied = applyReplacements(sourceText, result.replacements);
      expect(applied).toBe('<u>Visit </u>[[Note]]<u> here</u>');
    });

    it('splits formatting around an embed in the selection', () => {
      const sourceText = 'See ![[image.png]] below';
      const context = createContext(sourceText, 0, 24);

      const result = toggleTag(context, UNDERLINE_TAG);

      expect(result.isNoOp).toBe(false);

      const applied = applyReplacements(sourceText, result.replacements);
      expect(applied).toBe('<u>See </u>![[image.png]]<u> below</u>');
    });
  });

  // --- Line prefix handling ---

  describe('line prefix handling', () => {
    it('wraps content after heading prefix when selection starts at content', () => {
      const sourceText = '## My Title';
      // Selecting "My Title" at offsets 3-11
      const context = createContext(sourceText, 3, 11);

      const result = toggleTag(context, UNDERLINE_TAG);

      expect(result.isNoOp).toBe(false);

      const applied = applyReplacements(sourceText, result.replacements);
      expect(applied).toBe('## <u>My Title</u>');
    });

    it('wraps with MD bold after bullet prefix', () => {
      const sourceText = '- item text';
      // Selecting "item text" at offsets 2-11
      const context = createContext(sourceText, 2, 11);

      const result = toggleTag(context, BOLD_MD_TAG);

      expect(result.isNoOp).toBe(false);

      const applied = applyReplacements(sourceText, result.replacements);
      expect(applied).toBe('- **item text**');
    });
  });
});

// ============================================================
// removeTag
// ============================================================

describe('removeTag', () => {
  it('removes <u> tags when they enclose the selection', () => {
    const sourceText = '<u>hello</u>';
    const context = createContext(sourceText, 3, 8);

    const result = removeTag(context, UNDERLINE_TAG);

    expect(result.isNoOp).toBe(false);
    expect(applyReplacements(sourceText, result.replacements)).toBe('hello');
  });

  it('returns isNoOp when the requested tag is not present', () => {
    const sourceText = '<u>hello</u>';
    const context = createContext(sourceText, 3, 8);

    const result = removeTag(context, BOLD_HTML_TAG);

    expect(result.isNoOp).toBe(true);
    expect(result.replacements).toHaveLength(0);
  });

  it('removes ** delimiters for MD bold', () => {
    const sourceText = '**bold**';
    const context = createContext(sourceText, 2, 6);

    const result = removeTag(context, BOLD_MD_TAG);

    expect(result.isNoOp).toBe(false);
    expect(applyReplacements(sourceText, result.replacements)).toBe('bold');
  });

  it('removes the innermost matching tag when multiple of same type are nested', () => {
    const sourceText = '<u><u>text</u></u>';
    // "text" is at offsets 6-10; inner <u> is 3-6/10-14, outer <u> is 0-3/14-18
    const context = createContext(sourceText, 6, 10);

    const result = removeTag(context, UNDERLINE_TAG);

    expect(result.isNoOp).toBe(false);
    // Innermost <u> is removed
    const applied = applyReplacements(sourceText, result.replacements);
    expect(applied).toBe('<u>text</u>');
  });

  it('removes the tag when selection includes delimiters (delimiter-inclusive)', () => {
    const sourceText = '<u>hello</u>';
    // Selection spans entire text including <u> and </u>
    const context = createContext(sourceText, 0, 12);

    const result = removeTag(context, UNDERLINE_TAG);

    expect(result.isNoOp).toBe(false);
    expect(applyReplacements(sourceText, result.replacements)).toBe('hello');
  });
});

// ============================================================
// removeAllTags
// ============================================================

describe('removeAllTags', () => {
  it('removes both <u> and <b> tags from nested content', () => {
    const sourceText = '<u><b>hello</b></u>';
    // "hello" is at offsets 6-11
    const context = createContext(sourceText, 6, 11);

    const result = removeAllTags(context);

    expect(result.isNoOp).toBe(false);

    const applied = applyReplacements(sourceText, result.replacements);
    expect(applied).toBe('hello');
  });

  it('removes only the enclosing ** when selecting inside bold within mixed text', () => {
    const sourceText = '**bold** and <u>underline</u>';
    // Selecting "bold" at offsets 2-6
    const context = createContext(sourceText, 2, 6);

    const result = removeAllTags(context);

    expect(result.isNoOp).toBe(false);

    const applied = applyReplacements(sourceText, result.replacements);
    expect(applied).toBe('bold and <u>underline</u>');
  });

  it('returns isNoOp when no tags enclose the selection', () => {
    const sourceText = 'plain text';
    const context = createContext(sourceText, 0, 10);

    const result = removeAllTags(context);

    expect(result.isNoOp).toBe(true);
    expect(result.replacements).toHaveLength(0);
  });

  it('removes all three levels of nesting', () => {
    const sourceText = '<u><b><i>text</i></b></u>';
    // "text" is at offsets 9-13
    const context = createContext(sourceText, 9, 13);

    const result = removeAllTags(context);

    expect(result.isNoOp).toBe(false);

    const applied = applyReplacements(sourceText, result.replacements);
    expect(applied).toBe('text');
  });

  it('removes all tags when selection includes delimiters (delimiter-inclusive via Ctrl+A)', () => {
    const sourceText = '<u><b>bold</b></u>';
    // Selection spans entire text including all delimiters
    const context = createContext(sourceText, 0, 18);

    const result = removeAllTags(context);

    expect(result.isNoOp).toBe(false);
    expect(applyReplacements(sourceText, result.replacements)).toBe('bold');
  });

  it('returns isNoOp for code blocks', () => {
    const sourceText = '```\ncode\n```';
    const context = createContext(sourceText, 4, 8);

    const result = removeAllTags(context);

    expect(result.isNoOp).toBe(true);
  });

  it('removes mixed HTML and MD tags', () => {
    const sourceText = '<u>**text**</u>';
    // "text" is at offsets 5-9
    const context = createContext(sourceText, 5, 9);

    const result = removeAllTags(context);

    expect(result.isNoOp).toBe(false);

    const applied = applyReplacements(sourceText, result.replacements);
    expect(applied).toBe('text');
  });
});

// ============================================================
// addTag
// ============================================================

describe('addTag', () => {
  it('wraps plain text with <u> when adding underline', () => {
    const sourceText = 'hello world';
    const context = createContext(sourceText, 0, 11);

    const result = addTag(context, UNDERLINE_TAG);

    expect(result.isNoOp).toBe(false);
    expect(applyReplacements(sourceText, result.replacements)).toBe('<u>hello world</u>');
  });

  it('replaces color attribute when adding color to already colored text', () => {
    const sourceText = '<span style="color: red">text</span>';
    // "text" at offsets 25-29
    const context = createContext(sourceText, 25, 29);

    const blueSpanTag = buildSpanTagDefinition('color', 'blue');
    const result = addTag(context, blueSpanTag);

    expect(result.isNoOp).toBe(false);

    const applied = applyReplacements(sourceText, result.replacements);
    expect(applied).toBe('<span style="color: blue">text</span>');
  });

  it('wraps with new span when different CSS property is added', () => {
    const sourceText = '<span style="color: red">text</span>';
    // "text" at offsets 25-29
    const context = createContext(sourceText, 25, 29);

    const fontSizeTag = buildSpanTagDefinition('font-family', 'Arial');
    const result = addTag(context, fontSizeTag);

    expect(result.isNoOp).toBe(false);

    const applied = applyReplacements(sourceText, result.replacements);
    expect(applied).toBe(
      '<span style="color: red"><span style="font-family: Arial">text</span></span>'
    );
  });

  it('does not remove existing tag even if present (add-only behavior)', () => {
    const sourceText = '<u>hello</u>';
    const context = createContext(sourceText, 3, 8);

    // addTag with underline — should not remove existing <u>, should double-wrap
    const result = addTag(context, UNDERLINE_TAG);

    expect(result.isNoOp).toBe(false);

    const applied = applyReplacements(sourceText, result.replacements);
    // It wraps with another <u> (double-wrap is expected for add-only)
    expect(applied).toBe('<u><u>hello</u></u>');
  });

  it('returns isNoOp for inert zones', () => {
    const sourceText = '```\ncode\n```';
    const context = createContext(sourceText, 4, 8);

    const result = addTag(context, UNDERLINE_TAG);

    expect(result.isNoOp).toBe(true);
  });

  it('replaces font-size attribute value when same property already exists', () => {
    const sourceText = '<span style="font-size: 12pt">text</span>';
    // "text" at offsets 30-34
    const context = createContext(sourceText, 30, 34);

    const newFontSize = buildSpanTagDefinition('font-size', '16pt');
    const result = addTag(context, newFontSize);

    expect(result.isNoOp).toBe(false);

    const applied = applyReplacements(sourceText, result.replacements);
    expect(applied).toBe('<span style="font-size: 16pt">text</span>');
  });
});

// ============================================================
// copyFormat
// ============================================================

describe('copyFormat', () => {
  it('returns tag definitions for both enclosing tags and html domain', () => {
    const sourceText = '<u><b>text</b></u>';
    // "text" at offsets 6-10
    const result = copyFormat(sourceText, 6, 10);

    expect(result.domain).toBe('html');
    expect(result.tagDefinitions.length).toBeGreaterThanOrEqual(2);

    const tagNames = result.tagDefinitions.map((tagDefinition) => tagDefinition.tagName);
    expect(tagNames).toContain('b');
    expect(tagNames).toContain('u');
  });

  it('returns empty tag definitions and markdown domain for plain text', () => {
    const sourceText = 'plain text';

    const result = copyFormat(sourceText, 0, 10);

    expect(result.domain).toBe('markdown');
    expect(result.tagDefinitions).toHaveLength(0);
  });

  it('returns markdown tag definitions for MD-formatted text', () => {
    const sourceText = '**bold**';

    const result = copyFormat(sourceText, 2, 6);

    expect(result.domain).toBe('markdown');
    expect(result.tagDefinitions.length).toBeGreaterThanOrEqual(1);

    const tagNames = result.tagDefinitions.map((tagDefinition) => tagDefinition.tagName);
    expect(tagNames).toContain('bold');
  });

  it('returns span tag definition with CSS properties', () => {
    const sourceText = '<span style="color: red">text</span>';

    const result = copyFormat(sourceText, 25, 29);

    expect(result.domain).toBe('html');
    expect(result.tagDefinitions.length).toBeGreaterThanOrEqual(1);

    const spanDefinition = result.tagDefinitions.find(
      (tagDefinition) => tagDefinition.tagName === 'span'
    );
    expect(spanDefinition).toBeDefined();
    expect(spanDefinition!.attributes).toEqual({ color: 'red' });
  });

  it('returns multiple tag definitions for deeply nested formatting', () => {
    const sourceText = '<u><span style="color: blue"><b>text</b></span></u>';
    // "text" is at offsets 32-36 (<u>=0-3, <span ...>=3-29, <b>=29-32, text=32-36)
    const result = copyFormat(sourceText, 32, 36);

    expect(result.domain).toBe('html');
    expect(result.tagDefinitions.length).toBeGreaterThanOrEqual(3);

    const tagNames = result.tagDefinitions.map((tagDefinition) => tagDefinition.tagName);
    expect(tagNames).toContain('b');
    expect(tagNames).toContain('span');
    expect(tagNames).toContain('u');
  });
});

// ============================================================
// Edge cases
// ============================================================

describe('edge cases', () => {
  it('handles zero-width selection (cursor) for toggleTag', () => {
    const sourceText = '<u>hello</u>';
    // Cursor at offset 5 (inside "hello")
    const context = createContext(sourceText, 5, 5);

    const result = toggleTag(context, UNDERLINE_TAG);

    // Should still detect the enclosing <u> tag and remove it
    expect(result.isNoOp).toBe(false);
    expect(applyReplacements(sourceText, result.replacements)).toBe('hello');
  });

  it('handles empty source text', () => {
    const sourceText = '';
    const context = createContext(sourceText, 0, 0);

    const result = toggleTag(context, UNDERLINE_TAG);

    // Empty wrap — adds tags around nothing
    expect(result.isNoOp).toBe(false);
    expect(applyReplacements(sourceText, result.replacements)).toBe('<u></u>');
  });

  it('handles horizontal rule as inert', () => {
    const sourceText = '---';
    const context = createContext(sourceText, 0, 3);

    const result = toggleTag(context, BOLD_MD_TAG);

    expect(result.isNoOp).toBe(true);
  });
});

// ============================================================
// Batch 1: Line prefix tests
// ============================================================

describe('toggleTag — line prefix preservation', () => {
  it('preserves bullet prefix and underlines content', () => {
    const sourceText = '- item text';
    // "item text" starts at offset 2
    const context = createContext(sourceText, 2, 11);

    const result = toggleTag(context, UNDERLINE_TAG);

    expect(result.isNoOp).toBe(false);
    const output = applyReplacements(sourceText, result.replacements);
    expect(output).toBe('- <u>item text</u>');
  });

  it('preserves numbered list prefix and underlines content', () => {
    const sourceText = '1. numbered';
    // "numbered" starts at offset 3
    const context = createContext(sourceText, 3, 11);

    const result = toggleTag(context, UNDERLINE_TAG);

    expect(result.isNoOp).toBe(false);
    const output = applyReplacements(sourceText, result.replacements);
    expect(output).toBe('1. <u>numbered</u>');
  });

  it('preserves unchecked task prefix and underlines content', () => {
    const sourceText = '- [ ] task';
    // "task" starts at offset 6
    const context = createContext(sourceText, 6, 10);

    const result = toggleTag(context, UNDERLINE_TAG);

    expect(result.isNoOp).toBe(false);
    const output = applyReplacements(sourceText, result.replacements);
    expect(output).toBe('- [ ] <u>task</u>');
  });

  it('preserves checked task prefix and bolds content', () => {
    const sourceText = '- [x] done';
    // "done" starts at offset 6
    const context = createContext(sourceText, 6, 10);

    const result = toggleTag(context, BOLD_MD_TAG);

    expect(result.isNoOp).toBe(false);
    const output = applyReplacements(sourceText, result.replacements);
    expect(output).toBe('- [x] **done**');
  });

  it('preserves nested bullet prefix (indented) and underlines content', () => {
    const sourceText = '  - nested';
    // "nested" starts at offset 4
    const context = createContext(sourceText, 4, 10);

    const result = toggleTag(context, UNDERLINE_TAG);

    expect(result.isNoOp).toBe(false);
    const output = applyReplacements(sourceText, result.replacements);
    expect(output).toBe('  - <u>nested</u>');
  });

  it('preserves callout prefix and bolds content', () => {
    const sourceText = '> callout body';
    // "callout body" starts at offset 2
    const context = createContext(sourceText, 2, 14);

    const result = toggleTag(context, BOLD_MD_TAG);

    expect(result.isNoOp).toBe(false);
    const output = applyReplacements(sourceText, result.replacements);
    expect(output).toBe('> **callout body**');
  });

  it('preserves callout prefix and underlines content', () => {
    const sourceText = '> callout body';
    // "callout body" starts at offset 2
    const context = createContext(sourceText, 2, 14);

    const result = toggleTag(context, UNDERLINE_TAG);

    expect(result.isNoOp).toBe(false);
    const output = applyReplacements(sourceText, result.replacements);
    expect(output).toBe('> <u>callout body</u>');
  });

  it('preserves composite callout + task prefix and bolds content', () => {
    const sourceText = '> - [ ] task';
    // "task" starts at offset 8
    const context = createContext(sourceText, 8, 12);

    const result = toggleTag(context, BOLD_MD_TAG);

    expect(result.isNoOp).toBe(false);
    const output = applyReplacements(sourceText, result.replacements);
    expect(output).toBe('> - [ ] **task**');
  });
});

// ============================================================
// Batch 2: Domain conversion extras
// ============================================================

describe('toggleTag — domain conversion extras', () => {
  it('converts MD strikethrough to HTML and wraps with <u> when adding underline', () => {
    const sourceText = '~~struck~~';
    // "struck" at offsets 2-8
    const context = createContext(sourceText, 2, 8);

    const result = toggleTag(context, UNDERLINE_TAG);

    expect(result.isNoOp).toBe(false);
    const output = applyReplacements(sourceText, result.replacements);
    expect(output).toBe('<u><s>struck</s></u>');
  });

  it('converts MD highlight to HTML and wraps with <u> when adding underline', () => {
    const sourceText = '==highlighted==';
    // "highlighted" at offsets 2-13
    const context = createContext(sourceText, 2, 13);

    const result = toggleTag(context, UNDERLINE_TAG);

    expect(result.isNoOp).toBe(false);
    const output = applyReplacements(sourceText, result.replacements);
    expect(output).toBe('<u><mark>highlighted</mark></u>');
  });
});

// ============================================================
// Batch 3: Span toggle-off
// ============================================================

describe('toggleTag — span toggle-off', () => {
  it('removes color span when toggling same color span tag', () => {
    const sourceText = '<span style="color: red">text</span>';
    // "text" at offsets 25-29
    const context = createContext(sourceText, 25, 29);

    const colorRedTag = buildSpanTagDefinition('color', 'red');
    const result = toggleTag(context, colorRedTag);

    expect(result.isNoOp).toBe(false);
    const output = applyReplacements(sourceText, result.replacements);
    expect(output).toBe('text');
  });
});

// ============================================================
// Batch 4: Atomic token extras
// ============================================================

describe('toggleTag — atomic token extras', () => {
  it('splits bold formatting around a markdown link', () => {
    const sourceText = 'See [link](url) end';
    // Select full text 0-19
    const context = createContext(sourceText, 0, 19);

    const result = toggleTag(context, BOLD_HTML_TAG);

    expect(result.isNoOp).toBe(false);
    const output = applyReplacements(sourceText, result.replacements);
    expect(output).toBe('<b>See </b>[link](url)<b> end</b>');
  });

  it('splits underline formatting around a hashtag', () => {
    const sourceText = 'Check #my-tag rest';
    // Select full text 0-18
    const context = createContext(sourceText, 0, 18);

    const result = toggleTag(context, UNDERLINE_TAG);

    expect(result.isNoOp).toBe(false);
    const output = applyReplacements(sourceText, result.replacements);
    expect(output).toBe('<u>Check </u>#my-tag<u> rest</u>');
  });

  it('splits underline formatting around a footnote reference', () => {
    const sourceText = 'Ref [^1] text';
    // Select full text 0-13
    const context = createContext(sourceText, 0, 13);

    const result = toggleTag(context, UNDERLINE_TAG);

    expect(result.isNoOp).toBe(false);
    const output = applyReplacements(sourceText, result.replacements);
    expect(output).toBe('<u>Ref </u>[^1]<u> text</u>');
  });
});

// ============================================================
// Batch 5: removeAllTags extras
// ============================================================

describe('removeAllTags — extras', () => {
  it('removes <u> tags from heading content with preserveLinePrefix option', () => {
    const sourceText = '## <u>Title</u>';
    // Select "Title" inside the <u> tags: "<u>" starts at offset 3, "Title" at offset 6, ends at 11
    const context = createContext(sourceText, 6, 11);

    // Note: removeAllTags accepts an optional RemoveAllTagsOptions parameter.
    // Even if the option is not fully wired, the tags should still be removed.
    const result = removeAllTags(context, { preserveLinePrefix: true });

    expect(result.isNoOp).toBe(false);
    const output = applyReplacements(sourceText, result.replacements);
    expect(output).toBe('## Title');
  });

  it('removes all nested HTML tags from fully selected content', () => {
    const sourceText = '<u><b>text</b></u>';
    // Select full text 0-18
    const context = createContext(sourceText, 0, 18);

    const result = removeAllTags(context);

    expect(result.isNoOp).toBe(false);
    const output = applyReplacements(sourceText, result.replacements);
    expect(output).toBe('text');
  });

  it('removes MD bold delimiters from fully selected content', () => {
    const sourceText = '**bold**';
    // Select full text 0-8
    const context = createContext(sourceText, 0, 8);

    const result = removeAllTags(context);

    expect(result.isNoOp).toBe(false);
    const output = applyReplacements(sourceText, result.replacements);
    expect(output).toBe('bold');
  });

  it('removes all formatting from ***text*** leaving plain text', () => {
    const sourceText = '***both***';
    // "both" at offsets 3-7
    const context = createContext(sourceText, 3, 7);

    const result = removeAllTags(context);

    expect(result.isNoOp).toBe(false);
    const output = applyReplacements(sourceText, result.replacements);
    expect(output).toBe('both');
  });
});

// ============================================================
// Batch 6: Cursor-only tag insertion
// ============================================================

describe('toggleTag — cursor-only insertion', () => {
  it('inserts empty underline tag pair at cursor position in plain text', () => {
    const sourceText = 'hello world';
    // Zero-width cursor at offset 5
    const context = createContext(sourceText, 5, 5);

    const result = toggleTag(context, UNDERLINE_TAG);

    // Document actual engine behavior for zero-width cursor in plain text
    expect(result.isNoOp).toBe(false);
    const output = applyReplacements(sourceText, result.replacements);
    expect(output).toBe('hello<u></u> world');
  });

  it('inserts empty bold MD delimiters at cursor position in plain text', () => {
    const sourceText = 'hello world';
    // Zero-width cursor at offset 5
    const context = createContext(sourceText, 5, 5);

    const result = toggleTag(context, BOLD_MD_TAG);

    // Document actual engine behavior for zero-width cursor in plain text
    expect(result.isNoOp).toBe(false);
    const output = applyReplacements(sourceText, result.replacements);
    expect(output).toBe('hello**** world');
  });
});

// ============================================================
// Batch 7: Inert zone — inline math
// ============================================================

describe('toggleTag — inert zone: inline math', () => {
  it('returns isNoOp for cursor inside inline math $...$', () => {
    const sourceText = '$x^2$';
    // Zero-width cursor at offset 1 (inside the $ delimiters)
    const context = createContext(sourceText, 1, 1);

    const result = toggleTag(context, UNDERLINE_TAG);

    expect(result.isNoOp).toBe(true);
    expect(result.replacements).toHaveLength(0);
  });
});

// ============================================================
// Batch 8: Adjacent protected tokens with no gap
// ============================================================

describe('toggleTag — adjacent protected tokens with no gap', () => {
  it('produces no wraps when two wikilinks are directly adjacent', () => {
    const sourceText = '[[A]][[B]]';
    // Select full text 0-10
    const context = createContext(sourceText, 0, 10);

    const result = toggleTag(context, UNDERLINE_TAG);

    // Both wikilinks are protected ranges with no formattable gap between them.
    // The engine finds no gaps to wrap so replacements is empty.
    expect(result.replacements).toHaveLength(0);
  });
});

// ============================================================
// Batch 9: Cursor-only removeTag
// ============================================================

describe('removeTag — cursor-only (zero-width selection)', () => {
  it('removes enclosing <u> tags when cursor is inside the content', () => {
    const sourceText = '<u>text</u>';
    // Cursor at offset 4 (inside "text": t=3, e=4, x=5, t=6)
    const context = createContext(sourceText, 4, 4);

    const result = removeTag(context, UNDERLINE_TAG);

    expect(result.isNoOp).toBe(false);
    expect(applyReplacements(sourceText, result.replacements)).toBe('text');
  });

  it('returns isNoOp when cursor is inside <u> but removing bold (not present)', () => {
    const sourceText = '<u>text</u>';
    // Cursor at offset 4 (inside "text")
    const context = createContext(sourceText, 4, 4);

    const result = removeTag(context, BOLD_MD_TAG);

    expect(result.isNoOp).toBe(true);
    expect(result.replacements).toHaveLength(0);
  });
});

// ============================================================
// Batch 10: Cursor-only addTag
// ============================================================

describe('addTag — cursor-only (zero-width selection)', () => {
  it('inserts empty <u></u> tag pair at cursor position in plain text', () => {
    const sourceText = 'hello world';
    // Zero-width cursor at offset 5
    const context = createContext(sourceText, 5, 5);

    const result = addTag(context, UNDERLINE_TAG);

    expect(result.isNoOp).toBe(false);
    const output = applyReplacements(sourceText, result.replacements);
    expect(output).toBe('hello<u></u> world');
  });
});

// ============================================================
// Batch 11: Mixed-content full-selection removeAllTags
// ============================================================

describe('removeAllTags — mixed-content full selection', () => {
  it('removes both MD bold and HTML underline when full text is selected', () => {
    const sourceText = '**bold** and <u>underline</u>';
    // Select full text
    const context = createContext(sourceText, 0, sourceText.length);

    const result = removeAllTags(context);

    expect(result.isNoOp).toBe(false);
    const output = applyReplacements(sourceText, result.replacements);
    expect(output).toBe('bold and underline');
  });
});
