/**
 * Hooks E2E Test Suite
 * Tests React hooks functionality in the ribbon plugin.
 */

import type { SuiteTestResult } from '../interfaces';
import { wait } from '../suiteHelpers';

/**
 * Tests useFormatPainter hook functionality.
 */
async function testUseFormatPainterHook(): Promise<SuiteTestResult[]> {
  const formatPainterButton = document.querySelector('[data-cmd="format-painter"]');

  if (!formatPainterButton) {
    throw new Error('format-painter button not found in DOM');
  }

  // Arm: single click must transition the hook to 'armed' state, reflected on the button
  formatPainterButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  await wait(100);

  const isArmed = formatPainterButton.classList.contains('onr-active');
  if (!isArmed) {
    throw new Error('format-painter button did not become active after single click');
  }

  // Cancel: clicking the armed button must return it to idle (inactive)
  formatPainterButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  await wait(100);

  const isIdle = !formatPainterButton.classList.contains('onr-active');
  if (!isIdle) {
    throw new Error('format-painter button did not become idle after cancel click');
  }

  return [{ test: 'use-format-painter-hook', pass: true }];
}

/**
 * Tests useEditorState hook functionality.
 */
async function testUseEditorStateHook(): Promise<SuiteTestResult[]> {
  const editor = app.workspace.activeEditor?.editor;

  if (!editor) {
    throw new Error('No active editor for useEditorState hook test');
  }

  const boldButton = document.querySelector('[data-cmd="bold"]');

  if (!boldButton) {
    throw new Error('[data-cmd="bold"] not found in DOM');
  }

  // Place cursor inside bold markdown — hook must drive the bold button to active state
  editor.setValue('**bold text**');
  editor.setCursor({ line: 0, ch: 5 });
  await wait(300); // exceed the hook's content-change debounce

  if (!boldButton.classList.contains('onr-active')) {
    throw new Error('bold button not active after cursor placed inside **...**');
  }

  // Set plain text — bold button must deactivate
  editor.setValue('plain text');
  editor.setCursor({ line: 0, ch: 3 });
  await wait(300);

  if (boldButton.classList.contains('onr-active')) {
    throw new Error('bold button still active after cursor moved to plain text');
  }

  return [{ test: 'use-editor-state-hook', pass: true }];
}

/**
 * Main hooks test suite export.
 */
export async function hooksE2ETest(): Promise<SuiteTestResult[]> {
  const formatPainterResults = await testUseFormatPainterHook();
  const editorStateResults = await testUseEditorStateHook();

  const aggregatedResults = [...formatPainterResults, ...editorStateResults];

  const failedTests = aggregatedResults.filter(result => !result.pass);
  if (failedTests.length > 0) {
    const failedNames = failedTests.map(result => result.test).join(', ');
    throw new Error(`hooksE2ETest: ${failedTests.length} hook scenario(s) failed: ${failedNames}`);
  }

  return aggregatedResults;
}
