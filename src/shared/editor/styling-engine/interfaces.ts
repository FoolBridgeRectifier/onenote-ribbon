// === Formatting Domain ===

export type FormattingDomain = 'markdown' | 'html';

// === Tag and Markup Definitions ===

/**
 * Describes an HTML inline tag operation (bold, italic, span, etc.).
 * The `kind` field is optional and defaults to 'html' for backwards compatibility
 * with all existing callers that pre-date the discriminated union.
 */
export interface HtmlTagDefinition {
  kind?: 'html';
  tagName: string;
  domain: FormattingDomain;
  openingMarkup: string;
  closingMarkup: string;
  attributes?: Record<string, string>;
}

/** Describes a callout block operation (apply or remove). */
export interface CalloutTagDefinition {
  kind: 'callout';
  /** Required when adding a callout. Omit when removing the innermost callout. */
  calloutType?: string;
  /** Callout title text. When supplied to removeTag, removes that specific callout by key. */
  calloutTitle?: string;
}

/** Describes a task list item operation. */
export interface TaskTagDefinition {
  kind: 'task';
  /** Optional prefix placed before the task body (e.g. "Todo:", "Discuss:"). */
  taskPrefix?: string;
}

/** Describes a checkbox removal operation. */
export interface CheckboxTagDefinition {
  kind: 'checkbox';
}

/** Describes an inline #todo tag toggle operation. */
export interface InlineTodoTagDefinition {
  kind: 'inline-todo';
}

/**
 * Union of all tag operation kinds accepted by the unified styling engine API.
 * All existing HTML tag callers continue to work without changes — `kind` is optional on HtmlTagDefinition.
 */
export type TagDefinition =
  | HtmlTagDefinition
  | CalloutTagDefinition
  | TaskTagDefinition
  | CheckboxTagDefinition
  | InlineTodoTagDefinition;

/** Type guard: narrows a TagDefinition to the HTML-specific variant. */
export function isHtmlTagDefinition(tag: TagDefinition): tag is HtmlTagDefinition {
  return tag.kind === undefined || tag.kind === 'html';
}

// === Text Replacement and Result Types ===

export interface TextReplacement {
  fromOffset: number;
  toOffset: number;
  replacementText: string;
}

export interface StylingResult {
  replacements: TextReplacement[]; // ordered last-to-first for safe sequential apply
  isNoOp: boolean;
  newSelectionStart?: number;
  newSelectionEnd?: number;
}

// === Context Passed to Styling Functions ===

export interface StylingContext {
  sourceText: string;
  selectionStartOffset: number;
  selectionEndOffset: number;
  selectedText: string;
}

// === Structure Detection Types ===

export type LinePrefixType =
  | 'heading'
  | 'bullet'
  | 'numbered'
  | 'todo'
  | 'callout'
  | 'indent'
  | 'footnoteDefinition'
  | 'none';

export type InertZoneType =
  | 'codeBlock'
  | 'mathBlock'
  | 'inlineMath'
  | 'inlineCode'
  | 'table'
  | 'horizontalRule';

// === Protected (Atomic) Ranges ===

export interface ProtectedRange {
  startOffset: number; // relative to selection start
  endOffset: number;
  tokenType: 'wikilink' | 'mdLink' | 'embed' | 'footnoteRef' | 'hashtag';
}

// === Per-Line Structure Context ===

export interface LineStructureContext {
  lineStartOffset: number;
  lineEndOffset: number;
  linePrefix: string | null;
  linePrefixType: LinePrefixType;
  contentStartOffset: number; // absolute offset where formattable content starts (after prefix)
  inertZone: InertZoneType | null; // non-null means entire line is isNoOp
}

// === Aggregate Structure Context for a Selection ===

export interface StructureContext {
  lines: LineStructureContext[];
  protectedRanges: ProtectedRange[];
  isFullyInert: boolean; // true if ALL lines are inert — isNoOp for entire selection
}

// === Format Painter Types ===

export interface CopiedFormat {
  tagDefinitions: TagDefinition[];
  domain: FormattingDomain;
}

// === Domain Detection Result ===

export interface DomainDetectionResult {
  domain: FormattingDomain;
  hasMarkdownTokens: boolean; // true if MD delimiters (**, *, ~~, ==) detected in/around selection
  hasHtmlTags: boolean; // true if HTML tags (<u>, <span>, etc.) detected in/around selection
}

// === Options for Removing All Tags ===

export interface RemoveAllTagsOptions {
  preserveLinePrefix?: boolean; // default true; false strips heading prefixes too
}

// === Markdown-to-HTML Conversion Entry ===

// Entries that expand to multiple HTML tags (e.g. *** → <b><i>)
// use `htmlTags` array. Single-tag entries use a one-element array.
// Order matters: longer delimiters must come before shorter ones
// (*** before ** before *) to avoid partial-match confusion.
export interface MarkdownToHtmlConversionEntry {
  markdownOpening: string;
  markdownClosing: string;
  htmlTags: HtmlTagDefinition[]; // multiple entries for combined formats like bold+italic
}

// === Editor Integration ===

/** Minimal Obsidian Editor interface for styling operations. Satisfies the full Editor via structural typing. */
export interface ObsidianEditor {
  getValue(): string;
  getCursor(which?: 'from' | 'to' | 'head' | 'anchor'): { line: number; ch: number };
  setCursor(position: { line: number; ch: number }): void;
  setSelection(anchor: { line: number; ch: number }, head: { line: number; ch: number }): void;
  transaction(spec: {
    changes?: Array<{
      from: { line: number; ch: number };
      to: { line: number; ch: number };
      text: string;
    }>;
    selection?: { from: { line: number; ch: number }; to?: { line: number; ch: number } };
  }): void;
  getLine(lineNumber: number): string;
  setLine(lineNumber: number, text: string): void;
  getSelection(): string;
  replaceSelection(replacement: string): void;
  lastLine(): number;
}

// === Structure Detection ===

/** An inert zone within the document where styling should not be applied. */
export interface InertRange {
  startOffset: number;
  endOffset: number;
  zoneType: InertZoneType;
}
