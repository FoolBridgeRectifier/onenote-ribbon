import { NAVIGATE_RULE_IDS } from '../home/constants';
import type { HookRuleResult } from '../home/interfaces';
import { runHomeTabSuite } from '../home/suite-helpers/suiteHelpers';

export async function navigateIntegrationTest(): Promise<HookRuleResult[]> {
  return runHomeTabSuite(
    [NAVIGATE_RULE_IDS],
    async ({ clickByCommand, commandCalls, recordRules, wait }) => {
      clickByCommand('outline');
      clickByCommand('fold-all');
      clickByCommand('unfold-all');
      await wait(120);

      const navigatePass =
        commandCalls.includes('outline:open') &&
        commandCalls.includes('editor:fold-all') &&
        commandCalls.includes('editor:unfold-all');

      recordRules(
        NAVIGATE_RULE_IDS,
        navigatePass,
        'Executed commands: ' + commandCalls.join(', '),
      );
    },
  );
}
