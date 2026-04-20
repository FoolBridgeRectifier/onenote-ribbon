import { TodoTagIcon } from '../../../../../../assets/icons';
import type { TagOrSeparator } from '../../../interfaces';
import {
  ACTIVE_TAG_KEY_TASK,
  EDITOR_COMMAND_TOGGLE_CHECKLIST,
  TAG_FILL_DARK,
  TAG_FILL_MEDIUM_GRAY,
  TAG_FILL_TODO_BLUE,
  TAG_SWATCH_TODO,
  TAG_SWATCH_NEUTRAL,
} from '../../../constants';
import { TagIconText } from '../../tag-icons/basic-icons/BasicIcons';
import { ChecklistTagIcon, EmailTagIcon } from '../../tag-icons/special-icons/SpecialIcons';

/** Checkbox group, separator, and footer items (Customize Tags, Remove Tag). */
export const CHECKBOX_TAGS: TagOrSeparator[] = [
  { isGroupHeader: true as const, groupLabel: 'Checkbox' },

  {
    label: 'To Do',
    icon: <TodoTagIcon className="onr-tag-dd-icon-svg" />,
    swatchColor: TAG_SWATCH_TODO,
    action: { type: 'command', commandId: EDITOR_COMMAND_TOGGLE_CHECKLIST },
    calloutKey: ACTIVE_TAG_KEY_TASK,
  },
  {
    label: 'Discuss with <Person>',
    icon: <ChecklistTagIcon fill={TAG_FILL_MEDIUM_GRAY} />,
    swatchColor: TAG_SWATCH_NEUTRAL,
    action: { type: 'task', taskPrefix: 'Discuss:' },
    calloutKey: 'task-prefix:Discuss:',
  },
  {
    label: 'Discuss with <Person>',
    icon: <ChecklistTagIcon fill={TAG_FILL_DARK} />,
    swatchColor: TAG_SWATCH_NEUTRAL,
    action: { type: 'task', taskPrefix: 'Discuss:' },
    calloutKey: 'task-prefix:Discuss:',
  },
  {
    label: 'Discuss with manager',
    icon: <ChecklistTagIcon fill={TAG_FILL_DARK} />,
    swatchColor: TAG_SWATCH_NEUTRAL,
    action: { type: 'task', taskPrefix: 'Discuss with manager:' },
    calloutKey: 'task-prefix:Discuss with manager:',
  },
  {
    label: 'Send in email',
    icon: <EmailTagIcon />,
    swatchColor: TAG_SWATCH_NEUTRAL,
    action: { type: 'task', taskPrefix: 'Send in email:' },
    calloutKey: 'task-prefix:Send in email:',
  },
  {
    label: 'Schedule meeting',
    icon: <ChecklistTagIcon fill={TAG_FILL_TODO_BLUE} />,
    swatchColor: TAG_SWATCH_NEUTRAL,
    action: { type: 'task', taskPrefix: 'Schedule meeting:' },
    calloutKey: 'task-prefix:Schedule meeting:',
  },
  {
    label: 'Call back',
    icon: <ChecklistTagIcon fill={TAG_FILL_TODO_BLUE} />,
    swatchColor: TAG_SWATCH_NEUTRAL,
    action: { type: 'task', taskPrefix: 'Call back:' },
    calloutKey: 'task-prefix:Call back:',
  },
  { isSeparator: true },

  {
    label: 'Customize Tags…',
    icon: <TagIconText fill={TAG_FILL_MEDIUM_GRAY} symbol="⚙" />,
    swatchColor: 'transparent',
    action: { type: 'command', commandId: '' },
    isCustomizeTags: true,
  },
  {
    label: 'Remove Tag',
    icon: <TagIconText fill={TAG_FILL_MEDIUM_GRAY} symbol="✕" />,
    swatchColor: 'transparent',
    action: { type: 'command', commandId: '' },
    isRemoveTag: true,
  },
];
