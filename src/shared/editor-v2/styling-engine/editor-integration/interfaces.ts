/**
 * Public types for the v2 styling-engine editor-integration adapter. These are
 * the legacy-shape types still consumed by buttons and hooks. They live here
 * (not re-exported from the old engine) so the old engine can be deleted in
 * Phase 8 without touching any caller.
 */

// === Formatting Domain ===

export type FormattingDomain = 'markdown' | 'html';

// === Tag and Markup Definitions ===

/** Describes an HTML inline tag operation (bold, italic, span, etc.). */
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

/** Describes an inline `#todo` tag toggle operation. */
export interface InlineTodoTagDefinition {
  kind: 'inline-todo';
}

/** Minimal Obsidian Editor interface for styling operations. */
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
  replaceRange(replacement: string, from: { line: number; ch: number }, to: { line: number; ch: number }): void;
  lastLine(): number;
}

// === Format Painter ===

export interface CopiedFormat {
  // copyFormat only discovers HTML inline tags — callout/task kinds never appear here.
  tagDefinitions: HtmlTagDefinition[];
  domain: FormattingDomain;
}

// Legacy alias retained for any consumer that imports the renamed type.
export type LegacyCopiedFormat = CopiedFormat;

// === Options ===

export interface RemoveAllTagsOptions {
  preserveLinePrefix?: boolean; // default true; false strips heading prefixes too.
}
