import type { TagContext, DetectedTag, ProtectedRange } from '../interfaces';
import { detectInertLines } from '../inert-zones/inertZones';
import { detectLinePrefix } from '../line-prefix-detection/linePrefixDetection';
import { scanProtectedTokensInLine } from '../protected-tokens/protectedTokens';
import { scanInlineTags, type InlineSkipRange } from '../inline-tag-scanner/inlineTagScanner';

/**
 * Walks every line of `content`, accumulating DetectedTag entries (line-prefix
 * tags + inline tags) and ProtectedRange entries. Inert zones are skipped.
 */
export function buildTagContextFromContent(content: string): TagContext {
  const lines = content.split('\n');
  const inertLines = detectInertLines(content);

  const allTags: DetectedTag[] = [];
  const allProtectedRanges: ProtectedRange[] = [];

  let lineStartOffset = 0;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];

    if (inertLines[lineIndex]) {
      lineStartOffset += line.length + 1;
      continue;
    }

    // Capture line-level prefix tag and the column where inline content starts.
    const prefix = detectLinePrefix(line, lineIndex);
    if (prefix.tag) allTags.push(prefix.tag);

    // Protected tokens scoped to the inline portion of the line.
    const protectedRangesOnLine = scanProtectedTokensInLine(line, lineStartOffset, prefix.contentStartCh);
    allProtectedRanges.push(...protectedRangesOnLine);

    // Skip-range coordinates are relative to the line itself for the inline scanner.
    const skipRanges: InlineSkipRange[] = protectedRangesOnLine.map((range) => ({
      startCh: range.startOffset - lineStartOffset,
      endCh:   range.endOffset   - lineStartOffset,
    }));

    const inlineTags = scanInlineTags(line, lineIndex, prefix.contentStartCh, skipRanges);
    allTags.push(...inlineTags);

    // Special-case: meeting-details opening line is also a global protected range.
    if (prefix.tag?.type === 'meetingDetails') {
      allProtectedRanges.push({
        startOffset: lineStartOffset,
        endOffset:   lineStartOffset + line.length,
        tokenType:   'meetingDetails',
      });
    }

    lineStartOffset += line.length + 1;
  }

  // Sort tags by open.start ascending; line-only tags (no open) sort last by line.
  allTags.sort(compareTagsByOpen);

  return { tags: allTags, protectedRanges: allProtectedRanges, content };
}

function compareTagsByOpen(left: DetectedTag, right: DetectedTag): number {
  if (!left.open && !right.open) return 0;
  if (!left.open) return 1;
  if (!right.open) return -1;
  if (left.open.start.line !== right.open.start.line) return left.open.start.line - right.open.start.line;
  return left.open.start.ch - right.open.start.ch;
}
