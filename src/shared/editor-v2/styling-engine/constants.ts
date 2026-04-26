import type { DetectedTag, TagType } from './interfaces';
import type { TextReplacement } from './interfaces';

/**
 * MD delimiter for each tag type. Empty string when the tag has no MD form.
 * (Underline / subscript / superscript / spans only have HTML or span representations.)
 */
export const MD_DELIMITER_FOR_TYPE: Partial<Record<TagType, string>> = {
  bold:          '**',
  italic:        '*',
  strikethrough: '~~',
  highlight:     '==',
  code:          '`',
};

/** HTML element name for each tag type that has a direct HTML closing form. */
export const HTML_ELEMENT_FOR_TYPE: Partial<Record<TagType, string>> = {
  bold:          'b',
  italic:        'i',
  strikethrough: 's',
  underline:     'u',
  subscript:     'sub',
  superscript:   'sup',
};

/** CSS property used by each span-tag type. */
export const CSS_PROPERTY_FOR_SPAN_TYPE: Partial<Record<TagType, string>> = {
  color:      'color',
  fontSize:   'font-size',
  fontFamily: 'font-family',
  highlight:  'background',
  align:      'text-align',
  indent:     'margin-left',
};

/** Default style payload (after the colon) used when a span value is not provided. */
export const DEFAULT_SPAN_VALUE: Partial<Record<TagType, string>> = {
  color:      '#ff0000',
  fontSize:   '14pt',
  fontFamily: 'Arial',
  highlight:  '#ffff00',
  align:      'center',
};

/** Tag definitions for built-in MD tags (mirror old engine). */
export const BOLD_MD: DetectedTag     = { type: 'bold' };
export const ITALIC_MD: DetectedTag   = { type: 'italic' };
export const STRIKETHROUGH_MD: DetectedTag = { type: 'strikethrough' };
export const HIGHLIGHT_MD: DetectedTag = { type: 'highlight' };
export const CODE_MD: DetectedTag     = { type: 'code' };

/** Tag definitions for built-in HTML closing tags. */
export const BOLD_HTML: DetectedTag          = { type: 'bold',          isHTML: true };
export const ITALIC_HTML: DetectedTag        = { type: 'italic',        isHTML: true };
export const STRIKETHROUGH_HTML: DetectedTag = { type: 'strikethrough', isHTML: true };
export const UNDERLINE_HTML: DetectedTag     = { type: 'underline',     isHTML: true };
export const SUBSCRIPT_HTML: DetectedTag     = { type: 'subscript',     isHTML: true };
export const SUPERSCRIPT_HTML: DetectedTag   = { type: 'superscript',   isHTML: true };

/** Maps TagType to its mutual-exclusion partner (subscript ↔ superscript). */
export const MUTUALLY_EXCLUSIVE_PAIRS: Partial<Record<string, string>> = {
  subscript:   'superscript',
  superscript: 'subscript',
};

/** Pixel step used when applying / removing the indent span. */
export { INDENT_STEP_PX } from '../constants';

/** Empty replacement set used when toggleTag is a no-op. */
export const EMPTY_REPLACEMENTS: TextReplacement[] = [];

/** Default callout type used when the user toggles callout on plain text. */
export const DEFAULT_CALLOUT_TYPE = 'note';

/** Callout type used for nested callouts (X15). */
export const NESTED_CALLOUT_TYPE = 'tip';
