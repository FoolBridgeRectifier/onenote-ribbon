import type { HtmlTagDefinition, ObsidianEditor, LegacyCopiedFormat } from './interfaces';
import { toggleTag, removeAllTags, copyFormat } from '../StylingEngine';
import { buildStylingContextFromEditor, applyStylingResult } from './EditorIntegration';
import { translateHtmlTagDefinitionToV2 } from './translate-tag-definition/translateTagDefinition';
import { translateV2ToHtml } from './translate-tag-definition/translate-v2-to-html/translateV2ToHtml';

/**
 * Toggles the given tag on/off across the editor selection. Drop-in replacement for the old engine's
 * `toggleTagInEditor` — accepts a legacy {@link HtmlTagDefinition} and translates internally.
 */
export function toggleTagInEditor(editor: ObsidianEditor, htmlTagDefinition: HtmlTagDefinition): void {
  const stylingContext = buildStylingContextFromEditor(editor);
  const v2TagDefinition = translateHtmlTagDefinitionToV2(htmlTagDefinition);
  const result = toggleTag(stylingContext, v2TagDefinition);
  applyStylingResult(editor, stylingContext.sourceText, result);
}

/**
 * Adds the tag (never removes). Used by font/colour pickers where the user expects an
 * unconditional update — e.g. setting a new font size that replaces the current one.
 *
 * v2 has no separate `addTag`; we route through `toggleTag`. For span tags this still produces
 * an A5 replace when the same CSS property is already present, matching old-engine semantics.
 */
export function addTagInEditor(editor: ObsidianEditor, htmlTagDefinition: HtmlTagDefinition): void {
  toggleTagInEditor(editor, htmlTagDefinition);
}

/**
 * Removes a specific tag from around the selection. v2 does not expose a standalone `removeTag`,
 * so we use `toggleTag` (which removes when the tag is enclosing) — matches old engine semantics
 * because callers only invoke this when the tag is known to be present.
 */
export function removeTagInEditor(editor: ObsidianEditor, htmlTagDefinition: HtmlTagDefinition): void {
  toggleTagInEditor(editor, htmlTagDefinition);
}

/** Removes EVERY detectable tag (inline + span + line-prefix) inside the selection. */
export function removeAllTagsInEditor(editor: ObsidianEditor): void {
  const stylingContext = buildStylingContextFromEditor(editor);
  const result = removeAllTags(stylingContext);
  applyStylingResult(editor, stylingContext.sourceText, result);
}

/**
 * Captures the formatting context (enclosing tags + line-tag) at the cursor for paste reconciliation.
 * Returned shape mirrors the old engine's CopiedFormat.
 */
export function copyFormatFromEditor(editor: ObsidianEditor): LegacyCopiedFormat | null {
  const stylingContext = buildStylingContextFromEditor(editor);
  const captured = copyFormat(stylingContext);

  // Old engine's CopiedFormat surface — translate v2 tag definitions back into legacy HtmlTagDefinition shape.
  return {
    domain: captured.domain,
    tagDefinitions: translateV2ToHtml(captured.tagDefinitions),
  };
}
