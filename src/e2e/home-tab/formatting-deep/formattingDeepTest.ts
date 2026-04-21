import type { SuiteTestResult } from '../home/interfaces';
import { runHomeTabSuite } from '../home/suite-helpers/suiteHelpers';

/**
 * Deep tests for formatting paths not covered by the basic-text suite.
 * Specifically targets:
 *  - deduplicateReplacements in SharedHelpers.ts (called when removing a tag)
 *  - handleFormatPainterDoubleClick in Clipboard.tsx (locked mode)
 *  - applyFormat when painter is in locked mode
 */
export async function formattingDeepTest(): Promise<SuiteTestResult[]> {
  return runHomeTabSuite(
    'formatting-deep',
    async ({ clickByCommand, editor, selectToken, wait }) => {
      // Test 1: Toggle off an existing bold tag to exercise deduplicateReplacements.
      // Set text that already contains bold markdown, select the bold content,
      // then click bold again — this calls TagRemove → deduplicateReplacements.
      editor.setValue('**hello world** plain');
      selectToken('hello world');
      clickByCommand('bold');
      await wait(120);

      const afterBoldToggleOff = editor.getValue();
      const boldRemovedPass = !afterBoldToggleOff.includes('**hello world**');
      if (!boldRemovedPass) {
        throw new Error('Bold toggle-off failed: ' + afterBoldToggleOff);
      }

      // Test 2: Toggle off italic to hit deduplicateReplacements again for a different tag type.
      editor.setValue('_italic content_ normal');
      selectToken('italic content');
      clickByCommand('italic');
      await wait(120);

      const afterItalicToggleOff = editor.getValue();
      const italicRemovedPass = !afterItalicToggleOff.includes('_italic content_');
      if (!italicRemovedPass) {
        throw new Error('Italic toggle-off failed: ' + afterItalicToggleOff);
      }

      // Test 3: Format painter double-click to enter locked mode.
      // In locked mode, format is applied on every editor click until Escape.
      editor.setValue('**source bold** destination');
      selectToken('source bold');
      clickByCommand('format-painter');
      clickByCommand('format-painter');
      await wait(80);

      // Now select destination and click in the editor to apply format in locked mode
      selectToken('destination');

      const editorElement = document.querySelector('.cm-editor');
      if (editorElement) {
        editorElement.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      }

      // Wait for the 50ms apply-after-click timer plus React re-render
      await wait(200);

      const afterLockedPaint = editor.getValue();
      const lockedPaintPass =
        afterLockedPaint.includes('source bold') && afterLockedPaint.includes('destination');
      if (!lockedPaintPass) {
        throw new Error('Locked format painter failed: ' + afterLockedPaint);
      }

      // Test 4: Escape cancels the locked format painter.
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
      );
      await wait(80);

      // After Escape, the format painter should be back in idle mode.
      // Click in the editor again — format should NOT be applied.
      const editorElementAfterEscape = document.querySelector('.cm-editor');
      if (editorElementAfterEscape) {
        editorElementAfterEscape.dispatchEvent(
          new MouseEvent('click', { bubbles: true, cancelable: true })
        );
      }
      await wait(200);
    }
  );
}
