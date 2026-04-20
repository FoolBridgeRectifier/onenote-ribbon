import { useState, useEffect, useRef } from 'react';
import type {
  ListStyleContextValue,
  ListStyleSettings,
} from '../../tabs/home/basic-text/list-buttons/interfaces';
import {
  BULLET_PRESETS,
  NUMBER_PRESETS,
  DEFAULT_LIST_STYLE_SETTINGS,
  NUMBER_PRESET_NONE_ID,
  REQUIRED_BULLET_DEPTH_COUNT,
} from '../../tabs/home/basic-text/list-buttons/constants';
import { usePlugin } from '../context/PluginContext';
import type { StoragePlugin, BulletLevels } from './interfaces';
import { buildAndInjectCss } from './useListStyleInjection/css-builders/CssBuilders';
import { buildNumberConverter } from './useListStyleInjection/number-format-converters/NumberFormatConverters';
import { createListMarkerObserver } from './useListStyleInjection/list-marker-observer/ListMarkerObserver';

export { buildNumberConverter } from './useListStyleInjection/number-format-converters/NumberFormatConverters';

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
    DEFAULT_LIST_STYLE_SETTINGS.bulletPresetId
  );
  const [numberPresetId, setNumberPresetId] = useState<string>(
    DEFAULT_LIST_STYLE_SETTINGS.numberPresetId
  );
  const observerCleanupRef = useRef<(() => void) | null>(null);

  // Load persisted settings from plugin storage on mount; fall back to defaults for missing keys
  useEffect(() => {
    plugin.loadData().then((data: unknown) => {
      const loadedSettings = (data ?? {}) as Partial<ListStyleSettings>;
      setBulletPresetId(
        loadedSettings.bulletPresetId ?? DEFAULT_LIST_STYLE_SETTINGS.bulletPresetId
      );
      setNumberPresetId(
        loadedSettings.numberPresetId ?? DEFAULT_LIST_STYLE_SETTINGS.numberPresetId
      );
    });
  }, [plugin]);

  // Rebuild and inject CSS whenever either preset ID changes
  useEffect(() => {
    buildAndInjectCss(bulletPresetId, numberPresetId);
  }, [bulletPresetId, numberPresetId]);

  // Manage the MutationObserver for live-editor list marker conversion
  useEffect(() => {
    if (observerCleanupRef.current) {
      observerCleanupRef.current();
      observerCleanupRef.current = null;
    }

    const bulletPreset = BULLET_PRESETS.find((preset) => preset.id === bulletPresetId);
    const bulletLevels =
      bulletPreset && bulletPreset.levels.length === REQUIRED_BULLET_DEPTH_COUNT
        ? (bulletPreset.levels as BulletLevels)
        : null;

    const numberPreset =
      numberPresetId === NUMBER_PRESET_NONE_ID
        ? null
        : (NUMBER_PRESETS.find((preset) => preset.id === numberPresetId) ?? null);
    const converter = numberPreset ? buildNumberConverter(numberPreset) : null;

    if (bulletLevels === null && converter === null) return;

    // eslint-disable-next-line no-console
    console.log('[ONR] Creating observer for:', { bulletPresetId, numberPresetId });
    observerCleanupRef.current = createListMarkerObserver(converter, bulletLevels);
    // eslint-disable-next-line no-console
    console.log('[ONR] Observer created, ref set');

    return () => {
      // eslint-disable-next-line no-console
      console.log('[ONR] Effect cleanup running for:', { bulletPresetId, numberPresetId });
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
