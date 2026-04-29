import type { TCursor } from '../../interfaces';
import { detectMeetingTag } from '../detect-meeting-tag/detectMeetingTag';

export function getActiveTags(content: string, cursor: TCursor) {
  const lines = content.split('\n');
  const tags = [detectMeetingTag(lines)].filter(Boolean);

  console.warn('[DetectionEngine] getActiveTags', { cursor }, tags);
}
