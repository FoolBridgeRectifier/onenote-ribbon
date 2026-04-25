/** Milliseconds to wait after a content change before rebuilding the tag context. */
export const DETECTION_DEBOUNCE_MS = 300;

/** Regex that matches the start of a fenced code block line. */
export const FENCED_CODE_BLOCK_OPENING_PATTERN = /^```/;

/** Regex that matches a tab-indented line (inert zone). */
export const TAB_INDENTED_LINE_PATTERN = /^\t/;

/** Regex that matches a math block delimiter line. */
export const MATH_BLOCK_DELIMITER_PATTERN = /^\$\$\s*$/;

/** Regex that matches a callout header line, capturing the callout type. */
export const CALLOUT_HEADER_PATTERN = /^(>+)\s*\[!([^\]]+)\](.*)/;

/** Regex that matches a meeting-details opening line. */
export const MEETING_DETAILS_OPENING_PATTERN = /^>\s*---\s*$/;

/** Regex that matches a checkbox list item. */
export const CHECKBOX_ITEM_PATTERN = /^-\s+\[\s\]\s/;

/** Regex that matches a plain list item (not checkbox). */
export const LIST_ITEM_PATTERN = /^-\s+(?!\[\s\])/;

/** Regex that matches a heading line, capturing the `#` level prefix. */
export const HEADING_LINE_PATTERN = /^(#{1,6})\s/;

/** Regex that matches a blockquote prefix (not a callout). */
export const QUOTE_LINE_PATTERN = /^>\s(?!\[!)/;

/** Regex that matches a margin-left indent span, capturing the pixel value. */
export const INDENT_SPAN_PATTERN = /<span\s+style="margin-left:(\d+)px"\s*\/>/;
