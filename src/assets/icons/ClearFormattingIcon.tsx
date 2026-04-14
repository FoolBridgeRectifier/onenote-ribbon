interface IconProps {
  className?: string;
}

/* Stroke-based eraser icon — consistent with the ribbon's fill:none / stroke:currentColor SVG convention.
 * Three elements: outer eraser body (diagonal rectangle), internal band dividing
 * the eraser halves, and a flat baseline — all pure stroke paths, no fills. */
export function ClearFormattingIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      {/* Eraser body: diagonal parallelogram (4,14)→(14,4)→(20,10)→(10,20)→(4,20)→close */}
      <path d="M4 14l10-10 6 6-10 10H4v-6z" />
      {/* Internal band — visually separates the eraser tip from the cap */}
      <line x1="9" y1="9" x2="15" y2="15" />
      {/* Baseline */}
      <line x1="4" y1="20" x2="20" y2="20" />
    </svg>
  );
}
