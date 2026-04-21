/**
 * Describes how a tag transforms the current line in the editor.
 * Each variant maps to a distinct formatting strategy.
 */
export type TagAction =
  | { type: 'command'; commandId: string }
  | {
      type: 'callout';
      calloutType: string;
      /** Optional title text written after [!type] and used for cursor detection. */
      calloutTitle?: string;
    }
  | { type: 'task'; taskPrefix: string }
  | { type: 'highlight' };
