import { REQUIRED_BULLET_DEPTH_COUNT } from '../../../../tabs/home/basic-text/list-buttons/constants';
import type { NumberLevelConverter, BulletLevels } from '../../interfaces';
import {
  LIST_LINE_DEPTH_REGEX,
  OL_NUMBER_REGEX,
  UL_MARKER_REGEX,
  MARKER_SYMBOL_PADDING,
} from '../../constants';

/** Reads the HyperMD-list-line-N class from the element's closest cm-line to determine nesting depth. */
export function extractListLineDepth(element: Element): number | null {
  const lineClassName = element.closest('.cm-line')?.className ?? '';
  const match = lineClassName.match(LIST_LINE_DEPTH_REGEX);

  if (!match) return null;

  return parseInt(match[1], 10);
}

/**
 * Stamps `data-onr-marker` on every visible `.cm-formatting-list-ol` span.
 * Skips task-line spans (they use checkboxes, not numbers).
 * Only writes when the value actually differs to avoid infinite MutationObserver loops.
 */
export function stampAllOlSpans(converter: NumberLevelConverter): void {
  const spans = document.querySelectorAll('.cm-formatting-list-ol');

  for (const span of Array.from(spans)) {
    if (span.closest('.HyperMD-task-line')) {
      if (span.hasAttribute('data-onr-marker')) span.removeAttribute('data-onr-marker');
      continue;
    }

    const text = span.textContent ?? '';
    const match = text.match(OL_NUMBER_REGEX);

    if (match) {
      const number = parseInt(match[1], 10);
      const depth = extractListLineDepth(span);

      if (depth === null) {
        if (span.hasAttribute('data-onr-marker')) span.removeAttribute('data-onr-marker');
        continue;
      }

      const marker = converter(number, depth);

      if (span.getAttribute('data-onr-marker') !== marker) {
        span.setAttribute('data-onr-marker', marker);
      }

      continue;
    }

    if (span.hasAttribute('data-onr-marker')) span.removeAttribute('data-onr-marker');
  }
}

/**
 * Stamps `data-onr-marker` on every visible `.cm-formatting-list-ul` span.
 * Skips task-line spans. Only writes when the value actually differs.
 */
export function stampAllUlSpans(levels: BulletLevels): void {
  const spans = document.querySelectorAll('.cm-formatting-list-ul');

  for (const span of Array.from(spans)) {
    if (span.closest('.HyperMD-task-line')) {
      if (span.hasAttribute('data-onr-marker')) span.removeAttribute('data-onr-marker');
      continue;
    }

    const text = span.textContent ?? '';

    if (!UL_MARKER_REGEX.test(text)) {
      if (span.hasAttribute('data-onr-marker')) span.removeAttribute('data-onr-marker');
      continue;
    }

    const depth = extractListLineDepth(span);

    if (depth === null) {
      if (span.hasAttribute('data-onr-marker')) span.removeAttribute('data-onr-marker');
      continue;
    }

    const levelIndex = (depth - 1) % REQUIRED_BULLET_DEPTH_COUNT;
    const symbol = levels[levelIndex];
    const expectedMarker = `${symbol}${MARKER_SYMBOL_PADDING}`;

    if (span.getAttribute('data-onr-marker') !== expectedMarker) {
      span.setAttribute('data-onr-marker', expectedMarker);
    }
  }
}

/** Removes all `data-onr-marker` attributes from list-marker spans. */
export function clearAllListMarkers(): void {
  const spans = document.querySelectorAll(
    '.cm-formatting-list-ol[data-onr-marker], .cm-formatting-list-ul[data-onr-marker]'
  );

  for (const span of Array.from(spans)) {
    span.removeAttribute('data-onr-marker');
  }
}
