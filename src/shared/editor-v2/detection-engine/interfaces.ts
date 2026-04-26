import type { EditorPosition } from 'obsidian';
import type { TagType, ProtectedRange } from '../interfaces';

// Re-export shared types so callers can import from a single location.
export type { TagType, ProtectedTokenType, ProtectedRange } from '../interfaces';

// === Inert Zone (detection-specific) ===

/** Zones where the detection engine performs no tag scanning. */
export type InertZoneType = 'codeBlock' | 'mathBlock' | 'tabIndented';

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
  isHTML?: boolean;
  isSpan?: boolean;
  /** Optional CSS value override for span tags (used when caller provides custom value via adapter). */
  spanValue?: string;
}

// === Tag Context (output of buildTagContext) ===

/** Full document tag map. Tags are ordered by open.start position ascending. */
export interface TagContext {
  tags: DetectedTag[];
  protectedRanges: ProtectedRange[];
  content: string;
}

// === Query Results ===

/** Result returned by getActiveTagsAtCursor. */
export interface ActiveTagsResult {
  /** All inline and block tags whose range encloses the cursor position. */
  enclosingTags: DetectedTag[];
  /** The line-level tag on the cursor's line, or null if the line has no prefix tag. */
  lineTag: DetectedTag | null;
  /** Whether the cursor is in a Markdown or HTML context; drives format upgrades in the engine. */
  insertionFormat: 'markdown' | 'html';
}

/** Result of inspecting one line for a line-level prefix tag. */
export interface LinePrefixResult {
  /** Detected line tag (open only) — null when the line has no recognised prefix. */
  tag: DetectedTag | null;
  /** Character offset where inline content starts on this line (after the prefix). */
  contentStartCh: number;
}

/** Internal: HTML opener match payload. */
export interface HtmlOpenerMatch {
  openEndCh: number;
  styleAttribute?: string;
}

/** Internal: HTML closer match payload. */
export interface HtmlCloserMatch {
  closeStart: number;
  closeEnd: number;
}
