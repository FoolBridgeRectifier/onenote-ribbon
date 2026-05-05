import { EMdStyleTagType } from '../../../../interfaces';

/**
 * HTML forms of bold/italic/strikethrough. Same TTagType as their MD counterpart;
 * the matched tag gets isHTML: true.
 */
export const HTML_EQUIV_MD_TAG_REGEX = [
  { type: EMdStyleTagType.BOLD, isHTML: true, open: /<\s*b\s*>/g, close: /<\/\s*b\s*>/g },
  { type: EMdStyleTagType.ITALIC, isHTML: true, open: /<\s*i\s*>/g, close: /<\/\s*i\s*>/g },
  { type: EMdStyleTagType.STRIKETHROUGH, isHTML: true, open: /<\s*s\s*>/g, close: /<\/\s*s\s*>/g },
];
