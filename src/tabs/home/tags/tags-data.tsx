/**
 * All tag definitions for the OneNote-style tags dropdown.
 * Each entry defines the icon, label, swatch color, and editor action.
 * Separators divide the list into visual groups.
 */
import {
  TodoTagIcon,
  ImportantTagIcon,
  QuestionTagIcon,
} from '../../../assets/icons';

import type { TagOrSeparator } from './interfaces';
import {
  ACTIVE_TAG_KEY_TASK,
  EDITOR_COMMAND_TOGGLE_CHECKLIST,
  TAG_FILL_DARK,
  TAG_FILL_DEFINITION_GREEN,
  TAG_FILL_MEDIUM_GRAY,
  TAG_FILL_CRITICAL_RED,
  TAG_FILL_PROJECT_A_CORAL,
  TAG_FILL_PROJECT_B_GOLD,
  TAG_FILL_TODO_BLUE,
  TAG_FILL_PRIORITY_1_RED,
  TAG_FILL_PRIORITY_2_BLUE,
  TAG_SWATCH_TODO,
  TAG_SWATCH_IMPORTANT,
  TAG_SWATCH_QUESTION,
  TAG_SWATCH_REMEMBER,
  TAG_SWATCH_DEFINITION,
  TAG_SWATCH_NEUTRAL,
  TAG_SWATCH_CRITICAL,
  TAG_SWATCH_PROJECT_A,
  TAG_SWATCH_PROJECT_B,
  TAG_SWATCH_PRIORITY_1,
  TAG_SWATCH_PRIORITY_2,
} from './constants';

// ── Shared icon helpers ───────────────────────────────────────────────────────

/** Renders a colored 16×16 rounded square with a white text symbol centred inside. */
function TagIconText({ fill, symbol }: { fill: string; symbol: string }) {
  return (
    <svg viewBox="0 0 16 16" className="onr-tag-dd-icon-svg">
      <rect x="1" y="1" width="14" height="14" rx="2" fill={fill} />
      <text
        x="8"
        y="12"
        textAnchor="middle"
        fill="white"
        fontSize="10"
        fontWeight="bold"
        fontFamily="system-ui,sans-serif"
      >
        {symbol}
      </text>
    </svg>
  );
}

/** Person silhouette for Contact / Discuss tags. */
function PersonTagIcon({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 16 16" className="onr-tag-dd-icon-svg">
      <rect x="1" y="1" width="14" height="14" rx="2" fill={fill} />
      {/* Head */}
      <circle cx="8" cy="6" r="2.5" fill="white" />
      {/* Shoulders arc */}
      <path d="M3,14 Q3,10 8,10 Q13,10 13,14" fill="white" />
    </svg>
  );
}

/** House shape for Address tag. */
function AddressTagIcon() {
  return (
    <svg viewBox="0 0 16 16" className="onr-tag-dd-icon-svg">
      <rect
        x="1"
        y="1"
        width="14"
        height="14"
        rx="2"
        fill={TAG_FILL_MEDIUM_GRAY}
      />
      {/* Roof */}
      <polygon points="8,3 13,8 3,8" fill="white" />
      {/* Body */}
      <rect x="4.5" y="8" width="7" height="5" fill="white" />
      {/* Door */}
      <rect x="6.5" y="10" width="3" height="3" fill={TAG_FILL_MEDIUM_GRAY} />
    </svg>
  );
}

/** Phone handset for Phone number tag. */
function PhoneTagIcon() {
  return (
    <svg viewBox="0 0 16 16" className="onr-tag-dd-icon-svg">
      <rect
        x="1"
        y="1"
        width="14"
        height="14"
        rx="2"
        fill={TAG_FILL_MEDIUM_GRAY}
      />
      {/* Handset curve — simplified as a bold stroke path */}
      <path
        d="M4,4 Q4,2 6,3 L7,5 Q7.5,6 6.5,7 Q9,10 10,9.5 L12,10.5 Q13,11.5 11,12 Q7,13 4,4"
        fill="white"
        stroke="none"
      />
    </svg>
  );
}

/** Globe for Web site tag. */
function GlobeTagIcon() {
  return (
    <svg viewBox="0 0 16 16" className="onr-tag-dd-icon-svg">
      <rect
        x="1"
        y="1"
        width="14"
        height="14"
        rx="2"
        fill={TAG_FILL_MEDIUM_GRAY}
      />
      {/* Globe circle outline */}
      <circle
        cx="8"
        cy="8"
        r="4.5"
        fill="none"
        stroke="white"
        strokeWidth="1"
      />
      {/* Horizontal equator */}
      <line x1="3.5" y1="8" x2="12.5" y2="8" stroke="white" strokeWidth="1" />
      {/* Vertical axis */}
      <line x1="8" y1="3.5" x2="8" y2="12.5" stroke="white" strokeWidth="1" />
    </svg>
  );
}

/** Lightbulb for Idea tag. */
function IdeaTagIcon() {
  return (
    <svg viewBox="0 0 16 16" className="onr-tag-dd-icon-svg">
      <rect
        x="1"
        y="1"
        width="14"
        height="14"
        rx="2"
        fill={TAG_FILL_MEDIUM_GRAY}
      />
      {/* Bulb top */}
      <path
        d="M5.5,7 Q5,3 8,3 Q11,3 10.5,7 Q10.5,9 9,10 L9,11 L7,11 L7,10 Q5.5,9 5.5,7"
        fill="white"
      />
      {/* Base lines */}
      <rect x="6.5" y="11" width="3" height="1" fill="white" />
      <rect x="6.5" y="12.5" width="3" height="1" fill="white" />
    </svg>
  );
}

/** Lock for Password tag. */
function LockTagIcon() {
  return (
    <svg viewBox="0 0 16 16" className="onr-tag-dd-icon-svg">
      <rect x="1" y="1" width="14" height="14" rx="2" fill={TAG_FILL_DARK} />
      {/* Lock body */}
      <rect x="4.5" y="8" width="7" height="5.5" rx="1" fill="white" />
      {/* Shackle */}
      <path
        d="M5.5,8 L5.5,6 Q5.5,3 8,3 Q10.5,3 10.5,6 L10.5,8"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
      />
      {/* Keyhole */}
      <circle cx="8" cy="10.5" r="1" fill={TAG_FILL_DARK} />
      <rect x="7.5" y="11" width="1" height="1.5" fill={TAG_FILL_DARK} />
    </svg>
  );
}

/** Film frame for Movie tag. */
function MovieTagIcon() {
  return (
    <svg viewBox="0 0 16 16" className="onr-tag-dd-icon-svg">
      <rect x="1" y="1" width="14" height="14" rx="2" fill={TAG_FILL_DARK} />
      {/* Film strip outer */}
      <rect
        x="2.5"
        y="4.5"
        width="11"
        height="7"
        rx="1"
        fill="none"
        stroke="white"
        strokeWidth="1"
      />
      {/* Perforations */}
      <rect x="2.5" y="4.5" width="2" height="7" fill="white" opacity="0.4" />
      <rect x="11.5" y="4.5" width="2" height="7" fill="white" opacity="0.4" />
      {/* Frame lines */}
      <line x1="2.5" y1="8" x2="13.5" y2="8" stroke="white" strokeWidth="0.8" />
    </svg>
  );
}

/** Open book for Book tag. */
function BookTagIcon() {
  return (
    <svg viewBox="0 0 16 16" className="onr-tag-dd-icon-svg">
      <rect x="1" y="1" width="14" height="14" rx="2" fill={TAG_FILL_DARK} />
      {/* Left page */}
      <path d="M3,4 L8,4 L8,13 Q5,12 3,13 Z" fill="white" opacity="0.9" />
      {/* Right page */}
      <path d="M8,4 L13,4 L13,13 Q11,12 8,13 Z" fill="white" opacity="0.7" />
      {/* Spine */}
      <line
        x1="8"
        y1="4"
        x2="8"
        y2="13"
        stroke={TAG_FILL_DARK}
        strokeWidth="0.8"
      />
    </svg>
  );
}

/** Musical note for Music tag. */
function MusicTagIcon() {
  return (
    <svg viewBox="0 0 16 16" className="onr-tag-dd-icon-svg">
      <rect x="1" y="1" width="14" height="14" rx="2" fill={TAG_FILL_DARK} />
      {/* Note head */}
      <ellipse cx="6" cy="12" rx="2" ry="1.5" fill="white" />
      {/* Stem */}
      <line x1="7.8" y1="12" x2="7.8" y2="4" stroke="white" strokeWidth="1.2" />
      {/* Flag */}
      <path
        d="M7.8,4 Q12,6 10,9"
        fill="none"
        stroke="white"
        strokeWidth="1.2"
      />
    </svg>
  );
}

/** Document page for Source / Blog tags. */
function DocumentTagIcon({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 16 16" className="onr-tag-dd-icon-svg">
      <rect x="1" y="1" width="14" height="14" rx="2" fill={fill} />
      {/* Page */}
      <rect x="3.5" y="3" width="7.5" height="10" rx="1" fill="white" />
      {/* Folded corner */}
      <polygon points="11,3 11,6 14,6" fill={fill} opacity="0.6" />
      {/* Text lines */}
      <line x1="5" y1="6.5" x2="10" y2="6.5" stroke={fill} strokeWidth="0.8" />
      <line x1="5" y1="8.5" x2="10" y2="8.5" stroke={fill} strokeWidth="0.8" />
      <line x1="5" y1="10.5" x2="8" y2="10.5" stroke={fill} strokeWidth="0.8" />
    </svg>
  );
}

/** Checklist clipboard for task-style tags (Discuss, Schedule, Call). */
function ChecklistTagIcon({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 16 16" className="onr-tag-dd-icon-svg">
      <rect x="1" y="1" width="14" height="14" rx="2" fill={fill} />
      {/* Clipboard body */}
      <rect x="3" y="4" width="10" height="9" rx="1" fill="white" />
      {/* Clip at top */}
      <rect
        x="6"
        y="2.5"
        width="4"
        height="2.5"
        rx="1"
        fill="white"
        stroke={fill}
        strokeWidth="0.6"
      />
      {/* Check lines */}
      <polyline
        points="5.5,8 6.5,9.5 9,6.5"
        fill="none"
        stroke={fill}
        strokeWidth="1.2"
      />
      <line x1="10" y1="9" x2="12" y2="9" stroke={fill} strokeWidth="0.8" />
      <line x1="5.5" y1="11" x2="12" y2="11" stroke={fill} strokeWidth="0.8" />
    </svg>
  );
}

/** Envelope for Send in email tag. */
function EmailTagIcon() {
  return (
    <svg viewBox="0 0 16 16" className="onr-tag-dd-icon-svg">
      <rect
        x="1"
        y="1"
        width="14"
        height="14"
        rx="2"
        fill={TAG_FILL_MEDIUM_GRAY}
      />
      {/* Envelope body */}
      <rect x="2.5" y="5" width="11" height="7" rx="1" fill="white" />
      {/* Flap */}
      <polyline
        points="2.5,5 8,10 13.5,5"
        fill="none"
        stroke={TAG_FILL_MEDIUM_GRAY}
        strokeWidth="1"
      />
    </svg>
  );
}

/** Priority to-do icon: colored checkbox. */
function PriorityTodoIcon({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 16 16" className="onr-tag-dd-icon-svg">
      <rect x="1" y="1" width="14" height="14" rx="2" fill={fill} />
      <polyline
        points="4,8 7,11 12,5"
        stroke="white"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

// ── Full tag list ─────────────────────────────────────────────────────────────

export const ALL_TAGS: TagOrSeparator[] = [
  {
    label: 'Important',
    icon: <ImportantTagIcon className="onr-tag-dd-icon-svg" />,
    swatchColor: TAG_SWATCH_IMPORTANT,
    action: {
      type: 'callout',
      calloutType: 'important',
      calloutTitle: 'Important',
    },
    calloutKey: 'Important',
  },
  {
    label: 'Question',
    icon: <QuestionTagIcon className="onr-tag-dd-icon-svg" />,
    swatchColor: TAG_SWATCH_QUESTION,
    action: {
      type: 'callout',
      calloutType: 'question',
      calloutTitle: 'Question',
    },
    calloutKey: 'Question',
  },
  {
    label: 'Remember for later',
    icon: <TagIconText fill={TAG_FILL_DARK} symbol="R" />,
    swatchColor: TAG_SWATCH_REMEMBER,
    action: {
      type: 'callout',
      calloutType: 'note',
      calloutTitle: 'Remember for later',
    },
    calloutKey: 'Remember for later',
  },
  {
    label: 'Definition',
    icon: <TagIconText fill={TAG_FILL_DEFINITION_GREEN} symbol="D" />,
    swatchColor: TAG_SWATCH_DEFINITION,
    action: {
      type: 'callout',
      calloutType: 'abstract',
      calloutTitle: 'Definition',
    },
    calloutKey: 'Definition',
  },
  {
    label: 'Contact',
    icon: <PersonTagIcon fill={TAG_FILL_MEDIUM_GRAY} />,
    swatchColor: TAG_SWATCH_NEUTRAL,
    action: { type: 'callout', calloutType: 'info', calloutTitle: 'Contact' },
    calloutKey: 'Contact',
  },
  {
    label: 'Address',
    icon: <AddressTagIcon />,
    swatchColor: TAG_SWATCH_NEUTRAL,
    action: { type: 'callout', calloutType: 'info', calloutTitle: 'Address' },
    calloutKey: 'Address',
  },
  {
    label: 'Phone number',
    icon: <PhoneTagIcon />,
    swatchColor: TAG_SWATCH_NEUTRAL,
    action: {
      type: 'callout',
      calloutType: 'info',
      calloutTitle: 'Phone number',
    },
    calloutKey: 'Phone number',
  },
  {
    label: 'Web site to visit',
    icon: <GlobeTagIcon />,
    swatchColor: TAG_SWATCH_NEUTRAL,
    action: {
      type: 'callout',
      calloutType: 'tip',
      calloutTitle: 'Web site to visit',
    },
    calloutKey: 'Web site to visit',
  },
  {
    label: 'Idea',
    icon: <IdeaTagIcon />,
    swatchColor: TAG_SWATCH_NEUTRAL,
    action: { type: 'callout', calloutType: 'tip', calloutTitle: 'Idea' },
    calloutKey: 'Idea',
  },
  {
    label: 'Password',
    icon: <LockTagIcon />,
    swatchColor: TAG_SWATCH_NEUTRAL,
    action: {
      type: 'callout',
      calloutType: 'warning',
      calloutTitle: 'Password',
    },
    calloutKey: 'Password',
  },
  {
    label: 'Critical',
    icon: <TagIconText fill={TAG_FILL_CRITICAL_RED} symbol="!" />,
    swatchColor: TAG_SWATCH_CRITICAL,
    action: {
      type: 'callout',
      calloutType: 'danger',
      calloutTitle: 'Critical',
    },
    calloutKey: 'Critical',
  },
  {
    label: 'Project A',
    icon: <TagIconText fill={TAG_FILL_PROJECT_A_CORAL} symbol="A" />,
    swatchColor: TAG_SWATCH_PROJECT_A,
    action: {
      type: 'callout',
      calloutType: 'example',
      calloutTitle: 'Project A',
    },
    calloutKey: 'Project A',
  },
  {
    label: 'Project B',
    icon: <TagIconText fill={TAG_FILL_PROJECT_B_GOLD} symbol="B" />,
    swatchColor: TAG_SWATCH_PROJECT_B,
    action: {
      type: 'callout',
      calloutType: 'success',
      calloutTitle: 'Project B',
    },
    calloutKey: 'Project B',
  },
  {
    label: 'Movie to see',
    icon: <MovieTagIcon />,
    swatchColor: TAG_SWATCH_NEUTRAL,
    action: {
      type: 'callout',
      calloutType: 'tip',
      calloutTitle: 'Movie to see',
    },
    calloutKey: 'Movie to see',
  },
  {
    label: 'Book to read',
    icon: <BookTagIcon />,
    swatchColor: TAG_SWATCH_NEUTRAL,
    action: {
      type: 'callout',
      calloutType: 'tip',
      calloutTitle: 'Book to read',
    },
    calloutKey: 'Book to read',
  },
  {
    label: 'Music to listen to',
    icon: <MusicTagIcon />,
    swatchColor: TAG_SWATCH_NEUTRAL,
    action: {
      type: 'callout',
      calloutType: 'tip',
      calloutTitle: 'Music to listen to',
    },
    calloutKey: 'Music to listen to',
  },
  {
    label: 'Source for article',
    icon: <DocumentTagIcon fill={TAG_FILL_MEDIUM_GRAY} />,
    swatchColor: TAG_SWATCH_NEUTRAL,
    action: {
      type: 'callout',
      calloutType: 'quote',
      calloutTitle: 'Source for article',
    },
    calloutKey: 'Source for article',
  },
  {
    label: 'Remember for blog',
    icon: <DocumentTagIcon fill={TAG_FILL_MEDIUM_GRAY} />,
    swatchColor: TAG_SWATCH_NEUTRAL,
    action: {
      type: 'callout',
      calloutType: 'note',
      calloutTitle: 'Remember for blog',
    },
    calloutKey: 'Remember for blog',
  },
  {
    label: 'To Do priority 1',
    icon: <PriorityTodoIcon fill={TAG_FILL_PRIORITY_1_RED} />,
    swatchColor: TAG_SWATCH_PRIORITY_1,
    action: {
      type: 'callout',
      calloutType: 'todo',
      calloutTitle: 'To Do priority 1',
    },
    calloutKey: 'To Do priority 1',
  },
  {
    label: 'To Do priority 2',
    icon: <PriorityTodoIcon fill={TAG_FILL_PRIORITY_2_BLUE} />,
    swatchColor: TAG_SWATCH_PRIORITY_2,
    action: {
      type: 'callout',
      calloutType: 'todo',
      calloutTitle: 'To Do priority 2',
    },
    calloutKey: 'To Do priority 2',
  },

  // ── Checkbox group ────────────────────────────────────────────────────────

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
