import type { TABS } from './constants';

/** Union type of all valid tab names derived from the TABS constant. */
export type TabName = (typeof TABS)[number];
