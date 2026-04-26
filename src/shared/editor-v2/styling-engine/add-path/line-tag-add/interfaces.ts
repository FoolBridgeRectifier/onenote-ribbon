import type { TextReplacement } from '../../interfaces';

/** Internal classification result returned per-line during line-tag-add processing. */
export interface LineClassification {
  alreadyTagged: boolean;
  additionReplacements: TextReplacement[];
  removalReplacements: TextReplacement[];
}
