import {
  ObsidianEditor,
  addTagInEditor,
} from '../../../../shared/editor/styling-engine/editorIntegration';

import { buildSpanTagDefinition } from '../../../../shared/editor/styling-engine/tagManipulation';

// Applies a font-family span to the current selection via the styling engine.
export function applyFontFamily(editor: ObsidianEditor, fontFamily: string): void {
  addTagInEditor(editor, buildSpanTagDefinition('font-family', `'${fontFamily}'`));
}

// Applies a font-size span (in points) to the current selection via the styling engine.
export function applyFontSize(editor: ObsidianEditor, sizeInPt: number): void {
  addTagInEditor(editor, buildSpanTagDefinition('font-size', `${sizeInPt}pt`));
}
