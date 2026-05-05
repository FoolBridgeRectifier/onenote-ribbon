import type { TMatchRecord } from '../find-all-matches/interfaces';

export type TMatchFilter = (content: string, matches: TMatchRecord[]) => TMatchRecord[];
