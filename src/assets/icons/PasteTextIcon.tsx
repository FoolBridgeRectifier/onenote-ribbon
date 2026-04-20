import type { IconProps } from './interfaces';
// Clipboard with a "T" — represents "Paste as plain text (keep text only)"
export function PasteTextIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M6 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1" />
      <text
        x="12"
        y="17"
        textAnchor="middle"
        fontSize="8"
        fontWeight="bold"
        fontFamily="sans-serif"
        fill="currentColor"
        stroke="none"
      >
        T
      </text>
    </svg>
  );
}
