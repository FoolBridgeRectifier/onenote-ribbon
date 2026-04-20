import type { IconProps } from './interfaces';
export function FoldAllIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <polyline points="3 8 6 8 6 3" />
      <polyline points="3 16 6 16 6 21" />
      <line x1="21" y1="8" x2="6" y2="8" />
      <line x1="21" y1="16" x2="6" y2="16" />
    </svg>
  );
}
