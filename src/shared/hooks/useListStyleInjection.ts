import { useState, useEffect } from 'react';
import type { ListStyleContextValue, ListStyleSettings } from '../../tabs/home/basic-text/list-buttons/interfaces';
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
    }
  }

  if (numberPresetId !== NUMBER_PRESET_NONE_ID) {
    const numberPreset = NUMBER_PRESETS.find((preset) => preset.id === numberPresetId);

    if (numberPreset) {
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
 * Loads list-style settings from plugin storage, injects live CSS, and
 * exposes setters that both update CSS and persist the change.
 */
export function useListStyleInjection(): ListStyleContextValue {
  const plugin = usePlugin() as unknown as StoragePlugin;

  const [bulletPresetId, setBulletPresetId] = useState<string>(DEFAULT_LIST_STYLE_SETTINGS.bulletPresetId);
  const [numberPresetId, setNumberPresetId] = useState<string>(DEFAULT_LIST_STYLE_SETTINGS.numberPresetId);

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
