import { ELineTagType, ESpecialTagType } from '../../../../interfaces';
import type { TTag } from '../../../../interfaces';
import type { TMatchRecord } from '../../interfaces';

export const convertMatchesToTags = (matches: TMatchRecord[]): TTag[] =>
  matches.map((match) => ({
    ...match,
    isProtected: (
      [...Object.values(ELineTagType), ...Object.values(ESpecialTagType)] as string[]
    ).includes(match.type),
  })) as TTag[];
