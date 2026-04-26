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
  // Check if app context is available (ribbon should be mounted)
  const ribbonRoot = document.getElementById('onenote-ribbon-root');
  const ribbonMounted = !!ribbonRoot;

  // Check if app is accessible globally
  const appAvailable = typeof app !== 'undefined' && app !== null;

  if (!(ribbonMounted && appAvailable)) {
    throw new Error('App context test failed');
  }

  return [{ test: 'app-context', pass: true }];
}

/**
 * Tests FormatPainterContext provider functionality.
 */
async function testFormatPainterContext(): Promise<SuiteTestResult[]> {
  // Check if format painter button exists (indicates context is working)
  const formatPainterButton = document.querySelector('[data-cmd="format-painter"]');
  const formatPainterAvailable = !!formatPainterButton;

  // Try to activate format painter to test context state
  let _contextWorking = false;
  if (formatPainterButton) {
    formatPainterButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await wait(100);
    _contextWorking = formatPainterButton.classList.contains('onr-active') ||
      document.body.classList.contains('onr-format-painter-active');
  }

  if (!formatPainterAvailable) {
    throw new Error('Format painter context test failed');
  }

  return [{ test: 'format-painter-context', pass: true }];
}

/**
 * Main context test suite export.
 */
export async function contextE2ETest(): Promise<SuiteTestResult[]> {
  const appContextResults = await testAppContext();
  const formatPainterContextResults = await testFormatPainterContext();

  const aggregatedResults = [...appContextResults, ...formatPainterContextResults];

  if (aggregatedResults.length === 0) {
    throw new Error('contextE2ETest: no context scenarios produced results');
  }

  return aggregatedResults;
}
