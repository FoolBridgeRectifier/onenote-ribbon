import type { DetectedTag } from '../../detection-engine/interfaces';

/** Absolute-offset version of a DetectedTag's open/close ranges. */
export interface TagOffsetRange {
  openStart: number;
  openEnd: number;
  closeStart: number;
  closeEnd: number;
}

/** Decision payload returned by decideRemove — drives toggleTag's branch choice. */
export interface RemoveDecision {
  /** True when an enclosing tag of the same type (or HTML equivalent) was found. */
  shouldRemove: boolean;
  /** Primary enclosing tag of the requested type (MD or HTML or span). */
  enclosingTag: DetectedTag | null;
  /** Same-line bold/italic/strikethrough HTML equivalent when MD requested and HTML is also present (R9). */
  htmlEquivalent: DetectedTag | null;
  /** All same-type enclosing tags (R13 stacked detection). */
  stackedEnclosing: DetectedTag[];
}
