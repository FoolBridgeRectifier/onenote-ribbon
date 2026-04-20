import type { EditorState } from './interfaces';

/** CSS selectors for each nesting depth of unordered lists (L1 → L4). */
export const DEPTH_SELECTORS: [string, string, string, string] = [
  ':is(ul) > li',
  ':is(ul ul) > li',
  ':is(ul ul ul) > li',
  ':is(ul ul ul ul) > li',
];

/** CSS selectors for each nesting depth of ordered lists (L1 → L4). */
export const NUMBER_DEPTH_SELECTORS: [string, string, string, string] = [
  ':is(ol) > li',
  ':is(ol ol) > li',
  ':is(ol ol ol) > li',
  ':is(ol ol ol ol) > li',
];

/** Two-space visual padding appended after each bullet symbol in CSS marker content. */
export const MARKER_SYMBOL_PADDING = '  ';

/** Regex to identify the HyperMD list depth from a CM6 editor line class. */
export const LIST_LINE_DEPTH_REGEX = /\bHyperMD-list-line-(\d+)\b/;

/** Maximum nesting depth for editor-view CSS rules. */
export const EDITOR_MAX_DEPTH = 8;

/** Regex to extract the number from a CM6 OL formatting span: "3. " → 3. */
export const OL_NUMBER_REGEX = /^(\d+)\.\s$/;

/** Regex to detect a CM6 UL formatting span's raw marker text: "- " / "* " / "+ ". */
export const UL_MARKER_REGEX = /^[-*+]\s$/;

/** Maps tag names (both MD and HTML) to the EditorState boolean field they represent. */
export const TAG_NAME_TO_STATE_FIELD: Record<string, keyof EditorState> = {
  bold: 'bold',
  b: 'bold',
  italic: 'italic',
  i: 'italic',
  u: 'underline',
  strikethrough: 'strikethrough',
  s: 'strikethrough',
  highlight: 'highlight',
  mark: 'highlight',
  sub: 'subscript',
  sup: 'superscript',
};

/** Valid text alignment values accepted by Obsidian/CSS. */
export const VALID_TEXT_ALIGN_VALUES = new Set(['left', 'center', 'right', 'justify']);

/** Debounce time in ms before re-computing editor state after content change. */
export const CONTENT_CHANGE_DEBOUNCE_MS = 60;

/** Throttle time in ms for selection-change editor state re-computation. */
export const SELECTION_CHANGE_THROTTLE_MS = 80;

/** Delay in ms before applying the copied format after an editor click. */
export const APPLY_AFTER_EDITOR_CLICK_DELAY_MILLISECONDS = 50;

/** CSS selectors targeting reading-view list items for list-style injection. */
export const READING_VIEW_SCOPES = ['.markdown-preview-view', '.markdown-rendered'] as const;
