import { ESpecialTagType } from '../../interfaces';
import type { ISpecialTag } from '../../interfaces';
import { MEETING_FIELD_LINE_REGEX } from '../tag-regex/tagRegex';

export function detectMeetingTag(lines: string[]): ISpecialTag | null {
  if (lines.length < 3 || lines[0].trim() !== '---') return null;

  for (const [lineIndex, line] of lines.slice(1).entries()) {
    if (line.trim() === '---') {
      const closeLineNumber = lineIndex + 1;

      return {
        type: ESpecialTagType.MEETING_DETAILS,
        open: { start: { line: 0, ch: 0 }, end: { line: 0, ch: lines[0].trim().length } },
        close: {
          start: { line: closeLineNumber, ch: 0 },
          end: { line: closeLineNumber, ch: line.trim().length },
        },
        isHTML: false,
        isSpan: false,
        isProtected: true,
      };
    } else if (!MEETING_FIELD_LINE_REGEX.test(line.trim())) {
      return null;
    }
  }

  return null;
}
