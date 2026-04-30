import { EMdStyleTagType } from '../../../interfaces';

/**
 * HTML forms of bold/italic/strikethrough. Same TTagType as their MD counterpart;
 * the matched tag gets isHTML: true.
 */
export const HTML_EQUIV_MD_TAG_REGEX = [
  { type: EMdStyleTagType.BOLD, open: /<\s*b\s*>/, close: /<\/\s*b\s*>/ },
  { type: EMdStyleTagType.ITALIC, open: /<\s*i\s*>/, close: /<\/\s*i\s*>/ },
  { type: EMdStyleTagType.STRIKETHROUGH, open: /<\s*s\s*>/, close: /<\/\s*s\s*>/ },
];
