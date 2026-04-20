export { ALL_TAGS } from './helpers/all-tags/AllTags';

import type { TagDefinition, TagOrSeparator } from './interfaces';
import { isTagSeparator, isTagGroupHeader } from './interfaces';
import { TagDropdownItem } from './tag-dropdown-item/TagDropdownItem';

/** Renders each item in the tag dropdown, handling separators, headers, and interactive tag entries. */
export function renderTagItems(
  allDisplayedTags: TagOrSeparator[],
  activeTagKeys: Set<string>,
  canRemoveTag: boolean,
  handleTagDropdownSelect: (tagDefinition: TagDefinition) => void
): JSX.Element[] {
  return allDisplayedTags.map((tagOrSeparator, index) => {
    if (isTagSeparator(tagOrSeparator))
      return <div key={index} className="onr-tags-dd-separator" />;
    if (isTagGroupHeader(tagOrSeparator))
      return (
        <div key={index} className="onr-tags-dd-group-header">
          {tagOrSeparator.groupLabel}
        </div>
      );

    const tagDefinition = tagOrSeparator;
    // "Remove Tag" disabled state depends on whether cursor is in an active callout
    const isEffectivelyDisabled =
      !!tagDefinition.isDisabled || (!!tagDefinition.isRemoveTag && !canRemoveTag);
    // Whether this tag is currently active at the cursor
    const isChecked =
      tagDefinition.calloutKey !== null &&
      tagDefinition.calloutKey !== undefined &&
      activeTagKeys.has(tagDefinition.calloutKey);

    return (
      <TagDropdownItem
        key={index}
        tagDefinition={tagDefinition}
        isDisabled={isEffectivelyDisabled}
        isChecked={isChecked}
        onSelect={handleTagDropdownSelect}
      />
    );
  });
}
