import type { NumberPreset, NumberStyleType, NumberSuffixType } from '../interfaces';
import { DEPTH_STYLE_CYCLE } from './constants';

/** Builds levels for a number preset by rotating through style types starting at baseStyle. */
export function buildNumberLevels(
  baseStyle: NumberStyleType,
  suffix: NumberSuffixType
): NumberPreset['levels'] {
  const baseIndex = DEPTH_STYLE_CYCLE.indexOf(baseStyle);

  const getStyleAtDepth = (depthOffset: number): NumberStyleType => {
    const index = (baseIndex + depthOffset) % DEPTH_STYLE_CYCLE.length;
    return DEPTH_STYLE_CYCLE[index];
  };

  return [
    { style: getStyleAtDepth(0), suffix },
    { style: getStyleAtDepth(1), suffix },
    { style: getStyleAtDepth(2), suffix },
    { style: getStyleAtDepth(3), suffix },
  ];
}
