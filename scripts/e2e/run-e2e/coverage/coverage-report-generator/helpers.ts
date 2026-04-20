import type { CoverageSummary } from '../interfaces';

import type { FileCoverage } from './interfaces';
import { analyzeFileCoverage } from './analyze-file-coverage/analyzeFileCoverage';

export { analyzeFileCoverage };
export { inferBranchType, isExecutableLine, getLineFromOffset } from './analyze-file-coverage/analyzeFileCoverage';

/**
 * Calculate summary from file coverages.
 */
export function calculateSummaryFromFiles(files: FileCoverage[]): CoverageSummary {
  let totalLines = 0;
  let coveredLines = 0;
  let totalBranches = 0;
  let coveredBranches = 0;
  let totalFunctions = 0;
  let coveredFunctions = 0;

  for (const file of files) {
    totalLines += file.totalLines;
    coveredLines += file.coveredLines;
    totalBranches += file.totalBranches;
    coveredBranches += file.coveredBranches;
    totalFunctions += file.totalFunctions;
    coveredFunctions += file.coveredFunctions;
  }

  const lineCoverage = totalLines > 0 ? (coveredLines / totalLines) * 100 : 0;
  const branchCoverage =
    totalBranches > 0 ? (coveredBranches / totalBranches) * 100 : 0;
  const functionCoverage =
    totalFunctions > 0 ? (coveredFunctions / totalFunctions) * 100 : 0;

  const overallCoverage =
    totalLines + totalBranches + totalFunctions > 0
      ? (lineCoverage * totalLines +
          branchCoverage * totalBranches +
          functionCoverage * totalFunctions) /
        (totalLines + totalBranches + totalFunctions)
      : 0;

  return {
    totalLines,
    coveredLines,
    totalBranches,
    coveredBranches,
    totalFunctions,
    coveredFunctions,
    lineCoverage,
    branchCoverage,
    functionCoverage,
    overallCoverage,
  };
}

/**
 * Check if a script URL is from our plugin.
 */
export function isPluginScript(url: string): boolean {
  if (url.includes('onenote-ribbon')) return true;
  if (url.endsWith('main.js') && !url.includes('node_modules')) return true;
  return false;
}

/**
 * Extract file path from URL.
 */
export function extractFilePath(url: string): string {
  // Handle app://obsidian.md/... URLs
  if (url.startsWith('app://')) {
    const parts = url.split('/');
    return parts[parts.length - 1] || url;
  }
  return url;
}
