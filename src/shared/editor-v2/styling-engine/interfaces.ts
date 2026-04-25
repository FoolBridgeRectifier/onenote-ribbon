export type FormattingDomain = 'markdown' | 'html';

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

// === Tag Definitions ===

/** A paired MD delimiter tag e.g. ** ** or * *. */
export interface MdTagDefinition {
  kind: 'md-closing';
  openingDelimiter: string;
  closingDelimiter: string;
}

/** A paired HTML tag with a tag name e.g. <b></b>. */
export interface HtmlTagDefinition {
  kind: 'html-closing';
  tagName: string;
  openingMarkup: string;
  closingMarkup: string;
}

/** An HTML span with a specific CSS property–value pair. */
export interface SpanTagDefinition {
  kind: 'html-span';
  cssProperty: string;
  cssValue: string;
}

/** A line-level single tag: list, heading, quote, or indent. */
export interface SingleTagDefinition {
  kind: 'single';
  singleType: 'list' | 'heading' | 'quote' | 'indent';
  /** Heading level 1–6; only relevant when singleType === 'heading'. */
  headingLevel?: number;
}

/** A block-level or page-level special tag: checkbox, callout, inlineTodo, meetingDetails. */
export interface SpecialTagDefinition {
  kind: 'special';
  specialType: 'checkbox' | 'callout' | 'inlineTodo' | 'meetingDetails';
  calloutType?: string;
  calloutTitle?: string;
}

export type TagDefinition =
  | MdTagDefinition
  | HtmlTagDefinition
  | SpanTagDefinition
  | SingleTagDefinition
  | SpecialTagDefinition;

// === Copied Format ===

/** Result of copyFormat. Passed to the paste handler for reconciliation. */
export interface CopiedFormat {
  tagDefinitions: (HtmlTagDefinition | SpanTagDefinition | MdTagDefinition)[];
  domain: FormattingDomain;
  lineTagDefinition?: SingleTagDefinition | SpecialTagDefinition;
}
