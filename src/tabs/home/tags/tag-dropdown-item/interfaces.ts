import type { TagDefinition } from '../interfaces';

export interface TagDropdownItemProps {
  tagDefinition: TagDefinition;
  isDisabled: boolean;
  isChecked: boolean;
  onSelect: (tagDefinition: TagDefinition) => void;
}
