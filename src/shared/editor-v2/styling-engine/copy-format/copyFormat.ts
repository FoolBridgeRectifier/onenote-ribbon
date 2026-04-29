import type { StylingContext, CopiedFormat, TagDefinition, FormattingDomain } from '../interfaces';
import type { DetectedTag } from '../../detection-engine/interfaces';
// TODO: restore buildTagContext / getEnclosingTags imports after engine refactor is complete
import { lineBoundsAt } from '../helpers';
import { detectLineTag } from './detect-line-tag/detectLineTag';

/**
 * Captures all enclosing inline tags + the line-tag at the cursor.
 * Used by the paste reconciler to project formatting onto the destination selection.
 */
export function copyFormatImpl(context: StylingContext): CopiedFormat {
  const { sourceText, selectionStartOffset: selStart, selectionEndOffset: selEnd } = context;

  // TODO: restore real detection once engine refactor is complete.
  const enclosingTags: DetectedTag[] = [];

  const tagDefinitions: DetectedTag[] = enclosingTags;

  const domain: FormattingDomain = enclosingTags.some((tag) => tag.isHTML || tag.isSpan)
    ? 'html'
    : 'markdown';

  const bounds = lineBoundsAt(sourceText, selStart);
  const lineText = sourceText.slice(bounds.lineStart, bounds.lineEnd);
  const lineTagDefinition: TagDefinition | undefined = detectLineTag(lineText);

  return { tagDefinitions, domain, lineTagDefinition };
}

/** Convert absolute offset to {line, ch} editor position. */
function offsetToPosition(sourceText: string, offset: number): { line: number; ch: number } {
  let line = 0;
  let lastNewline = -1;
  for (let i = 0; i < offset; i++) {
    if (sourceText[i] === '\n') {
      line++;
      lastNewline = i;
    }
  }
  return { line, ch: offset - lastNewline - 1 };
}
