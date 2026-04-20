import { TAG_FILL_MEDIUM_GRAY, TAG_FILL_DARK } from '../../../constants';

/** Lightbulb for Idea tag. */
export function IdeaTagIcon() {
  return (
    <svg viewBox="0 0 16 16" className="onr-tag-dd-icon-svg">
      <rect x="1" y="1" width="14" height="14" rx="2" fill={TAG_FILL_MEDIUM_GRAY} />
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
export function LockTagIcon() {
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
export function MovieTagIcon() {
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
export function BookTagIcon() {
  return (
    <svg viewBox="0 0 16 16" className="onr-tag-dd-icon-svg">
      <rect x="1" y="1" width="14" height="14" rx="2" fill={TAG_FILL_DARK} />
      {/* Left page */}
      <path d="M3,4 L8,4 L8,13 Q5,12 3,13 Z" fill="white" opacity="0.9" />
      {/* Right page */}
      <path d="M8,4 L13,4 L13,13 Q11,12 8,13 Z" fill="white" opacity="0.7" />
      {/* Spine */}
      <line x1="8" y1="4" x2="8" y2="13" stroke={TAG_FILL_DARK} strokeWidth="0.8" />
    </svg>
  );
}

/** Musical note for Music tag. */
export function MusicTagIcon() {
  return (
    <svg viewBox="0 0 16 16" className="onr-tag-dd-icon-svg">
      <rect x="1" y="1" width="14" height="14" rx="2" fill={TAG_FILL_DARK} />
      {/* Note head */}
      <ellipse cx="6" cy="12" rx="2" ry="1.5" fill="white" />
      {/* Stem */}
      <line x1="7.8" y1="12" x2="7.8" y2="4" stroke="white" strokeWidth="1.2" />
      {/* Flag */}
      <path d="M7.8,4 Q12,6 10,9" fill="none" stroke="white" strokeWidth="1.2" />
    </svg>
  );
}
