import type {
  TagDefinition,
  TextReplacement,
  StylingResult,
  StylingContext,
  StructureContext,
} from '../interfaces';
import { buildTagRanges } from '../../enclosing-html-tags/EnclosingHtmlTags';
import { sortReplacementsLastToFirst } from '../shared-helpers/SharedHelpers';
import { buildEffectiveLineRanges, lineHasMatchingTag } from './helpers';

export { shouldProcessPerLine, buildEffectiveLineRanges, lineHasMatchingTag } from './helpers';

/** for multi-line structured selections.
 * If ALL lines have the tag → removes from all. Otherwise → adds to lines missing it.
 * Takes toggleTag and addTag as parameters to avoid circular dependencies.
 */
export function toggleTagPerLine(
  sourceText: string,
  selectionStartOffset: number,
  selectionEndOffset: number,
  tagDefinition: TagDefinition,
  structureContext: StructureContext,
  toggleTagFn: (context: StylingContext, tagDefinition: TagDefinition) => StylingResult,
  addTagFn: (context: StylingContext, tagDefinition: TagDefinition) => StylingResult
): StylingResult {
  const lineRanges = buildEffectiveLineRanges(
    structureContext,
    selectionStartOffset,
    selectionEndOffset
  );
  if (lineRanges.length === 0) return { replacements: [], isNoOp: true };

  const allTagRanges = buildTagRanges(sourceText);
  const tagPresent = lineRanges.map((range) =>
    lineHasMatchingTag(allTagRanges, sourceText, range.start, range.end, tagDefinition)
  );

  const allHaveTag = tagPresent.every(Boolean);
  const allReplacements: TextReplacement[] = [];

  if (allHaveTag) {
    for (const range of lineRanges) {
      const lineContext: StylingContext = {
        sourceText,
        selectionStartOffset: range.start,
        selectionEndOffset: range.end,
        selectedText: sourceText.slice(range.start, range.end),
      };
      const result = toggleTagFn(lineContext, tagDefinition);
      if (!result.isNoOp) allReplacements.push(...result.replacements);
    }
  } else {
    for (let lineIndex = 0; lineIndex < lineRanges.length; lineIndex++) {
      if (tagPresent[lineIndex]) continue;
      const range = lineRanges[lineIndex];
      const lineContext: StylingContext = {
        sourceText,
        selectionStartOffset: range.start,
        selectionEndOffset: range.end,
        selectedText: sourceText.slice(range.start, range.end),
      };
      const result = addTagFn(lineContext, tagDefinition);
      if (!result.isNoOp) allReplacements.push(...result.replacements);
    }
  }

  return {
    replacements: sortReplacementsLastToFirst(allReplacements),
    isNoOp: allReplacements.length === 0,
  };
}

/**
 * Adds a formatting tag per-line for multi-line structured selections.
 * Takes addTag as a parameter to avoid circular dependencies.
 */
export function addTagPerLine(
  sourceText: string,
  selectionStartOffset: number,
  selectionEndOffset: number,
  tagDefinition: TagDefinition,
  structureContext: StructureContext,
  addTagFn: (context: StylingContext, tagDefinition: TagDefinition) => StylingResult
): StylingResult {
  const lineRanges = buildEffectiveLineRanges(
    structureContext,
    selectionStartOffset,
    selectionEndOffset
  );
  if (lineRanges.length === 0) return { replacements: [], isNoOp: true };

  const allReplacements: TextReplacement[] = [];

  for (const range of lineRanges) {
    const lineContext: StylingContext = {
      sourceText,
      selectionStartOffset: range.start,
      selectionEndOffset: range.end,
      selectedText: sourceText.slice(range.start, range.end),
    };
    const result = addTagFn(lineContext, tagDefinition);
    if (!result.isNoOp) allReplacements.push(...result.replacements);
  }

  return {
    replacements: sortReplacementsLastToFirst(allReplacements),
    isNoOp: allReplacements.length === 0,
  };
}
