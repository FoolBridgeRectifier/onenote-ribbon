import type { SuiteTestResult } from '../../../helpers/interfaces';
import type { HomeSuiteCallback } from './interfaces';

declare const app: any;

export const wait = (milliseconds: number): Promise<void> =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export function clickByCommand(commandId: string): void {
  const commandElement = document.querySelector('[data-cmd="' + commandId + '"]');

  if (!commandElement) {
    throw new Error('Missing command button: ' + commandId);
  }

  commandElement.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
}

export function selectToken(editor: any, tokenValue: string): void {
  const editorValue = editor.getValue();
  const tokenStartIndex = editorValue.indexOf(tokenValue);

  if (tokenStartIndex === -1) {
    throw new Error('Token not found: ' + tokenValue);
  }

  editor.setSelection(
    editor.offsetToPos(tokenStartIndex),
    editor.offsetToPos(tokenStartIndex + tokenValue.length)
  );
}

export async function ensureHomePanel(): Promise<void> {
  const homeTabElement = document.querySelector('[data-tab="Home"]');

  if (homeTabElement) {
    homeTabElement.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  }

  for (let index = 0; index < 20; index += 1) {
    if (document.querySelector('[data-panel="Home"]')) {
      return;
    }

    await wait(80);
  }

  throw new Error('Home panel not visible');
}

export async function runHomeTabSuite(
  testName: string,
  callback: HomeSuiteCallback
): Promise<SuiteTestResult[]> {
  try {
    await ensureHomePanel();

    const editor = app.workspace.activeEditor?.editor;

    if (!editor) {
      throw new Error('No active editor for home-tab integration test');
    }

    const originalExecuteCommandById = app.commands.executeCommandById.bind(app.commands);
    const commandCalls: string[] = [];
    app.commands.executeCommandById = (commandId: string) => {
      commandCalls.push(commandId);
      return originalExecuteCommandById(commandId);
    };

    let testPassed = true;
    let testDetails = '';

    try {
      await callback({
        commandCalls,
        clickByCommand,
        editor,
        selectToken: (tokenValue: string) => selectToken(editor, tokenValue),
        wait,
      });
      testDetails = 'Test completed successfully';
    } catch (_error) {
      testPassed = false;
      testDetails = String(_error);
    } finally {
      app.commands.executeCommandById = originalExecuteCommandById;
    }

    return [{ test: testName, pass: testPassed, details: testDetails }];
  } catch (_error) {
    return [{ test: testName, pass: false, details: String(_error) }];
  }
}
