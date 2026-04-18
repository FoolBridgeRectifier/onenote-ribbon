import {
  EXPECTED_HOME_GROUP_NAMES,
  INSERT_RULE_IDS,
  RIBBON_SHELL_RULE_IDS,
} from './constants';
import type { HookRuleResult } from './interfaces';
import { runHomeTabSuite } from './suite-helpers/suiteHelpers';

export async function homeIntegrationTest(): Promise<HookRuleResult[]> {
  return runHomeTabSuite(
    [RIBBON_SHELL_RULE_IDS, INSERT_RULE_IDS],
    async ({ recordRules, wait }) => {
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

      recordRules(
        RIBBON_SHELL_RULE_IDS,
        expectedOrderMatches,
        'Detected group order: ' + groupNames.join(' > '),
      );

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

      recordRules(
        INSERT_RULE_IDS,
        insertPass,
        'Insert tab visible=' + Boolean(insertTabElement),
      );
    },
  );
}
