import { useState, useEffect, useRef } from 'react';
import type { ListStyleContextValue, ListStyleSettings, NumberPreset } from '../../tabs/home/basic-text/list-buttons/interfaces';
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

/** Two-space visual padding appended after each bullet symbol in CSS marker content. */
const MARKER_SYMBOL_PADDING = '  ';

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
    [1000, 'm'], [900, 'cm'], [500, 'd'], [400, 'cd'],
    [100, 'c'], [90, 'xc'], [50, 'l'], [40, 'xl'],
    [10, 'x'], [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i'],
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

/**
 * Converter function type: takes a 1-based number (parsed from markdown "N. ")
 * and returns the formatted marker string (e.g. "a. " or "(1) ").
 */
type NumberConverter = (value: number) => string;

/**
 * Builds a converter function for a given NumberPreset.
 * Returns null if the preset is "none" (no conversion needed).
 */
export function buildNumberConverter(numberPreset: NumberPreset): NumberConverter | null {
  const styleType = numberPreset.cssListStyleType;
  const markerTemplate = numberPreset.markerContent;

  // Period-suffix styles: "a. ", "I. ", etc.
  if (styleType) {
    const formatFn = getFormatFunction(styleType);
    return (value: number) => `${formatFn(value)}. `;
  }

  // Custom marker templates: "1) ", "(a) ", etc.
  // The template uses `counter(list-item, <style>)` notation.
  // We extract the style and wrapping characters.
  if (markerTemplate) {
    return buildTemplateConverter(markerTemplate);
  }

  return null;
}

/** Maps a CSS list-style-type name to a number→string function. */
function getFormatFunction(styleType: string): (value: number) => string {
  switch (styleType) {
    case 'lower-alpha': return numberToLowerAlpha;
    case 'upper-alpha': return numberToUpperAlpha;
    case 'lower-roman': return numberToLowerRoman;
    case 'upper-roman': return numberToUpperRoman;
    case 'decimal':
    default:
      return (value: number) => String(value);
  }
}

/**
 * Parses a markerContent template like 'counter(list-item, lower-alpha) ")  "'
 * or '"(" counter(list-item, decimal) ")  "' and returns a converter function.
 */
function buildTemplateConverter(template: string): NumberConverter | null {
  // Extract the counter style from counter(list-item, <style>)
  const counterMatch = template.match(/counter\(\s*list-item\s*,\s*(\w[\w-]*)\s*\)/);
  if (!counterMatch) return null;

  const styleType = counterMatch[1];
  const formatFn = getFormatFunction(styleType);

  // Check for prefix/suffix characters around the counter() call
  // e.g., '"(" counter(...) ")  "' → prefix="(", suffix=") "
  const beforeCounter = template.substring(0, template.indexOf('counter('));
  const afterCounter = template.substring(template.indexOf(')') + 1);

  // Extract string literals from the prefix/suffix (remove quotes and extra spaces)
  const prefix = extractStringLiteral(beforeCounter);
  const suffix = extractStringLiteral(afterCounter);

  return (value: number) => `${prefix}${formatFn(value)}${suffix}`;
}

/** Extracts the text content from a CSS string literal like '"("' → "(". */
function extractStringLiteral(fragment: string): string {
  const matches = fragment.match(/"([^"]*)"/g);
  if (!matches) return '';

  return matches.map((match) => match.slice(1, -1)).join('');
}

/** Regex to extract the number from a CM6 OL formatting span: "3. " → 3. */
const OL_NUMBER_REGEX = /^(\d+)\.\s$/;

/**
 * Builds static CSS rules for the editor that hide the original number text
 * and display the `data-onr-marker` attribute via `::before`.
 *
 * The actual marker text is set on each `.cm-formatting-list-ol` span by
 * the MutationObserver in `useListStyleInjection`.
 */
function buildEditorNumberCss(): string[] {
  const parts: string[] = [];

  for (let depth = 1; depth <= EDITOR_MAX_DEPTH; depth++) {
    parts.push(
      `.HyperMD-list-line-${depth} .cm-formatting-list-ol[data-onr-marker] ` +
      `{ font-size: 0 !important; }`,
    );
    parts.push(
      `.HyperMD-list-line-${depth} .cm-formatting-list-ol[data-onr-marker]::before ` +
      `{ font-size: var(--font-text-size, 16px) !important; ` +
      `content: attr(data-onr-marker); ` +
      `color: var(--text-normal) !important; }`,
    );
  }

  // Task lines keep their original display
  parts.push(
    `.HyperMD-task-line .cm-formatting-list-ol { font-size: inherit !important; }`,
  );
  parts.push(
    `.HyperMD-task-line .cm-formatting-list-ol::before { content: none !important; }`,
  );

  return parts;
}

/**
 * Stamps `data-onr-marker` on every visible `.cm-formatting-list-ol` span.
 * Called once to process all existing spans, and again by the MutationObserver
 * whenever the DOM changes.
 */
function stampAllOlSpans(converter: NumberConverter): void {
  const spans = document.querySelectorAll('.cm-formatting-list-ol');

  for (const span of spans) {
    // Skip task-line spans (they use checkboxes, not numbers)
    if (span.closest('.HyperMD-task-line')) {
      span.removeAttribute('data-onr-marker');
      continue;
    }

    const text = span.textContent ?? '';
    const match = text.match(OL_NUMBER_REGEX);

    if (match) {
      const number = parseInt(match[1], 10);
      const marker = converter(number);
      span.setAttribute('data-onr-marker', marker);
    }
  }
}

/**
 * Removes all `data-onr-marker` attributes from OL spans (cleanup on preset change or unmount).
 */
function clearAllOlMarkers(): void {
  const spans = document.querySelectorAll('.cm-formatting-list-ol[data-onr-marker]');

  for (const span of spans) {
    span.removeAttribute('data-onr-marker');
  }
}

/** Builds the full CSS override string for the given bullet and number preset IDs. */
function buildCssString(bulletPresetId: string, numberPresetId: string): string {
  const parts: string[] = [];

  if (bulletPresetId !== BULLET_PRESET_NONE_ID) {
    const bulletPreset = BULLET_PRESETS.find((preset) => preset.id === bulletPresetId);

    // Only emit rules when the preset has exactly the required number of level symbols defined
    if (bulletPreset && bulletPreset.levels.length === REQUIRED_BULLET_DEPTH_COUNT) {
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
        parts.push(`${scope} .task-list-item::marker { content: "" !important; }`);
      }

      // Editor / live-preview view: Obsidian renders bullets as a CSS circle via
      // .list-bullet::after (background-color circle, no text content). Override that
      // pseudo-element with the preset symbol. Depth is encoded in .HyperMD-list-line-N.
      for (let depth = 1; depth <= EDITOR_MAX_DEPTH; depth++) {
        const levelIndex = (depth - 1) % REQUIRED_BULLET_DEPTH_COUNT;
        const symbol = levels[levelIndex];

        parts.push(
          `.HyperMD-list-line-${depth} .list-bullet::after { ` +
          `content: "${symbol}" !important; ` +
          `background: none !important; ` +
          `border-radius: 0 !important; ` +
          `width: auto !important; ` +
          `height: auto !important; ` +
          `color: var(--text-muted, #888) !important; ` +
          `font-size: 0.9em; }`,
        );
      }
    }
  }

  if (numberPresetId !== NUMBER_PRESET_NONE_ID) {
    const numberPreset = NUMBER_PRESETS.find((preset) => preset.id === numberPresetId);

    if (numberPreset) {
      // ── Reading view CSS ────────────────────────────────────────────────
      if (numberPreset.cssListStyleType) {
        // Use native list-style-type — lets Obsidian's counter-reset handling work correctly
        for (const scope of READING_VIEW_SCOPES) {
          parts.push(`${scope} ol > li { list-style-type: ${numberPreset.cssListStyleType}; }`);
        }
      } else if (numberPreset.markerContent) {
        // Custom marker expression requires suppressing the default list-style-type first
        for (const scope of READING_VIEW_SCOPES) {
          parts.push(`${scope} ol > li { list-style-type: none; }`);
          parts.push(`${scope} ol > li::marker { content: ${numberPreset.markerContent}; }`);
        }
      }

      // ── Editor / live-preview CSS (data-attribute driven) ──────────────
      parts.push(...buildEditorNumberCss());
    }
  }

  return parts.join('\n');
}

/** Upserts the injected <style> element in document.head with the current list-style CSS. */
function buildAndInjectCss(bulletPresetId: string, numberPresetId: string): void {
  let styleElement = document.getElementById(LIST_STYLE_ELEMENT_ID) as HTMLStyleElement | null;

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
function createOlMarkerObserver(converter: NumberConverter): () => void {
  let pendingFrame: number | null = null;
  let isStamping = false;

  const scheduleStamp = () => {
    // Ignore mutations triggered by our own stamping
    if (isStamping) return;
    if (pendingFrame !== null) return;

    pendingFrame = requestAnimationFrame(() => {
      pendingFrame = null;
      isStamping = true;
      stampAllOlSpans(converter);
      isStamping = false;
    });
  };

  // Initial pass
  isStamping = true;
  stampAllOlSpans(converter);
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
  const scrollHandler = () => scheduleStamp();

  for (const container of scrollContainers) {
    container.addEventListener('scroll', scrollHandler, { passive: true });
  }

  return () => {
    observer.disconnect();

    for (const container of scrollContainers) {
      container.removeEventListener('scroll', scrollHandler);
    }

    if (pendingFrame !== null) {
      cancelAnimationFrame(pendingFrame);
    }

    clearAllOlMarkers();
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

  const [bulletPresetId, setBulletPresetId] = useState<string>(DEFAULT_LIST_STYLE_SETTINGS.bulletPresetId);
  const [numberPresetId, setNumberPresetId] = useState<string>(DEFAULT_LIST_STYLE_SETTINGS.numberPresetId);
  const observerCleanupRef = useRef<(() => void) | null>(null);

  // Load persisted settings from plugin storage on mount; fall back to defaults for missing keys
  useEffect(() => {
    plugin.loadData().then((data: unknown) => {
      const loadedSettings = (data ?? {}) as Partial<ListStyleSettings>;
      setBulletPresetId(loadedSettings.bulletPresetId ?? DEFAULT_LIST_STYLE_SETTINGS.bulletPresetId);
      setNumberPresetId(loadedSettings.numberPresetId ?? DEFAULT_LIST_STYLE_SETTINGS.numberPresetId);
    });
  }, []); // intentionally runs once on mount only

  // Rebuild and inject CSS whenever either preset ID changes
  useEffect(() => {
    buildAndInjectCss(bulletPresetId, numberPresetId);
  }, [bulletPresetId, numberPresetId]);

  // Manage the MutationObserver for OL number conversion in the editor
  useEffect(() => {
    // Clean up previous observer
    if (observerCleanupRef.current) {
      observerCleanupRef.current();
      observerCleanupRef.current = null;
    }

    if (numberPresetId === NUMBER_PRESET_NONE_ID) return;

    const numberPreset = NUMBER_PRESETS.find((preset) => preset.id === numberPresetId);
    if (!numberPreset) return;

    const converter = buildNumberConverter(numberPreset);
    if (!converter) return;

    console.log('[ONR] Creating observer for:', numberPresetId);
    observerCleanupRef.current = createOlMarkerObserver(converter);
    console.log('[ONR] Observer created, ref set');

    return () => {
      console.log('[ONR] Effect cleanup running for:', numberPresetId);
      if (observerCleanupRef.current) {
        observerCleanupRef.current();
        observerCleanupRef.current = null;
      }
    };
  }, [numberPresetId]);

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
