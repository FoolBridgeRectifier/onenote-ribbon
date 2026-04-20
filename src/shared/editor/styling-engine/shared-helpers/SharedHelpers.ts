import type { TagDefinition, TextReplacement, FormattingDomain } from '../interfaces';
import type { HtmlTagRange } from '../../enclosing-html-tags/interfaces';
import { MARKDOWN_TO_HTML_TAG_MAP, SUBSCRIPT_TAG, SUPERSCRIPT_TAG } from '../constants';

/** Sorts replacements by fromOffset descending (last-to-first) for safe sequential application. */
export function sortReplacementsLastToFirst(replacements: TextReplacement[]): TextReplacement[] {
  return [...replacements].sort(
    (replacementA, replacementB) => replacementB.fromOffset - replacementA.fromOffset
  );
}

/**
 * Removes duplicate replacements that share the same fromOffset and toOffset.
 * Guards against malformed markup like `<b><b>text</b></b>` producing overlapping deletions.
 */
export function deduplicateReplacements(replacements: TextReplacement[]): TextReplacement[] {
  const seen = new Set<string>();
  const deduplicated: TextReplacement[] = [];

  for (const replacement of replacements) {
    const key = replacement.fromOffset + ':' + replacement.toOffset;

    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(replacement);
    }
  }

  return deduplicated;
}

/**
 * Resolves the effective tag definition for cross-domain scenarios.
 * If adding a markdown tag in an HTML domain, substitutes the HTML equivalent.
 */
export function resolveTagForDomain(
  tagDefinition: TagDefinition,
  detectedDomain: FormattingDomain
): TagDefinition {
  if (detectedDomain === 'html' && tagDefinition.domain === 'markdown') {
    const htmlEquivalent = MARKDOWN_TO_HTML_TAG_MAP.get(tagDefinition.tagName);

    if (htmlEquivalent) {
      return htmlEquivalent;
    }
  }

  return tagDefinition;
}

/**
 * Returns the mutually exclusive counterpart of a sub/superscript tag.
 * If sub is present, returns super (and vice versa) so the two are swapped rather than stacked.
 */
export function resolveMutuallyExclusiveScriptTag(
  tagDefinition: TagDefinition
): TagDefinition | null {
  if (tagDefinition.tagName === SUBSCRIPT_TAG.tagName) return SUPERSCRIPT_TAG;
  if (tagDefinition.tagName === SUPERSCRIPT_TAG.tagName) return SUBSCRIPT_TAG;
  return null;
}

/** Builds replacements that swap the markup of a tag range to a different tag definition. */
export function buildTagMarkupSwapReplacements(
  tagRange: HtmlTagRange,
  replacementTagDefinition: TagDefinition
): TextReplacement[] {
  const closingTagReplacement: TextReplacement = {
    fromOffset: tagRange.closingTagStartOffset,
    toOffset: tagRange.closingTagEndOffset,
    replacementText: replacementTagDefinition.closingMarkup,
  };

  const openingTagReplacement: TextReplacement = {
    fromOffset: tagRange.openingTagStartOffset,
    toOffset: tagRange.openingTagEndOffset,
    replacementText: replacementTagDefinition.openingMarkup,
  };

  return [closingTagReplacement, openingTagReplacement];
}
