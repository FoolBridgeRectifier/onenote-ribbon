import type { TagContext } from '../editor-v2/detection-engine/interfaces';
import type { CopiedFormat } from '../editor-v2/styling-engine/editor-integration/interfaces';

/** The complete state of the editor's text formatting at the current cursor position. */
export interface EditorState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  highlight: boolean;
  subscript: boolean;
  superscript: boolean;
  bulletList: boolean;
  numberedList: boolean;
  headLevel: number;
  fontFamily: string;
  fontSize: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  fontColor: string | null;
  highlightColor: string | null;
  /** Set of active tag keys at the current cursor (e.g. "__task__", "important"). */
  activeTagKeys: Set<string>;
}

/** Cached detection-engine TagContext for a specific source-text snapshot. */
export interface CachedTagContext {
  sourceText: string;
  // TODO: restore non-null once engine refactor is complete.
  context: TagContext | null;
}

/** Style state derived from enclosing span tags + legacy <div> wrappers. */
export interface SpanAndDivState {
  fontColor: string | null;
  highlightColor: string | null;
  fontFamily: string;
  fontSize: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
}

/** Format-painter activity mode. */
export type FormatPainterMode = 'idle' | 'armed' | 'locked';

/** Combined state for the format painter hook. */
export interface FormatPainterState {
  mode: FormatPainterMode;
  copiedFormat: CopiedFormat | null;
}

/** Return type of the useFormatPainter hook. */
export interface UseFormatPainterResult {
  state: FormatPainterState;
  handleSingleClick: (clickCount?: number) => void;
  handleDoubleClick: () => void;
  cancel: () => void;
}

/** Subset of the Plugin API needed for persistent list-style storage. */
export interface StoragePlugin {
  loadData(): Promise<unknown>;
  saveData(data: unknown): Promise<void>;
}

/** Minimal CM6 EditorView interface for type safety. */
export interface EditorView {
  posAtDOM(node: Node, offset: number): number;
  dispatch(spec: { selection: { anchor: number } }): void;
}

/** Tuple of four CSS marker strings, one per nesting depth. */
export type BulletLevels = [string, string, string, string];

/** Converts a list counter value (and depth) to a formatted string. */
export type NumberLevelConverter = (value: number, depth: number) => string;
