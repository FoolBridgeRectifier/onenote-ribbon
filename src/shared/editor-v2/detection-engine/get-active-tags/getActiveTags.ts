import { buildContentTags } from './build-content-tags/buildContentTags';

export const getActiveTags = (content: string, _cursor: unknown) => {
  const tags = buildContentTags(content);
  console.warn(tags);
  return tags;
};
