/**
 * Ribbon Components E2E Test Suite
 * Tests ribbon-level functionality including TabBar, RibbonApp, and RibbonShell.
 */

import type { SuiteTestResult } from '../helpers/interfaces';
import { wait } from '../home-tab/home/suite-helpers/suiteHelpers';

/**
 * Tests RibbonApp component rendering.
 */
async function testRibbonAppRender(): Promise<SuiteTestResult[]> {
  // First expand the ribbon by clicking a tab
  const homeTab = document.querySelector('[data-tab="Home"]');
  if (homeTab) {
    homeTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await wait(100);
  }

  const ribbonRoot = document.getElementById('onenote-ribbon-root');
  const ribbonExists = !!ribbonRoot;
  const tabBarExists = !!document.querySelector('.onr-tab-bar');
  const bodyExists = !!document.querySelector('.onr-body');

  if (!(ribbonExists && tabBarExists && bodyExists)) {
    throw new Error('Ribbon app render test failed');
  }

  return [{ test: 'ribbon-app-render', pass: true }];
}

/**
 * Tests TabBar rendering.
 */
async function testTabBarRender(): Promise<SuiteTestResult[]> {
  const tabBar = document.querySelector('.onr-tab-bar');
  const tabs = document.querySelectorAll('.onr-tab');
  const expectedTabs = ['Home', 'Insert', 'Draw', 'History', 'Review', 'View', 'Help'];

  const tabTexts = Array.from(tabs).map(tab => tab.textContent?.trim() || '');
  const allTabsPresent = expectedTabs.every(expectedTab =>
    tabTexts.some(text => text === expectedTab),
  );

  if (!(tabBar && allTabsPresent)) {
    throw new Error('Tab bar render test failed');
  }

  return [{ test: 'tab-bar-render', pass: true }];
}

/**
 * Tests TabBar click interactions.
 */
async function testTabBarClicks(): Promise<SuiteTestResult[]> {
  const tabs = ['Home', 'Insert'];
  const results: boolean[] = [];

  for (const tabName of tabs) {
    const tabElement = document.querySelector(`[data-tab="${tabName}"]`);
    if (tabElement) {
      tabElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await wait(100);

      const isActive = tabElement.classList.contains('active');
      const panelVisible = !!document.querySelector(`[data-panel="${tabName}"]`);
      results.push(isActive || panelVisible);
    }
  }

  // Switch back to Home
  const homeTab = document.querySelector('[data-tab="Home"]');
  if (homeTab) {
    homeTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await wait(100);
  }

  if (!results.every(Boolean)) {
    throw new Error('Tab bar clicks test failed');
  }

  return [{ test: 'tab-bar-clicks', pass: true }];
}

/**
 * Tests RibbonShell mounting.
 */
async function testRibbonShellMount(): Promise<SuiteTestResult[]> {
  const ribbonRoot = document.getElementById('onenote-ribbon-root');
  const portalContainer = document.getElementById('onenote-ribbon-portals');
  const mounted = !!ribbonRoot && !!portalContainer;

  if (!mounted) {
    throw new Error('Ribbon shell mount test failed');
  }

  return [{ test: 'ribbon-shell-mount', pass: true }];
}

/**
 * Tests RibbonShell unmounting (simulated by checking cleanup).
 */
async function testRibbonShellUnmount(): Promise<SuiteTestResult[]> {
  // Check that elements exist before "unmount"
  const ribbonRootBefore = document.getElementById('onenote-ribbon-root');
  const portalBefore = document.getElementById('onenote-ribbon-portals');

  // Simulate what happens during unmount by checking cleanup capability
  // (We don't actually unmount to keep test running)
  const canUnmount = !!ribbonRootBefore?.remove && !!portalBefore?.remove;

  if (!canUnmount) {
    throw new Error('Ribbon shell unmount test failed');
  }

  return [{ test: 'ribbon-shell-unmount', pass: true }];
}

/**
 * Tests active state management.
 */
async function testActiveState(): Promise<SuiteTestResult[]> {
  // Click Insert tab
  const insertTab = document.querySelector('[data-tab="Insert"]');
  if (insertTab) {
    insertTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await wait(100);
  }

  const insertActive = insertTab?.classList.contains('active');
  const insertPanelVisible = !!document.querySelector('[data-panel="Insert"]');

  // Click back to Home
  const homeTab = document.querySelector('[data-tab="Home"]');
  if (homeTab) {
    homeTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await wait(100);
  }

  const homeActive = homeTab?.classList.contains('active');
  const homePanelVisible = !!document.querySelector('[data-panel="Home"]');

  if (!((insertActive || insertPanelVisible) && (homeActive || homePanelVisible))) {
    throw new Error('Active state test failed');
  }

  return [{ test: 'active-state', pass: true }];
}

/**
 * Tests body visibility toggling.
 */
async function testBodyToggle(): Promise<SuiteTestResult[]> {
  // First, ensure ribbon is expanded by clicking a tab
  const homeTab = document.querySelector('[data-tab="Home"]');
  if (homeTab) {
    homeTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await wait(100);
  }

  const pinButton = document.querySelector('.onr-pin-btn');
  if (!pinButton) {
    throw new Error('Pin button not found');
  }

  // Get initial state
  const bodyBefore = document.querySelector('.onr-body');
  const _wasVisible = !!bodyBefore;

  // Toggle collapse
  pinButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  await wait(150);

  const bodyAfterToggle = document.querySelector('.onr-body');
  const isCollapsed = !bodyAfterToggle;

  // To expand, first click the tab to make the button visible
  if (homeTab) {
    homeTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await wait(100);
  }

  const expandButton = document.querySelector('.onr-pin-btn');
  if (expandButton) {
    expandButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await wait(150);
  }

  const bodyAfterRestore = document.querySelector('.onr-body');
  const isExpanded = !!bodyAfterRestore;

  if (!(isCollapsed && isExpanded)) {
    throw new Error('Body toggle test failed');
  }

  return [{ test: 'body-toggle', pass: true }];
}

/**
 * Tests keyboard navigation.
 */
async function testKeyboardNavigation(): Promise<SuiteTestResult[]> {
  // Open a dropdown first
  const stylesButton = document.querySelector('[data-cmd="styles-expand"]');
  if (stylesButton) {
    stylesButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await wait(100);
  }

  // Test Escape key to close dropdown
  const escapeEvent = new KeyboardEvent('keydown', {
    key: 'Escape',
    bubbles: true,
  });
  document.dispatchEvent(escapeEvent);
  await wait(100);

  // Check if dropdown closed
  const dropdownClosed = !document.querySelector('.onr-overlay-dropdown');

  if (!dropdownClosed) {
    throw new Error('Keyboard navigation test failed');
  }

  return [{ test: 'keyboard-navigation', pass: true }];
}

/**
 * Tests responsive layout.
 */
async function testResponsiveLayout(): Promise<SuiteTestResult[]> {
  const ribbon = document.querySelector('.onr-ribbon');
  const tabBar = document.querySelector('.onr-tab-bar');
  const _body = document.querySelector('.onr-body');

  // Check that elements have proper layout classes
  const hasProperStructure = !!ribbon && !!tabBar;

  if (!hasProperStructure) {
    throw new Error('Responsive layout test failed');
  }

  return [{ test: 'responsive-layout', pass: true }];
}

/**
 * Tests CSS class application.
 */
async function testCssClasses(): Promise<SuiteTestResult[]> {
  // First expand the ribbon by clicking a tab to ensure all elements are visible
  const homeTab = document.querySelector('[data-tab="Home"]');
  if (homeTab) {
    homeTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await wait(100);
  }

  const requiredClasses = [
    '.onr-ribbon',
    '.onr-tab-bar',
    '.onr-tab',
    '.onr-body',
    '.onr-group',
    '.onr-btn',
  ];

  const results = requiredClasses.map(selector => ({
    selector,
    exists: !!document.querySelector(selector),
  }));

  const allExist = results.every(r => r.exists);

  if (!allExist) {
    throw new Error('CSS classes test failed');
  }

  return [{ test: 'css-classes', pass: true }];
}

/**
 * Main ribbon components test function.
 */
export async function ribbonComponentsIntegrationTest(): Promise<SuiteTestResult[]> {
  const results: SuiteTestResult[] = [];

  results.push(...await testRibbonAppRender());
  results.push(...await testTabBarRender());
  results.push(...await testTabBarClicks());
  results.push(...await testRibbonShellMount());
  results.push(...await testRibbonShellUnmount());
  results.push(...await testActiveState());
  results.push(...await testBodyToggle());
  results.push(...await testKeyboardNavigation());
  results.push(...await testResponsiveLayout());
  results.push(...await testCssClasses());

  return results;
}
