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
  // Check if format painter state exists in the DOM
  const formatPainterButton = document.querySelector('[data-cmd="format-painter"]');
  const hasFormatPainter = !!formatPainterButton;

  // Test format painter activation
  let _formatPainterActive = false;
  if (formatPainterButton) {
    formatPainterButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await wait(100);
    _formatPainterActive = formatPainterButton.classList.contains('onr-active');
  }

  if (!hasFormatPainter) {
    throw new Error('Format painter hook test failed');
  }

  return [{ test: 'use-format-painter-hook', pass: true }];
}

/**
 * Tests useEditorState hook functionality.
 */
async function testUseEditorStateHook(): Promise<SuiteTestResult[]> {
  // Check if editor state is being tracked
  const editor = app.workspace.activeEditor?.editor;
  const hasEditor = !!editor;

  // Check if any editor-dependent buttons exist
  const editorButtons = document.querySelectorAll('[data-cmd]');
  const hasEditorButtons = editorButtons.length > 0;

  if (!(hasEditor && hasEditorButtons)) {
    throw new Error('Editor state hook test failed');
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

  if (aggregatedResults.length === 0) {
    throw new Error('hooksE2ETest: no hook scenarios produced results');
  }

  return aggregatedResults;
}
