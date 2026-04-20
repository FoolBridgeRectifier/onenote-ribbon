import type { TextAlign } from './interfaces';

/** Options available in the alignment dropdown. */
export const ALIGNMENT_OPTIONS: Array<{ value: TextAlign; label: string }> = [
  { value: 'left', label: 'Align Left' },
  { value: 'center', label: 'Align Center' },
  { value: 'right', label: 'Align Right' },
];

/** Matches alignment spans: new format with vertical-align:top. */
export const ALIGN_SPAN_PATTERN =
  /^(#{1,6}\s)?<span style="display:inline-block;width:100%;vertical-align:top;text-align:\s*(\w+)">(.*)<\/span>$/;

/** Legacy: matches old <div style="text-align: VALUE"> for backward-compatible reading. */
export const LEGACY_ALIGN_DIV_PATTERN = /^(#{1,6}\s)?<div style="text-align:\s*(\w+)">(.*)<\/div>$/;

/** Legacy: matches old inline-block span WITHOUT vertical-align:top for backward-compatible reading. */
export const LEGACY_ALIGN_INLINE_BLOCK_SPAN_PATTERN =
  /^(#{1,6}\s)?<span style="display:inline-block;width:100%;text-align:\s*(\w+)">(.*)<\/span>$/;

/** Legacy: matches old display:block span format for backward-compatible reading. */
export const LEGACY_ALIGN_BLOCK_SPAN_PATTERN =
  /^(#{1,6}\s)?<span style="display:block;text-align:\s*(\w+)">(.*)<\/span>$/;

/** Matches a heading prefix (e.g., "## ") at the start of a line. */
export const HEADING_PREFIX_PATTERN = /^(#{1,6}\s)/;
