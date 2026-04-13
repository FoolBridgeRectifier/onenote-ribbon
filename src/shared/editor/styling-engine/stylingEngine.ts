import {
  TagDefinition,
  TextReplacement,
  StylingResult,
  StylingContext,
  CopiedFormat,
  FormattingDomain,
  RemoveAllTagsOptions,
} from './interfaces';

import {
  MARKDOWN_TO_HTML_TAG_MAP,
  MARKDOWN_TO_HTML_CONVERSION_TABLE,
  UNDERLINE_TAG,
  SUBSCRIPT_TAG,
  SUPERSCRIPT_TAG,
  BOLD_HTML_TAG,
  ITALIC_HTML_TAG,
  STRIKETHROUGH_HTML_TAG,
  HIGHLIGHT_HTML_TAG,
  BOLD_MD_TAG,
  ITALIC_MD_TAG,
  STRIKETHROUGH_MD_TAG,
  HIGHLIGHT_MD_TAG,
} from './constants';

import { detectStructureContext } from './structureDetection';
import { detectFormattingDomain } from './domainDetection';
import { convertMarkdownTokensToHtml } from './markdownToHtmlConversion';

import {
  wrapTextWithTag,
  unwrapTag,
  extractStylePropertyFromOpeningTag,
  replaceOpeningTagAttribute,
  splitFormattingAroundProtectedRanges,
  buildSpanTagDefinition,
} from './tagManipulation';

import { buildTagRanges } from '../enclosing-html-tags/enclosingHtmlTags';

import { HtmlTagRange } from '../enclosing-html-tags/interfaces';

// ============================================================
// Shared Helpers
// ============================================================

/**
 * Comparator: sorts tag ranges by content width (inner-to-outer).
 */
function compareByContentWidth(rangeA: HtmlTagRange, rangeB: HtmlTagRange): number {
  const widthA = rangeA.closingTagStartOffset - rangeA.openingTagEndOffset;
  const widthB = rangeB.closingTagStartOffset - rangeB.openingTagEndOffset;
  return widthA - widthB;
}

/**
 * Checks if a tag range fully encloses the given selection.
 * A range encloses when its opening tag ends at/before selectionStart
 * and its closing tag starts at/after selectionEnd.
 */
function tagEnclosesSelection(
  tagRange: HtmlTagRange,
  selectionStartOffset: number,
  selectionEndOffset: number,
): boolean {
  // Inclusive boundaries: cursor at tag boundary is considered enclosed
  return (
    tagRange.openingTagEndOffset <= selectionStartOffset &&
    tagRange.closingTagStartOffset >= selectionEndOffset
  );
}

/**
 * Checks if a tag range's full span (opening start to closing end) is contained
 * within or exactly matches the selection. This detects "delimiter-inclusive" selections
 * where the user selects `<u>text</u>` including the tags themselves.
 */
function tagSpanIsWithinSelection(
  tagRange: HtmlTagRange,
  selectionStartOffset: number,
  selectionEndOffset: number,
): boolean {
  return (
    tagRange.openingTagStartOffset >= selectionStartOffset &&
    tagRange.closingTagEndOffset <= selectionEndOffset
  );
}

/**
 * Filters tag ranges by a geometry predicate and tag definition match.
 * Shared by findEnclosingMatchingTag and findDelimiterInclusiveMatch —
 * they differ only in their geometry check and which match to return.
 */
function filterMatchingTagRanges(
  allTagRanges: HtmlTagRange[],
  sourceText: string,
  tagDefinition: TagDefinition,
  geometryPredicate: (tagRange: HtmlTagRange) => boolean,
): HtmlTagRange[] {
  const isSpanWithAttributes =
    tagDefinition.tagName === 'span' && tagDefinition.attributes !== undefined;

  const matchingRanges: HtmlTagRange[] = [];

  for (let rangeIndex = 0; rangeIndex < allTagRanges.length; rangeIndex++) {
    const tagRange = allTagRanges[rangeIndex];

    if (!geometryPredicate(tagRange)) {
      continue;
    }

    if (!isSpanWithAttributes) {
      if (tagRange.tagName === tagDefinition.tagName) {
        matchingRanges.push(tagRange);
      }

      continue;
    }

    // For span tags with CSS attributes, check the CSS property matches
    if (tagRange.tagName !== 'span') {
      continue;
    }

    const openingTagText = sourceText.slice(
      tagRange.openingTagStartOffset,
      tagRange.openingTagEndOffset,
    );
    const extracted = extractStylePropertyFromOpeningTag(openingTagText);

    if (extracted === null) {
      continue;
    }

    const targetPropertyName = Object.keys(tagDefinition.attributes!)[0];

    if (extracted.propertyName === targetPropertyName) {
      matchingRanges.push(tagRange);
    }
  }

  return matchingRanges;
}

/**
 * Finds a matching tag range whose entire span (including delimiters) falls within
 * the selection. Used for delimiter-inclusive selections like selecting `<u>text</u>`.
 * Returns the outermost such tag (largest span) for consistent unwrapping.
 */
function findDelimiterInclusiveMatch(
  allTagRanges: HtmlTagRange[],
  sourceText: string,
  selectionStartOffset: number,
  selectionEndOffset: number,
  tagDefinition: TagDefinition,
): HtmlTagRange | null {
  const matchingRanges = filterMatchingTagRanges(
    allTagRanges,
    sourceText,
    tagDefinition,
    (tagRange) => tagSpanIsWithinSelection(tagRange, selectionStartOffset, selectionEndOffset),
  );

  if (matchingRanges.length === 0) {
    return null;
  }

  // Return the outermost match (largest full span)
  let outermost = matchingRanges[0];

  for (let rangeIndex = 1; rangeIndex < matchingRanges.length; rangeIndex++) {
    const candidate = matchingRanges[rangeIndex];
    const candidateFullSpan =
      candidate.closingTagEndOffset - candidate.openingTagStartOffset;
    const outermostFullSpan =
      outermost.closingTagEndOffset - outermost.openingTagStartOffset;

    if (candidateFullSpan > outermostFullSpan) {
      outermost = candidate;
    }
  }

  return outermost;
}

/**
 * Finds the innermost tag range that encloses the selection and matches the tag definition.
 * For span tags with attributes, also checks that the CSS property matches.
 */
function findEnclosingMatchingTag(
  allTagRanges: HtmlTagRange[],
  sourceText: string,
  selectionStartOffset: number,
  selectionEndOffset: number,
  tagDefinition: TagDefinition,
): HtmlTagRange | null {
  const matchingRanges = filterMatchingTagRanges(
    allTagRanges,
    sourceText,
    tagDefinition,
    (tagRange) => tagEnclosesSelection(tagRange, selectionStartOffset, selectionEndOffset),
  );

  if (matchingRanges.length === 0) {
    return null;
  }

  // Return the innermost match (smallest content span)
  let innermost = matchingRanges[0];

  for (let rangeIndex = 1; rangeIndex < matchingRanges.length; rangeIndex++) {
    const candidate = matchingRanges[rangeIndex];
    const candidateContentWidth =
      candidate.closingTagStartOffset - candidate.openingTagEndOffset;
    const innermostContentWidth =
      innermost.closingTagStartOffset - innermost.openingTagEndOffset;

    if (candidateContentWidth < innermostContentWidth) {
      innermost = candidate;
    }
  }

  return innermost;
}

/**
 * Filters tag ranges by a geometry predicate, returning matches sorted inner-to-outer.
 * Shared by findAllEnclosingTags and findAllTagsWithinSelection.
 */
function filterTagRangesByGeometry(
  allTagRanges: HtmlTagRange[],
  geometryPredicate: (tagRange: HtmlTagRange) => boolean,
): HtmlTagRange[] {
  const matchingRanges: HtmlTagRange[] = [];

  for (let rangeIndex = 0; rangeIndex < allTagRanges.length; rangeIndex++) {
    const tagRange = allTagRanges[rangeIndex];

    if (geometryPredicate(tagRange)) {
      matchingRanges.push(tagRange);
    }
  }

  matchingRanges.sort(compareByContentWidth);
  return matchingRanges;
}

/**
 * Finds all tag ranges that enclose the selection (both HTML and MD).
 * Returns them in inner-to-outer order (smallest content range first).
 */
function findAllEnclosingTags(
  allTagRanges: HtmlTagRange[],
  selectionStartOffset: number,
  selectionEndOffset: number,
): HtmlTagRange[] {
  return filterTagRangesByGeometry(allTagRanges, (tagRange) =>
    tagEnclosesSelection(tagRange, selectionStartOffset, selectionEndOffset),
  );
}

/**
 * Finds all tag ranges whose full span (opening start to closing end) falls within the selection.
 * Used for delimiter-inclusive selections (e.g., Ctrl+A on `<u><b>text</b></u>`).
 * Returns results inner-to-outer (smallest content range first).
 */
function findAllTagsWithinSelection(
  allTagRanges: HtmlTagRange[],
  selectionStartOffset: number,
  selectionEndOffset: number,
): HtmlTagRange[] {
  return filterTagRangesByGeometry(allTagRanges, (tagRange) =>
    tagSpanIsWithinSelection(tagRange, selectionStartOffset, selectionEndOffset),
  );
}

/**
 * Sorts replacements by fromOffset descending (last-to-first) for safe sequential application.
 */
function sortReplacementsLastToFirst(replacements: TextReplacement[]): TextReplacement[] {
  return [...replacements].sort(
    (replacementA, replacementB) => replacementB.fromOffset - replacementA.fromOffset,
  );
}

/**
 * Removes duplicate replacements that share the same fromOffset and toOffset.
 * Keeps the first occurrence (which is the one from the innermost tag due to sort order).
 * Guards against malformed markup like `<b><b>text</b></b>` producing overlapping deletions.
 */
function deduplicateReplacements(replacements: TextReplacement[]): TextReplacement[] {
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
 * The reverse (HTML → MD) is intentionally not done because HTML tags are always valid
 * in markdown files, but markdown delimiters break in HTML-heavy contexts.
 */
function resolveTagForDomain(
  tagDefinition: TagDefinition,
  detectedDomain: FormattingDomain,
): TagDefinition {
  if (detectedDomain === 'html' && tagDefinition.domain === 'markdown') {
    const htmlEquivalent = MARKDOWN_TO_HTML_TAG_MAP.get(tagDefinition.tagName);

    if (htmlEquivalent) {
      return htmlEquivalent;
    }
  }

  return tagDefinition;
}

// ============================================================
// Domain Conversion: MD tokens to HTML
// ============================================================

/**
 * When adding an HTML tag to content in a markdown domain that has markdown tokens,
 * converts the enclosing MD tags to their HTML equivalents and wraps with the target tag.
 * Returns a single replacement that replaces the full enclosing MD region.
 */
function buildDomainConversionReplacements(
  sourceText: string,
  selectionStartOffset: number,
  selectionEndOffset: number,
  tagDefinition: TagDefinition,
  allTagRanges: HtmlTagRange[],
): TextReplacement[] {
  // Find enclosing MD tags that we need to convert
  const enclosingMarkdownRanges: HtmlTagRange[] = [];

  for (let rangeIndex = 0; rangeIndex < allTagRanges.length; rangeIndex++) {
    const tagRange = allTagRanges[rangeIndex];

    if (!tagEnclosesSelection(tagRange, selectionStartOffset, selectionEndOffset)) {
      continue;
    }

    // Check if this is a markdown tag by looking up in the conversion map
    if (MARKDOWN_TO_HTML_TAG_MAP.has(tagRange.tagName)) {
      enclosingMarkdownRanges.push(tagRange);
    }
  }

  if (enclosingMarkdownRanges.length === 0) {
    // No MD tags to convert — just wrap the selection directly
    return wrapTextWithTag(selectionStartOffset, selectionEndOffset, tagDefinition);
  }

  // Find the outermost MD tag range to determine the full region to replace
  let outermostRange = enclosingMarkdownRanges[0];

  for (let rangeIndex = 1; rangeIndex < enclosingMarkdownRanges.length; rangeIndex++) {
    const candidate = enclosingMarkdownRanges[rangeIndex];

    if (candidate.openingTagStartOffset < outermostRange.openingTagStartOffset) {
      outermostRange = candidate;
    }
  }

  // Extract the text from outermost opening to outermost closing (inclusive of delimiters)
  const regionStart = outermostRange.openingTagStartOffset;
  const regionEnd = outermostRange.closingTagEndOffset;
  const regionText = sourceText.slice(regionStart, regionEnd);

  // Convert all MD tokens in the region to HTML
  const convertedText = convertMarkdownTokensToHtml(regionText);

  // Wrap the converted text with the target HTML tag
  const wrappedText = tagDefinition.openingMarkup + convertedText + tagDefinition.closingMarkup;

  return [{
    fromOffset: regionStart,
    toOffset: regionEnd,
    replacementText: wrappedText,
  }];
}

// ============================================================
// Shared Wrap Logic
// ============================================================

/**
 * Produces wrap replacements for adding a tag, handling domain conversion,
 * protected ranges, and standard wrapping. Shared by toggleTag and addTag.
 */
function buildWrapReplacements(
  sourceText: string,
  selectionStartOffset: number,
  selectionEndOffset: number,
  tagDefinition: TagDefinition,
  effectiveTag: TagDefinition,
  domainResult: { domain: FormattingDomain; hasMarkdownTokens: boolean },
  structureContext: { protectedRanges: { startOffset: number; endOffset: number; tokenType: string }[] },
  allTagRanges: HtmlTagRange[] | null,
): StylingResult {
  // Domain conversion: adding HTML tag in MD domain with MD tokens present
  if (
    domainResult.domain === 'markdown' &&
    tagDefinition.domain === 'html' &&
    domainResult.hasMarkdownTokens
  ) {
    const tagRanges = allTagRanges ?? buildTagRanges(sourceText);
    const replacements = buildDomainConversionReplacements(
      sourceText,
      selectionStartOffset,
      selectionEndOffset,
      tagDefinition,
      tagRanges,
    );

    return { replacements: sortReplacementsLastToFirst(replacements), isNoOp: false };
  }

  // If structure has protected ranges, split formatting around them
  if (structureContext.protectedRanges.length > 0) {
    const replacements = splitFormattingAroundProtectedRanges(
      selectionStartOffset,
      selectionEndOffset,
      structureContext.protectedRanges,
      effectiveTag,
    );

    return { replacements, isNoOp: false };
  }

  // Standard wrap
  const replacements = wrapTextWithTag(
    selectionStartOffset,
    selectionEndOffset,
    effectiveTag,
  );

  return { replacements, isNoOp: false };
}

// ============================================================
// Exported Functions
// ============================================================

/**
 * Toggles a formatting tag on or off for the given selection.
 *
 * If the tag is already present enclosing the selection, removes it.
 * If the tag is absent, adds it (handling domain conversion and protected ranges).
 */
export function toggleTag(
  context: StylingContext,
  tagDefinition: TagDefinition,
): StylingResult {
  const { sourceText, selectionStartOffset, selectionEndOffset } = context;

  // Step 1: Detect structure context
  const structureContext = detectStructureContext(
    sourceText,
    selectionStartOffset,
    selectionEndOffset,
  );

  // Step 2: If fully inert, no-op
  if (structureContext.isFullyInert) {
    return { replacements: [], isNoOp: true };
  }

  // Step 3: Single-line processing — use full selection range

  // Step 4: Detect formatting domain
  const domainResult = detectFormattingDomain(
    sourceText,
    selectionStartOffset,
    selectionEndOffset,
  );

  // Step 5: Get all tag ranges
  const allTagRanges = buildTagRanges(sourceText);

  // Step 6: Check if the target tag is already present
  const matchingRange = findEnclosingMatchingTag(
    allTagRanges,
    sourceText,
    selectionStartOffset,
    selectionEndOffset,
    tagDefinition,
  );

  // Step 7: If present, remove it
  if (matchingRange !== null) {
    const replacements = unwrapTag(matchingRange);
    return { replacements, isNoOp: false };
  }

  // Step 7b: Delimiter-inclusive check — selection includes the tag delimiters themselves
  // (e.g., user selected `<u>text</u>` including the `<u>` and `</u>` markers)
  const delimiterInclusiveMatch = findDelimiterInclusiveMatch(
    allTagRanges,
    sourceText,
    selectionStartOffset,
    selectionEndOffset,
    tagDefinition,
  );

  if (delimiterInclusiveMatch !== null) {
    const replacements = unwrapTag(delimiterInclusiveMatch);
    return { replacements, isNoOp: false };
  }

  // Step 8: Tag is absent — add it
  const effectiveTag = resolveTagForDomain(tagDefinition, domainResult.domain);

  return buildWrapReplacements(
    sourceText,
    selectionStartOffset,
    selectionEndOffset,
    tagDefinition,
    effectiveTag,
    domainResult,
    structureContext,
    allTagRanges,
  );
}

/**
 * Adds a formatting tag to the selection (never removes).
 * For spans with the same CSS property already present, replaces the attribute value
 * instead of double-wrapping.
 */
export function addTag(
  context: StylingContext,
  tagDefinition: TagDefinition,
): StylingResult {
  const { sourceText, selectionStartOffset, selectionEndOffset } = context;

  // Detect structure context
  const structureContext = detectStructureContext(
    sourceText,
    selectionStartOffset,
    selectionEndOffset,
  );

  if (structureContext.isFullyInert) {
    return { replacements: [], isNoOp: true };
  }

  // Detect formatting domain
  const domainResult = detectFormattingDomain(
    sourceText,
    selectionStartOffset,
    selectionEndOffset,
  );

  const effectiveTag = resolveTagForDomain(tagDefinition, domainResult.domain);

  // For span tags with attributes, check if a span with the same CSS property exists
  const isSpanWithAttributes =
    effectiveTag.tagName === 'span' && effectiveTag.attributes !== undefined;

  if (isSpanWithAttributes) {
    const allTagRanges = buildTagRanges(sourceText);
    const matchingRange = findEnclosingMatchingTag(
      allTagRanges,
      sourceText,
      selectionStartOffset,
      selectionEndOffset,
      effectiveTag,
    );

    if (matchingRange !== null) {
      // Replace the existing attribute value instead of double-wrapping
      const targetPropertyName = Object.keys(effectiveTag.attributes!)[0];
      const targetPropertyValue = effectiveTag.attributes![targetPropertyName];

      const replacement = replaceOpeningTagAttribute(
        sourceText,
        matchingRange,
        targetPropertyName,
        targetPropertyValue,
      );

      return { replacements: [replacement], isNoOp: false };
    }
  }

  // Wrap with the tag (handles domain conversion, protected ranges, standard wrap)
  return buildWrapReplacements(
    sourceText,
    selectionStartOffset,
    selectionEndOffset,
    tagDefinition,
    effectiveTag,
    domainResult,
    structureContext,
    null,
  );
}

/**
 * Removes a specific formatting tag from around the selection.
 * Returns isNoOp if the tag is not found enclosing the selection.
 */
export function removeTag(
  context: StylingContext,
  tagDefinition: TagDefinition,
): StylingResult {
  const { sourceText, selectionStartOffset, selectionEndOffset } = context;

  const allTagRanges = buildTagRanges(sourceText);

  const matchingRange = findEnclosingMatchingTag(
    allTagRanges,
    sourceText,
    selectionStartOffset,
    selectionEndOffset,
    tagDefinition,
  );

  if (matchingRange === null) {
    // Delimiter-inclusive fallback: selection may include the tag delimiters
    const delimiterInclusiveMatch = findDelimiterInclusiveMatch(
      allTagRanges,
      sourceText,
      selectionStartOffset,
      selectionEndOffset,
      tagDefinition,
    );

    if (delimiterInclusiveMatch === null) {
      return { replacements: [], isNoOp: true };
    }

    const replacements = unwrapTag(delimiterInclusiveMatch);
    return { replacements, isNoOp: false };
  }

  const replacements = unwrapTag(matchingRange);
  return { replacements, isNoOp: false };
}

/**
 * Removes all formatting tags (both HTML and MD) enclosing the selection.
 * Combines both enclosing tags and delimiter-inclusive tags (for Ctrl+A selections).
 * Processes tags inner-to-outer. All replacements sorted by fromOffset descending.
 */
export function removeAllTags(
  context: StylingContext,
  // TODO: implement preserveLinePrefix option — currently accepted but unused
  options?: RemoveAllTagsOptions,
): StylingResult {
  const { sourceText, selectionStartOffset, selectionEndOffset } = context;

  const structureContext = detectStructureContext(
    sourceText,
    selectionStartOffset,
    selectionEndOffset,
  );

  if (structureContext.isFullyInert) {
    return { replacements: [], isNoOp: true };
  }

  const allTagRanges = buildTagRanges(sourceText);

  // Combine enclosing tags and delimiter-inclusive tags to handle both selection geometries
  const enclosingTags = findAllEnclosingTags(
    allTagRanges,
    selectionStartOffset,
    selectionEndOffset,
  );

  const delimiterInclusiveTags = findAllTagsWithinSelection(
    allTagRanges,
    selectionStartOffset,
    selectionEndOffset,
  );

  // Deduplicate by opening tag start offset (same tag can't appear in both sets,
  // but guard against future edge cases)
  const seenOffsets = new Set<number>();
  const tagsToRemove: HtmlTagRange[] = [];

  for (const tagRange of [...enclosingTags, ...delimiterInclusiveTags]) {
    if (!seenOffsets.has(tagRange.openingTagStartOffset)) {
      seenOffsets.add(tagRange.openingTagStartOffset);
      tagsToRemove.push(tagRange);
    }
  }

  if (tagsToRemove.length === 0) {
    return { replacements: [], isNoOp: true };
  }

  // Sort inner-to-outer by content width for consistent unwrap ordering
  tagsToRemove.sort(compareByContentWidth);

  // Collect all unwrap replacements from inner tags outward
  const allReplacements: TextReplacement[] = [];

  for (let tagIndex = 0; tagIndex < tagsToRemove.length; tagIndex++) {
    const tagRange = tagsToRemove[tagIndex];
    const unwrapReplacements = unwrapTag(tagRange);
    allReplacements.push(...unwrapReplacements);
  }

  // Sort all replacements by fromOffset descending for safe sequential application
  const sortedReplacements = sortReplacementsLastToFirst(allReplacements);

  // Deduplicate overlapping replacements at the same offset range
  // (can occur with malformed markup like <b><b>text</b></b>)
  const deduplicatedReplacements = deduplicateReplacements(sortedReplacements);

  return { replacements: deduplicatedReplacements, isNoOp: false };
}

/**
 * Copies the formatting context at the selection — returns the enclosing tag definitions
 * and the detected domain for later application with addTag.
 */
export function copyFormat(
  sourceText: string,
  selectionStartOffset: number,
  selectionEndOffset: number,
): CopiedFormat {
  const allTagRanges = buildTagRanges(sourceText);

  const enclosingTags = findAllEnclosingTags(
    allTagRanges,
    selectionStartOffset,
    selectionEndOffset,
  );

  const domainResult = detectFormattingDomain(
    sourceText,
    selectionStartOffset,
    selectionEndOffset,
  );

  // Convert enclosing tag ranges into TagDefinitions
  const tagDefinitions: TagDefinition[] = [];

  for (let tagIndex = 0; tagIndex < enclosingTags.length; tagIndex++) {
    const tagRange = enclosingTags[tagIndex];
    const tagDefinition = tagRangeToTagDefinition(tagRange, sourceText);

    if (tagDefinition !== null) {
      tagDefinitions.push(tagDefinition);
    }
  }

  return {
    tagDefinitions,
    domain: domainResult.domain,
  };
}

// ============================================================
// Tag Range to Tag Definition Conversion
// ============================================================

/**
 * Known HTML tag name to TagDefinition mappings for standard tags.
 * Used by copyFormat to reconstruct TagDefinition from discovered tag ranges.
 */
const HTML_TAG_NAME_DEFINITIONS: Map<string, TagDefinition> = new Map([
  ['u', UNDERLINE_TAG],
  ['sub', SUBSCRIPT_TAG],
  ['sup', SUPERSCRIPT_TAG],
  ['b', BOLD_HTML_TAG],
  ['i', ITALIC_HTML_TAG],
  ['s', STRIKETHROUGH_HTML_TAG],
  ['mark', HIGHLIGHT_HTML_TAG],
]);

/**
 * Known MD tag name to TagDefinition mappings.
 */
const MARKDOWN_TAG_NAME_DEFINITIONS: Map<string, TagDefinition> = new Map([
  ['bold', BOLD_MD_TAG],
  ['italic', ITALIC_MD_TAG],
  ['strikethrough', STRIKETHROUGH_MD_TAG],
  ['highlight', HIGHLIGHT_MD_TAG],
]);

/**
 * Converts a tag range to a TagDefinition.
 * For span tags, extracts the CSS property from the opening tag text.
 * For known HTML/MD tags, returns the predefined TagDefinition.
 */
function tagRangeToTagDefinition(
  tagRange: HtmlTagRange,
  sourceText: string,
): TagDefinition | null {
  // Check HTML tag definitions first
  const htmlDefinition = HTML_TAG_NAME_DEFINITIONS.get(tagRange.tagName);

  if (htmlDefinition) {
    return htmlDefinition;
  }

  // Check MD tag definitions
  const markdownDefinition = MARKDOWN_TAG_NAME_DEFINITIONS.get(tagRange.tagName);

  if (markdownDefinition) {
    return markdownDefinition;
  }

  // For span tags, reconstruct from the opening tag's style attribute
  if (tagRange.tagName === 'span') {
    const openingTagText = sourceText.slice(
      tagRange.openingTagStartOffset,
      tagRange.openingTagEndOffset,
    );
    const extracted = extractStylePropertyFromOpeningTag(openingTagText);

    if (extracted !== null) {
      return buildSpanTagDefinition(extracted.propertyName, extracted.propertyValue);
    }
  }

  return null;
}
