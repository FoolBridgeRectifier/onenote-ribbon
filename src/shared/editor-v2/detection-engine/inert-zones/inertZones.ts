import {
  FENCED_CODE_BLOCK_OPENING_PATTERN,
  TAB_INDENTED_LINE_PATTERN,
  MATH_BLOCK_DELIMITER_PATTERN,
} from '../constants';

/**
 * Returns a boolean[] indexed by line number — true means that line lives
 * inside an inert zone (fenced code, math block, or tab-indented).
 *
 * Fenced code and math blocks span from their opening delimiter line to the
 * matching closing delimiter line; the delimiter lines themselves are inert.
 * Tab-indented lines are inert one line at a time.
 */
export function detectInertLines(content: string): boolean[] {
  const lines = content.split('\n');
  const inert: boolean[] = new Array(lines.length).fill(false);

  let openBlockType: 'fenced' | 'math' | null = null;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];

    if (openBlockType === 'fenced') {
      inert[lineIndex] = true;
      // Closing ``` ends the fenced block (the closing line is also inert)
      if (FENCED_CODE_BLOCK_OPENING_PATTERN.test(line)) openBlockType = null;
      continue;
    }

    if (openBlockType === 'math') {
      inert[lineIndex] = true;
      if (MATH_BLOCK_DELIMITER_PATTERN.test(line)) openBlockType = null;
      continue;
    }

    if (FENCED_CODE_BLOCK_OPENING_PATTERN.test(line)) {
      inert[lineIndex] = true;
      openBlockType = 'fenced';
      continue;
    }

    if (MATH_BLOCK_DELIMITER_PATTERN.test(line)) {
      inert[lineIndex] = true;
      openBlockType = 'math';
      continue;
    }

    if (TAB_INDENTED_LINE_PATTERN.test(line)) {
      inert[lineIndex] = true;
    }
  }

  return inert;
}
