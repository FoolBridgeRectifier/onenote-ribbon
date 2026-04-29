import type { DetectedTag } from '../detection-engine/interfaces';

// Re-export so callers can import from a single location.
export type { DetectedTag } from '../detection-engine/interfaces';

// === Styling Context ===

/** Input to all styling functions. Uses absolute character offsets from the start of the text. */
export interface StylingContext {
  sourceText: string;
  selectionStartOffset: number;
  selectionEndOffset: number;
}

// === Result ===

/** A single text substitution. fromOffset/toOffset are absolute character positions. */
export interface TextReplacement {
  fromOffset: number;
  toOffset: number;
  replacementText: string;
}

/**
 * Output of all styling functions.
 * Replacements must be ordered last-to-first so they can be applied sequentially
 * without offset drift between steps.
 */
export interface StylingResult {
  replacements: TextReplacement[];
  isNoOp: boolean;
  newSelectionStartOffset?: number;
  newSelectionEndOffset?: number;
}

// === Tag Definition ===

/**
 * Unified tag descriptor used as input to all styling functions.
 * Identical shape to DetectedTag: type identifies the tag; isHTML and isSpan
 * distinguish markdown vs HTML vs span variants.
 */
export type TagDefinition = DetectedTag;

// === Copied Format ===

export type FormattingDomain = 'markdown' | 'html';

/** Result of copyFormat. Passed to the paste handler for reconciliation. */
export interface CopiedFormat {
  tagDefinitions: DetectedTag[];
  domain: unknown;
  lineTagDefinition?: DetectedTag;
}
