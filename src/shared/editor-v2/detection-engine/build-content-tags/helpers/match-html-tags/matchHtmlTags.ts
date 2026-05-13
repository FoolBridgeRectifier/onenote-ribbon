import { EHtmlStyleTagType, EMdStyleTagType } from '../../../../interfaces';
import type { TMatchRecord } from '../../interfaces';
import { invalidateTags } from '../../utils';

export const matchHtmlTags = (_content: string, allMatches: TMatchRecord[]): TMatchRecord[] => {
  const openHtmlTags: TMatchRecord[] = [];
  const result: TMatchRecord[] = [];

  for (const match of allMatches) {
    if (
      !(
        [
          ...Object.values(EHtmlStyleTagType),
          EMdStyleTagType.BOLD,
          EMdStyleTagType.ITALIC,
          EMdStyleTagType.STRIKETHROUGH,
        ].includes(match.type as EHtmlStyleTagType | EMdStyleTagType) && match.isHTML
      )
    ) {
      result.push(match);
      continue;
    }

    if (match.open) {
      openHtmlTags.push(match);
      result.push(match);
    } else {
      // HTML close: only pairs with the top of the stack (broken nesting breaks the document anyway).
      if (openHtmlTags.length) {
        openHtmlTags[openHtmlTags.length - 1].close = match.close;
        openHtmlTags.pop();
      }
    }
  }

  if (openHtmlTags.length > 0) {
    return invalidateTags(result, openHtmlTags[0]);
  }

  return result;
};
