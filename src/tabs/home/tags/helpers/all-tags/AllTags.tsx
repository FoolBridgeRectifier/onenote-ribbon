import type { TagOrSeparator } from '../../interfaces';
import { CALLOUT_TAGS_A } from './callout-a/CalloutA';
import { CALLOUT_TAGS_B } from './callout-b/CalloutB';
import { CHECKBOX_TAGS } from './checkbox/Checkbox';

/** Complete ordered list of all tags shown in the OneNote-style tags dropdown. */
export const ALL_TAGS: TagOrSeparator[] = [...CALLOUT_TAGS_A, ...CALLOUT_TAGS_B, ...CHECKBOX_TAGS];
