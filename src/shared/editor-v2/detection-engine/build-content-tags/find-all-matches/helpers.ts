import type { TMatchRecord } from '../interfaces';

/** Sorts two TMatchRecords ascending by document position. */
export const compareByPosition = (recordA: TMatchRecord, recordB: TMatchRecord) => {
  const positionA = recordA.open ?? recordA.close!;
  const positionB = recordB.open ?? recordB.close!;

  const lineDifference = positionA.start.line - positionB.start.line;
  if (lineDifference !== 0) {
    return lineDifference;
  }
  return positionA.start.ch - positionB.start.ch;
};

/** Runs a regex globally against content and returns all non-empty match positions. */
export const scanPattern = (content: string, pattern: RegExp) =>
  Array.from(content.matchAll(pattern))
    .filter((match) => match[0].length > 0)
    .map((match) => ({ index: match.index!, length: match[0].length }));
