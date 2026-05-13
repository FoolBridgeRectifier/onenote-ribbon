import { EMdStyleTagType, ESpecialTagType } from '../../../../../interfaces';
import type { TMatchRecord } from '../../../interfaces';
import { filterTagsInMeetingNotes } from '../filterTagsInMeetingNotes';

const makeMeetingDetails = (startLine: number, startCh: number, endLine: number, endCh: number): TMatchRecord => ({
  type: ESpecialTagType.MEETING_DETAILS,
  isHTML: false,
  open: {
    start: { line: startLine, ch: startCh },
    end: { line: endLine, ch: endCh },
  },
});

const makeBold = (line: number, ch: number): TMatchRecord => ({
  type: EMdStyleTagType.BOLD,
  isHTML: false,
  open: { start: { line, ch }, end: { line, ch: ch + 2 } },
});

describe('filterTagsInMeetingNotes', () => {
  test('returns all records unchanged when there are no MEETING_DETAILS records', () => {
    const bold = makeBold(0, 0);
    const result = filterTagsInMeetingNotes('', [bold]);
    expect(result).toEqual([bold]);
  });

  test('removes MD tag whose position falls inside a MEETING_DETAILS block', () => {
    // Meeting block spans line 0 ch 0 → line 2 ch 3.
    const meeting = makeMeetingDetails(0, 0, 2, 3);
    const boldInside = makeBold(1, 0);

    const result = filterTagsInMeetingNotes('', [meeting, boldInside]);

    expect(result).toEqual([meeting]);
  });

  test('keeps MD tag whose position is outside the MEETING_DETAILS block', () => {
    const meeting = makeMeetingDetails(0, 0, 2, 3);
    const boldOutside = makeBold(3, 0);

    const result = filterTagsInMeetingNotes('', [meeting, boldOutside]);

    expect(result).toEqual([meeting, boldOutside]);
  });

  test('MEETING_DETAILS record without an open property is ignored as a range', () => {
    // A close-only MEETING_DETAILS record contributes no range.
    const meetingCloseOnly: TMatchRecord = {
      type: ESpecialTagType.MEETING_DETAILS,
      isHTML: false,
      close: { start: { line: 0, ch: 0 }, end: { line: 0, ch: 3 } },
    };
    const bold = makeBold(0, 5);

    const result = filterTagsInMeetingNotes('', [meetingCloseOnly, bold]);

    // Bold is not filtered because no valid range was created.
    expect(result).toEqual([meetingCloseOnly, bold]);
  });

  test('handles multiple separate MEETING_DETAILS blocks', () => {
    const meeting1 = makeMeetingDetails(0, 0, 2, 3);
    const boldBetween = makeBold(3, 0);
    const meeting2 = makeMeetingDetails(4, 0, 6, 3);
    const boldInside2 = makeBold(5, 0);

    const result = filterTagsInMeetingNotes('', [meeting1, boldBetween, meeting2, boldInside2]);

    expect(result).toEqual([meeting1, boldBetween, meeting2]);
  });

  test('returns empty array for empty input', () => {
    expect(filterTagsInMeetingNotes('', [])).toEqual([]);
  });
});
