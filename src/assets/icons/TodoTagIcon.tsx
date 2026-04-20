import type { IconProps } from './interfaces';
export function TodoTagIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className}>
      <rect x="1" y="1" width="14" height="14" rx="2" fill="#4472C4" />
      <polyline
        points="4,8 7,11 12,5"
        stroke="white"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}
