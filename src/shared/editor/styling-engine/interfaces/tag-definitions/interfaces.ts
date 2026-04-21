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
