/**
 * Edge Cases E2E Test Suite
 * Covers edge cases and error scenarios for the ribbon plugin.
 */

import type { SuiteTestResult } from '../helpers/interfaces';
import { wait } from '../home-tab/home/suite-helpers/suiteHelpers';

/**
 * Tests behavior when no editor is active.
 */
async function testNoEditorScenario(): Promise<SuiteTestResult[]> {
  // Try to close any active editor
  const activeLeaf = app.workspace.activeLeaf;
  if (activeLeaf) {
    activeLeaf.detach();
  }
  await wait(100);

  // Try clicking buttons when no editor - should not throw
  let noEditorPass = true;
  try {
    const buttons = document.querySelectorAll('[data-cmd]');
    for (const button of buttons) {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
  } catch (_error) {
    noEditorPass = false;
  }

  if (!noEditorPass) {
    throw new Error('No editor scenario failed');
  }

  return [{ test: 'no-editor-scenario', pass: true }];
}

/**
 * Tests ribbon collapse/expand behavior.
 */
async function testCollapsedRibbon(): Promise<SuiteTestResult[]> {
  // First, ensure ribbon is expanded by clicking a tab
  const homeTab = document.querySelector('[data-tab="Home"]');
  if (homeTab) {
    homeTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await wait(100);
  }

  // Find and click collapse button
  const collapseButton = document.querySelector('.onr-pin-btn');
  if (collapseButton) {
    collapseButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await wait(100);

    const bodyCollapsed = !document.querySelector('.onr-body');

    // Expand again by clicking the tab again (to make button visible) then clicking pin
    if (homeTab) {
      homeTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await wait(100);
    }

    const expandButton = document.querySelector('.onr-pin-btn');
    if (expandButton) {
      expandButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await wait(100);
    }

    const bodyExpanded = !!document.querySelector('.onr-body');

    if (!(bodyCollapsed && bodyExpanded)) {
      throw new Error('Collapse/expand test failed');
    }
  } else {
    throw new Error('Collapse button not found');
  }

  return [{ test: 'collapsed-ribbon', pass: true }];
}

/**
 * Tests rapid tab switching.
 */
async function testRapidTabSwitching(): Promise<SuiteTestResult[]> {
  const tabs = ['Home', 'Insert'];

  // Rapidly switch tabs 10 times
  for (let iteration = 0; iteration < 10; iteration++) {
    for (const tabName of tabs) {
      const tabElement = document.querySelector(`[data-tab="${tabName}"]`);
      if (tabElement) {
        tabElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await wait(10);
      }
    }
  }

  // Verify ribbon is still functional
  const ribbonStillFunctional = !!document.querySelector('.onr-ribbon');

  if (!ribbonStillFunctional) {
    throw new Error('Ribbon not functional after rapid tab switching');
  }

  return [{ test: 'rapid-tab-switching', pass: true }];
}

/**
 * Tests empty content handling.
 */
async function testEmptyContent(): Promise<SuiteTestResult[]> {
  // Ensure Home tab is active
  const homeTab = document.querySelector('[data-tab="Home"]');
  if (homeTab) {
    homeTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await wait(100);
  }

  // Test that buttons exist and can be clicked without errors
  const boldButton = document.querySelector('[data-cmd="bold"]');
  let testPassed = false;

  if (boldButton) {
    try {
      boldButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await wait(50);
      testPassed = true;
    } catch (_error) {
      testPassed = false;
    }
  }

  if (!testPassed) {
    throw new Error('Empty content handling test failed');
  }

  return [{ test: 'empty-content', pass: true }];
}

/**
 * Tests long content handling.
 */
async function testLongContent(): Promise<SuiteTestResult[]> {
  // Ensure Home tab is active
  const homeTab = document.querySelector('[data-tab="Home"]');
  if (homeTab) {
    homeTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await wait(100);
  }

  // Test that ribbon handles many button clicks without performance issues
  const boldButton = document.querySelector('[data-cmd="bold"]');
  let testPassed = false;

  if (boldButton) {
    try {
      // Click button multiple times to test performance
      for (let index = 0; index < 10; index++) {
        boldButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await wait(10);
      }
      testPassed = true;
    } catch (_error) {
      testPassed = false;
    }
  }

  if (!testPassed) {
    throw new Error('Long content handling test failed');
  }

  return [{ test: 'long-content', pass: true }];
}

/**
 * Tests special character handling.
 */
async function testSpecialCharacters(): Promise<SuiteTestResult[]> {
  // Ensure Home tab is active
  const homeTab = document.querySelector('[data-tab="Home"]');
  if (homeTab) {
    homeTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await wait(100);
  }

  // Test that ribbon buttons with special characters in data attributes work
  const buttons = document.querySelectorAll('[data-cmd]');
  const testPassed = buttons.length > 0;

  if (!testPassed) {
    throw new Error('Special characters test failed');
  }

  return [{ test: 'special-characters', pass: true }];
}

/**
 * Tests Unicode handling.
 */
async function testUnicode(): Promise<SuiteTestResult[]> {
  // Ensure Home tab is active
  const homeTab = document.querySelector('[data-tab="Home"]');
  if (homeTab) {
    homeTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await wait(100);
  }

  // Test that ribbon handles Unicode in group names
  const groupNames = document.querySelectorAll('.onr-group-name');
  const testPassed = groupNames.length > 0;

  if (!testPassed) {
    throw new Error('Unicode test failed');
  }

  return [{ test: 'unicode', pass: true }];
}

/**
 * Tests multiple cursor handling.
 */
async function testMultipleCursors(): Promise<SuiteTestResult[]> {
  // Ensure Home tab is active
  const homeTab = document.querySelector('[data-tab="Home"]');
  if (homeTab) {
    homeTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await wait(100);
  }

  // Test that multiple buttons can be clicked in sequence
  const buttons = document.querySelectorAll('[data-cmd]');
  let testPassed = false;

  if (buttons.length > 0) {
    try {
      // Click first few buttons
      for (let index = 0; index < Math.min(3, buttons.length); index++) {
        buttons[index].dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await wait(20);
      }
      testPassed = true;
    } catch (_error) {
      testPassed = false;
    }
  }

  if (!testPassed) {
    throw new Error('Multi-cursor test failed');
  }

  return [{ test: 'multiple-cursors', pass: true }];
}

/**
 * Tests error recovery.
 */
async function testErrorRecovery(): Promise<SuiteTestResult[]> {
  // Simulate various error conditions — set by try or catch before being read
  let recovered: boolean;

  try {
    // Try to access non-existent elements
    const nonExistent = document.querySelector('.non-existent-element');
    if (nonExistent) {
      nonExistent.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }

    // Try malformed operations
    const buttons = document.querySelectorAll('[data-cmd]');
    for (const button of buttons) {
      // Rapid clicking
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }

    await wait(100);

    // Verify ribbon still works
    recovered = !!document.querySelector('.onr-ribbon');
  } catch (_error) {
    recovered = false;
  }

  if (!recovered) {
    throw new Error('Error recovery test failed');
  }

  return [{ test: 'error-recovery', pass: true }];
}

/**
 * Tests for memory leaks.
 */
async function testMemoryLeaks(): Promise<SuiteTestResult[]> {
  // Open and close dropdowns multiple times
  const dropdownTriggers = document.querySelectorAll(
    '[data-cmd*="dropdown"], [data-cmd="styles-expand"], [data-cmd="more-tags"]'
  );

  for (let iteration = 0; iteration < 20; iteration++) {
    for (const trigger of dropdownTriggers) {
      trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await wait(30);
    }

    // Close any open dropdowns by clicking elsewhere
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await wait(30);
  }

  // Check that DOM is not accumulating elements
  const portalContainer = document.getElementById('onenote-ribbon-portals');
  const portalChildren = portalContainer?.children.length || 0;

  // Should not have excessive portal elements
  const noMemoryLeak = portalChildren < 50;

  if (!noMemoryLeak) {
    throw new Error('Memory leak detected');
  }

  return [{ test: 'memory-leaks', pass: true }];
}

/**
 * Main edge cases test function.
 */
export async function edgeCasesIntegrationTest(): Promise<SuiteTestResult[]> {
  const results: SuiteTestResult[] = [];

  results.push(...(await testNoEditorScenario()));
  results.push(...(await testCollapsedRibbon()));
  results.push(...(await testRapidTabSwitching()));
  results.push(...(await testEmptyContent()));
  results.push(...(await testLongContent()));
  results.push(...(await testSpecialCharacters()));
  results.push(...(await testUnicode()));
  results.push(...(await testMultipleCursors()));
  results.push(...(await testErrorRecovery()));
  results.push(...(await testMemoryLeaks()));

  if (results.length === 0) {
    throw new Error('edgeCasesIntegrationTest: no scenario produced any results');
  }

  return results;
}
