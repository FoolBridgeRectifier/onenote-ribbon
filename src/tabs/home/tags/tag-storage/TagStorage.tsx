import type { CustomTag } from '../customize-modal/interfaces';
import type { TagDefinition } from '../interfaces';
import { STORAGE_KEY_CUSTOM_TAGS } from '../constants';

export function loadCustomTags(): CustomTag[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CUSTOM_TAGS);
    return stored ? (JSON.parse(stored) as CustomTag[]) : [];
  } catch {
    return [];
  }
}

export function saveCustomTags(tags: CustomTag[]): void {
  localStorage.setItem(STORAGE_KEY_CUSTOM_TAGS, JSON.stringify(tags));
}

// Dynamic background on a tiny icon — inline style is appropriate here since
// the color is a runtime value chosen by the user, not a static class.
export function buildCustomTagDefinition(customTag: CustomTag): TagDefinition {
  // Checkbox-type custom tags create a task line instead of a callout block
  const isCheckbox = customTag.calloutType === 'checkbox';

  return {
    label: customTag.name,
    icon: (
      <span
        className="onr-tag-custom-icon"
        style={{ backgroundColor: customTag.color }}
        aria-hidden="true"
      />
    ),
    swatchColor: customTag.color,
    action: isCheckbox
      ? { type: 'task', taskPrefix: `${customTag.name}:` }
      : {
          type: 'callout',
          calloutType: customTag.calloutType,
          calloutTitle: customTag.name,
        },
    calloutKey: isCheckbox ? `task-prefix:${customTag.name}:` : customTag.name,
  };
}
