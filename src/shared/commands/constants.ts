/** Obsidian command IDs for all ribbon shortcuts. */
export const COMMAND_TOGGLE_BOLD = 'onenote-ribbon-bold';
export const COMMAND_TOGGLE_ITALIC = 'onenote-ribbon-italic';
export const COMMAND_TOGGLE_UNDERLINE = 'onenote-ribbon-underline';
export const COMMAND_TOGGLE_SUBSCRIPT = 'onenote-ribbon-subscript';
export const COMMAND_TOGGLE_SUPERSCRIPT = 'onenote-ribbon-superscript';
export const COMMAND_CLEAR_FORMATTING = 'onenote-ribbon-clear-formatting';
export const COMMAND_INCREASE_FONT_SIZE = 'onenote-ribbon-font-size-increase';
export const COMMAND_DECREASE_FONT_SIZE = 'onenote-ribbon-font-size-decrease';
export const COMMAND_ACTIVATE_FORMAT_PAINTER = 'onenote-ribbon-format-painter';

/**
 * Custom DOM event dispatched to activate the format painter from outside React.
 * ClipboardGroup listens for this event and arms the format painter state machine.
 */
export const FORMAT_PAINTER_ACTIVATE_EVENT = 'onr-format-painter-activate';
