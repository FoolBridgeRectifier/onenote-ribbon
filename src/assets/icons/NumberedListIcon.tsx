import type { IconProps } from './interfaces';
export function NumberedListIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <line x1="10" y1="6" x2="21" y2="6" />
      <line x1="10" y1="12" x2="21" y2="12" />
      <line x1="10" y1="18" x2="21" y2="18" />
      <path d="M4 6h1v4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 10h2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 14H4l2 2-2 2h2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
