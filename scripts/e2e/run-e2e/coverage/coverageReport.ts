import { PERCENT_DISPLAY_DECIMALS } from './constants';

export function formatCoveragePercent(coveragePercent: number): string {
  return `${coveragePercent.toFixed(PERCENT_DISPLAY_DECIMALS)}%`;
}
