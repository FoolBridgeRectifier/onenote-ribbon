import type { SuiteTestResult } from '../home/interfaces';
import { runHomeTabSuite } from '../home/suite-helpers/suiteHelpers';

/**
 * Deep tests for domain-conversion and wrap-replacements branches:
 *  - DomainConversion.ts: buildDomainConversionReplacements when enclosingMarkdownRanges.length > 0
 *    (adding HTML span tag inside **bold** text → domain='markdown' + hasMarkdownTokens=true)
 *  - WrapReplacements.ts: buildWrapReplacements lines 9,13,14 (domain conversion branch)
 *  - TagAdd.ts: isSpanWithAttributes → matchingRange !== null (replace existing span attribute)
 *  - TagAdd.ts: structureContext.isFullyInert → true (adding to code block → no-op)
 */
export async function domainConversionDeepTest(): Promise<SuiteTestResult[]> {
  return runHomeTabSuite('domain-conversion-deep', async ({ clickByCommand, editor, wait }) => {
    if (!editor) {
      throw new Error('domain-conversion-deep: no editor provided to suite');
    }

    const click = (element: Element): void => {
      element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    };

    // First: select a non-default highlight color swatch to set lastHighlightColor to HTML span color.
    // This ensures subsequent highlight button clicks use addTagInEditor with a span tag (HTML domain).
    editor.setValue('text');
    editor.setCursor({ line: 0, ch: 0 });
    await wait(60);

    const highlightCaretBtn = document.querySelector('.onr-highlight-wrapper .onr-caret-btn');

    if (highlightCaretBtn) {
      click(highlightCaretBtn);
      await wait(100);
    }

    const swatches = document.querySelectorAll('.onr-cp-grid .onr-cp-swatch');

    if (swatches.length > 0) {
      // Select first swatch to set lastHighlightColor to a non-default color (HTML span domain)
      click(swatches[0]);
      await wait(120);
    }

    // Test 1: Add HTML color span inside bold markdown text.
    // domain='markdown', hasMarkdownTokens=true, tagDefinition.domain='html' → domain conversion fires.
    // DomainConversion.ts: enclosingMarkdownRanges.length > 0 → converts ** to <strong> + wraps.
    const boldMarkdownContent = '**bold text to color**';
    editor.setValue(boldMarkdownContent);
    await wait(80);
    editor.setSelection(editor.offsetToPos(2), editor.offsetToPos(20));
    // Click highlight — lastHighlightColor is now the swatch (HTML span), not default MD tag
    clickByCommand('highlight');
    await wait(120);

    // Domain conversion must have changed the content (** → <strong>, span added).
    const afterHighlight1 = editor.getValue();
    if (!afterHighlight1.includes('<strong>') || !afterHighlight1.includes('background:')) {
      throw new Error('domain-conversion-deep test1: expected <strong> + background: span after domain conversion, got: ' + afterHighlight1);
    }

    // Test 2: Add HTML color span inside italic markdown text.
    editor.setValue('*italic text here*');
    await wait(60);
    editor.setSelection(editor.offsetToPos(1), editor.offsetToPos(17));
    clickByCommand('highlight');
    await wait(120);

    // Domain conversion must have changed the content (* → <em>, span added).
    const afterHighlight2 = editor.getValue();
    if (!afterHighlight2.includes('<em>') || !afterHighlight2.includes('background:')) {
      throw new Error('domain-conversion-deep test2: expected <em> + background: span after domain conversion, got: ' + afterHighlight2);
    }

    // Test 3: Replace existing span attribute (isSpanWithAttributes + matchingRange !== null).
    // Text already has a color span → add a different color → should replace attribute.
    const spanContent = '<span style="background:#FF0000;">existing color</span>';
    editor.setValue(spanContent);
    await wait(60);
    editor.setSelection(editor.offsetToPos(34), editor.offsetToPos(48));
    // The editor has an HTML span → domain='html' → no domain conversion, but span replacement fires.
    clickByCommand('highlight');
    await wait(100);

    // Span attribute must be replaced — content must change from original.
    if (editor.getValue() === spanContent) {
      throw new Error('domain-conversion-deep test3: span attribute unchanged — matchingRange replacement did not fire');
    }

    // Test 4: isFullyInert → true (TagAdd early return).
    // Entire selection is inside a code fence.
    const codeBlockContent = '```\ncode block content here\n```';
    editor.setValue(codeBlockContent);
    await wait(60);
    editor.setSelection(editor.offsetToPos(4), editor.offsetToPos(28));
    clickByCommand('highlight');
    await wait(100);

    // Inert guard must have blocked all modifications
    if (editor.getValue() !== codeBlockContent) {
      throw new Error('domain-conversion-deep test4: content changed inside code block — isFullyInert guard did not prevent modification');
    }

    // Test 5: Multi-line selection crossing a code block (partially inert).
    // shouldProcessPerLine + buildEffectiveLineRanges skips inert lines.
    editor.setValue('- list item one\n```\ncode here\n```\n- list item two');
    await wait(60);
    const value = editor.getValue();
    editor.setSelection(
      editor.offsetToPos(value.indexOf('list item one')),
      editor.offsetToPos(value.indexOf('list item two') + 'list item two'.length)
    );
    clickByCommand('bold');
    await wait(120);

    // Lines inside the code block are inert → only the two list lines receive bold.
    const afterBold5 = editor.getValue();
    if (afterBold5 !== '- **list item one**\n```\ncode here\n```\n- **list item two**') {
      throw new Error('domain-conversion-deep test5: expected bold on list lines only, code block skipped, got: ' + afterBold5);
    }
  });
}
