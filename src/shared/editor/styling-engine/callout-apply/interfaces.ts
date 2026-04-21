/**
 * Describes how a callout tag transforms the current editor line.
 */
export type TagAction =
  | { type: 'command'; commandId: string }
  | {
      type: 'callout';
      calloutType: string;
      /** Optional title text written after [!type] and used for cursor detection. */
      calloutTitle?: string;
    }
  | { type: 'task'; taskPrefix: string };

/** Match result for a #todo tag at cursor position within a line. */
export interface TodoTagMatch {
  startIndex: number;
  endIndex: number;
}
