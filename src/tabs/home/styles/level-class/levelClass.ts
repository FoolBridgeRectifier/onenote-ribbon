import type { StyleEntry } from '../interfaces';

/**
 * Maps a StyleEntry to the CSS modifier class that controls its visual
 * appearance in both the preview buttons and the expand dropdown.
 * Returns an empty string for unrecognised entries.
 */
export function levelClass(style: StyleEntry): string {
  if (style.level === 0 && !style.type) return 'onr-style-normal';
  if (style.level === 1) return 'onr-style-h1';
  if (style.level === 2) return 'onr-style-h2';
  if (style.level === 3) return 'onr-style-h3';
  if (style.level === 4) return 'onr-style-h4';
  if (style.level === 5) return 'onr-style-h5';
  if (style.level === 6) return 'onr-style-h6';
  if (style.type === 'quote') return 'onr-style-quote';
  if (style.type === 'code') return 'onr-style-code';
  return '';
}
