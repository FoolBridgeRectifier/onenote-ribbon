import { EHtmlStyleTagType } from '../../../../interfaces';

/** Tags with no MD equivalent — always HTML. */
export const HTML_TAG_REGEX = [
  { type: EHtmlStyleTagType.UNDERLINE, isHTML: true, open: /<\s*u\s*>/g, close: /<\/\s*u\s*>/g },
  { type: EHtmlStyleTagType.SUBSCRIPT, isHTML: true, open: /<\s*sub\s*>/g, close: /<\/\s*sub\s*>/g },
  { type: EHtmlStyleTagType.SUPERSCRIPT, isHTML: true, open: /<\s*sup\s*>/g, close: /<\/\s*sup\s*>/g },
];
