import { EMAIL_RULE_IDS } from '../home/constants';
import type { HookRuleResult } from '../home/interfaces';
import { runHomeTabSuite } from '../home/suite-helpers/suiteHelpers';

export async function emailIntegrationTest(): Promise<HookRuleResult[]> {
  return runHomeTabSuite(
    [EMAIL_RULE_IDS],
    async ({ clickByCommand, editor, recordRules, wait }) => {
      editor.setValue('Meeting line');
      editor.setCursor(editor.offsetToPos(0));
      clickByCommand('meeting-details');
      await wait(120);

      const meetingDocument = editor.getValue();
      const emailPass =
        (Boolean(document.querySelector('[data-cmd="email-page"]')) &&
          Boolean(document.querySelector('[data-cmd="meeting-details"]'))) ||
        (meetingDocument.includes('---') &&
          meetingDocument.includes('Date:') &&
          meetingDocument.includes('Time:') &&
          meetingDocument.includes('Attendees:') &&
          meetingDocument.includes('Agenda:'));

      recordRules(
        EMAIL_RULE_IDS,
        emailPass,
        'meetingDocument=' + meetingDocument,
      );
    },
  );
}
