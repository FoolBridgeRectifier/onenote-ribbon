import type { HtmlTagDefinition, FormattingDomain } from '../tag-definitions/interfaces';

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
  // copyFormat only discovers HTML inline tags — callout/task kinds never appear here
  tagDefinitions: HtmlTagDefinition[];
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

// === Structure Detection ===

/** An inert zone within the document where styling should not be applied. */
export interface InertRange {
  startOffset: number;
  endOffset: number;
  zoneType: InertZoneType;
}
