import type { ObsidianEditor } from '../../../../shared/editor-v2/styling-engine/editor-integration/interfaces';
import { addTagInEditor } from '../../../../shared/editor-v2/styling-engine/editor-integration/helpers';
import { buildSpanTagDefinition } from '../../../../shared/editor-v2/styling-engine/editor-integration/build-span-tag-definition/buildSpanTagDefinition';

// Applies a font-family span to the current selection via the styling engine.
export function applyFontFamily(editor: ObsidianEditor, fontFamily: string): void {
  addTagInEditor(editor, buildSpanTagDefinition('font-family', `'${fontFamily}'`));
}

// Applies a font-size span (in points) to the current selection via the styling engine.
export function applyFontSize(editor: ObsidianEditor, sizeInPt: number): void {
  addTagInEditor(editor, buildSpanTagDefinition('font-size', `${sizeInPt}pt`));
}
