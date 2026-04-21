import { TAG_FILL_MEDIUM_GRAY } from '../../../tabs/home/tags/constants';

/** Document page for Source / Blog tags. */
export function DocumentTagIcon({ fill }: { fill: string }) {
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
export function ChecklistTagIcon({ fill }: { fill: string }) {
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
      <polyline points="5.5,8 6.5,9.5 9,6.5" fill="none" stroke={fill} strokeWidth="1.2" />
      <line x1="10" y1="9" x2="12" y2="9" stroke={fill} strokeWidth="0.8" />
      <line x1="5.5" y1="11" x2="12" y2="11" stroke={fill} strokeWidth="0.8" />
    </svg>
  );
}

/** Envelope for Send in email tag. */
export function EmailTagIcon() {
  return (
    <svg viewBox="0 0 16 16" className="onr-tag-dd-icon-svg">
      <rect x="1" y="1" width="14" height="14" rx="2" fill={TAG_FILL_MEDIUM_GRAY} />
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
export function PriorityTodoIcon({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 16 16" className="onr-tag-dd-icon-svg">
      <rect x="1" y="1" width="14" height="14" rx="2" fill={fill} />
      <polyline points="4,8 7,11 12,5" stroke="white" strokeWidth="2" fill="none" />
    </svg>
  );
}
