import { EXPECTED_HOME_GROUP_NAMES } from './constants';
import type { SuiteTestResult } from './interfaces';
import { runHomeTabSuite } from './suite-helpers/suiteHelpers';

export async function homeIntegrationTest(): Promise<SuiteTestResult[]> {
  return runHomeTabSuite('home-integration', async ({ wait }) => {
    const groupNames = Array.from(
      document.querySelectorAll('[data-panel="Home"] .onr-group-name'),
    ).map((groupElement) => (groupElement.textContent || '').trim());

    let currentSearchStartIndex = 0;
    const expectedOrderMatches = EXPECTED_HOME_GROUP_NAMES.every(
      (expectedName) => {
        const foundIndex = groupNames.findIndex(
          (groupName, index) =>
            index >= currentSearchStartIndex &&
            groupName.toLowerCase() === expectedName.toLowerCase(),
        );

        if (foundIndex === -1) {
          return false;
        }

        currentSearchStartIndex = foundIndex + 1;
        return true;
      },
    );

    if (!expectedOrderMatches) {
      throw new Error('Group order mismatch: ' + groupNames.join(' > '));
    }

    const insertTabElement = document.querySelector('[data-tab="Insert"]');

    if (insertTabElement) {
      insertTabElement.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true }),
      );
      await wait(80);
    }

    const insertPass =
      Boolean(insertTabElement) ||
      Boolean(document.querySelector('[data-panel="Insert"]'));

    if (!insertPass) {
      throw new Error('Insert tab not visible');
    }
  });
}
