// Interfaces shared between the detection engine and the styling engine.
// Engine-specific interfaces live in each engine's own interfaces.ts file.

// === Tag Taxonomy ===

/**
 * All recognised tag types. The detection engine emits these on DetectedTag.type;
 * the styling engine accepts them implicitly through TagDefinition shapes.
 */
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

// === Protected Token ===

/** Types of inline tokens that the styling engine must punch out around, never wrap inside. */
export type ProtectedTokenType = 'wikilink' | 'embed' | 'mdLink' | 'footnoteRef' | 'code' | 'todo' | 'meetingDetails';

/**
 * A character range that must not be wrapped inside any inline tag.
 * The detection engine records these; the styling engine consumes them to implement punch-out.
 */
export interface ProtectedRange {
  startOffset: number;
  endOffset: number;
  tokenType: ProtectedTokenType;
}

// === Formatting Domain ===

/**
 * Determines which tag form is used at any given position.
 * 'markdown' — plain MD delimiters (**  *  ~~  ==  `).
 * 'html'     — HTML markup tags and spans. MD delimiters are forbidden inside (invariant I2).
 */
export type FormattingDomain = 'markdown' | 'html';
