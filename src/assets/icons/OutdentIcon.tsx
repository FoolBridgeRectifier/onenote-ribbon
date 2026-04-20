import type { IconProps } from './interfaces';
export function OutdentIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <polyline points="7 8 3 12 7 16" />
      <line x1="21" y1="12" x2="3" y2="12" />
      <line x1="21" y1="6" x2="11" y2="6" />
      <line x1="21" y1="18" x2="11" y2="18" />
    </svg>
  );
}
