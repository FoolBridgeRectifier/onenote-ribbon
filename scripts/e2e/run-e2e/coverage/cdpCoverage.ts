/**
 * CDP Coverage Collector
 * Uses Chrome DevTools Protocol to collect JavaScript coverage data.
 */

import type { CdpClient } from '../cdpClient/cdpClient';

import type { CoverageData, SourceFilesResult } from './interfaces';

// Re-export all interfaces so existing callers don't break
export type {
  CoverageRange,
  FunctionCoverage,
  ScriptCoverage,
  CoverageData,
  CoverageSummary,
  MappedCoverageData,
  SourceMappedCoverage,
  SourceFilesResult,
} from './interfaces';

// Re-export mapCoverageToSource so coverageReportGenerator doesn't need to change
export { mapCoverageToSource } from './coverage-mapper/coverageMapper';

// Re-export calculateCoverageSummary so callers don't need to change
export { calculateCoverageSummary } from './coverage-calculator/coverageCalculator';

/** Start collecting JavaScript coverage data via CDP. */
export async function startCoverageCollection(
  cdpClient: CdpClient,
): Promise<void> {
  await cdpClient.send('Profiler.enable');

  await cdpClient.send('Profiler.startPreciseCoverage', {
    callCount: true,
    detailed: true,
  });
}

/** Stop collecting coverage data and return the results. */
export async function stopCoverageCollection(
  cdpClient: CdpClient,
): Promise<CoverageData> {
  const coverage = await cdpClient.send<CoverageData>(
    'Profiler.takePreciseCoverage',
  );

  await cdpClient.send('Profiler.stopPreciseCoverage');
  await cdpClient.send('Profiler.disable');

  return coverage;
}

/** Get coverage data without stopping collection (for incremental updates). */
export async function takeCoverageDelta(
  cdpClient: CdpClient,
): Promise<CoverageData> {
  return cdpClient.send<CoverageData>('Profiler.takePreciseCoverage');
}

/**
 * Load source files for coverage analysis.
 * Loads the bundled main.js that executes in Obsidian.
 */
export async function loadSourceFiles(
  rootPath: string,
): Promise<SourceFilesResult> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require('fs') as typeof import('fs');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const path = require('path') as typeof import('path');
  const sourceFiles = new Map<string, string>();

  const mainJsPath = path.join(rootPath, 'main.js');
  let bundleContent = '';

  if (fs.existsSync(mainJsPath)) {
    bundleContent = fs.readFileSync(mainJsPath, 'utf8');
    sourceFiles.set('plugin:onenote-ribbon', bundleContent);
    sourceFiles.set('main.js', bundleContent);
  }

  return {
    files: sourceFiles,
    bundleContent,
    bundlePath: mainJsPath,
  };
}

