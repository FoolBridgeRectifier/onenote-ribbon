import type { App, Editor, Plugin } from 'obsidian';
import {
  applyBold,
  applyItalic,
  applyUnderline,
  applyClearAllFormatting,
} from '../../tabs/home/basic-text/helpers';
import { applyFontSize } from '../../tabs/home/basic-text/font-picker/helpers';
import { toggleTagInEditor } from '../editor-v2/styling-engine/editor-integration/helpers';
import { SUBSCRIPT_TAG, SUPERSCRIPT_TAG } from '../editor-v2/styling-engine/editor-integration/constants';
import { deriveEditorState } from '../hooks/editorStateHelpers';
import { getNextFontSize, getPreviousFontSize } from './helpers';
import {
  COMMAND_TOGGLE_BOLD,
  COMMAND_TOGGLE_ITALIC,
  COMMAND_TOGGLE_UNDERLINE,
  COMMAND_TOGGLE_SUBSCRIPT,
  COMMAND_TOGGLE_SUPERSCRIPT,
  COMMAND_CLEAR_FORMATTING,
  COMMAND_INCREASE_FONT_SIZE,
  COMMAND_DECREASE_FONT_SIZE,
  COMMAND_ACTIVATE_FORMAT_PAINTER,
  FORMAT_PAINTER_ACTIVATE_EVENT,
} from './constants';

export function registerCommands(plugin: Plugin, app: App): void {
  plugin.addCommand({
    id: COMMAND_TOGGLE_BOLD,
    name: 'Toggle bold',
    editorCallback: (editor: Editor) => applyBold(editor),
  });

  plugin.addCommand({
    id: COMMAND_TOGGLE_ITALIC,
    name: 'Toggle italic',
    editorCallback: (editor: Editor) => applyItalic(editor),
  });

  plugin.addCommand({
    id: COMMAND_TOGGLE_UNDERLINE,
    name: 'Toggle underline',
    editorCallback: (editor: Editor) => applyUnderline(editor),
  });

  plugin.addCommand({
    id: COMMAND_TOGGLE_SUBSCRIPT,
    name: 'Toggle subscript',
    editorCallback: (editor: Editor) => toggleTagInEditor(editor, SUBSCRIPT_TAG),
  });

  plugin.addCommand({
    id: COMMAND_TOGGLE_SUPERSCRIPT,
    name: 'Toggle superscript',
    editorCallback: (editor: Editor) => toggleTagInEditor(editor, SUPERSCRIPT_TAG),
  });

  plugin.addCommand({
    id: COMMAND_CLEAR_FORMATTING,
    name: 'Clear formatting',
    editorCallback: (editor: Editor) => applyClearAllFormatting(editor),
  });

  plugin.addCommand({
    id: COMMAND_INCREASE_FONT_SIZE,
    name: 'Increase font size',
    editorCallback: (editor: Editor) => {
      const currentState = deriveEditorState(app, null, null);
      const nextSize = getNextFontSize(currentState.fontSize);
      applyFontSize(editor, parseInt(nextSize, 10));
    },
  });

  plugin.addCommand({
    id: COMMAND_DECREASE_FONT_SIZE,
    name: 'Decrease font size',
    editorCallback: (editor: Editor) => {
      const currentState = deriveEditorState(app, null, null);
      const previousSize = getPreviousFontSize(currentState.fontSize);
      applyFontSize(editor, parseInt(previousSize, 10));
    },
  });

  // Uses a DOM event so the React component can arm the format painter state machine.
  plugin.addCommand({
    id: COMMAND_ACTIVATE_FORMAT_PAINTER,
    name: 'Activate format painter',
    callback: () => {
      document.dispatchEvent(new CustomEvent(FORMAT_PAINTER_ACTIVATE_EVENT));
    },
  });
}
