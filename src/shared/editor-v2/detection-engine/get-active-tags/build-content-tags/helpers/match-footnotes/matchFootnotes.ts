import { ESpecialTagType } from '../../../../../interfaces';
import type { TMatchRecord } from '../../../find-all-matches/interfaces';

// Extracts the footnote label using the match's start/end positions to slice from content.
const extractLabel = (content: string, match: TMatchRecord): string | null => {
  const position = match.open ?? match.close;
  if (!position) return null;

  const line = content.split('\n')[position.start.line];
  const rawText = line.slice(position.start.ch, position.end.ch);

  return rawText.match(/\[\^([^\]]+)\]/)?.[1] ?? null;
};

export const matchFootnotes = (content: string, allMatches: TMatchRecord[]): TMatchRecord[] => {
  const result: TMatchRecord[] = [];
  const footnoteOpens = new Map<string, TMatchRecord>();

  for (const match of allMatches) {
    if (match.type !== ESpecialTagType.FOOTNOTE_REF) {
      result.push(match);
      continue;
    }

    const label = extractLabel(content, match);
    if (!label) {
      continue;
    }

    if (match.open) {
      // Only track the first open per label — duplicates are discarded.
      if (!footnoteOpens.has(label)) {
        footnoteOpens.set(label, match);
      }

      result.push(match);
    } else if (match.close) {
      const footnoteOpenMatch = footnoteOpens.get(label);
      if (footnoteOpenMatch) {
        footnoteOpenMatch.close = match.close;
      } else {
        result.push(match);
      }
    }
  }

  return result;
};
