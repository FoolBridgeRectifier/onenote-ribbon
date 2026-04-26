import type { Editor } from 'obsidian';
import type { ClearFormattingOptions } from './interfaces';
import {
  toggleTagInEditor,
  removeAllTagsInEditor,
} from '../../../shared/editor-v2/styling-engine/editor-integration/helpers';
import {
  UNDERLINE_TAG,
  BOLD_MD_TAG,
  ITALIC_MD_TAG,
  STRIKETHROUGH_MD_TAG,
} from '../../../shared/editor-v2/styling-engine/editor-integration/constants';

export type { ClearFormattingOptions };

export function applyBold(editor: Editor): void {
  toggleTagInEditor(editor, BOLD_MD_TAG);
}

export function applyItalic(editor: Editor): void {
  toggleTagInEditor(editor, ITALIC_MD_TAG);
}

export function applyUnderline(editor: Editor): void {
  toggleTagInEditor(editor, UNDERLINE_TAG);
}

export function applyStrikethrough(editor: Editor): void {
  toggleTagInEditor(editor, STRIKETHROUGH_MD_TAG);
}

export function applyDeleteElement(editor: Editor): void {
  editor.replaceSelection('');
}

export function applyClearAllFormatting(editor: Editor): void {
  // v2 removeAllTags always strips line prefixes — matches the legacy
  // { preserveLinePrefix: false } semantics this caller relies on.
  removeAllTagsInEditor(editor);
}

/**
 * Overload for string-based clearing.
 */
function clearFormattingString(sourceText: string, options: ClearFormattingOptions = {}): string {
  const { preserveHeadings = false } = options;

  let result = sourceText;

  if (!preserveHeadings) {
    result = result.replace(/^#+\s/gm, '');
  }

  result = result.replace(/\*\*([^*]+)\*\*/g, '$1');
  result = result.replace(/__([^_]+)__/g, '$1');
  result = result.replace(/~~([^~]+)~~/g, '$1');
  result = result.replace(/`([^`]+)`/g, '$1');
  result = result.replace(/_([^_]+)_/g, '$1');
  result = result.replace(/\*([^*]+)\*/g, '$1');
  result = result.replace(/<u>([^<]+)<\/u>/g, '$1');
  result = result.replace(/<sub>([^<]+)<\/sub>/g, '$1');
  result = result.replace(/<sup>([^<]+)<\/sup>/g, '$1');

  // Strip <span style="..."> tags (used by font-family and font-size formatting).
  // Loop until stable to handle nested span wrapping.
  while (/<span[^>]*>/i.test(result)) {
    result = result.replace(/<span[^>]*>([^<]*)<\/span>/gi, '$1');
  }
  result = result.replace(/==([^=]+)==/g, '$1');

  return result;
}

/**
 * Overload for editor-based clearing.
 * Clears formatting from the current selection or entire line if no selection.
 */
export function clearFormatting(
  editor: {
    getSelection(): string;
    getCursor(): { line: number; ch: number };
    getLine(n: number): string;
    replaceSelection(text: string): void;
    setLine(n: number, text: string): void;
  },
  preserveHeadings?: boolean
): void;

/**
 * Overload for string-based clearing.
 */
export function clearFormatting(sourceText: string, options?: ClearFormattingOptions): string;

export function clearFormatting(
  input:
    | string
    | {
        getSelection(): string;
        getCursor(): { line: number; ch: number };
        getLine(n: number): string;
        replaceSelection(text: string): void;
        setLine(n: number, text: string): void;
      },
  optionsOrPreserve?: ClearFormattingOptions | boolean
): string | void {
  if (typeof input === 'string') {
    const opts =
      typeof optionsOrPreserve === 'boolean'
        ? { preserveHeadings: optionsOrPreserve }
        : (optionsOrPreserve ?? {});
    return clearFormattingString(input, opts);
  } else {
    // Editor version
    const editor = input;
    const preserveHeadings = typeof optionsOrPreserve === 'boolean' ? optionsOrPreserve : false;
    const selection = editor.getSelection();

    if (selection) {
      // Clear selection only
      const cleared = clearFormattingString(selection, { preserveHeadings });
      editor.replaceSelection(cleared);
    } else {
      // Clear entire line
      const cursor = editor.getCursor();
      const line = editor.getLine(cursor.line);
      const cleared = clearFormattingString(line, { preserveHeadings });
      editor.setLine(cursor.line, cleared);
    }
  }
}

/**
 * Alias for clearFormatting for backward compatibility with tests.
 * When stripInline=false (default), strips all formatting including headings.
 * When stripInline=true, only strips inline formatting.
 */
export function stripFormatting(sourceText: string, stripInline: boolean = false): string {
  return clearFormattingString(sourceText, { preserveHeadings: !stripInline });
}
