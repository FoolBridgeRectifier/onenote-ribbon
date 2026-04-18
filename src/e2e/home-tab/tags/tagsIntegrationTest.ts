import { TAG_RULE_IDS } from '../home/constants';
import type { HookRuleResult } from '../home/interfaces';
import { runHomeTabSuite } from '../home/suite-helpers/suiteHelpers';

export async function tagsIntegrationTest(): Promise<HookRuleResult[]> {
  return runHomeTabSuite(
    [TAG_RULE_IDS],
    async ({ clickByCommand, commandCalls, editor, recordRules, wait }) => {
      editor.setValue('tag row');
      editor.setCursor(editor.offsetToPos(0));
      clickByCommand('todo');
      await wait(80);
      clickByCommand('important');
      await wait(80);
      const afterImportant = editor.getValue();

      clickByCommand('question');
      await wait(80);
      const afterQuestion = editor.getValue();

      clickByCommand('todo-tag');
      await wait(80);
      const afterTodoTag = editor.getValue();

      const moreTagsButton = document.querySelector('[data-cmd="more-tags"]');

      if (moreTagsButton) {
        moreTagsButton.dispatchEvent(
          new MouseEvent('click', { bubbles: true, cancelable: true }),
        );
        await wait(120);
      }

      const tagDropdownLabels = Array.from(
        document.querySelectorAll('.onr-tags-dd-label'),
      ).map((labelElement) => (labelElement.textContent || '').trim());

      const tagRulesPass =
        commandCalls.includes('editor:toggle-checklist-status') &&
        afterImportant.includes('[!important]') &&
        afterQuestion.includes('[!question]') &&
        afterTodoTag.includes('#todo') &&
        tagDropdownLabels.includes('Critical') &&
        tagDropdownLabels.includes('Customize Tags…');

      recordRules(
        TAG_RULE_IDS,
        tagRulesPass,
        [
          'afterImportant=' + afterImportant,
          'afterQuestion=' + afterQuestion,
          'afterTodoTag=' + afterTodoTag,
          'tagDropdownLabels=' + tagDropdownLabels.join(', '),
        ].join(' | '),
      );
    },
  );
}
