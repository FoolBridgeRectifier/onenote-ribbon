import type { EditorState } from '../../../../shared/hooks/interfaces';

/** Props for the HighlightTextColor component. */
export interface HighlightTextColorProps {
  editorState: EditorState;
}

/** Subset of EditorState used by highlight/font-color helpers. */
export interface HighlightEditorState {
  highlight: boolean;
  highlightColor: string | null;
  fontColor: string | null;
}
