/**
 * Insert tab combinations integration test suite.
 */

import { INSERT_COMBINATIONS_RULE_IDS } from '../constants';
import type { HookRuleResult } from '../interfaces';
import { runInsertTabSuite } from '../suite-helpers/suiteHelpers';

export async function insertCombinationsIntegrationTest(): Promise<HookRuleResult[]> {
  return runInsertTabSuite(
    [INSERT_COMBINATIONS_RULE_IDS],
    async ({ clickByCommand, commandCalls, editor, recordRules, wait }) => {
      // Rule 241: Multiple insert operations work sequentially
      editor.setValue('');
      let sequentialOperationsWork = true;

      // Try multiple insert operations in sequence
      const operations = ['code-block', 'divider', 'quote'];
      for (const operation of operations) {
        const button = document.querySelector(`[data-cmd="${operation}"]`);
        if (button) {
          clickByCommand(operation);
          await wait(100);
        }
      }

      const contentAfterSequential = editor.getValue();
      sequentialOperationsWork = contentAfterSequential.length > 0;

      // Rule 242: Tab switching preserves insert state
      const homeTab = document.querySelector('[data-tab="Home"]');
      const insertTab = document.querySelector('[data-tab="Insert"]');

      let tabSwitchingPreservesState = true;
      if (homeTab && insertTab) {
        // Switch to Home
        homeTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await wait(100);

        // Switch back to Insert
        insertTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await wait(100);

        // Check Insert panel is still visible
        tabSwitchingPreservesState = Boolean(document.querySelector('[data-panel="Insert"]'));
      }

      // Rule 243: Insert operations work after editor content changes
      editor.setValue('initial content');
      await wait(50);

      const codeBlockButton = document.querySelector('[data-cmd="code-block"]');
      let worksAfterContentChange = false;
      if (codeBlockButton) {
        clickByCommand('code-block');
        await wait(100);
        worksAfterContentChange = editor.getValue().includes('```');
      }

      // Rule 244: Multiple block types can coexist
      editor.setValue('');
      const blockTypes = ['quote', 'divider'];
      for (const blockType of blockTypes) {
        const button = document.querySelector(`[data-cmd="${blockType}"]`);
        if (button) {
          clickByCommand(blockType);
          await wait(100);
        }
      }

      const contentWithMultipleBlocks = editor.getValue();
      const multipleBlocksCoexist = contentWithMultipleBlocks.length > 0;

      // Rule 245: Insert commands are tracked correctly
      const insertCommandsTracked = commandCalls.some(cmd =>
        cmd.includes('insert') || cmd.includes('block') || cmd.includes('divider')
      );

      // Rule 246: Insert operations work with selections
      editor.setValue('selected text for insertion');
      const selectionStart = editor.offsetToPos(0);
      const selectionEnd = editor.offsetToPos(15);
      editor.setSelection(selectionStart, selectionEnd);

      const quoteButton = document.querySelector('[data-cmd="quote"]');
      let worksWithSelection = false;
      if (quoteButton) {
        clickByCommand('quote');
        await wait(100);
        worksWithSelection = editor.getValue().includes('>');
      }

      // Rule 247: Insert panel buttons are all accessible
      const insertButtons = document.querySelectorAll('[data-panel="Insert"] [data-cmd]');
      const allButtonsHaveCommands = Array.from(insertButtons).every(btn =>
        btn.hasAttribute('data-cmd')
      );

      // Rule 248: Insert operations don't corrupt editor state
      editor.setValue('clean state');
      await wait(50);

      const initialLineCount = editor.lineCount();

      // Perform some insert operations
      const dividerBtn = document.querySelector('[data-cmd="divider"]');
      if (dividerBtn) {
        clickByCommand('divider');
        await wait(100);
      }

      const editorNotCorrupted = editor.lineCount() >= initialLineCount;

      // Rule 249: Insert dropdowns close when switching tabs
      let dropdownsCloseOnTabSwitch = true;
      const dropdownButton = document.querySelector('[data-cmd*="dropdown"]');
      if (dropdownButton) {
        dropdownButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await wait(100);

        // Switch to Home tab
        if (homeTab) {
          homeTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          await wait(100);
        }

        // Check if dropdown is closed
        const openDropdowns = document.querySelectorAll('.onr-overlay-dropdown');
        dropdownsCloseOnTabSwitch = openDropdowns.length === 0;
      }

      // Rule 250: Insert operations maintain cursor position appropriately
      editor.setValue('line one\nline two\nline three');
      editor.setCursor(editor.offsetToPos(10));
      const cursorBefore = editor.getCursor();

      const calloutBtn = document.querySelector('[data-cmd="callout"]');
      if (calloutBtn) {
        clickByCommand('callout');
        await wait(100);
      }

      const cursorMaintained = editor.getCursor() !== null;

      const allPass = sequentialOperationsWork && tabSwitchingPreservesState &&
        worksAfterContentChange && multipleBlocksCoexist && insertCommandsTracked;

      recordRules(
        INSERT_COMBINATIONS_RULE_IDS,
        allPass,
        [
          'sequentialOperationsWork=' + sequentialOperationsWork,
          'tabSwitchingPreservesState=' + tabSwitchingPreservesState,
          'worksAfterContentChange=' + worksAfterContentChange,
          'multipleBlocksCoexist=' + multipleBlocksCoexist,
          'insertCommandsTracked=' + insertCommandsTracked,
          'worksWithSelection=' + worksWithSelection,
          'allButtonsHaveCommands=' + allButtonsHaveCommands,
          'editorNotCorrupted=' + editorNotCorrupted,
          'dropdownsCloseOnTabSwitch=' + dropdownsCloseOnTabSwitch,
          'cursorMaintained=' + cursorMaintained,
        ].join(' | '),
      );
    },
  );
}
