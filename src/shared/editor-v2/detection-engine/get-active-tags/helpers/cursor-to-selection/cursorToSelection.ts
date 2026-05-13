import type { EditorPosition } from 'obsidian';
import type { TCursor } from '../../../../interfaces';

/** Normalizes a TCursor (single point or range) into a { start, end } EditorPosition pair. */
export const cursorToSelection = (cursor: TCursor): { start: EditorPosition; end: EditorPosition } =>
  'start' in cursor ? cursor : { start: cursor, end: cursor };
