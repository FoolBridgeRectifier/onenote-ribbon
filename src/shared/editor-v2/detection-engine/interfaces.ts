import type { EditorPosition } from 'obsidian';

// === Tag Taxonomy ===

export type TagType =
  | 'bold'
  | 'italic'
  | 'strikethrough'
  | 'highlight'
  | 'underline'
  | 'subscript'
  | 'superscript'
  | 'code'
  | 'color'
  | 'fontSize'
  | 'fontFamily'
  | 'align'
  | 'list'
  | 'heading'
  | 'quote'
  | 'indent'
  | 'checkbox'
  | 'callout'
  | 'inlineTodo'
  | 'meetingDetails';

export type InertZoneType = 'codeBlock' | 'mathBlock' | 'tabIndented';

export type ProtectedTokenType = 'wikilink' | 'embed' | 'mdLink' | 'footnoteRef';

// === Position Types ===

/** Inclusive start and exclusive end EditorPosition range for an opening or closing delimiter. */
export interface TagPosition {
  start: EditorPosition;
  end: EditorPosition;
}

// === Core Tag Shape ===

/**
 * Represents one fully matched tag found during document scan.
 * Line-level tags (list, heading, quote, indent, checkbox, callout) have open but no close.
 * Page-level tags (meetingDetails) have neither open nor close — they are located by line scan.
 */
export interface DetectedTag {
  type: TagType;
  /** Present on all closing and inline tags; absent only on page-level single tags. */
  open?: TagPosition;
  /** Present on paired closing tags only (MD closing, HTML closing, HTML span). */
  close?: TagPosition;
  isHTML: boolean;
  isSpan: boolean;
  /** Heading level 1–6; only set when type === 'heading'. */
  headingLevel?: number;
  /** Callout type string e.g. 'note', 'warning'; only set when type === 'callout'. */
  calloutType?: string;
  /** Indent depth in multiples of 24px; only set when type === 'indent'. */
  indentDepth?: number;
}

// === Protected Token ===

/** A token that the styling engine must punch out around rather than wrap inside. */
export interface ProtectedRange {
  startOffset: number;
  endOffset: number;
  tokenType: ProtectedTokenType;
}

// === Tag Context (output of buildTagContext) ===

/** Full document tag map. Tags are ordered by open.start position ascending. */
export interface TagContext {
  tags: DetectedTag[];
  protectedRanges: ProtectedRange[];
  content: string;
}

// === Query Results ===

/** Result of getActiveTagsAtCursor. */
export interface ActiveTagsResult {
  /** All closing tags whose range encloses the cursor position. */
  enclosingTags: DetectedTag[];
  /** The line-level single tag on the cursor line, or null if none. */
  lineTag: DetectedTag | null;
}
