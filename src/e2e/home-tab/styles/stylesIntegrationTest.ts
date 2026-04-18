import { STYLE_GROUP_RULE_IDS } from '../home/constants';
import type { HookRuleResult } from '../home/interfaces';
import { runHomeTabSuite } from '../home/suite-helpers/suiteHelpers';

export async function stylesIntegrationTest(): Promise<HookRuleResult[]> {
  return runHomeTabSuite(
    [STYLE_GROUP_RULE_IDS],
    async ({ clickByCommand, recordRules, wait }) => {
      clickByCommand('styles-expand');
      await wait(120);

      const styleItems = Array.from(
        document.querySelectorAll('.onr-styles-dropdown .onr-dd-item'),
      ).map((itemElement) => (itemElement.textContent || '').trim());

      const styleGroupPass = [
        'Normal',
        'Heading 1',
        'Heading 6',
        'Quote',
        'Code',
      ].every((styleName) =>
        styleItems.some((itemText) => itemText === styleName),
      );

      recordRules(
        STYLE_GROUP_RULE_IDS,
        styleGroupPass,
        'Styles dropdown entries: ' + styleItems.join(', '),
      );
    },
  );
}
