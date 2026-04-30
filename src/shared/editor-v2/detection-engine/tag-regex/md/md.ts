import { EMdStyleTagType } from '../../../interfaces';

/**
 * MD delimiter pairs. `**` and `~~` and `==` must appear before `*` so the
 * longer delimiter is tried first at each cursor position.
 */
export const MD_TAG_REGEX = [
  { type: EMdStyleTagType.BOLD, delimiter: /\*\*/ },
  { type: EMdStyleTagType.STRIKETHROUGH, delimiter: /~~/ },
  { type: EMdStyleTagType.HIGHLIGHT, delimiter: /==/ },
  // `*` must come last — disambiguated at scan time by checking for adjacent `*`.
  { type: EMdStyleTagType.ITALIC, delimiter: /\*/ },
];
