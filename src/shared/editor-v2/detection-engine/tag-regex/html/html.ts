import { EHtmlStyleTagType } from '../../../interfaces';

/** Tags with no MD equivalent — always HTML. */
export const HTML_TAG_REGEX = [
  { type: EHtmlStyleTagType.UNDERLINE, open: /<\s*u\s*>/, close: /<\/\s*u\s*>/ },
  { type: EHtmlStyleTagType.SUBSCRIPT, open: /<\s*sub\s*>/, close: /<\/\s*sub\s*>/ },
  { type: EHtmlStyleTagType.SUPERSCRIPT, open: /<\s*sup\s*>/, close: /<\/\s*sup\s*>/ },
];
