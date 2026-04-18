import { EDITOR_STATE_RULE_IDS } from '../home/constants';
import type { HookRuleResult } from '../home/interfaces';
import { runHomeTabSuite } from '../home/suite-helpers/suiteHelpers';

export async function homeCombinationsIntegrationTest(): Promise<
  HookRuleResult[]
> {
  return runHomeTabSuite(
    [EDITOR_STATE_RULE_IDS],
    async ({
      clickByCommand,
      commandCalls,
      editor,
      recordRules,
      selectToken,
      wait,
    }) => {
      editor.setValue('alpha beta gamma');
      selectToken('beta');
      clickByCommand('highlight');
      await wait(80);

      const activeButtons = Array.from(
        document.querySelectorAll('.onr-active'),
      ).map((buttonElement) => buttonElement.getAttribute('data-cmd') || '');

      const editorStatePass =
        activeButtons.includes('important') ||
        activeButtons.includes('question') ||
        activeButtons.includes('highlight') ||
        commandCalls.length > 0 ||
        editor.getValue().includes('==beta==');

      recordRules(
        EDITOR_STATE_RULE_IDS,
        editorStatePass,
        [
          'activeButtons=' + activeButtons.join(', '),
          'commandCalls=' + commandCalls.join(', '),
          'document=' + editor.getValue(),
        ].join(' | '),
      );
    },
  );
}
