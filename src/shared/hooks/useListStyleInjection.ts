import { useState, useEffect, useRef } from 'react';
import type {
  ListStyleContextValue,
  ListStyleSettings,
  NumberLevelConfig,
  NumberPreset,
} from '../../tabs/home/basic-text/list-buttons/interfaces';
import {
  BULLET_PRESETS,
  NUMBER_PRESETS,
  DEFAULT_LIST_STYLE_SETTINGS,
  BULLET_PRESET_NONE_ID,
  NUMBER_PRESET_NONE_ID,
  LIST_STYLE_ELEMENT_ID,
  READING_VIEW_SCOPES,
  REQUIRED_BULLET_DEPTH_COUNT,
} from '../../tabs/home/basic-text/list-buttons/constants';
import { usePlugin } from '../context/PluginContext';

/** Subset of the Plugin API needed for persistent list-style storage. */
interface StoragePlugin {
  loadData(): Promise<unknown>;
  saveData(data: unknown): Promise<void>;
}

/** Minimal CM6 EditorView interface for type safety. */
interface EditorView {
  posAtDOM(node: Node, offset: number): number;
  dispatch(spec: { selection: { anchor: number } }): void;
}

/** CSS selectors for each nesting depth of unordered lists (L1 → L4). */
const DEPTH_SELECTORS: [string, string, string, string] = [
  ':is(ul) > li',
  ':is(ul ul) > li',
  ':is(ul ul ul) > li',
  ':is(ul ul ul ul) > li',
];

const NUMBER_DEPTH_SELECTORS: [string, string, string, string] = [
  ':is(ol) > li',
  ':is(ol ol) > li',
  ':is(ol ol ol) > li',
  ':is(ol ol ol ol) > li',
];

/** Two-space visual padding appended after each bullet symbol in CSS marker content. */
const MARKER_SYMBOL_PADDING = '  ';

type BulletLevels = [string, string, string, string];

const LIST_LINE_DEPTH_REGEX = /\bHyperMD-list-line-(\d+)\b/;

/**
 * Maximum nesting depth for editor-view CSS rules.
 * Depths beyond REQUIRED_BULLET_DEPTH_COUNT cycle back via modulo.
 */
const EDITOR_MAX_DEPTH = 8;

// ============================================================
// Number format conversion utilities
// ============================================================

/** Converts a 1-based number to lowercase letters: 1→a, 2→b, ..., 26→z, 27→aa. */
function numberToLowerAlpha(value: number): string {
  let result = '';
  let remaining = value;

  while (remaining > 0) {
    remaining--;
    result = String.fromCharCode(97 + (remaining % 26)) + result;
    remaining = Math.floor(remaining / 26);
  }

  return result;
}

/** Converts a 1-based number to uppercase letters: 1→A, 2→B, etc. */
function numberToUpperAlpha(value: number): string {
  return numberToLowerAlpha(value).toUpperCase();
}

/** Converts a 1-based number to lowercase Roman numerals. */
function numberToLowerRoman(value: number): string {
  const romanPairs: Array<[number, string]> = [
    [1000, 'm'],
    [900, 'cm'],
    [500, 'd'],
    [400, 'cd'],
    [100, 'c'],
    [90, 'xc'],
    [50, 'l'],
    [40, 'xl'],
    [10, 'x'],
    [9, 'ix'],
    [5, 'v'],
    [4, 'iv'],
    [1, 'i'],
  ];

  let result = '';
  let remaining = value;

  for (const [threshold, symbol] of romanPairs) {
    while (remaining >= threshold) {
      result += symbol;
      remaining -= threshold;
    }
  }

  return result;
}

/** Converts a 1-based number to uppercase Roman numerals. */
function numberToUpperRoman(value: number): string {
  return numberToLowerRoman(value).toUpperCase();
}

type NumberLevelConverter = (value: number, depth: number) => string;

/**
 * Builds a converter function for a given NumberPreset.
 * Returns null if the preset is "none" (no conversion needed).
 */
export function buildNumberConverter(
  numberPreset: NumberPreset,
): NumberLevelConverter | null {
  if (numberPreset.levels.length !== REQUIRED_BULLET_DEPTH_COUNT) return null;

  const levels = numberPreset.levels as [
    NumberLevelConfig,
    NumberLevelConfig,
    NumberLevelConfig,
    NumberLevelConfig,
  ];

  return (value: number, depth: number) => {
    const levelIndex = (depth - 1) % REQUIRED_BULLET_DEPTH_COUNT;
    const levelConfig = levels[levelIndex];
    const formatFn = getFormatFunction(levelConfig.style);
    const formattedValue = formatFn(value);

    switch (levelConfig.suffix) {
      case 'period':
        return `${formattedValue}. `;
      case 'paren':
        return `${formattedValue})  `;
      case 'wrapped':
        return `(${formattedValue})  `;
      default:
        return `${formattedValue}. `;
    }
  };
}

/** Maps a CSS list-style-type name to a number→string function. */
function getFormatFunction(styleType: string): (value: number) => string {
  switch (styleType) {
    case 'lower-alpha':
      return numberToLowerAlpha;
    case 'upper-alpha':
      return numberToUpperAlpha;
    case 'lower-roman':
      return numberToLowerRoman;
    case 'upper-roman':
      return numberToUpperRoman;
    case 'decimal':
    default:
      return (value: number) => String(value);
  }
}

/** Regex to extract the number from a CM6 OL formatting span: "3. " → 3. */
const OL_NUMBER_REGEX = /^(\d+)\.\s$/;

/** Regex to detect a CM6 UL formatting span's raw marker text: "- " / "* " / "+ ". */
const UL_MARKER_REGEX = /^[-*+]\s$/;

function buildEditorMarkerCss(
  markerClassName: 'cm-formatting-list-ol' | 'cm-formatting-list-ul',
  markerColor: string,
): string[] {
  const parts: string[] = [];

  for (let depth = 1; depth <= EDITOR_MAX_DEPTH; depth++) {
    // Hide the raw marker text with transparent color (not font-size: 0) so the native
    // caret still renders at normal height when positioned inside the marker span.
    parts.push(
      `.HyperMD-list-line-${depth} .${markerClassName} ` +
        `{ color: transparent !important; ` +
        `caret-color: ${markerColor} !important; ` +
        `position: relative !important; ` +
        `display: inline-block !important; ` +
        `vertical-align: baseline !important; ` +
        `cursor: text !important; }`,
    );

    // Empty placeholder before JS stamps the attribute — prevents default numbering flash.
    // Absolutely positioned so it overlays the transparent original text.
    parts.push(
      `.HyperMD-list-line-${depth} .${markerClassName}::before ` +
        `{ position: absolute !important; ` +
        `left: 0 !important; ` +
        `pointer-events: none !important; ` +
        `font-size: var(--font-text-size, 16px) !important; ` +
        `content: "\\a0" !important; ` +
        `color: ${markerColor} !important; }`,
    );

    // Once JS stamps the data-onr-marker attribute, show the converted marker text.
    parts.push(
      `.HyperMD-list-line-${depth} .${markerClassName}[data-onr-marker]::before ` +
        `{ content: attr(data-onr-marker) !important; }`,
    );
  }

  return parts;
}

function extractListLineDepth(element: Element): number | null {
  const lineClassName = element.closest('.cm-line')?.className ?? '';
  const match = lineClassName.match(LIST_LINE_DEPTH_REGEX);

  if (!match) {
    return null;
  }

  return parseInt(match[1], 10);
}

/**
 * Builds static CSS rules for the editor that hide the original number text
 * and display the `data-onr-marker` attribute via `::before`.
 *
 * The actual marker text is set on each `.cm-formatting-list-ol` span by
 * the MutationObserver in `useListStyleInjection`.
 */
function buildEditorNumberCss(): string[] {
  const parts = buildEditorMarkerCss(
    'cm-formatting-list-ol',
    'var(--text-normal)',
  );

  // Task lines keep their original display
  parts.push(
    `.HyperMD-task-line .cm-formatting-list-ol { color: inherit !important; position: static !important; }`,
  );
  parts.push(
    `.HyperMD-task-line .cm-formatting-list-ol::before { content: none !important; }`,
  );

  return parts;
}

function buildEditorBulletCss(levels: BulletLevels): string[] {
  const parts: string[] = [];

  for (let depth = 1; depth <= EDITOR_MAX_DEPTH; depth++) {
    const levelIndex = (depth - 1) % REQUIRED_BULLET_DEPTH_COUNT;
    const symbol = levels[levelIndex];

    // Hide the raw markdown token with transparent color (not font-size: 0) so the native
    // caret still renders at normal height when positioned inside the marker span.
    parts.push(
      `.HyperMD-list-line-${depth} .cm-formatting-list-ul ` +
        `{ color: transparent !important; ` +
        `caret-color: var(--text-normal) !important; ` +
        `position: relative !important; ` +
        `display: inline-block !important; ` +
        `vertical-align: baseline !important; ` +
        `cursor: text !important; }`,
    );

    // Depth-based fallback marker shown even before data-onr-marker is restamped.
    // Absolutely positioned so it overlays the transparent original text.
    parts.push(
      `.HyperMD-list-line-${depth} .cm-formatting-list-ul::before ` +
        `{ position: absolute !important; ` +
        `left: 0 !important; ` +
        `pointer-events: none !important; ` +
        `font-size: var(--font-text-size, 16px) !important; ` +
        `content: "${symbol}${MARKER_SYMBOL_PADDING}" !important; ` +
        `color: var(--text-muted, #888) !important; }`,
    );

    // Once available, prefer the JS-stamped marker attribute.
    parts.push(
      `.HyperMD-list-line-${depth} .cm-formatting-list-ul[data-onr-marker]::before ` +
        `{ content: attr(data-onr-marker) !important; }`,
    );

    // Hide Obsidian's native bullet dot (rendered via .list-bullet::after)
    // so it doesn't double up with our custom marker.
    parts.push(
      `.HyperMD-list-line-${depth} .cm-formatting-list-ul .list-bullet::after ` +
        `{ display: none !important; }`,
    );
  }

  parts.push(
    `.HyperMD-task-line .cm-formatting-list-ul { color: inherit !important; position: static !important; }`,
  );
  parts.push(
    `.HyperMD-task-line .cm-formatting-list-ul::before { content: none !important; }`,
  );

  return parts;
}

/**
 * Stamps `data-onr-marker` on every visible `.cm-formatting-list-ol` span.
 * Called once to process all existing spans, and again by the MutationObserver
 * whenever the DOM changes.
 */
function stampAllOlSpans(converter: NumberLevelConverter): void {
  const spans = document.querySelectorAll('.cm-formatting-list-ol');

  for (const span of Array.from(spans)) {
    // Skip task-line spans (they use checkboxes, not numbers)
    if (span.closest('.HyperMD-task-line')) {
      if (span.hasAttribute('data-onr-marker'))
        span.removeAttribute('data-onr-marker');
      continue;
    }

    const text = span.textContent ?? '';
    const match = text.match(OL_NUMBER_REGEX);

    if (match) {
      const number = parseInt(match[1], 10);
      const depth = extractListLineDepth(span);

      if (depth === null) {
        if (span.hasAttribute('data-onr-marker'))
          span.removeAttribute('data-onr-marker');
        continue;
      }

      const marker = converter(number, depth);

      // Only write when the value actually differs — prevents infinite MutationObserver loops
      if (span.getAttribute('data-onr-marker') !== marker) {
        span.setAttribute('data-onr-marker', marker);
      }

      continue;
    }

    if (span.hasAttribute('data-onr-marker'))
      span.removeAttribute('data-onr-marker');
  }
}

function stampAllUlSpans(levels: BulletLevels): void {
  const spans = document.querySelectorAll('.cm-formatting-list-ul');

  for (const span of Array.from(spans)) {
    if (span.closest('.HyperMD-task-line')) {
      if (span.hasAttribute('data-onr-marker'))
        span.removeAttribute('data-onr-marker');
      continue;
    }

    const text = span.textContent ?? '';

    if (!UL_MARKER_REGEX.test(text)) {
      if (span.hasAttribute('data-onr-marker'))
        span.removeAttribute('data-onr-marker');
      continue;
    }

    const depth = extractListLineDepth(span);

    if (depth === null) {
      if (span.hasAttribute('data-onr-marker'))
        span.removeAttribute('data-onr-marker');
      continue;
    }

    const levelIndex = (depth - 1) % REQUIRED_BULLET_DEPTH_COUNT;
    const symbol = levels[levelIndex];
    const expectedMarker = `${symbol}${MARKER_SYMBOL_PADDING}`;

    // Only write when the value actually differs — prevents infinite MutationObserver loops
    if (span.getAttribute('data-onr-marker') !== expectedMarker) {
      span.setAttribute('data-onr-marker', expectedMarker);
    }
  }
}

/**
 * Removes all `data-onr-marker` attributes from list-marker spans.
 */
function clearAllListMarkers(): void {
  const spans = document.querySelectorAll(
    '.cm-formatting-list-ol[data-onr-marker], .cm-formatting-list-ul[data-onr-marker]',
  );

  for (const span of Array.from(spans)) {
    span.removeAttribute('data-onr-marker');
  }
}

/** Builds the full CSS override string for the given bullet and number preset IDs. */
function buildCssString(
  bulletPresetId: string,
  numberPresetId: string,
): string {
  const parts: string[] = [];

  if (bulletPresetId !== BULLET_PRESET_NONE_ID) {
    const bulletPreset = BULLET_PRESETS.find(
      (preset) => preset.id === bulletPresetId,
    );

    // Only emit rules when the preset has exactly the required number of level symbols defined
    if (
      bulletPreset &&
      bulletPreset.levels.length === REQUIRED_BULLET_DEPTH_COUNT
    ) {
      const levels = bulletPreset.levels as [string, string, string, string];

      // Obsidian renders its default bullet via .list-bullet::after (a CSS circle shape).
      // Hide that circle so our custom ::marker symbols are the only visible bullet indicator.
      for (const scope of READING_VIEW_SCOPES) {
        parts.push(`${scope} ul > li > .list-bullet::after { display: none; }`);
      }

      for (const scope of READING_VIEW_SCOPES) {
        DEPTH_SELECTORS.forEach((depthSelector, index) => {
          const symbol = levels[index];
          parts.push(`${scope} ${depthSelector} { list-style-type: none; }`);
          // Obsidian's theme sets ::marker color to transparent; explicitly set it to inherit the muted text color.
          // Two spaces after symbol provides visual padding before the list item text.
          parts.push(
            `${scope} ${depthSelector}::marker { content: "${symbol}${MARKER_SYMBOL_PADDING}" !important; color: var(--text-muted, #888) !important; }`,
          );
        });
      }

      // Task list items use checkboxes instead of bullets — suppress custom markers on them.
      for (const scope of READING_VIEW_SCOPES) {
        parts.push(`${scope} .task-list-item { list-style-type: none; }`);
        parts.push(
          `${scope} .task-list-item::marker { content: "" !important; }`,
        );
      }

      parts.push(...buildEditorBulletCss(levels));
    }
  }

  if (numberPresetId !== NUMBER_PRESET_NONE_ID) {
    const numberPreset = NUMBER_PRESETS.find(
      (preset) => preset.id === numberPresetId,
    );

    if (
      numberPreset &&
      numberPreset.levels.length === REQUIRED_BULLET_DEPTH_COUNT
    ) {
      const levels = numberPreset.levels as [
        NumberLevelConfig,
        NumberLevelConfig,
        NumberLevelConfig,
        NumberLevelConfig,
      ];

      // ── Reading view CSS ────────────────────────────────────────────────
      for (const scope of READING_VIEW_SCOPES) {
        NUMBER_DEPTH_SELECTORS.forEach((depthSelector, depthIndex) => {
          const levelConfig = levels[depthIndex];

          if (levelConfig.suffix === 'period') {
            parts.push(
              `${scope} ${depthSelector} { list-style-type: ${levelConfig.style}; }`,
            );
            return;
          }

          parts.push(`${scope} ${depthSelector} { list-style-type: none; }`);

          if (levelConfig.suffix === 'paren') {
            parts.push(
              `${scope} ${depthSelector}::marker { content: counter(list-item, ${levelConfig.style}) ")  "; }`,
            );
            return;
          }

          parts.push(
            `${scope} ${depthSelector}::marker { content: "(" counter(list-item, ${levelConfig.style}) ")  "; }`,
          );
        });
      }

      for (const scope of READING_VIEW_SCOPES) {
        parts.push(`${scope} .task-list-item { list-style-type: none; }`);
        parts.push(
          `${scope} .task-list-item::marker { content: "" !important; }`,
        );
      }

      // ── Editor / live-preview CSS (data-attribute driven) ──────────────
      parts.push(...buildEditorNumberCss());
    }
  }

  return parts.join('\n');
}

/** Upserts the injected <style> element in document.head with the current list-style CSS. */
function buildAndInjectCss(
  bulletPresetId: string,
  numberPresetId: string,
): void {
  let styleElement = document.getElementById(
    LIST_STYLE_ELEMENT_ID,
  ) as HTMLStyleElement | null;

  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = LIST_STYLE_ELEMENT_ID;
    document.head.appendChild(styleElement);
  }

  styleElement.textContent = buildCssString(bulletPresetId, numberPresetId);
}

/**
 * Creates a MutationObserver that watches the entire workspace for OL formatting
 * spans and stamps them with `data-onr-marker` attributes.
 *
 * Observes `document.body` to handle tab switches, file changes, and CM6's
 * virtual DOM recycling — all of which can create new `.cm-content` containers.
 *
 * Uses requestAnimationFrame batching to avoid excessive re-stamping during
 * rapid DOM mutations (e.g. typing, scrolling). A `stamping` flag prevents
 * infinite loops from our own attribute mutations triggering the observer.
 *
 * Returns a cleanup function that disconnects the observer and removes all markers.
 */
function createListMarkerObserver(
  converter: NumberLevelConverter | null,
  bulletLevels: BulletLevels | null,
): () => void {
  let hasPendingMicrotask = false;
  let isStamping = false;

  const scheduleStamp = () => {
    // Ignore mutations triggered by our own stamping
    if (isStamping) return;
    if (hasPendingMicrotask) return;

    hasPendingMicrotask = true;

    queueMicrotask(() => {
      hasPendingMicrotask = false;
      isStamping = true;

      if (converter !== null) {
        stampAllOlSpans(converter);
      }

      if (bulletLevels !== null) {
        stampAllUlSpans(bulletLevels);
      }

      isStamping = false;
    });
  };

  // Initial pass
  isStamping = true;

  if (converter !== null) {
    stampAllOlSpans(converter);
  }

  if (bulletLevels !== null) {
    stampAllUlSpans(bulletLevels);
  }

  isStamping = false;

  const observer = new MutationObserver(scheduleStamp);

  // attributeFilter includes data-onr-marker so the observer fires immediately
  // when CM6 strips our custom attribute during its DOM reconciliation.
  // Without this, re-stamping only happens via selectionchange (too late — after paint).
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributeFilter: ['data-onr-marker'],
  });

  // CM6 recycles DOM nodes during scrolling without always firing childList
  // mutations at the body level. Listen for scroll events on the editor's
  // scroll container to catch viewport-driven node recycling.
  const scrollContainers = document.querySelectorAll('.cm-scroller');
  const scrollHandler = () => scheduleStamp();
  const selectionHandler = () => scheduleStamp();

  for (const container of Array.from(scrollContainers)) {
    container.addEventListener('scroll', scrollHandler, { passive: true });
  }

  document.addEventListener('selectionchange', selectionHandler, true);

  // Clicking on a marker span with transparent text can land the native caret inside
  // the marker's text node. On mouseup, nudge the cursor to the first content position
  // after the marker so CM6's list-aware backspace behavior is preserved.
  const contentContainers = document.querySelectorAll('.cm-content');

  const markerClickHandler = (event: Event) => {
    const mouseEvent = event as MouseEvent;
    const target = mouseEvent.target as Element | null;

    if (!target) return;

    const markerSpan = target.closest(
      '.cm-formatting-list-ol, .cm-formatting-list-ul',
    );

    if (!markerSpan) return;

    // Skip task-line markers — those keep their native formatting
    if (markerSpan.closest('.HyperMD-task-line')) return;

    // Access the CM6 EditorView via the content element's internal reference
    const cmContent = markerSpan.closest('.cm-content') as HTMLElement | null;
    const editorView = (cmContent as unknown as { cmView?: { view?: EditorView } } | null)?.cmView?.view;

    if (!editorView || typeof editorView.posAtDOM !== 'function') return;

    // Resolve document position at the first character after the marker span
    const nextSibling = markerSpan.nextSibling;
    const positionAfterMarker = nextSibling
      ? editorView.posAtDOM(nextSibling, 0)
      : editorView.posAtDOM(markerSpan, markerSpan.childNodes.length);

    // Let CM6 process the mousedown natively, then reposition the cursor
    // on mouseup so CM6's internal state (including list-context awareness)
    // is set up correctly for subsequent keystrokes like backspace.
    const repositionOnMouseUp = () => {
      document.removeEventListener('mouseup', repositionOnMouseUp, true);

      // Schedule after CM6 finishes its own mouseup handling
      requestAnimationFrame(() => {
        editorView.dispatch({ selection: { anchor: positionAfterMarker } });
      });
    };

    document.addEventListener('mouseup', repositionOnMouseUp, true);
  };

  for (const container of Array.from(contentContainers)) {
    container.addEventListener('mousedown', markerClickHandler, true);
  }

  // Backspace inside a marker span (transparent text) would delete individual marker
  // characters instead of removing list formatting. Intercept it and use Obsidian's
  // toggle commands so "1. one" → "one" rather than "1. one" → "1.one".
  const backspaceHandler = (event: Event) => {
    const keyEvent = event as KeyboardEvent;

    if (keyEvent.key !== 'Backspace') return;

    const selection = document.getSelection();

    if (!selection || !selection.isCollapsed) return;

    const anchorNode = selection.anchorNode;
    const parentElement = anchorNode?.parentElement;

    if (!parentElement) return;

    const isOlMarker = parentElement.closest(
      '.cm-formatting-list-ol:not(.HyperMD-task-line .cm-formatting-list-ol)',
    );
    const isUlMarker = parentElement.closest(
      '.cm-formatting-list-ul:not(.HyperMD-task-line .cm-formatting-list-ul)',
    );

    if (!isOlMarker && !isUlMarker) return;

    keyEvent.preventDefault();
    keyEvent.stopPropagation();

    const commandId = isOlMarker
      ? 'editor:toggle-numbered-list'
      : 'editor:toggle-bullet-list';

    // Access Obsidian's global app to execute the toggle command
    const obsidianWindow = window as unknown as {
      app?: { commands?: { executeCommandById(commandId: string): void } };
    };
    obsidianWindow.app?.commands?.executeCommandById(commandId);
  };

  for (const container of Array.from(contentContainers)) {
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

/**
 * Loads list-style settings from plugin storage, injects live CSS, and
 * exposes setters that both update CSS and persist the change.
 *
 * For number presets, a MutationObserver watches OL formatting spans in the
 * editor and stamps `data-onr-marker` attributes with the converted text.
 * CSS counters are unreliable in CodeMirror 6's virtual DOM, so we use
 * JS-based conversion instead.
 */
export function useListStyleInjection(): ListStyleContextValue {
  const plugin = usePlugin() as unknown as StoragePlugin;

  const [bulletPresetId, setBulletPresetId] = useState<string>(
    DEFAULT_LIST_STYLE_SETTINGS.bulletPresetId,
  );
  const [numberPresetId, setNumberPresetId] = useState<string>(
    DEFAULT_LIST_STYLE_SETTINGS.numberPresetId,
  );
  const observerCleanupRef = useRef<(() => void) | null>(null);

  // Load persisted settings from plugin storage on mount; fall back to defaults for missing keys
  useEffect(() => {
    plugin.loadData().then((data: unknown) => {
      const loadedSettings = (data ?? {}) as Partial<ListStyleSettings>;
      setBulletPresetId(
        loadedSettings.bulletPresetId ??
          DEFAULT_LIST_STYLE_SETTINGS.bulletPresetId,
      );
      setNumberPresetId(
        loadedSettings.numberPresetId ??
          DEFAULT_LIST_STYLE_SETTINGS.numberPresetId,
      );
    });
  }, [plugin]);

  // Rebuild and inject CSS whenever either preset ID changes
  useEffect(() => {
    buildAndInjectCss(bulletPresetId, numberPresetId);
  }, [bulletPresetId, numberPresetId]);

  // Manage the MutationObserver for live-editor list marker conversion
  useEffect(() => {
    // Clean up previous observer
    if (observerCleanupRef.current) {
      observerCleanupRef.current();
      observerCleanupRef.current = null;
    }

    const bulletPreset = BULLET_PRESETS.find(
      (preset) => preset.id === bulletPresetId,
    );
    const bulletLevels =
      bulletPreset && bulletPreset.levels.length === REQUIRED_BULLET_DEPTH_COUNT
        ? (bulletPreset.levels as BulletLevels)
        : null;

    const numberPreset =
      numberPresetId === NUMBER_PRESET_NONE_ID
        ? null
        : (NUMBER_PRESETS.find((preset) => preset.id === numberPresetId) ??
          null);
    const converter = numberPreset ? buildNumberConverter(numberPreset) : null;

    if (bulletLevels === null && converter === null) return;

    // eslint-disable-next-line no-console
    console.log('[ONR] Creating observer for:', {
      bulletPresetId,
      numberPresetId,
    });
    observerCleanupRef.current = createListMarkerObserver(
      converter,
      bulletLevels,
    );
    // eslint-disable-next-line no-console
    console.log('[ONR] Observer created, ref set');

    return () => {
      // eslint-disable-next-line no-console
      console.log('[ONR] Effect cleanup running for:', {
        bulletPresetId,
        numberPresetId,
      });
      if (observerCleanupRef.current) {
        observerCleanupRef.current();
        observerCleanupRef.current = null;
      }
    };
  }, [bulletPresetId, numberPresetId]);

  const setBulletPreset = (presetId: string): void => {
    setBulletPresetId(presetId);
    void plugin.saveData({ bulletPresetId: presetId, numberPresetId });
  };

  const setNumberPreset = (presetId: string): void => {
    setNumberPresetId(presetId);
    void plugin.saveData({ bulletPresetId, numberPresetId: presetId });
  };

  return { bulletPresetId, numberPresetId, setBulletPreset, setNumberPreset };
}
