export interface TextPosition {
  line: number;
  ch: number;
}

export interface HtmlTagRange {
  tagName: string;
  openingTagStartOffset: number;
  openingTagEndOffset: number;
  closingTagStartOffset: number;
  closingTagEndOffset: number;
}

export type CursorOrSelectionLocation =
  | { cursorPosition: TextPosition }
  | { leftPosition: TextPosition; rightPosition: TextPosition };

export interface EnclosingHtmlTagFinder {
  getEnclosingTagRanges(location: CursorOrSelectionLocation): HtmlTagRange[];
  getEnclosingTagNames(location: CursorOrSelectionLocation): string[];
}

export interface TextIndex {
  lineStartOffsets: number[];
  lineLengths: number[];
  sourceLength: number;
}

export interface OpeningTagBoundary {
  tagName: string;
  openingTagStartOffset: number;
  openingTagEndOffset: number;
}

export interface OffsetRange {
  leftOffset: number;
  rightOffset: number;
}

export interface MarkdownTagPatternDefinition {
  tagName: string;
  patternSource: string;
  patternFlags: string;
  openingDelimiterLength: number;
  closingDelimiterLength: number;
  // Offset from the match boundary inward where this tag's delimiter begins.
  // Used for combined patterns like *** where bold claims the outer 2 chars
  // (inset=0) and italic claims the inner 1 char (inset=2).
  delimiterInset?: number;
}
