import type {
  ExplicitRuleResult,
  HookRuleResult,
  HomeSuiteCallback,
  RuleIdGroup,
} from './interfaces';

declare const app: any;

function buildRuleResults(
  ruleResultsById: Record<number, ExplicitRuleResult>,
  ruleIdGroups: readonly RuleIdGroup[],
): HookRuleResult[] {
  return ruleIdGroups
    .flat()
    .sort((leftRuleId, rightRuleId) => leftRuleId - rightRuleId)
    .map((ruleId) => ({
      test: `rule-${String(ruleId).padStart(3, '0')}`,
      pass: ruleResultsById[ruleId]?.pass ?? false,
      details: ruleResultsById[ruleId]?.details ?? 'Missing explicit result.',
    }));
}

export const wait = (milliseconds: number): Promise<void> =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export function clickByCommand(commandId: string): void {
  const commandElement = document.querySelector('[data-cmd="' + commandId + '"]');

  if (!commandElement) {
    throw new Error('Missing command button: ' + commandId);
  }

  commandElement.dispatchEvent(
    new MouseEvent('click', { bubbles: true, cancelable: true }),
  );
}

export function selectToken(editor: any, tokenValue: string): void {
  const editorValue = editor.getValue();
  const tokenStartIndex = editorValue.indexOf(tokenValue);

  if (tokenStartIndex === -1) {
    throw new Error('Token not found: ' + tokenValue);
  }

  editor.setSelection(
    editor.offsetToPos(tokenStartIndex),
    editor.offsetToPos(tokenStartIndex + tokenValue.length),
  );
}

export async function ensureHomePanel(): Promise<void> {
  const homeTabElement = document.querySelector('[data-tab="Home"]');

  if (homeTabElement) {
    homeTabElement.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true }),
    );
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
  ruleIdGroups: readonly RuleIdGroup[],
  callback: HomeSuiteCallback,
): Promise<HookRuleResult[]> {
  const ruleResultsById: Record<number, ExplicitRuleResult> = {};
  const recordRules = (ruleIds: RuleIdGroup, pass: boolean, details: string) => {
    ruleIds.forEach((ruleId) => {
      ruleResultsById[ruleId] = { details, pass };
    });
  };

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

    try {
      await callback({
        commandCalls,
        clickByCommand,
        editor,
        recordRules,
        selectToken: (tokenValue: string) => selectToken(editor, tokenValue),
        wait,
      });
    } finally {
      app.commands.executeCommandById = originalExecuteCommandById;
    }

    return buildRuleResults(ruleResultsById, ruleIdGroups);
  } catch (error) {
    const errorMessage = String(error);

    ruleIdGroups.forEach((ruleIds) => {
      ruleIds.forEach((ruleId) => {
        if (!ruleResultsById[ruleId]) {
          ruleResultsById[ruleId] = { details: errorMessage, pass: false };
        }
      });
    });

    return buildRuleResults(ruleResultsById, ruleIdGroups);
  }
}