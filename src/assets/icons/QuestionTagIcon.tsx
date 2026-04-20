import type { IconProps } from './interfaces';
export function QuestionTagIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className}>
      <rect x="1" y="1" width="14" height="14" rx="2" fill="#7030A0" />
      <text
        x="8"
        y="12"
        textAnchor="middle"
        fill="white"
        fontSize="11"
        fontWeight="bold"
      >
        ?
      </text>
    </svg>
  );
}
