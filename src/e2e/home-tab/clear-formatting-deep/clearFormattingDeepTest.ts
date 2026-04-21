import type { SuiteTestResult } from '../home/interfaces';
import { runHomeTabSuite } from '../home/suite-helpers/suiteHelpers';

/**
 * Deep tests for TagRemove.ts — removeTag and removeAllTags functions:
 *  - removeAllTags: enclosing tags present → unwrap all (main body path)
 *  - removeAllTags: isFullyInert → early return (code block)
 *  - removeAllTags: containedTagRanges + enclosingTagRanges combined
 *  - removeTag: delimiterMatch path (markdown delimiter tag)
 *  - removeTag: no match → isNoOp: true
 *  - editor-integration/helpers.ts: null context early return paths
 */
export async function clearFormattingDeepTest(): Promise<SuiteTestResult[]> {
  return runHomeTabSuite(
    'clear-formatting-deep',
    async ({ clickByCommand, editor, selectToken, wait }) => {
      // Test 1: Clear all formatting on bold+italic+underline text.
      // removeAllTags: enclosingTagRanges non-empty → unwrap loop fires.
      editor.setValue('<b><i><u>heavily formatted text</u></i></b>');
      await wait(60);
      selectToken('heavily formatted text');
      clickByCommand('clear-all');
      await wait(120);

      // Test 2: Clear all formatting on markdown formatted text.
      // removeAllTags: handles **bold** and _italic_ delimiter-inclusive matches.
      editor.setValue('**bold** and _italic_ and ~~strikethrough~~ text');
      await wait(60);
      // Select the whole line
      editor.setSelection(editor.offsetToPos(0), editor.offsetToPos(49));
      clickByCommand('clear-all');
      await wait(120);

      // Test 3: Clear all formatting on fully inert content (code block).
      // removeAllTags: isFullyInert → early return (no-op).
      editor.setValue('```\nformatted code content\n```');
      await wait(60);
      editor.setSelection(editor.offsetToPos(4), editor.offsetToPos(26));
      clickByCommand('clear-all');
      await wait(100);

      // Test 4: Clear formatting on text with nested span tags.
      // removeAllTags: containedTagRanges (tags fully within selection) are also removed.
      editor.setValue('outer <span style="color:red;"><b>inner bold</b></span> end');
      await wait(60);
      editor.setSelection(editor.offsetToPos(0), editor.offsetToPos(59));
      clickByCommand('clear-all');
      await wait(120);

      // Test 5: removeTag (via removeTagInEditor) — delimiter match path.
      // Apply bold (which uses ** delimiter), then remove bold tag specifically.
      editor.setValue('**bold markdown text**');
      await wait(60);
      selectToken('bold markdown text');
      // Click bold to toggle-off (which calls removeTag → findDelimiterInclusiveMatch)
      clickByCommand('bold');
      await wait(100);

      // Test 6: removeTag — no match → isNoOp.
      // Attempt to remove italic from plain text (no italic present).
      editor.setValue('plain text no formatting');
      await wait(60);
      selectToken('plain text no formatting');
      // Click italic to try to remove it — no italic present → isNoOp
      clickByCommand('italic');
      await wait(100);

      // Then click italic again to apply (so the first click was no-op, second adds)
      clickByCommand('italic');
      await wait(100);

      // Test 7: Clear formatting on text with mixed span colors (complex removeAllTags).
      // removeAllTags handles both enclosing and contained tags simultaneously.
      editor.setValue('<span style="background:#FF0">highlighted</span> and <b>bold</b> together');
      await wait(60);
      editor.setSelection(editor.offsetToPos(0), editor.offsetToPos(72));
      clickByCommand('clear-all');
      await wait(120);
    }
  );
}
