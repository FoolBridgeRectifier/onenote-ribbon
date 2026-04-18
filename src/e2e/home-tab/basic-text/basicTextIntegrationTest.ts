import {
  BASIC_TEXT_RULE_IDS,
  DOMAIN_RULE_IDS,
  HTML_TAG_RULE_IDS,
  LIST_BUTTON_RULE_IDS,
  LIST_STYLE_RULE_IDS,
  MARKDOWN_TAG_RULE_IDS,
  MULTILINE_RULE_IDS,
  REQUIRED_HOME_COMMANDS,
  STRUCTURE_RULE_IDS,
} from '../home/constants';
import type { HookRuleResult } from '../home/interfaces';
import { runHomeTabSuite } from '../home/suite-helpers/suiteHelpers';

export async function basicTextIntegrationTest(): Promise<HookRuleResult[]> {
  return runHomeTabSuite(
    [
      DOMAIN_RULE_IDS,
      MARKDOWN_TAG_RULE_IDS,
      HTML_TAG_RULE_IDS,
      STRUCTURE_RULE_IDS,
      MULTILINE_RULE_IDS,
      BASIC_TEXT_RULE_IDS,
      LIST_BUTTON_RULE_IDS,
      LIST_STYLE_RULE_IDS,
    ],
    async ({
      clickByCommand,
      commandCalls,
      editor,
      recordRules,
      selectToken,
      wait,
    }) => {
      editor.setValue('**beta** gamma');
      selectToken('beta');
      clickByCommand('underline');
      await wait(120);
      const domainConversionDocument = editor.getValue();
      const domainPass =
        domainConversionDocument !== '**beta** gamma' &&
        domainConversionDocument.toLowerCase().includes('beta') &&
        domainConversionDocument.includes('<u>');
      recordRules(
        DOMAIN_RULE_IDS,
        domainPass,
        'domainConversionDocument=' + domainConversionDocument,
      );

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
      recordRules(
        MARKDOWN_TAG_RULE_IDS,
        markdownTagPass,
        [
          'afterBold=' + afterBold,
          'afterItalic=' + afterItalic,
          'afterStrikethrough=' + afterStrikethrough,
          'afterHighlight=' + afterHighlight,
        ].join(' | '),
      );

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
      recordRules(
        HTML_TAG_RULE_IDS,
        htmlTagPass,
        [
          'afterUnderline=' + afterUnderline,
          'afterSubscript=' + afterSubscript,
          'afterSuperscript=' + afterSuperscript,
        ].join(' | '),
      );

      editor.setValue('```\ncode line\n```\n| a | b |');
      selectToken('code line');
      clickByCommand('bold');
      await wait(80);
      const afterCodeFenceAttempt = editor.getValue();
      const structurePass =
        afterCodeFenceAttempt.includes('```\ncode line\n```') &&
        afterCodeFenceAttempt.includes('| a | b |');
      recordRules(
        STRUCTURE_RULE_IDS,
        structurePass,
        'afterCodeFenceAttempt=' + afterCodeFenceAttempt,
      );

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
      recordRules(
        MULTILINE_RULE_IDS,
        multilinePass,
        'afterMultilineBold=' + afterMultilineBold,
      );

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
      recordRules(
        BASIC_TEXT_RULE_IDS,
        basicTextPass,
        [
          'missingCommands=' + missingCommands.join(', '),
          'fontFamilyButton=' +
            Boolean(document.querySelector('[data-cmd="font-family"]')),
          'fontSizeButton=' +
            Boolean(document.querySelector('[data-cmd="font-size"]')),
          'alignButton=' +
            Boolean(document.querySelector('[data-cmd="align"]')),
        ].join(' | '),
      );

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
      recordRules(
        LIST_BUTTON_RULE_IDS,
        listButtonPass,
        'Executed commands: ' + commandCalls.join(', '),
      );

      const listStylePass =
        listButtonPass &&
        Boolean(document.querySelector('[data-cmd="bullet-list-toggle"]')) &&
        Boolean(document.querySelector('[data-cmd="number-list-toggle"]'));
      recordRules(
        LIST_STYLE_RULE_IDS,
        listStylePass,
        [
          'bulletButton=' +
            Boolean(document.querySelector('[data-cmd="bullet-list-toggle"]')),
          'numberButton=' +
            Boolean(document.querySelector('[data-cmd="number-list-toggle"]')),
          'Executed commands: ' + commandCalls.join(', '),
        ].join(' | '),
      );
    },
  );
}
