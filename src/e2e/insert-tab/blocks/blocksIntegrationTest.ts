/**
 * Blocks group integration test suite (Insert tab).
 */

import { BLOCKS_RULE_IDS } from '../constants';
import type { HookRuleResult } from '../interfaces';
import { runInsertTabSuite } from '../suite-helpers/suiteHelpers';

export async function blocksIntegrationTest(): Promise<HookRuleResult[]> {
  return runInsertTabSuite(
    [BLOCKS_RULE_IDS],
    async ({ clickByCommand, commandCalls, editor, recordRules, wait }) => {
      // Rule 222: Code block button exists
      const codeBlockButton = document.querySelector('[data-cmd="code-block"]');
      const codeBlockButtonExists = Boolean(codeBlockButton);

      // Rule 223: Callout button exists
      const calloutButton = document.querySelector('[data-cmd="callout"]');
      const calloutButtonExists = Boolean(calloutButton);

      // Rule 224: Quote button exists
      const quoteButton = document.querySelector('[data-cmd="quote"]');
      const quoteButtonExists = Boolean(quoteButton);

      // Rule 225: Divider button exists
      const dividerButton = document.querySelector('[data-cmd="divider"]');
      const dividerButtonExists = Boolean(dividerButton);

      // Rule 226: Code block insertion adds markdown code fence
      editor.setValue('');
      if (codeBlockButtonExists) {
        clickByCommand('code-block');
        await wait(100);
      }
      const contentAfterCodeBlock = editor.getValue();
      const hasCodeBlockSyntax = contentAfterCodeBlock.includes('```');

      // Rule 227: Callout insertion adds callout syntax
      editor.setValue('');
      if (calloutButtonExists) {
        clickByCommand('callout');
        await wait(100);
      }
      const contentAfterCallout = editor.getValue();
      const hasCalloutSyntax = contentAfterCallout.includes('> [!') ||
        contentAfterCallout.includes('>[');

      // Rule 228: Quote insertion adds quote syntax
      editor.setValue('');
      if (quoteButtonExists) {
        clickByCommand('quote');
        await wait(100);
      }
      const contentAfterQuote = editor.getValue();
      const hasQuoteSyntax = contentAfterQuote.includes('> ');

      // Rule 229: Divider insertion adds horizontal rule
      editor.setValue('');
      if (dividerButtonExists) {
        clickByCommand('divider');
        await wait(100);
      }
      const contentAfterDivider = editor.getValue();
      const hasDividerSyntax = contentAfterDivider.includes('---') ||
        contentAfterDivider.includes('***') ||
        contentAfterDivider.includes('___');

      // Rule 230: Block buttons are visible
      const allButtonsVisible = [codeBlockButton, calloutButton, quoteButton, dividerButton]
        .every(btn => btn?.checkVisibility() ?? false);

      // Rule 231: Block group label is correct
      const blockGroupLabel = Array.from(document.querySelectorAll('.onr-group-name'))
        .find(el => el.textContent?.toLowerCase().includes('block'));
      const hasCorrectLabel = Boolean(blockGroupLabel);

      const allPass = codeBlockButtonExists && calloutButtonExists &&
        quoteButtonExists && dividerButtonExists;

      recordRules(
        BLOCKS_RULE_IDS,
        allPass,
        [
          'codeBlockButtonExists=' + codeBlockButtonExists,
          'calloutButtonExists=' + calloutButtonExists,
          'quoteButtonExists=' + quoteButtonExists,
          'dividerButtonExists=' + dividerButtonExists,
          'hasCodeBlockSyntax=' + hasCodeBlockSyntax,
          'hasCalloutSyntax=' + hasCalloutSyntax,
          'hasQuoteSyntax=' + hasQuoteSyntax,
          'hasDividerSyntax=' + hasDividerSyntax,
          'allButtonsVisible=' + allButtonsVisible,
          'hasCorrectLabel=' + hasCorrectLabel,
        ].join(' | '),
      );
    },
  );
}
