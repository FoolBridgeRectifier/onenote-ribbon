import type { SuiteTestResult } from '../home/interfaces';
import { runHomeTabSuite } from '../home/suite-helpers/suiteHelpers';

export async function emailIntegrationTest(): Promise<SuiteTestResult[]> {
  return runHomeTabSuite('email-integration', async ({
    clickByCommand,
    editor,
    wait,
  }) => {
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

    if (!emailPass) {
      throw new Error('Email/meeting test failed');
    }
  });
}
