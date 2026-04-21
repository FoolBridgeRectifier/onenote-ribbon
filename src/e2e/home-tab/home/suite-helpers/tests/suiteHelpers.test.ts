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

    await wait(10);

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
    expect(() => clickByCommand('missing')).toThrow('Missing command button: missing');
  });

  it('selectToken selects the requested token range', () => {
    const editor = {
      getValue: () => 'alpha beta gamma',
      offsetToPos: (offset: number) => ({ offset }),
      setSelection: jest.fn(),
    };

    selectToken(editor, 'beta');

    expect(editor.setSelection).toHaveBeenCalledWith({ offset: 6 }, { offset: 10 });
  });

  it('selectToken throws when the requested token is missing', () => {
    const editor = {
      getValue: () => 'alpha beta gamma',
      offsetToPos: (offset: number) => ({ offset }),
      setSelection: jest.fn(),
    };

    expect(() => selectToken(editor, 'delta')).toThrow('Token not found: delta');
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

  it('runHomeTabSuite returns test result for a successful callback', async () => {
    const panelElement = document.createElement('div');
    const editor = {
      getValue: () => 'alpha beta gamma',
      offsetToPos: (offset: number) => ({ offset }),
      setSelection: jest.fn(),
    };
    const originalExecuteCommandById = jest.fn((commandId: string) => commandId);

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
      'test-suite',
      async ({ commandCalls, selectToken: selectContextToken }) => {
        selectContextToken('beta');
        (globalThis as Record<string, any>).app.commands.executeCommandById('editor:bold');

        expect(commandCalls).toEqual(['editor:bold']);
        expect(editor.setSelection).toHaveBeenCalledWith({ offset: 6 }, { offset: 10 });
      }
    );

    expect(results).toEqual([
      { test: 'test-suite', pass: true, details: 'Test completed successfully' },
    ]);
    expect(
      (globalThis as Record<string, any>).app.commands.executeCommandById('editor:italic')
    ).toBe('editor:italic');
    expect(originalExecuteCommandById).toHaveBeenCalledWith('editor:italic');
  });

  it('runHomeTabSuite returns failed result when no active editor exists', async () => {
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

    const results = await runHomeTabSuite('test-suite', async () => undefined);

    expect(results).toEqual([
      {
        test: 'test-suite',
        pass: false,
        details: 'Error: No active editor for home-tab integration test',
      },
    ]);
  });

  it('runHomeTabSuite returns failed result after a callback error', async () => {
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

    const results = await runHomeTabSuite('test-suite', async () => {
      throw new Error('boom');
    });

    expect(results).toEqual([{ details: 'Error: boom', pass: false, test: 'test-suite' }]);
    (globalThis as Record<string, any>).app.commands.executeCommandById('editor:italic');
    expect(originalExecuteCommandById).toHaveBeenCalledWith('editor:italic');
  });
});
