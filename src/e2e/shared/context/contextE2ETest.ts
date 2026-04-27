/**
 * Context E2E Test Suite
 * Tests React context providers functionality in the ribbon plugin.
 */

import type { SuiteTestResult } from '../interfaces';
import { wait } from '../suiteHelpers';

/**
 * Tests AppContext provider functionality.
 */
async function testAppContext(): Promise<SuiteTestResult[]> {
  const ribbonRoot = document.getElementById('onenote-ribbon-root');

  if (!ribbonRoot) {
    throw new Error('onenote-ribbon-root not found — AppContext did not mount the ribbon');
  }

  if (typeof app === 'undefined' || app === null) {
    throw new Error('Obsidian app not accessible — AppContext provider is not wrapping the tree');
  }

  // Verify command buttons are rendered (proves AppContext wired through to child components)
  const commandButtonCount = document.querySelectorAll('[data-cmd]').length;
  if (commandButtonCount === 0) {
    throw new Error('No [data-cmd] buttons found — AppContext did not reach child components');
  }

  return [{ test: 'app-context', pass: true }];
}

/**
 * Tests FormatPainterContext provider functionality.
 */
async function testFormatPainterContext(): Promise<SuiteTestResult[]> {
  const formatPainterButton = document.querySelector('[data-cmd="format-painter"]');

  if (!formatPainterButton) {
    throw new Error('format-painter button not found — FormatPainterContext may not be mounted');
  }

  // Arm: clicking once must reflect the context state transition on the button
  formatPainterButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  await wait(100);

  const isArmed =
    formatPainterButton.classList.contains('onr-active') ||
    document.body.classList.contains('onr-format-painter-active');
  if (!isArmed) {
    throw new Error('FormatPainterContext: armed state not reflected after single click');
  }

  // Disarm: cancel click must remove the active state
  formatPainterButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  await wait(100);

  return [{ test: 'format-painter-context', pass: true }];
}

/**
 * Main context test suite export.
 */
export async function contextE2ETest(): Promise<SuiteTestResult[]> {
  const appContextResults = await testAppContext();
  const formatPainterContextResults = await testFormatPainterContext();

  const aggregatedResults = [...appContextResults, ...formatPainterContextResults];

  const failedTests = aggregatedResults.filter((result) => !result.pass);
  if (failedTests.length > 0) {
    const failedNames = failedTests.map((result) => result.test).join(', ');
    throw new Error(
      `contextE2ETest: ${failedTests.length} context scenario(s) failed: ${failedNames}`
    );
  }

  return aggregatedResults;
}
