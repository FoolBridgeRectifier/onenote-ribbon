import type { TagDefinition } from '../../../interfaces';

/** Inverse of CSS-property → type mapping used in translateHtmlTagDefinitionToV2. */
export const TYPE_TO_CSS_PROPERTY: Partial<Record<TagDefinition['type'], string>> = {
  color:      'color',
  highlight:  'background',
  fontSize:   'font-size',
  fontFamily: 'font-family',
  align:      'text-align',
  indent:     'margin-left',
};

/** Inverse of HTML-element → type mapping used in translateHtmlTagDefinitionToV2. */
export const TYPE_TO_HTML_ELEMENT: Partial<Record<TagDefinition['type'], string>> = {
  bold:          'b',
  italic:        'i',
  strikethrough: 's',
  underline:     'u',
  subscript:     'sub',
  superscript:   'sup',
  highlight:     'mark',
};

/** Markdown delimiters used for plain (non-HTML) tags. */
export const TYPE_TO_MD_DELIMITER: Partial<Record<TagDefinition['type'], string>> = {
  bold:          '**',
  italic:        '*',
  strikethrough: '~~',
  highlight:     '==',
  code:          '`',
};
