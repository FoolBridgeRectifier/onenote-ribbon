import type { TCursor, TTag } from '../../interfaces';
import { detectMeetingTag } from '../detect-meeting-tag/detectMeetingTag';

export function getActiveTags(content: string, cursor: TCursor): TTag[] {
  const lines = content.split('\n');
  const tags = [detectMeetingTag(lines)].filter(Boolean);

  console.warn('[DetectionEngine] getActiveTags', { cursor }, tags);
  return tags;
}
