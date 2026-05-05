import { EMdStyleTagType } from '../../../../interfaces';

/**
 * MD delimiter pairs. `**` and `~~` and `==` must appear before `*` so the
 * longer delimiter is tried first at each cursor position.
 */
export const MD_TAG_REGEX = [
  { type: EMdStyleTagType.BOLD, isHTML: false, open: /\*\*/g, close: /\*\*/g },
  { type: EMdStyleTagType.STRIKETHROUGH, isHTML: false, open: /~~/g, close: /~~/g },
  { type: EMdStyleTagType.HIGHLIGHT, isHTML: false, open: /==/g, close: /==/g },
  // `*` must come last — disambiguated at scan time by checking for adjacent `*`.
  { type: EMdStyleTagType.ITALIC, isHTML: false, open: /\*/g, close: /\*/g },
];
