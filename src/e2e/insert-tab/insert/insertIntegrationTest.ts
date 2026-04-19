/**
 * Insert tab main integration test suite.
 */

import {
  EXPECTED_INSERT_GROUP_NAMES,
  INSERT_TAB_RULE_IDS,
} from '../constants';
import type { HookRuleResult } from '../interfaces';
import { runInsertTabSuite } from '../suite-helpers/suiteHelpers';

export async function insertIntegrationTest(): Promise<HookRuleResult[]> {
  return runInsertTabSuite(
    [INSERT_TAB_RULE_IDS],
    async ({ recordRules, wait }) => {
      // Rule 167: Insert panel is visible
      const insertPanel = document.querySelector('[data-panel="Insert"]');
      const panelVisible = Boolean(insertPanel);

      // Rule 168: Insert tab button exists and is clickable
      const insertTabButton = document.querySelector('[data-tab="Insert"]');
      const tabButtonExists = Boolean(insertTabButton);

      // Rule 169: Insert panel has correct CSS class
      const hasCorrectClass = insertPanel?.classList.contains('onr-insert-panel') ?? false;

      // Rule 170: Insert tab is marked as active when panel is visible
      const isTabActive = insertTabButton?.classList.contains('onr-active') ?? false;

      // Rule 171: Expected groups are present in Insert tab
      const groupNames = Array.from(
        document.querySelectorAll('[data-panel="Insert"] .onr-group-name'),
      ).map((groupElement) => (groupElement.textContent || '').trim());

      let currentSearchStartIndex = 0;
      const expectedOrderMatches = EXPECTED_INSERT_GROUP_NAMES.every(
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

      const allPass = panelVisible && tabButtonExists && hasCorrectClass && isTabActive && expectedOrderMatches;

      recordRules(
        INSERT_TAB_RULE_IDS,
        allPass,
        [
          'panelVisible=' + panelVisible,
          'tabButtonExists=' + tabButtonExists,
          'hasCorrectClass=' + hasCorrectClass,
          'isTabActive=' + isTabActive,
          'expectedOrderMatches=' + expectedOrderMatches,
          'detectedGroups=' + groupNames.join(', '),
        ].join(' | '),
      );
    },
  );
}
