import type { EditorState } from '../../../../shared/hooks/useEditorState';

/** Text alignment direction for the Align Button. */
export type TextAlign = 'left' | 'center' | 'right';

/** Props for the AlignButton component. */
export interface AlignButtonProps {
  editorState: EditorState;
}
