import { buildContentTags } from '../build-content-tags/buildContentTags';
import type { TCursor } from '../../interfaces';

export const getActiveTags = (content: string, cursor: TCursor) => {
  const tags = buildContentTags(content);

  return tags;
};
