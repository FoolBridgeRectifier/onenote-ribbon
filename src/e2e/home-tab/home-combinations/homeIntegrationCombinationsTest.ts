import type { SuiteTestResult } from '../../helpers/interfaces';
import { runHomeTabSuite } from '../home/suite-helpers/suiteHelpers';

export async function homeCombinationsIntegrationTest(): Promise<
  SuiteTestResult[]
> {
  return runHomeTabSuite(
    'home-combinations',
    async ({
      clickByCommand,
      commandCalls,
      editor,
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

      if (!editorStatePass) {
        throw new Error(
          [
            'Editor state validation failed:',
            'activeButtons=' + activeButtons.join(', '),
            'commandCalls=' + commandCalls.join(', '),
            'document=' + editor.getValue(),
          ].join(' | '),
        );
      }
    },
  );
}
