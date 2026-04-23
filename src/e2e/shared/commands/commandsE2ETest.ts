import type { SuiteTestResult } from '../interfaces';
import { wait, runRibbonSuite } from '../suiteHelpers';

// Override the typed global so all app.xxx accesses are unrestricted at runtime.
declare const app: any;

const PLUGIN_ID = 'onenote-ribbon';

const REGISTERED_COMMAND_IDS = [
  PLUGIN_ID + ':onenote-ribbon-bold',
  PLUGIN_ID + ':onenote-ribbon-italic',
  PLUGIN_ID + ':onenote-ribbon-underline',
  PLUGIN_ID + ':onenote-ribbon-subscript',
  PLUGIN_ID + ':onenote-ribbon-superscript',
  PLUGIN_ID + ':onenote-ribbon-clear-formatting',
  PLUGIN_ID + ':onenote-ribbon-font-size-increase',
  PLUGIN_ID + ':onenote-ribbon-font-size-decrease',
  PLUGIN_ID + ':onenote-ribbon-format-painter',
];

async function testBoldCommand(): Promise<SuiteTestResult[]> {
  return runRibbonSuite('command-bold', async () => {
    const editor = app.workspace.activeEditor?.editor;

    if (!editor) {
      throw new Error('No active editor for bold command test');
    }

    editor.setValue('hello world');
    editor.setSelection(editor.offsetToPos(0), editor.offsetToPos(5));
    app.commands.executeCommandById(PLUGIN_ID + ':onenote-ribbon-bold');
    await wait(80);

    const result = editor.getValue();

    if (!result.includes('**hello**')) {
      throw new Error('Bold command failed: ' + result);
    }
  });
}

async function testItalicCommand(): Promise<SuiteTestResult[]> {
  return runRibbonSuite('command-italic', async () => {
    const editor = app.workspace.activeEditor?.editor;

    if (!editor) {
      throw new Error('No active editor for italic command test');
    }

    editor.setValue('hello world');
    editor.setSelection(editor.offsetToPos(0), editor.offsetToPos(5));
    app.commands.executeCommandById(PLUGIN_ID + ':onenote-ribbon-italic');
    await wait(80);

    const result = editor.getValue();

    // Italic wraps with single * on each side; check for *hello* without false-positive on **
    if (!result.includes('*hello*') || result.includes('**hello**')) {
      throw new Error('Italic command failed: ' + result);
    }
  });
}

async function testUnderlineCommand(): Promise<SuiteTestResult[]> {
  return runRibbonSuite('command-underline', async () => {
    const editor = app.workspace.activeEditor?.editor;

    if (!editor) {
      throw new Error('No active editor for underline command test');
    }

    editor.setValue('hello world');
    editor.setSelection(editor.offsetToPos(0), editor.offsetToPos(5));
    app.commands.executeCommandById(PLUGIN_ID + ':onenote-ribbon-underline');
    await wait(80);

    const result = editor.getValue();

    if (!result.includes('<u>hello</u>')) {
      throw new Error('Underline command failed: ' + result);
    }
  });
}

async function testSubscriptCommand(): Promise<SuiteTestResult[]> {
  return runRibbonSuite('command-subscript', async () => {
    const editor = app.workspace.activeEditor?.editor;

    if (!editor) {
      throw new Error('No active editor for subscript command test');
    }

    editor.setValue('hello world');
    editor.setSelection(editor.offsetToPos(0), editor.offsetToPos(5));
    app.commands.executeCommandById(PLUGIN_ID + ':onenote-ribbon-subscript');
    await wait(80);

    const result = editor.getValue();

    if (!result.includes('<sub>hello</sub>')) {
      throw new Error('Subscript command failed: ' + result);
    }
  });
}

async function testSuperscriptCommand(): Promise<SuiteTestResult[]> {
  return runRibbonSuite('command-superscript', async () => {
    const editor = app.workspace.activeEditor?.editor;

    if (!editor) {
      throw new Error('No active editor for superscript command test');
    }

    editor.setValue('hello world');
    editor.setSelection(editor.offsetToPos(0), editor.offsetToPos(5));
    app.commands.executeCommandById(PLUGIN_ID + ':onenote-ribbon-superscript');
    await wait(80);

    const result = editor.getValue();

    if (!result.includes('<sup>hello</sup>')) {
      throw new Error('Superscript command failed: ' + result);
    }
  });
}

async function testClearFormattingCommand(): Promise<SuiteTestResult[]> {
  return runRibbonSuite('command-clear-formatting', async () => {
    const editor = app.workspace.activeEditor?.editor;

    if (!editor) {
      throw new Error('No active editor for clear-formatting command test');
    }

    editor.setValue('**hello** world');
    editor.setSelection(editor.offsetToPos(0), editor.offsetToPos(15));
    app.commands.executeCommandById(PLUGIN_ID + ':onenote-ribbon-clear-formatting');
    await wait(80);

    const result = editor.getValue();

    if (result.includes('**')) {
      throw new Error('Clear formatting command failed to remove bold: ' + result);
    }
  });
}

async function testFontSizeIncreaseCommand(): Promise<SuiteTestResult[]> {
  return runRibbonSuite('command-font-size-increase', async () => {
    const editor = app.workspace.activeEditor?.editor;

    if (!editor) {
      throw new Error('No active editor for font-size-increase command test');
    }

    editor.setValue('hello world');
    editor.setSelection(editor.offsetToPos(0), editor.offsetToPos(5));
    app.commands.executeCommandById(PLUGIN_ID + ':onenote-ribbon-font-size-increase');
    await wait(80);

    const result = editor.getValue();

    if (!result.includes('font-size')) {
      throw new Error('Font size increase command failed: ' + result);
    }
  });
}

async function testFontSizeDecreaseCommand(): Promise<SuiteTestResult[]> {
  return runRibbonSuite('command-font-size-decrease', async () => {
    const editor = app.workspace.activeEditor?.editor;

    if (!editor) {
      throw new Error('No active editor for font-size-decrease command test');
    }

    editor.setValue('hello world');
    editor.setSelection(editor.offsetToPos(0), editor.offsetToPos(5));
    app.commands.executeCommandById(PLUGIN_ID + ':onenote-ribbon-font-size-decrease');
    await wait(80);

    const result = editor.getValue();

    if (!result.includes('font-size')) {
      throw new Error('Font size decrease command failed: ' + result);
    }
  });
}

async function testFormatPainterCommand(): Promise<SuiteTestResult[]> {
  return runRibbonSuite('command-format-painter', async () => {
    let eventFired = false;

    // Listen for the custom DOM event that the format painter command dispatches.
    const handleActivate = () => {
      eventFired = true;
    };
    document.addEventListener('onr-format-painter-activate', handleActivate);

    app.commands.executeCommandById(PLUGIN_ID + ':onenote-ribbon-format-painter');
    await wait(80);

    document.removeEventListener('onr-format-painter-activate', handleActivate);

    if (!eventFired) {
      throw new Error('Format painter command did not fire the activation event');
    }
  });
}

export async function commandsE2ETest(): Promise<SuiteTestResult[]> {
  // Verify all commands are registered before running editor tests.
  const missingCommandIds = REGISTERED_COMMAND_IDS.filter(
    (commandId) => !app.commands.commands[commandId]
  );

  if (missingCommandIds.length > 0) {
    throw new Error('Commands not registered: ' + missingCommandIds.join(', '));
  }

  const registrationResult: SuiteTestResult = { test: 'command-registration', pass: true };

  const boldResults = await testBoldCommand();
  const italicResults = await testItalicCommand();
  const underlineResults = await testUnderlineCommand();
  const subscriptResults = await testSubscriptCommand();
  const superscriptResults = await testSuperscriptCommand();
  const clearFormattingResults = await testClearFormattingCommand();
  const fontSizeIncreaseResults = await testFontSizeIncreaseCommand();
  const fontSizeDecreaseResults = await testFontSizeDecreaseCommand();
  const formatPainterResults = await testFormatPainterCommand();

  return [
    registrationResult,
    ...boldResults,
    ...italicResults,
    ...underlineResults,
    ...subscriptResults,
    ...superscriptResults,
    ...clearFormattingResults,
    ...fontSizeIncreaseResults,
    ...fontSizeDecreaseResults,
    ...formatPainterResults,
  ];
}
