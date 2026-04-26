import type { StylingContext, StylingResult } from '../../../interfaces';

/** Toggles the meeting-details block on the entire source text. */
export function processMeetingDetails(context: StylingContext): StylingResult {
  const blockPattern = /^>\s---\n[\s\S]*?\n>\s---\n?/;
  const match = blockPattern.exec(context.sourceText);
  if (match) {
    return {
      replacements: [{ fromOffset: 0, toOffset: match[0].length, replacementText: '' }],
      isNoOp: false,
    };
  }
  return {
    replacements: [
      { fromOffset: context.sourceText.length, toOffset: context.sourceText.length, replacementText: '\n> ---' },
      { fromOffset: 0, toOffset: 0, replacementText: '> ---\nDate:\nAttendees:\nAgenda:\n' },
    ],
    isNoOp: false,
  };
}
