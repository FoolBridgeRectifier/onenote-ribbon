import {
  REQUIRED_BULLET_DEPTH_COUNT,
  LIST_STYLE_ELEMENT_ID,
  BULLET_PRESETS,
  NUMBER_PRESETS,
  BULLET_PRESET_NONE_ID,
  NUMBER_PRESET_NONE_ID,
} from '../../../../tabs/home/basic-text/list-buttons/constants';
import type { NumberLevelConfig } from '../../../../tabs/home/basic-text/list-buttons/interfaces';
import {
  DEPTH_SELECTORS,
  NUMBER_DEPTH_SELECTORS,
  MARKER_SYMBOL_PADDING,
  READING_VIEW_SCOPES,
} from '../../constants';
import { buildEditorBulletCss, buildEditorNumberCss } from './editor-css/EditorCss';

/** Builds the full CSS override string for the given bullet and number preset IDs. */
export function buildCssString(bulletPresetId: string, numberPresetId: string): string {
  const parts: string[] = [];

  if (bulletPresetId !== BULLET_PRESET_NONE_ID) {
    const bulletPreset = BULLET_PRESETS.find((preset) => preset.id === bulletPresetId);

    if (bulletPreset && bulletPreset.levels.length === REQUIRED_BULLET_DEPTH_COUNT) {
      const levels = bulletPreset.levels as [string, string, string, string];

      for (const scope of READING_VIEW_SCOPES) {
        parts.push(`${scope} ul > li > .list-bullet::after { display: none; }`);
      }

      for (const scope of READING_VIEW_SCOPES) {
        DEPTH_SELECTORS.forEach((depthSelector, index) => {
          const symbol = levels[index];
          parts.push(`${scope} ${depthSelector} { list-style-type: none; }`);
          parts.push(
            `${scope} ${depthSelector}::marker { content: "${symbol}${MARKER_SYMBOL_PADDING}" !important; color: var(--text-muted, #888) !important; }`
          );
        });
      }

      for (const scope of READING_VIEW_SCOPES) {
        parts.push(`${scope} .task-list-item { list-style-type: none; }`);
        parts.push(`${scope} .task-list-item::marker { content: "" !important; }`);
      }

      parts.push(...buildEditorBulletCss(levels));
    }
  }

  if (numberPresetId !== NUMBER_PRESET_NONE_ID) {
    const numberPreset = NUMBER_PRESETS.find((preset) => preset.id === numberPresetId);

    if (numberPreset && numberPreset.levels.length === REQUIRED_BULLET_DEPTH_COUNT) {
      const levels = numberPreset.levels as [
        NumberLevelConfig,
        NumberLevelConfig,
        NumberLevelConfig,
        NumberLevelConfig,
      ];

      for (const scope of READING_VIEW_SCOPES) {
        NUMBER_DEPTH_SELECTORS.forEach((depthSelector, depthIndex) => {
          const levelConfig = levels[depthIndex];

          if (levelConfig.suffix === 'period') {
            parts.push(`${scope} ${depthSelector} { list-style-type: ${levelConfig.style}; }`);
            return;
          }

          parts.push(`${scope} ${depthSelector} { list-style-type: none; }`);

          if (levelConfig.suffix === 'paren') {
            parts.push(
              `${scope} ${depthSelector}::marker { content: counter(list-item, ${levelConfig.style}) ")  "; }`
            );
            return;
          }

          parts.push(
            `${scope} ${depthSelector}::marker { content: "(" counter(list-item, ${levelConfig.style}) ")  "; }`
          );
        });
      }

      for (const scope of READING_VIEW_SCOPES) {
        parts.push(`${scope} .task-list-item { list-style-type: none; }`);
        parts.push(`${scope} .task-list-item::marker { content: "" !important; }`);
      }

      parts.push(...buildEditorNumberCss());
    }
  }

  return parts.join('\n');
}

/** Upserts the injected <style> element in document.head with the current list-style CSS. */
export function buildAndInjectCss(bulletPresetId: string, numberPresetId: string): void {
  let styleElement = document.getElementById(LIST_STYLE_ELEMENT_ID) as HTMLStyleElement | null;

  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = LIST_STYLE_ELEMENT_ID;
    document.head.appendChild(styleElement);
  }

  styleElement.textContent = buildCssString(bulletPresetId, numberPresetId);
}
