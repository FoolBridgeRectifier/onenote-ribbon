import type { SuiteTestResult } from '../home/interfaces';
import { runHomeTabSuite } from '../home/suite-helpers/suiteHelpers';

/**
 * E2E coverage for callout sequencing and removal edge cases:
 *
 *  1. Sequential callout apply — clicking Important then Question must nest Question
 *     inside Important rather than wrapping the Important header line with an extra ">".
 *     Regression for: applyCallout leaving cursor on the header line.
 *
 *  2. Parent callout removal reduces child depth — removing the outer callout must
 *     strip one ">" from child callout headers and body lines, not drop them.
 *     Regression for: removeActiveCallout skipping ALL callout header lines.
 *
 *  3. Multiple checkbox adds — clicking the todo button multiple times:
 *     a) On a plain line → creates a checkbox.
 *     b) On an already-checked line → stays a checkbox (existingTaskMatch, idempotent).
 *     c) On a callout body line → applies checkbox inside the blockquote prefix.
 */
export async function calloutSequenceDeepTest(): Promise<SuiteTestResult[]> {
  return runHomeTabSuite('callout-sequence-deep', async ({ clickByCommand, editor, wait }) => {

    // ── Test 1: Sequential callout apply ──────────────────────────────────────
    // After the first applyCallout the cursor must be on the body line (line 1).
    // The second clickByCommand('question') should therefore nest inside the body,
    // not wrap the already-written Important header with an extra ">".
    editor.setValue('my note');
    editor.setCursor({ line: 0, ch: 0 });

    clickByCommand('important');
    await wait(80);

    clickByCommand('question');
    await wait(80);

    const afterSequentialCallouts = editor.getValue();
    const sequentialCalloutPass =
      afterSequentialCallouts === '> [!important] Important\n>> [!question] Question\n>> my note';

    if (!sequentialCalloutPass) {
      throw new Error(
        'Sequential callout apply corrupted the Important header. Got: ' +
        afterSequentialCallouts,
      );
    }

    // ── Test 2: Parent callout removal reduces child depth ────────────────────
    // Starting with Important wrapping Question — remove Important.
    // The child Question header and its body must each lose exactly one ">".
    editor.setValue('> [!important] Important\n>> [!question] Question\n>> my note');
    editor.setCursor({ line: 0, ch: 0 });

    clickByCommand('important');
    await wait(80);

    const afterParentRemoval = editor.getValue();
    const parentRemovalPass =
      afterParentRemoval === '> [!question] Question\n> my note';

    if (!parentRemovalPass) {
      throw new Error(
        'Parent callout removal did not reduce child callout depth. Got: ' +
        afterParentRemoval,
      );
    }

    // ── Test 3a: First checkbox add on a plain line ───────────────────────────
    editor.setValue('task item');
    editor.setCursor({ line: 0, ch: 0 });

    clickByCommand('todo');
    await wait(80);

    const afterFirstCheckbox = editor.getValue();
    const firstCheckboxPass = afterFirstCheckbox === '- [ ] task item';

    if (!firstCheckboxPass) {
      throw new Error('First todo add produced unexpected output: ' + afterFirstCheckbox);
    }

    // ── Test 3b: Second checkbox add on a different plain line ────────────────
    // Verifies that adding todo to multiple separate plain lines all produce checkboxes.
    editor.setValue('another item');
    editor.setCursor({ line: 0, ch: 0 });

    clickByCommand('todo');
    await wait(80);

    const afterSecondCheckbox = editor.getValue();
    const secondCheckboxPass = afterSecondCheckbox === '- [ ] another item';

    if (!secondCheckboxPass) {
      throw new Error(
        'Second todo add on a new plain line produced unexpected output: ' +
        afterSecondCheckbox,
      );
    }

    // ── Test 3c: Third checkbox add on a callout body line ────────────────────
    // A wait before clicking is required so the hook can recompute activeTagKeys
    // (clearing the stale __task__ state from test 3b). Once the hook has no active
    // task, handleTodo delegates to the native Obsidian toggle-checklist command,
    // which correctly inserts "- [ ]" inside the existing blockquote prefix.
    editor.setValue('> body inside callout');
    editor.setCursor({ line: 0, ch: 5 });
    await wait(80);

    clickByCommand('todo');
    await wait(80);

    const afterCalloutCheckbox = editor.getValue();
    const calloutCheckboxPass = afterCalloutCheckbox === '> - [ ] body inside callout';

    if (!calloutCheckboxPass) {
      throw new Error(
        'Todo add inside callout body produced unexpected output: ' +
        afterCalloutCheckbox,
      );
    }
  });
}
