import { REQUIRED_BULLET_DEPTH_COUNT } from '../../../../../tabs/home/basic-text/list-buttons/constants';
import type { BulletLevels } from '../../../interfaces';
import { EDITOR_MAX_DEPTH, MARKER_SYMBOL_PADDING } from '../../../constants';

/** Generates CSS rules that hide the raw marker text and show a custom ::before overlay. */
export function buildEditorMarkerCss(
  markerClassName: 'cm-formatting-list-ol' | 'cm-formatting-list-ul',
  markerColor: string
): string[] {
  const parts: string[] = [];

  for (let depth = 1; depth <= EDITOR_MAX_DEPTH; depth++) {
    // Hide raw marker text; keep caret height by using transparent color instead of font-size: 0
    parts.push(
      `.HyperMD-list-line-${depth} .${markerClassName} ` +
        `{ color: transparent !important; caret-color: ${markerColor} !important; ` +
        `position: relative !important; display: inline-block !important; ` +
        `vertical-align: baseline !important; cursor: text !important; }`
    );

    // Absolutely positioned ::before shows the empty placeholder until JS stamps the attribute
    parts.push(
      `.HyperMD-list-line-${depth} .${markerClassName}::before ` +
        `{ position: absolute !important; left: 0 !important; pointer-events: none !important; ` +
        `font-size: var(--font-text-size, 16px) !important; ` +
        `content: "\\a0" !important; color: ${markerColor} !important; }`
    );

    // Once JS stamps data-onr-marker, show the converted marker text
    parts.push(
      `.HyperMD-list-line-${depth} .${markerClassName}[data-onr-marker]::before ` +
        `{ content: attr(data-onr-marker) !important; }`
    );
  }

  return parts;
}

/** Builds static CSS rules for OL markers in the editor. */
export function buildEditorNumberCss(): string[] {
  const parts = buildEditorMarkerCss('cm-formatting-list-ol', 'var(--text-normal)');
  // Task lines keep their original display
  parts.push(
    `.HyperMD-task-line .cm-formatting-list-ol { color: inherit !important; position: static !important; }`
  );
  parts.push(`.HyperMD-task-line .cm-formatting-list-ol::before { content: none !important; }`);
  return parts;
}

/** Builds static CSS rules for UL markers in the editor. */
export function buildEditorBulletCss(levels: BulletLevels): string[] {
  const parts: string[] = [];

  for (let depth = 1; depth <= EDITOR_MAX_DEPTH; depth++) {
    const levelIndex = (depth - 1) % REQUIRED_BULLET_DEPTH_COUNT;
    const symbol = levels[levelIndex];

    parts.push(
      `.HyperMD-list-line-${depth} .cm-formatting-list-ul ` +
        `{ color: transparent !important; caret-color: var(--text-normal) !important; ` +
        `position: relative !important; display: inline-block !important; ` +
        `vertical-align: baseline !important; cursor: text !important; }`
    );

    // Depth-based fallback marker shown before data-onr-marker is stamped
    parts.push(
      `.HyperMD-list-line-${depth} .cm-formatting-list-ul::before ` +
        `{ position: absolute !important; left: 0 !important; pointer-events: none !important; ` +
        `font-size: var(--font-text-size, 16px) !important; ` +
        `content: "${symbol}${MARKER_SYMBOL_PADDING}" !important; ` +
        `color: var(--text-muted, #888) !important; }`
    );

    parts.push(
      `.HyperMD-list-line-${depth} .cm-formatting-list-ul[data-onr-marker]::before ` +
        `{ content: attr(data-onr-marker) !important; }`
    );

    // Hide Obsidian's native bullet dot so it doesn't double up with our custom marker
    parts.push(
      `.HyperMD-list-line-${depth} .cm-formatting-list-ul .list-bullet::after ` +
        `{ display: none !important; }`
    );
  }

  parts.push(
    `.HyperMD-task-line .cm-formatting-list-ul { color: inherit !important; position: static !important; }`
  );
  parts.push(`.HyperMD-task-line .cm-formatting-list-ul::before { content: none !important; }`);

  return parts;
}
