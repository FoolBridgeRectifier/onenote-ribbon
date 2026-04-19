import { REQUIRED_HOME_COMMANDS } from '../home/constants';
import type { SuiteTestResult } from '../home/interfaces';
import { runHomeTabSuite } from '../home/suite-helpers/suiteHelpers';

export async function basicTextIntegrationTest(): Promise<SuiteTestResult[]> {
  return runHomeTabSuite('basic-text-integration', async ({
    clickByCommand,
    commandCalls,
    editor,
    selectToken,
    wait,
  }) => {
    // Test domain conversion (markdown to HTML)
    editor.setValue('**beta** gamma');
    selectToken('beta');
    clickByCommand('underline');
    await wait(120);
    const domainConversionDocument = editor.getValue();
    const domainPass =
      domainConversionDocument !== '**beta** gamma' &&
      domainConversionDocument.toLowerCase().includes('beta') &&
      domainConversionDocument.includes('<u>');
    if (!domainPass) {
      throw new Error('Domain conversion failed: ' + domainConversionDocument);
    }

    // Test markdown tags
    editor.setValue('alpha beta gamma');
    selectToken('beta');
    clickByCommand('bold');
    await wait(80);
    const afterBold = editor.getValue();
    selectToken('beta');
    clickByCommand('italic');
    await wait(80);
    const afterItalic = editor.getValue();
    selectToken('beta');
    clickByCommand('strikethrough');
    await wait(80);
    const afterStrikethrough = editor.getValue();
    selectToken('beta');
    clickByCommand('highlight');
    await wait(80);
    const afterHighlight = editor.getValue();
    const markdownTagPass =
      afterBold.includes('**') &&
      afterItalic !== afterBold &&
      afterStrikethrough.includes('~~') &&
      afterHighlight.includes('==');
    if (!markdownTagPass) {
      throw new Error('Markdown tag test failed');
    }

    // Test HTML tags
    editor.setValue('alpha beta gamma');
    selectToken('beta');
    clickByCommand('underline');
    await wait(80);
    const afterUnderline = editor.getValue();
    selectToken('beta');
    clickByCommand('subscript');
    await wait(80);
    const afterSubscript = editor.getValue();
    selectToken('beta');
    clickByCommand('superscript');
    await wait(80);
    const afterSuperscript = editor.getValue();
    const htmlTagPass =
      afterUnderline.includes('<u>') &&
      afterSubscript.includes('<sub>') &&
      afterSuperscript.includes('<sup>') &&
      !afterSuperscript.includes('<sub>');
    if (!htmlTagPass) {
      throw new Error('HTML tag test failed');
    }

    // Test structure preservation
    editor.setValue('```\ncode line\n```\n| a | b |');
    selectToken('code line');
    clickByCommand('bold');
    await wait(80);
    const afterCodeFenceAttempt = editor.getValue();
    const structurePass =
      afterCodeFenceAttempt.includes('```\ncode line\n```') &&
      afterCodeFenceAttempt.includes('| a | b |');
    if (!structurePass) {
      throw new Error('Structure preservation failed');
    }

    // Test multiline formatting
    editor.setValue('# alpha\n- beta');
    editor.setSelection(
      editor.offsetToPos(0),
      editor.offsetToPos(editor.getValue().length),
    );
    clickByCommand('bold');
    await wait(120);
    const afterMultilineBold = editor.getValue();
    const multilinePass =
      afterMultilineBold.startsWith('# ') &&
      afterMultilineBold.includes('- ') &&
      afterMultilineBold.includes('**alpha**') &&
      afterMultilineBold.includes('**beta**');
    if (!multilinePass) {
      throw new Error('Multiline formatting failed');
    }

    // Test basic text commands
    const missingCommands = REQUIRED_HOME_COMMANDS.filter(
      (commandId) =>
        !document.querySelector('[data-cmd="' + commandId + '"]'),
    );
    const basicTextPass =
      missingCommands.length === 0 &&
      afterUnderline.includes('<u>') &&
      afterHighlight.includes('==') &&
      Boolean(document.querySelector('[data-cmd="font-family"]')) &&
      Boolean(document.querySelector('[data-cmd="font-size"]')) &&
      Boolean(document.querySelector('[data-cmd="align"]'));
    if (!basicTextPass) {
      throw new Error('Basic text commands failed');
    }

    // Test list buttons
    editor.setValue('list item');
    editor.setCursor(editor.offsetToPos(0));
    clickByCommand('bullet-list-toggle');
    clickByCommand('number-list-toggle');
    clickByCommand('outdent');
    clickByCommand('indent');
    await wait(120);
    const listButtonPass = [
      'editor:toggle-bullet-list',
      'editor:toggle-numbered-list',
      'editor:unindent-list',
      'editor:indent-list',
    ].every((commandId) => commandCalls.includes(commandId));
    if (!listButtonPass) {
      throw new Error('List buttons test failed');
    }

    // Test list style buttons
    const listStylePass =
      listButtonPass &&
      Boolean(document.querySelector('[data-cmd="bullet-list-toggle"]')) &&
      Boolean(document.querySelector('[data-cmd="number-list-toggle"]'));
    if (!listStylePass) {
      throw new Error('List style test failed');
    }

    // Test format painter
    editor.setValue('**beta** gamma');
    selectToken('beta');
    clickByCommand('format-painter');
    await wait(120);

    selectToken('gamma');

    const editorElement = document.querySelector('.cm-editor');

    if (editorElement) {
      editorElement.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true }),
      );
    }

    await wait(200);

    const afterFormatPainter = editor.getValue();
    const formatPainterPass =
      Boolean(editorElement) &&
      afterFormatPainter.includes('beta') &&
      afterFormatPainter.includes('gamma') &&
      afterFormatPainter !== '**beta** gamma';

    if (!formatPainterPass) {
      throw new Error('Format painter test failed');
    }
  });
}
