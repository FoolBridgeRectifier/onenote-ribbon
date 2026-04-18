import {
  clickByCommand,
  ensureHomePanel,
  runHomeTabSuite,
  selectToken,
  wait,
} from '../suiteHelpers';

describe('suiteHelpers', () => {
  const originalApp = (globalThis as Record<string, unknown>).app;

  beforeEach(() => {
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });

  afterEach(() => {
    if (originalApp === undefined) {
      delete (globalThis as Record<string, unknown>).app;
      return;
    }

    (globalThis as Record<string, unknown>).app = originalApp;
  });

  it('wait resolves after the provided delay', async () => {
    const startedAt = Date.now();

    await wait(5);

    expect(Date.now() - startedAt).toBeGreaterThanOrEqual(5);
  });

  it('clickByCommand dispatches a click event for the matching command', () => {
    const buttonElement = document.createElement('button');
    const clickListener = jest.fn();

    buttonElement.dataset.cmd = 'bold';
    buttonElement.addEventListener('click', clickListener);
    document.body.append(buttonElement);

    clickByCommand('bold');

    expect(clickListener).toHaveBeenCalledTimes(1);
  });

  it('clickByCommand throws when the command button is missing', () => {
    expect(() => clickByCommand('missing')).toThrow(
      'Missing command button: missing',
    );
  });

  it('selectToken selects the requested token range', () => {
    const editor = {
      getValue: () => 'alpha beta gamma',
      offsetToPos: (offset: number) => ({ offset }),
      setSelection: jest.fn(),
    };

    selectToken(editor, 'beta');

    expect(editor.setSelection).toHaveBeenCalledWith(
      { offset: 6 },
      { offset: 10 },
    );
  });

  it('selectToken throws when the requested token is missing', () => {
    const editor = {
      getValue: () => 'alpha beta gamma',
      offsetToPos: (offset: number) => ({ offset }),
      setSelection: jest.fn(),
    };

    expect(() => selectToken(editor, 'delta')).toThrow(
      'Token not found: delta',
    );
  });

  it('ensureHomePanel resolves when the panel becomes available', async () => {
    const homeTabElement = document.createElement('button');

    homeTabElement.dataset.tab = 'Home';
    homeTabElement.addEventListener('click', () => {
      const panelElement = document.createElement('div');
      panelElement.dataset.panel = 'Home';
      document.body.append(panelElement);
    });
    document.body.append(homeTabElement);

    await expect(ensureHomePanel()).resolves.toBeUndefined();
  });

  it('ensureHomePanel fails when the panel never appears', async () => {
    await expect(ensureHomePanel()).rejects.toThrow('Home panel not visible');
  });

  it('runHomeTabSuite returns sorted rule results for a successful callback', async () => {
    const panelElement = document.createElement('div');
    const editor = {
      getValue: () => 'alpha beta gamma',
      offsetToPos: (offset: number) => ({ offset }),
      setSelection: jest.fn(),
    };
    const originalExecuteCommandById = jest.fn(
      (commandId: string) => commandId,
    );

    panelElement.dataset.panel = 'Home';
    document.body.append(panelElement);
    (globalThis as Record<string, unknown>).app = {
      commands: {
        executeCommandById: originalExecuteCommandById,
      },
      workspace: {
        activeEditor: { editor },
      },
    };

    const results = await runHomeTabSuite(
      [[3], [1, 2]],
      async ({
        commandCalls,
        recordRules,
        selectToken: selectContextToken,
      }) => {
        selectContextToken('beta');
        (globalThis as Record<string, any>).app.commands.executeCommandById(
          'editor:bold',
        );

        expect(commandCalls).toEqual(['editor:bold']);
        expect(editor.setSelection).toHaveBeenCalledWith(
          { offset: 6 },
          { offset: 10 },
        );

        recordRules([3], true, 'third');
        recordRules([1, 2], false, 'first-second');
      },
    );

    expect(results).toEqual([
      { details: 'first-second', pass: false, test: 'rule-001' },
      { details: 'first-second', pass: false, test: 'rule-002' },
      { details: 'third', pass: true, test: 'rule-003' },
    ]);
    expect(
      (globalThis as Record<string, any>).app.commands.executeCommandById(
        'editor:italic',
      ),
    ).toBe('editor:italic');
    expect(originalExecuteCommandById).toHaveBeenCalledWith('editor:italic');
  });

  it('runHomeTabSuite marks every rule as failed when no active editor exists', async () => {
    const panelElement = document.createElement('div');

    panelElement.dataset.panel = 'Home';
    document.body.append(panelElement);
    (globalThis as Record<string, unknown>).app = {
      commands: {
        executeCommandById: jest.fn(),
      },
      workspace: {
        activeEditor: null,
      },
    };

    const results = await runHomeTabSuite([[1], [2]], async () => undefined);

    expect(results).toEqual([
      {
        details: 'Error: No active editor for home-tab integration test',
        pass: false,
        test: 'rule-001',
      },
      {
        details: 'Error: No active editor for home-tab integration test',
        pass: false,
        test: 'rule-002',
      },
    ]);
  });

  it('runHomeTabSuite preserves recorded rules and fills missing ones after a callback error', async () => {
    const panelElement = document.createElement('div');
    const editor = {
      getValue: () => 'alpha beta gamma',
      offsetToPos: (offset: number) => ({ offset }),
      setSelection: jest.fn(),
    };
    const originalExecuteCommandById = jest.fn();

    panelElement.dataset.panel = 'Home';
    document.body.append(panelElement);
    (globalThis as Record<string, unknown>).app = {
      commands: {
        executeCommandById: originalExecuteCommandById,
      },
      workspace: {
        activeEditor: { editor },
      },
    };

    const results = await runHomeTabSuite([[1, 2]], async ({ recordRules }) => {
      recordRules([1], true, 'kept');
      throw new Error('boom');
    });

    expect(results).toEqual([
      { details: 'kept', pass: true, test: 'rule-001' },
      { details: 'Error: boom', pass: false, test: 'rule-002' },
    ]);
    (globalThis as Record<string, any>).app.commands.executeCommandById(
      'editor:italic',
    );
    expect(originalExecuteCommandById).toHaveBeenCalledWith('editor:italic');
  });
});
