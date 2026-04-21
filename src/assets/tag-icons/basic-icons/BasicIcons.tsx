import { TAG_FILL_MEDIUM_GRAY } from '../../../tabs/home/tags/constants';

/** Renders a colored 16×16 rounded square with a white text symbol centred inside. */
export function TagIconText({ fill, symbol }: { fill: string; symbol: string }) {
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
export function PersonTagIcon({ fill }: { fill: string }) {
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
export function AddressTagIcon() {
  return (
    <svg viewBox="0 0 16 16" className="onr-tag-dd-icon-svg">
      <rect x="1" y="1" width="14" height="14" rx="2" fill={TAG_FILL_MEDIUM_GRAY} />
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
export function PhoneTagIcon() {
  return (
    <svg viewBox="0 0 16 16" className="onr-tag-dd-icon-svg">
      <rect x="1" y="1" width="14" height="14" rx="2" fill={TAG_FILL_MEDIUM_GRAY} />
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
export function GlobeTagIcon() {
  return (
    <svg viewBox="0 0 16 16" className="onr-tag-dd-icon-svg">
      <rect x="1" y="1" width="14" height="14" rx="2" fill={TAG_FILL_MEDIUM_GRAY} />
      {/* Globe circle outline */}
      <circle cx="8" cy="8" r="4.5" fill="none" stroke="white" strokeWidth="1" />
      {/* Horizontal equator */}
      <line x1="3.5" y1="8" x2="12.5" y2="8" stroke="white" strokeWidth="1" />
      {/* Vertical axis */}
      <line x1="8" y1="3.5" x2="8" y2="12.5" stroke="white" strokeWidth="1" />
    </svg>
  );
}
