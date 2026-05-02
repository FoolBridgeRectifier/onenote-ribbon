import { EHtmlStyleTagType } from '../../../../interfaces';

/** Tags with no MD equivalent — always HTML. */
export const HTML_TAG_REGEX = [
  { type: EHtmlStyleTagType.UNDERLINE, open: /<\s*u\s*>/g, close: /<\/\s*u\s*>/g },
  { type: EHtmlStyleTagType.SUBSCRIPT, open: /<\s*sub\s*>/g, close: /<\/\s*sub\s*>/g },
  { type: EHtmlStyleTagType.SUPERSCRIPT, open: /<\s*sup\s*>/g, close: /<\/\s*sup\s*>/g },
];
