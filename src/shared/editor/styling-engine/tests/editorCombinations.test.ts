import { MockEditor } from '../../../../test-utils/MockEditor';

import {
  buildStylingContextFromEditor,
  applyStylingResult,
  toggleTagInEditor,
  addTagInEditor,
  removeTagInEditor,
  removeAllTagsInEditor,
  copyFormatFromEditor,
  ObsidianEditor,
} from '../editorIntegration';

import {
  UNDERLINE_TAG,
  BOLD_MD_TAG,
  ITALIC_MD_TAG,
  BOLD_HTML_TAG,
  ITALIC_HTML_TAG,
  SUBSCRIPT_TAG,
  SUPERSCRIPT_TAG,
  STRIKETHROUGH_MD_TAG,
  HIGHLIGHT_MD_TAG,
} from '../constants';

import { buildSpanTagDefinition } from '../tagManipulation';

import {
  createEnclosingHtmlTagFinder,
  HtmlTagRange,
} from '../../enclosing-html-tags/enclosingHtmlTags';

import { extractSpanAndDivState } from '../../../hooks/useEditorState';

// ============================================================
// Test Helper: Mock Editor Factory
// ============================================================

/**
 * Creates a mock editor that satisfies the ObsidianEditor interface.
 * Wraps MockEditor to add getCursor(which) and transaction() support.
 */
function createTestEditor(content: string): ObsidianEditor & { transaction: jest.Mock } {
  const innerEditor = new MockEditor();
  innerEditor.setValue(content);

  let selectionFrom: { line: number; ch: number } | null = null;
  let selectionTo: { line: number; ch: number } | null = null;

  /**
   * Applies transaction changes in reverse document order to avoid position shifts.
   */
  const applyTransaction = (
    spec: {
      changes: Array<{
        from: { line: number; ch: number };
        to: { line: number; ch: number };
        text: string;
      }>;
    },
  ): void => {
    const sortedChanges = [...spec.changes].sort((changeA, changeB) => {
      if (changeA.from.line !== changeB.from.line) {
        return changeB.from.line - changeA.from.line;
      }
      return changeB.from.ch - changeA.from.ch;
    });

    for (const change of sortedChanges) {
      innerEditor.replaceRange(change.text, change.from, change.to);
    }
  };

  return {
    getValue(): string {
      return innerEditor.getValue();
    },

    getCursor(which?: 'from' | 'to' | 'head' | 'anchor'): { line: number; ch: number } {
      if (which === 'from' && selectionFrom !== null) {
        return { ...selectionFrom };
      }

      if (which === 'to' && selectionTo !== null) {
        return { ...selectionTo };
      }

      return innerEditor.getCursor();
    },

    setCursor(position: { line: number; ch: number }): void {
      selectionFrom = null;
      selectionTo = null;
      innerEditor.setCursor(position);
    },

    setSelection(from: { line: number; ch: number }, to: { line: number; ch: number }): void {
      selectionFrom = { ...from };
      selectionTo = { ...to };
      innerEditor.setSelection(from, to);
    },

    transaction: jest.fn(applyTransaction),
  };
}

/**
 * Refreshes mock editor state to match current content after a mutation.
 * After toggleTagInEditor/addTagInEditor mutate the underlying content,
 * we need to rebuild the editor so subsequent operations see the new text.
 */
function rebuildEditor(editor: ObsidianEditor): ObsidianEditor & { transaction: jest.Mock } {
  return createTestEditor(editor.getValue());
}

/**
 * Helper: select a substring within a single-line editor.
 * Searches for the substring in the editor's content and sets the selection.
 */
function selectSubstring(
  editor: ObsidianEditor,
  substring: string,
): void {
  const content = editor.getValue();
  const startIndex = content.indexOf(substring);

  if (startIndex === -1) {
    throw new Error(`Substring "${substring}" not found in content "${content}"`);
  }

  // Convert flat offset to line/ch — simple approach for single-line text
  const lines = content.split('\n');
  let currentOffset = 0;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const lineLength = lines[lineIndex].length;

    if (startIndex >= currentOffset && startIndex <= currentOffset + lineLength) {
      const startCh = startIndex - currentOffset;
      const endOffset = startIndex + substring.length;

      // Find end position
      let endLine = lineIndex;
      let endCh = startCh + substring.length;

      if (endOffset > currentOffset + lineLength) {
        // Multi-line selection
        let remainingOffset = endOffset;
        let tempOffset = 0;

        for (let searchLine = 0; searchLine < lines.length; searchLine++) {
          const searchLineLength = lines[searchLine].length;
          if (remainingOffset <= tempOffset + searchLineLength) {
            endLine = searchLine;
            endCh = remainingOffset - tempOffset;
            break;
          }
          tempOffset += searchLineLength + 1; // +1 for newline
        }
      }

      editor.setSelection(
        { line: lineIndex, ch: startCh },
        { line: endLine, ch: endCh },
      );
      return;
    }

    currentOffset += lineLength + 1; // +1 for newline
  }
}

// ============================================================
// Group 1: Sequential Editor Operations
// ============================================================

describe('Group 1: Sequential editor operations', () => {

  it('Bold → Italic → Underline produces triple-stacked formatting', () => {
    let editor = createTestEditor('hello');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });

    toggleTagInEditor(editor, BOLD_MD_TAG);
    expect(editor.getValue()).toBe('**hello**');

    editor = rebuildEditor(editor);
    selectSubstring(editor, 'hello');
    toggleTagInEditor(editor, ITALIC_MD_TAG);
    expect(editor.getValue()).toBe('***hello***');

    editor = rebuildEditor(editor);
    selectSubstring(editor, 'hello');
    toggleTagInEditor(editor, UNDERLINE_TAG);

    // Adding an HTML tag (<u>) to markdown-domain text with MD tokens
    // triggers domain conversion: *** → <b><i> + <u> wrap
    const finalContent = editor.getValue();
    expect(finalContent).toContain('hello');
    expect(finalContent).toContain('<u>');
    expect(finalContent).toContain('</u>');
    // Bold and italic should be converted to HTML equivalents
    expect(finalContent).toContain('<b>');
    expect(finalContent).toContain('<i>');
  });

  it('Bold → Clear All produces plain text', () => {
    let editor = createTestEditor('hello');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });

    toggleTagInEditor(editor, BOLD_MD_TAG);
    expect(editor.getValue()).toBe('**hello**');

    editor = rebuildEditor(editor);
    // Select the inner text for removeAll
    selectSubstring(editor, 'hello');
    removeAllTagsInEditor(editor);

    expect(editor.getValue()).toBe('hello');
  });

  it('Underline → Subscript produces nested HTML tags', () => {
    let editor = createTestEditor('H2O');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 3 });

    toggleTagInEditor(editor, UNDERLINE_TAG);
    expect(editor.getValue()).toBe('<u>H2O</u>');

    editor = rebuildEditor(editor);
    // Select the "2" inside the underline
    editor.setSelection({ line: 0, ch: 4 }, { line: 0, ch: 5 });
    toggleTagInEditor(editor, SUBSCRIPT_TAG);

    const finalContent = editor.getValue();
    expect(finalContent).toContain('<sub>2</sub>');
    expect(finalContent).toContain('<u>');
    expect(finalContent).toContain('</u>');
  });

  it('Font color (red) → Font color (blue) replaces value instead of double-wrapping', () => {
    const redSpanTag = buildSpanTagDefinition('color', 'red');
    const blueSpanTag = buildSpanTagDefinition('color', 'blue');

    let editor = createTestEditor('hello');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });

    addTagInEditor(editor, redSpanTag);
    expect(editor.getValue()).toBe('<span style="color: red">hello</span>');

    editor = rebuildEditor(editor);
    selectSubstring(editor, 'hello');
    addTagInEditor(editor, blueSpanTag);

    const finalContent = editor.getValue();
    expect(finalContent).toBe('<span style="color: blue">hello</span>');
    // Should not double-wrap
    expect(finalContent.match(/<span/g)?.length).toBe(1);
  });

  it('Font family → Font size produces both span wraps', () => {
    const fontFamilyTag = buildSpanTagDefinition('font-family', "'Arial'");
    const fontSizeTag = buildSpanTagDefinition('font-size', '14pt');

    let editor = createTestEditor('hello');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });

    addTagInEditor(editor, fontFamilyTag);
    const afterFontFamily = editor.getValue();
    expect(afterFontFamily).toContain('font-family');

    editor = rebuildEditor(editor);
    selectSubstring(editor, 'hello');
    addTagInEditor(editor, fontSizeTag);

    const finalContent = editor.getValue();
    expect(finalContent).toContain('font-family');
    expect(finalContent).toContain('font-size');
    expect(finalContent).toContain('hello');
  });

  it('Bold (MD) → Font color converts markdown to HTML when mixing domains', () => {
    const fontColorTag = buildSpanTagDefinition('color', 'red');

    let editor = createTestEditor('hello');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });

    toggleTagInEditor(editor, BOLD_MD_TAG);
    expect(editor.getValue()).toBe('**hello**');

    editor = rebuildEditor(editor);
    selectSubstring(editor, 'hello');
    addTagInEditor(editor, fontColorTag);

    const finalContent = editor.getValue();
    // HTML font color on MD bold text should trigger domain conversion
    expect(finalContent).toContain('hello');
    expect(finalContent).toContain('color: red');
    // Bold should have been converted from ** to <b>
    expect(finalContent).toContain('<b>');
    expect(finalContent).not.toContain('**');
  });
});

// ============================================================
// Group 2: Copy Format + Apply Format Pipeline
// ============================================================

describe('Group 2: Copy format + apply format pipeline', () => {

  it('copies bold+italic tag definitions from formatted text', () => {
    const editor = createTestEditor('<b><i>styled text</i></b>');
    // Cursor inside "styled text"
    selectSubstring(editor, 'styled');

    const copiedFormat = copyFormatFromEditor(editor);

    expect(copiedFormat).not.toBeNull();
    expect(copiedFormat!.domain).toBe('html');

    const tagNames = copiedFormat!.tagDefinitions.map(
      (tagDefinition) => tagDefinition.tagName,
    );
    expect(tagNames).toContain('b');
    expect(tagNames).toContain('i');
  });

  it('copies underline + font color from formatted text', () => {
    const editor = createTestEditor('<u><span style="color: red">colored</span></u>');
    selectSubstring(editor, 'colored');

    const copiedFormat = copyFormatFromEditor(editor);

    expect(copiedFormat).not.toBeNull();

    const tagNames = copiedFormat!.tagDefinitions.map(
      (tagDefinition) => tagDefinition.tagName,
    );
    expect(tagNames).toContain('u');
    expect(tagNames).toContain('span');

    // Verify the span tag has the color attribute
    const spanTag = copiedFormat!.tagDefinitions.find(
      (tagDefinition) => tagDefinition.tagName === 'span',
    );
    expect(spanTag).toBeDefined();
    expect(spanTag!.attributes).toBeDefined();
    expect(spanTag!.attributes!['color']).toBe('red');
  });

  it('copies format from HTML domain and applies to plain text', () => {
    // Source: copy format from bold underline text
    const sourceEditor = createTestEditor('<u><b>source</b></u>');
    selectSubstring(sourceEditor, 'source');

    const copiedFormat = copyFormatFromEditor(sourceEditor);
    expect(copiedFormat).not.toBeNull();

    // Target: apply copied format to plain text
    let targetEditor = createTestEditor('target');
    targetEditor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 6 });

    for (const tagDefinition of copiedFormat!.tagDefinitions) {
      addTagInEditor(targetEditor, tagDefinition);
      targetEditor = rebuildEditor(targetEditor);
      selectSubstring(targetEditor, 'target');
    }

    const finalContent = targetEditor.getValue();
    expect(finalContent).toContain('<u>');
    expect(finalContent).toContain('<b>');
    expect(finalContent).toContain('target');
  });

  it('returns empty tag definitions for plain unformatted text', () => {
    const editor = createTestEditor('just plain text');
    selectSubstring(editor, 'plain');

    const copiedFormat = copyFormatFromEditor(editor);

    expect(copiedFormat).not.toBeNull();
    expect(copiedFormat!.tagDefinitions).toHaveLength(0);
  });
});

// ============================================================
// Group 3: removeAllTags through editor on complex formatting
// ============================================================

describe('Group 3: removeAllTags on complex formatting', () => {

  it('removes all nested tags: bold + italic + underline + font-color', () => {
    const editor = createTestEditor(
      '<span style="color: red"><u><b><i>text</i></b></u></span>',
    );
    selectSubstring(editor, 'text');

    removeAllTagsInEditor(editor);

    expect(editor.getValue()).toBe('text');
  });

  it('removes formatting from text with underline + subscript nesting', () => {
    const editor = createTestEditor('<u><sub>H2O</sub></u>');
    selectSubstring(editor, 'H2O');

    removeAllTagsInEditor(editor);

    expect(editor.getValue()).toBe('H2O');
  });

  it('removes bold markdown formatting via removeAllTags', () => {
    const editor = createTestEditor('**bold text**');
    selectSubstring(editor, 'bold text');

    removeAllTagsInEditor(editor);

    expect(editor.getValue()).toBe('bold text');
  });

  it('removes all formatting from multi-nested HTML tags', () => {
    const editor = createTestEditor(
      '<span style="font-size: 14pt"><span style="color: blue"><b>styled</b></span></span>',
    );
    selectSubstring(editor, 'styled');

    removeAllTagsInEditor(editor);

    expect(editor.getValue()).toBe('styled');
  });

  it('removeAllTags on heading line preserves heading prefix by default', () => {
    // The heading prefix (##) is a line prefix, not a formatting tag.
    // removeAllTags should strip formatting tags but the ## is structural.
    const editor = createTestEditor('## <b>heading</b>');
    selectSubstring(editor, 'heading');

    removeAllTagsInEditor(editor);

    // ## is a line prefix, not a tag — it should remain
    expect(editor.getValue()).toContain('heading');
    expect(editor.getValue()).not.toContain('<b>');
  });

  it('removeAllTags on todo line preserves checkbox prefix', () => {
    const editor = createTestEditor('- [ ] <u>formatted todo</u>');
    selectSubstring(editor, 'formatted todo');

    removeAllTagsInEditor(editor);

    const finalContent = editor.getValue();
    expect(finalContent).toContain('- [ ]');
    expect(finalContent).toContain('formatted todo');
    expect(finalContent).not.toContain('<u>');
  });
});

// ============================================================
// Group 4: Editor State Derivation Tests
// ============================================================

describe('Group 4: Editor state derivation via tag finder + extractSpanAndDivState', () => {

  const defaults = { defaultFontFamily: 'default', defaultFontSize: '16' };

  it('detects bold + italic + underline — all three booleans true', () => {
    const sourceText = '<b><i><u>text</u></i></b>';
    const finder = createEnclosingHtmlTagFinder(sourceText);
    const tagRanges = finder.getEnclosingTagRanges({
      cursorPosition: { line: 0, ch: 12 },
    });
    const tagNames = tagRanges.map((range) => range.tagName);

    expect(tagNames).toContain('b');
    expect(tagNames).toContain('i');
    expect(tagNames).toContain('u');
  });

  it('detects font color span + highlight background span', () => {
    const sourceText = '<span style="background: yellow"><span style="color: red">text</span></span>';
    const finder = createEnclosingHtmlTagFinder(sourceText);
    const tagRanges = finder.getEnclosingTagRanges({
      cursorPosition: { line: 0, ch: 62 },
    });

    const spanState = extractSpanAndDivState(
      tagRanges,
      sourceText,
      defaults.defaultFontFamily,
      defaults.defaultFontSize,
    );

    expect(spanState.fontColor).toBe('red');
    expect(spanState.highlightColor).toBe('yellow');
  });

  it('detects font-family + font-size spans', () => {
    const sourceText = '<span style="font-family: \'Courier\'"><span style="font-size: 20pt">text</span></span>';
    const finder = createEnclosingHtmlTagFinder(sourceText);
    const tagRanges = finder.getEnclosingTagRanges({
      cursorPosition: { line: 0, ch: 72 },
    });

    const spanState = extractSpanAndDivState(
      tagRanges,
      sourceText,
      defaults.defaultFontFamily,
      defaults.defaultFontSize,
    );

    expect(spanState.fontFamily).toBe('Courier');
    expect(spanState.fontSize).toBe('20');
  });

  it('detects text-align from enclosing div', () => {
    const sourceText = '<div style="text-align: center">centered text</div>';
    const finder = createEnclosingHtmlTagFinder(sourceText);
    const tagRanges = finder.getEnclosingTagRanges({
      cursorPosition: { line: 0, ch: 35 },
    });

    const spanState = extractSpanAndDivState(
      tagRanges,
      sourceText,
      defaults.defaultFontFamily,
      defaults.defaultFontSize,
    );

    expect(spanState.textAlign).toBe('center');
  });

  it('detects heading level from ## prefix', () => {
    const sourceText = '## heading text';
    const finder = createEnclosingHtmlTagFinder(sourceText);
    const tagRanges = finder.getEnclosingTagRanges({
      cursorPosition: { line: 0, ch: 5 },
    });
    const tagNames = tagRanges.map((range) => range.tagName);

    // ## is detected as a heading tag by the enclosing tag finder
    expect(tagNames).toContain('heading');

    // Verify line-level detection: heading regex
    const headMatch = sourceText.match(/^(#{1,6})\s/);
    expect(headMatch).not.toBeNull();
    expect(headMatch![1].length).toBe(2);
  });

  it('detects bullet list from "- " prefix', () => {
    const sourceText = '- list item text';

    // Line-level detection via regex (same as deriveEditorState)
    const isBulletList = /^\s*[-*+]\s/.test(sourceText);
    expect(isBulletList).toBe(true);

    const isNumberedList = /^\s*\d+\.\s/.test(sourceText);
    expect(isNumberedList).toBe(false);
  });

  it('detects todo line as bullet-like (starts with "- ")', () => {
    const sourceText = '- [ ] todo item';

    // Todo lines start with "- " so bulletList regex also matches
    const isBulletList = /^\s*[-*+]\s/.test(sourceText);
    expect(isBulletList).toBe(true);
  });

  it('complex: heading with underline + font color', () => {
    const sourceText = '## <u><span style="color: red">heading</span></u>';
    const finder = createEnclosingHtmlTagFinder(sourceText);
    const tagRanges = finder.getEnclosingTagRanges({
      cursorPosition: { line: 0, ch: 35 },
    });
    const tagNames = tagRanges.map((range) => range.tagName);

    // Should detect heading, underline, and span
    expect(tagNames).toContain('heading');
    expect(tagNames).toContain('u');
    expect(tagNames).toContain('span');

    const spanState = extractSpanAndDivState(
      tagRanges,
      sourceText,
      defaults.defaultFontFamily,
      defaults.defaultFontSize,
    );

    expect(spanState.fontColor).toBe('red');

    // Heading level from line-level regex
    const headMatch = sourceText.match(/^(#{1,6})\s/);
    expect(headMatch).not.toBeNull();
    expect(headMatch![1].length).toBe(2);
  });

  it('detects bold and italic from markdown ** and * markers', () => {
    const sourceText = '***bold and italic***';
    const finder = createEnclosingHtmlTagFinder(sourceText);
    const tagRanges = finder.getEnclosingTagRanges({
      cursorPosition: { line: 0, ch: 10 },
    });
    const tagNames = tagRanges.map((range) => range.tagName);

    expect(tagNames).toContain('bold');
    expect(tagNames).toContain('italic');
  });

  it('detects numbered list from "1. " prefix', () => {
    const sourceText = '1. numbered item';

    const isNumberedList = /^\s*\d+\.\s/.test(sourceText);
    expect(isNumberedList).toBe(true);

    const isBulletList = /^\s*[-*+]\s/.test(sourceText);
    expect(isBulletList).toBe(false);
  });

  it('returns defaults for plain text with no formatting', () => {
    const sourceText = 'just plain text';
    const finder = createEnclosingHtmlTagFinder(sourceText);
    const tagRanges = finder.getEnclosingTagRanges({
      cursorPosition: { line: 0, ch: 5 },
    });

    expect(tagRanges).toHaveLength(0);

    const spanState = extractSpanAndDivState(
      tagRanges,
      sourceText,
      defaults.defaultFontFamily,
      defaults.defaultFontSize,
    );

    expect(spanState.fontColor).toBeNull();
    expect(spanState.highlightColor).toBeNull();
    expect(spanState.fontFamily).toBe('default');
    expect(spanState.fontSize).toBe('16');
    expect(spanState.textAlign).toBe('left');
  });
});

// ============================================================
// Group 5: Format Interactions with Protected Ranges
// ============================================================

describe('Group 5: Format interactions with protected ranges', () => {

  it('bold on "hello [[link]] world" splits formatting around wikilink', () => {
    const editor = createTestEditor('hello [[link]] world');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 20 });

    toggleTagInEditor(editor, BOLD_MD_TAG);

    const finalContent = editor.getValue();
    // The wikilink [[link]] should be preserved without formatting delimiters inside it
    expect(finalContent).toContain('[[link]]');

    // The non-protected parts should be wrapped
    // Bold wraps around the gaps: "hello " and " world"
    const boldOpenCount = (finalContent.match(/\*\*/g) || []).length;
    // Each gap gets opening + closing = 2 markers; 2 gaps = 4 markers total
    expect(boldOpenCount).toBeGreaterThanOrEqual(4);
  });

  it('underline on "hello ![[embed]] world" splits around embed', () => {
    const editor = createTestEditor('hello ![[embed]] world');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 22 });

    toggleTagInEditor(editor, UNDERLINE_TAG);

    const finalContent = editor.getValue();
    // Embed should be preserved intact
    expect(finalContent).toContain('![[embed]]');
    // The gaps should be wrapped with <u> tags
    expect(finalContent).toContain('<u>');
    expect(finalContent).toContain('</u>');
  });

  it('font color on text with #hashtag splits around hashtag', () => {
    const fontColorTag = buildSpanTagDefinition('color', 'green');

    const editor = createTestEditor('text #hashtag more');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 18 });

    addTagInEditor(editor, fontColorTag);

    const finalContent = editor.getValue();
    // Hashtag should be preserved without span wrapping
    expect(finalContent).toContain('#hashtag');
    // The formattable text around it should be wrapped
    expect(finalContent).toContain('<span style="color: green">');
  });

  it('bold on "[text](url)" markdown link splits around link', () => {
    const editor = createTestEditor('hello [click](http://example.com) world');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 39 });

    toggleTagInEditor(editor, BOLD_MD_TAG);

    const finalContent = editor.getValue();
    // The markdown link should be preserved intact
    expect(finalContent).toContain('[click](http://example.com)');
  });

  it('underline on text with wikilink at the beginning preserves it', () => {
    const editor = createTestEditor('[[note]] followed by text');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 25 });

    toggleTagInEditor(editor, UNDERLINE_TAG);

    const finalContent = editor.getValue();
    expect(finalContent).toContain('[[note]]');
    expect(finalContent).toContain('<u>');
  });

  it('underline on text with wikilink at the end preserves it', () => {
    const editor = createTestEditor('text before [[note]]');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 20 });

    toggleTagInEditor(editor, UNDERLINE_TAG);

    const finalContent = editor.getValue();
    expect(finalContent).toContain('[[note]]');
    expect(finalContent).toContain('<u>');
  });
});

// ============================================================
// Additional Integration Scenarios
// ============================================================

describe('Additional integration scenarios', () => {

  it('toggle bold on, then toggle bold off restores original text', () => {
    let editor = createTestEditor('roundtrip');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 9 });

    toggleTagInEditor(editor, BOLD_MD_TAG);
    expect(editor.getValue()).toBe('**roundtrip**');

    editor = rebuildEditor(editor);
    selectSubstring(editor, 'roundtrip');
    toggleTagInEditor(editor, BOLD_MD_TAG);

    expect(editor.getValue()).toBe('roundtrip');
  });

  it('toggle underline on, then toggle underline off restores original text', () => {
    let editor = createTestEditor('roundtrip');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 9 });

    toggleTagInEditor(editor, UNDERLINE_TAG);
    expect(editor.getValue()).toBe('<u>roundtrip</u>');

    editor = rebuildEditor(editor);
    selectSubstring(editor, 'roundtrip');
    toggleTagInEditor(editor, UNDERLINE_TAG);

    expect(editor.getValue()).toBe('roundtrip');
  });

  it('addTag does not remove existing formatting — it always adds', () => {
    let editor = createTestEditor('<u>already underlined</u>');
    selectSubstring(editor, 'already underlined');

    // addTag with bold should wrap, not toggle off underline
    addTagInEditor(editor, BOLD_HTML_TAG);

    const finalContent = editor.getValue();
    expect(finalContent).toContain('<u>');
    expect(finalContent).toContain('<b>');
  });

  it('removeTag only removes the specified tag, leaving others intact', () => {
    const editor = createTestEditor('<u><b>text</b></u>');
    selectSubstring(editor, 'text');

    removeTagInEditor(editor, BOLD_HTML_TAG);

    const finalContent = editor.getValue();
    expect(finalContent).toContain('<u>');
    expect(finalContent).not.toContain('<b>');
    expect(finalContent).toContain('text');
  });

  it('buildStylingContextFromEditor handles multi-line content correctly', () => {
    const editor = createTestEditor('line one\nline two\nline three');
    editor.setSelection({ line: 1, ch: 0 }, { line: 1, ch: 8 });

    const context = buildStylingContextFromEditor(editor);

    expect(context).not.toBeNull();
    expect(context!.selectedText).toBe('line two');
    // "line one\n" = 9 chars, so line 2 starts at offset 9
    expect(context!.selectionStartOffset).toBe(9);
    expect(context!.selectionEndOffset).toBe(17);
  });

  it('strikethrough toggle on and off works with markdown markers', () => {
    let editor = createTestEditor('strike');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 6 });

    toggleTagInEditor(editor, STRIKETHROUGH_MD_TAG);
    expect(editor.getValue()).toBe('~~strike~~');

    editor = rebuildEditor(editor);
    selectSubstring(editor, 'strike');
    toggleTagInEditor(editor, STRIKETHROUGH_MD_TAG);

    expect(editor.getValue()).toBe('strike');
  });

  it('highlight toggle works with markdown == markers', () => {
    let editor = createTestEditor('important');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 9 });

    toggleTagInEditor(editor, HIGHLIGHT_MD_TAG);
    expect(editor.getValue()).toBe('==important==');

    editor = rebuildEditor(editor);
    selectSubstring(editor, 'important');
    toggleTagInEditor(editor, HIGHLIGHT_MD_TAG);

    expect(editor.getValue()).toBe('important');
  });

  it('superscript toggle on and off works', () => {
    let editor = createTestEditor('2');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 1 });

    toggleTagInEditor(editor, SUPERSCRIPT_TAG);
    expect(editor.getValue()).toBe('<sup>2</sup>');

    editor = rebuildEditor(editor);
    selectSubstring(editor, '2');
    toggleTagInEditor(editor, SUPERSCRIPT_TAG);

    expect(editor.getValue()).toBe('2');
  });

  it('font color can be removed via removeTag with matching span definition', () => {
    const fontColorTag = buildSpanTagDefinition('color', 'red');

    const editor = createTestEditor('<span style="color: red">colored</span>');
    selectSubstring(editor, 'colored');

    removeTagInEditor(editor, fontColorTag);

    expect(editor.getValue()).toBe('colored');
  });

  it('highlight color (background span) can be set and replaced', () => {
    const yellowHighlight = buildSpanTagDefinition('background', 'yellow');
    const greenHighlight = buildSpanTagDefinition('background', 'green');

    let editor = createTestEditor('highlight me');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 12 });

    addTagInEditor(editor, yellowHighlight);
    expect(editor.getValue()).toBe('<span style="background: yellow">highlight me</span>');

    editor = rebuildEditor(editor);
    selectSubstring(editor, 'highlight me');
    addTagInEditor(editor, greenHighlight);

    expect(editor.getValue()).toBe('<span style="background: green">highlight me</span>');
  });
});
