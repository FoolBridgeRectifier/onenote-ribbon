import type { IconProps } from './interfaces';
export function HighlightIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M9 11l-6 6v3h3l6-6" />
      <path d="M22 5.54a2 2 0 0 0-2.83-2.83l-11.3 11.3 2.83 2.83L22 5.54z" />
    </svg>
  );
}
