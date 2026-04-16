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
    parts.push(
      `.HyperMD-list-line-${depth} .${markerClassName}[data-onr-marker] ` +
        `{ font-size: 0 !important; }`,
    );
    parts.push(
      `.HyperMD-list-line-${depth} .${markerClassName}[data-onr-marker]::before ` +
        `{ font-size: var(--font-text-size, 16px) !important; ` +
        `content: attr(data-onr-marker); ` +
        `color: ${markerColor} !important; }`,
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

  // During short CM6 recycling windows, spans may not be stamped yet.
  // Keep the raw markdown number token visually hidden so `1.` does not flash.
  parts.push('.cm-formatting-list-ol { color: transparent !important; }');
  parts.push(
    '.cm-formatting-list-ol::before { color: var(--text-normal) !important; font-size: var(--font-text-size, 16px) !important; }',
  );

  // Task lines keep their original display
  parts.push(
    `.HyperMD-task-line .cm-formatting-list-ol { font-size: inherit !important; }`,
  );
  parts.push(`.HyperMD-task-line .cm-formatting-list-ol { color: inherit !important; }`);
  parts.push(
    `.HyperMD-task-line .cm-formatting-list-ol::before { content: none !important; }`,
  );

  return parts;
}

function buildEditorBulletCss(levels: BulletLevels): string[] {
  const parts: string[] = [];

  // Always hide raw UL marker tokens and render a level-1 fallback marker.
  // This prevents visible flashes when CM6 temporarily recycles depth classes.
  parts.push('.cm-formatting-list-ul { font-size: 0 !important; }');
  parts.push(
    `.cm-formatting-list-ul::before { font-size: var(--font-text-size, 16px) !important; content: "${levels[0]}${MARKER_SYMBOL_PADDING}" !important; color: var(--text-muted, #888) !important; }`,
  );

  for (let depth = 1; depth <= EDITOR_MAX_DEPTH; depth++) {
    const levelIndex = (depth - 1) % REQUIRED_BULLET_DEPTH_COUNT;
    const symbol = levels[levelIndex];

    // Depth-based fallback marker shown even before data-onr-marker is restamped.
    // Support both span depth classes and line depth classes to tolerate CM6 DOM churn.
    parts.push(
      `.cm-formatting-list-ul.cm-list-${depth}::before, ` +
        `.HyperMD-list-line-${depth} .cm-formatting-list-ul::before ` +
        `{ font-size: var(--font-text-size, 16px) !important; ` +
        `content: "${symbol}${MARKER_SYMBOL_PADDING}" !important; ` +
        `color: var(--text-muted, #888) !important; }`,
    );
  }

  // Once available, prefer the JS-stamped marker attribute.
  parts.push(
    '.cm-formatting-list-ul[data-onr-marker]::before { content: attr(data-onr-marker) !important; }',
  );

  parts.push(
    `.HyperMD-task-line .cm-formatting-list-ul { font-size: inherit !important; }`,
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

  for (const span of spans) {
    // Skip task-line spans (they use checkboxes, not numbers)
    if (span.closest('.HyperMD-task-line')) {
      span.removeAttribute('data-onr-marker');
      continue;
    }

    const text = span.textContent ?? '';
    const match = text.match(OL_NUMBER_REGEX);

    if (!match) {
      // During cursor moves, CM6 can briefly leave list-formatting spans in an
      // intermediate state. Keep the previous marker through that transition
      // to avoid a visible raw-token flash.
      if (text.trim().length === 0) {
        continue;
      }

      span.removeAttribute('data-onr-marker');
      continue;
    }

    const number = parseInt(match[1], 10);
    const depth = extractListLineDepth(span);

    // If depth class is temporarily missing, preserve existing marker and wait
    // for the next stable pass.
    if (depth === null) {
      continue;
    }

    const marker = converter(number, depth);
    span.setAttribute('data-onr-marker', marker);
  }
}

function stampAllUlSpans(levels: BulletLevels): void {
  const spans = document.querySelectorAll('.cm-formatting-list-ul');

  for (const span of spans) {
    if (span.closest('.HyperMD-task-line')) {
      span.removeAttribute('data-onr-marker');
      continue;
    }

    const text = span.textContent ?? '';

    if (!UL_MARKER_REGEX.test(text)) {
      span.removeAttribute('data-onr-marker');
      continue;
    }

    const depth = extractListLineDepth(span);

    if (depth === null) {
      span.removeAttribute('data-onr-marker');
      continue;
    }

    const levelIndex = (depth - 1) % REQUIRED_BULLET_DEPTH_COUNT;
    const symbol = levels[levelIndex];
    span.setAttribute('data-onr-marker', `${symbol}${MARKER_SYMBOL_PADDING}`);
  }
}

/**
 * Removes all `data-onr-marker` attributes from list-marker spans.
 */
function clearAllListMarkers(): void {
  const spans = document.querySelectorAll(
    '.cm-formatting-list-ol[data-onr-marker], .cm-formatting-list-ul[data-onr-marker]',
  );

  for (const span of spans) {
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
  let isStamping = false;

  const runStampNow = () => {
    if (isStamping) return;

    isStamping = true;

    if (converter !== null) {
      stampAllOlSpans(converter);
    }

    if (bulletLevels !== null) {
      stampAllUlSpans(bulletLevels);
    }

    isStamping = false;
  };

  const scheduleStamp = () => {
    // Ignore mutations triggered by our own stamping
    if (isStamping) return;
    runStampNow();
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

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  // CM6 recycles DOM nodes during scrolling without always firing childList
  // mutations at the body level. Listen for scroll events on the editor's
  // scroll container to catch viewport-driven node recycling.
  const scrollContainers = document.querySelectorAll('.cm-scroller');

  const runStampBurst = () => {
    runStampNow();

    queueMicrotask(() => {
      runStampNow();
    });

    requestAnimationFrame(() => {
      runStampNow();
    });
  };

  // Selection and scroll changes can happen without mutation timing that lands before paint.
  // Stamp immediately on these events to reduce visible marker flashes.
  const scrollHandler = () => runStampBurst();
  const selectionHandler = () => runStampBurst();

  for (const container of scrollContainers) {
    container.addEventListener('scroll', scrollHandler, { passive: true });
  }

  document.addEventListener('selectionchange', selectionHandler, true);

  return () => {
    observer.disconnect();

    for (const container of scrollContainers) {
      container.removeEventListener('scroll', scrollHandler);
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
  }, []); // intentionally runs once on mount only

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

    console.log('[ONR] Creating observer for:', {
      bulletPresetId,
      numberPresetId,
    });
    observerCleanupRef.current = createListMarkerObserver(
      converter,
      bulletLevels,
    );
    console.log('[ONR] Observer created, ref set');

    return () => {
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
