import type { DetectedTag } from '../interfaces';

/** Inclusive-start, exclusive-end character range that the inline scanner must skip. */
export interface InlineSkipRange {
  startCh: number;
  endCh: number;
}

/** A single inline-match result produced by the HTML or MD matcher. */
export interface InlineMatchResult {
  tag: DetectedTag;
  innerTags: DetectedTag[];
  advanceTo: number;
}

/** Signature of the recursive scanner — passed into matchers to detect nested tags. */
export type InlineRecursiveScanner = (
  line: string,
  lineIndex: number,
  scanStartCh: number,
  skipRanges: InlineSkipRange[],
) => DetectedTag[];
