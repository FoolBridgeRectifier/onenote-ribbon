import type { NumberLevelConverter, BulletLevels, EditorView } from '../../interfaces';
import {
  stampAllOlSpans,
  stampAllUlSpans,
  clearAllListMarkers,
} from '../span-stampers/SpanStampers';

/**
 * Creates a MutationObserver that watches the entire workspace for OL/UL formatting
 * spans and stamps them with `data-onr-marker` attributes.
 *
 * Observes `document.body` to handle tab switches, file changes, and CM6's
 * virtual DOM recycling. Uses queueMicrotask batching to avoid excessive
 * re-stamping. A `stamping` flag prevents infinite loops from our own
 * attribute mutations triggering the observer.
 *
 * Returns a cleanup function that disconnects the observer and removes all markers.
 */
export function createListMarkerObserver(
  converter: NumberLevelConverter | null,
  bulletLevels: BulletLevels | null
): () => void {
  let hasPendingMicrotask = false;
  let isStamping = false;

  const scheduleStamp = () => {
    if (isStamping) return;
    if (hasPendingMicrotask) return;

    hasPendingMicrotask = true;

    queueMicrotask(() => {
      hasPendingMicrotask = false;
      isStamping = true;
      if (converter !== null) stampAllOlSpans(converter);
      if (bulletLevels !== null) stampAllUlSpans(bulletLevels);
      isStamping = false;
    });
  };

  // Initial pass before observer starts
  isStamping = true;
  if (converter !== null) stampAllOlSpans(converter);
  if (bulletLevels !== null) stampAllUlSpans(bulletLevels);
  isStamping = false;

  const observer = new MutationObserver(scheduleStamp);

  // attributeFilter includes data-onr-marker so the observer fires when CM6 strips our attribute
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributeFilter: ['data-onr-marker'],
  });

  const scrollContainers = document.querySelectorAll('.cm-scroller');
  const scrollHandler = () => scheduleStamp();
  const selectionHandler = () => scheduleStamp();

  for (const container of Array.from(scrollContainers)) {
    container.addEventListener('scroll', scrollHandler, { passive: true });
  }

  document.addEventListener('selectionchange', selectionHandler, true);

  const contentContainers = document.querySelectorAll('.cm-content');

  // Clicking on a transparent-text marker span repositions the caret after the span
  const markerClickHandler = (event: Event) => {
    const target = (event as MouseEvent).target as Element | null;
    if (!target) return;

    const markerSpan = target.closest('.cm-formatting-list-ol, .cm-formatting-list-ul');
    if (!markerSpan) return;
    if (markerSpan.closest('.HyperMD-task-line')) return;

    const cmContent = markerSpan.closest('.cm-content') as HTMLElement | null;
    const editorView = (cmContent as unknown as { cmView?: { view?: EditorView } } | null)?.cmView
      ?.view;

    if (!editorView || typeof editorView.posAtDOM !== 'function') return;

    const nextSibling = markerSpan.nextSibling;
    const positionAfterMarker = nextSibling
      ? editorView.posAtDOM(nextSibling, 0)
      : editorView.posAtDOM(markerSpan, markerSpan.childNodes.length);

    const repositionOnMouseUp = () => {
      document.removeEventListener('mouseup', repositionOnMouseUp, true);
      // Schedule after CM6 finishes its own mouseup handling
      requestAnimationFrame(() => {
        editorView.dispatch({ selection: { anchor: positionAfterMarker } });
      });
    };

    document.addEventListener('mouseup', repositionOnMouseUp, true);
  };

  // Backspace inside a transparent marker span toggles the list instead of deleting text
  const backspaceHandler = (event: Event) => {
    const keyEvent = event as KeyboardEvent;
    if (keyEvent.key !== 'Backspace') return;

    const selection = document.getSelection();
    if (!selection || !selection.isCollapsed) return;

    const parentElement = selection.anchorNode?.parentElement;
    if (!parentElement) return;

    const isOlMarker = parentElement.closest(
      '.cm-formatting-list-ol:not(.HyperMD-task-line .cm-formatting-list-ol)'
    );
    const isUlMarker = parentElement.closest(
      '.cm-formatting-list-ul:not(.HyperMD-task-line .cm-formatting-list-ul)'
    );

    if (!isOlMarker && !isUlMarker) return;

    keyEvent.preventDefault();
    keyEvent.stopPropagation();

    const commandId = isOlMarker ? 'editor:toggle-numbered-list' : 'editor:toggle-bullet-list';
    const obsidianWindow = window as unknown as {
      app?: { commands?: { executeCommandById(commandId: string): void } };
    };
    obsidianWindow.app?.commands?.executeCommandById(commandId);
  };

  for (const container of Array.from(contentContainers)) {
    container.addEventListener('mousedown', markerClickHandler, true);
    container.addEventListener('keydown', backspaceHandler, true);
  }

  return () => {
    observer.disconnect();

    for (const container of Array.from(scrollContainers)) {
      container.removeEventListener('scroll', scrollHandler);
    }

    for (const container of Array.from(contentContainers)) {
      container.removeEventListener('mousedown', markerClickHandler, true);
      container.removeEventListener('keydown', backspaceHandler, true);
    }

    document.removeEventListener('selectionchange', selectionHandler, true);
    clearAllListMarkers();
  };
}
