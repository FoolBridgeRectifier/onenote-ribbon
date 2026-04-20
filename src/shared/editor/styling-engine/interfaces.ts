// === Formatting Domain ===

export type FormattingDomain = 'markdown' | 'html';

// === Tag and Markup Definitions ===

export interface TagDefinition {
  tagName: string;
  domain: FormattingDomain;
  openingMarkup: string;
  closingMarkup: string;
  attributes?: Record<string, string>;
}

// === Text Replacement and Result Types ===

export interface TextReplacement {
  fromOffset: number;
  toOffset: number;
  replacementText: string;
}

export interface StylingResult {
  replacements: TextReplacement[];  // ordered last-to-first for safe sequential apply
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
  startOffset: number;  // relative to selection start
  endOffset: number;
  tokenType: 'wikilink' | 'mdLink' | 'embed' | 'footnoteRef' | 'hashtag';
}

// === Per-Line Structure Context ===

export interface LineStructureContext {
  lineStartOffset: number;
  lineEndOffset: number;
  linePrefix: string | null;
  linePrefixType: LinePrefixType;
  contentStartOffset: number;       // absolute offset where formattable content starts (after prefix)
  inertZone: InertZoneType | null;  // non-null means entire line is isNoOp
}

// === Aggregate Structure Context for a Selection ===

export interface StructureContext {
  lines: LineStructureContext[];
  protectedRanges: ProtectedRange[];
  isFullyInert: boolean;  // true if ALL lines are inert — isNoOp for entire selection
}

// === Format Painter Types ===

export interface CopiedFormat {
  tagDefinitions: TagDefinition[];
  domain: FormattingDomain;
}

// === Domain Detection Result ===

export interface DomainDetectionResult {
  domain: FormattingDomain;
  hasMarkdownTokens: boolean;  // true if MD delimiters (**, *, ~~, ==) detected in/around selection
  hasHtmlTags: boolean;        // true if HTML tags (<u>, <span>, etc.) detected in/around selection
}

// === Options for Removing All Tags ===

export interface RemoveAllTagsOptions {
  preserveLinePrefix?: boolean;  // default true; false strips heading prefixes too
}

// === Markdown-to-HTML Conversion Entry ===

// Entries that expand to multiple HTML tags (e.g. *** → <b><i>)
// use `htmlTags` array. Single-tag entries use a one-element array.
// Order matters: longer delimiters must come before shorter ones
// (*** before ** before *) to avoid partial-match confusion.
export interface MarkdownToHtmlConversionEntry {
  markdownOpening: string;
  markdownClosing: string;
  htmlTags: TagDefinition[];  // multiple entries for combined formats like bold+italic
}

// === Editor Integration ===

/** Minimal Obsidian Editor interface for styling operations. Satisfies the full Editor via structural typing. */
export interface ObsidianEditor {
  getValue(): string;
  getCursor(which?: 'from' | 'to' | 'head' | 'anchor'): { line: number; ch: number };
  setCursor(position: { line: number; ch: number }): void;
  setSelection(
    anchor: { line: number; ch: number },
    head: { line: number; ch: number },
  ): void;
  transaction(spec: {
    changes?: Array<{ from: { line: number; ch: number }; to: { line: number; ch: number }; text: string }>;
    selection?: { anchor: { line: number; ch: number }; head: { line: number; ch: number } };
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
