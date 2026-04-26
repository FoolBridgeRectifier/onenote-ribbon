// Extracts all font-size point values from inline HTML on a single line.
export const FONT_SIZE_IN_LINE_PATTERN = /font-size:\s*(\d+(?:\.\d+)?)pt/g;

// Detects an existing line-height wrapper span.
// Captures: [1] heading prefix (optional), [2] line-height value, [3] inner content.
export const LINE_HEIGHT_WRAPPER_PATTERN =
  /^(#{1,6}\s)?<span style="line-height:\s*(\d+(?:\.\d+)?)pt">(.*)<\/span>$/;

// Detects a markdown heading prefix such as "## " at the start of a line.
export const HEADING_PREFIX_PATTERN = /^(#{1,6}\s)/;

// 1.5× multiplier: matches the browser's CSS "line-height: normal" behaviour, which CodeMirror
// measures as exactly 1.5 × font-size-px for the editor font (verified: 24pt/32px → 48px cm-line,
// 36pt/48px → 72px cm-line). Using this value means our line-height wrapper produces the same
// cm-line height as naturally unstyled text at the same font size — no compression, no extra
// padding. It also always exceeds the Georgia glyph height (measured at ≈1.32× font-size-px),
// ensuring glyphs fit inside their line box in reading mode.
export const LINE_HEIGHT_MULTIPLIER = 1.5;

// Font sizes at or below this threshold (pt) already fit the default editor line-height.
// Wrapping them in a line-height span would compress content rather than help it.
export const MINIMUM_FONT_SIZE_FOR_LINE_HEIGHT_PT = 16;
