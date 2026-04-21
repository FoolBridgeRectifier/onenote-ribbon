import type { EnclosingHtmlTagFinder } from '../editor/enclosing-html-tags/enclosingHtmlTags';
import type { CopiedFormat } from '../editor/styling-engine/interfaces';

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
}

/** Cached result of an EnclosingHtmlTagFinder for a specific source text. */
export interface CachedFinderData {
  sourceText: string;
  finder: EnclosingHtmlTagFinder;
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
