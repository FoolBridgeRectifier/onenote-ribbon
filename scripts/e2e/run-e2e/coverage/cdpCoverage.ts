/**
 * CDP Coverage Collector
 * Uses Chrome DevTools Protocol to collect JavaScript coverage data.
 */

import type { CdpClient } from '../cdpClient/cdpClient';
import type { ParsedSourceMap } from './source-map-resolver/sourceMapResolver';
import {
  extractInlineSourceMap,
  findOriginalPosition,
  getOriginalSourceFiles,
} from './source-map-resolver/sourceMapResolver';

export interface CoverageRange {
  startOffset: number;
  endOffset: number;
  count: number;
}

export interface FunctionCoverage {
  functionName: string;
  ranges: CoverageRange[];
  isBlockCoverage: boolean;
}

export interface ScriptCoverage {
  scriptId: string;
  url: string;
  functions: FunctionCoverage[];
}

export interface CoverageData {
  result: ScriptCoverage[];
  timestamp: number;
}

export interface CoverageSummary {
  totalLines: number;
  coveredLines: number;
  totalBranches: number;
  coveredBranches: number;
  totalFunctions: number;
  coveredFunctions: number;
  lineCoverage: number;
  branchCoverage: number;
  functionCoverage: number;
  overallCoverage: number;
}

/**
 * Mapped coverage data for original source files.
 */
export interface MappedCoverageData {
  filePath: string;
  coveredLines: Set<number>;
  uncoveredLines: Set<number>;
  coveredBranches: number;
  totalBranches: number;
  coveredFunctions: number;
  totalFunctions: number;
}

/**
 * Result of mapping coverage from bundled code to original source.
 */
export interface SourceMappedCoverage {
  files: Map<string, MappedCoverageData>;
  summary: CoverageSummary;
}

/**
 * Start collecting JavaScript coverage data via CDP.
 */
export async function startCoverageCollection(
  cdpClient: CdpClient,
): Promise<void> {
  // Enable the Profiler domain
  await cdpClient.send('Profiler.enable');

  // Start precise coverage with call counts and block-level granularity
  await cdpClient.send('Profiler.startPreciseCoverage', {
    callCount: true,
    detailed: true,
  });
}

/**
 * Stop collecting coverage data and return the results.
 */
export async function stopCoverageCollection(
  cdpClient: CdpClient,
): Promise<CoverageData> {
  // Take coverage delta (returns all coverage since start)
  const coverage = await cdpClient.send<CoverageData>(
    'Profiler.takePreciseCoverage',
  );

  // Stop precise coverage
  await cdpClient.send('Profiler.stopPreciseCoverage');

  // Disable the Profiler domain
  await cdpClient.send('Profiler.disable');

  return coverage;
}

/**
 * Get coverage data without stopping collection (for incremental updates).
 */
export async function takeCoverageDelta(
  cdpClient: CdpClient,
): Promise<CoverageData> {
  return cdpClient.send<CoverageData>('Profiler.takePreciseCoverage');
}

/**
 * Calculate coverage summary from raw coverage data.
 */
export function calculateCoverageSummary(
  coverageData: CoverageData,
  sourceFiles: Map<string, string>,
): CoverageSummary {
  let totalLines = 0;
  let coveredLines = 0;
  let totalBranches = 0;
  let coveredBranches = 0;
  let totalFunctions = 0;
  let coveredFunctions = 0;

  for (const script of coverageData.result) {
    // Skip scripts that aren't from our plugin
    if (!isPluginScript(script.url)) {
      continue;
    }

    const source = sourceFiles.get(script.url);
    if (!source) {
      continue;
    }

    const lines = source.split('\n');
    const coveredLineSet = new Set<number>();

    for (const func of script.functions) {
      totalFunctions++;

      // Check if function was called
      const functionCalled = func.ranges.some((range) => range.count > 0);
      if (functionCalled) {
        coveredFunctions++;
      }

      // Process line coverage from all ranges
      for (const range of func.ranges) {
        const startLine = getLineFromOffset(source, range.startOffset);
        const endLine = getLineFromOffset(source, range.endOffset);

        for (let line = startLine; line <= endLine; line++) {
          if (range.count > 0) {
            coveredLineSet.add(line);
          }
        }
      }

      // Process branch coverage for block coverage functions
      // When isBlockCoverage is true, ranges[0] is the function body,
      // and ranges[1+] are branch blocks (if/else, ternary, switch cases, etc.)
      if (func.isBlockCoverage && func.ranges.length > 1) {
        // Count branches from branch blocks (skip the first range which is function body)
        for (let rangeIndex = 1; rangeIndex < func.ranges.length; rangeIndex++) {
          const range = func.ranges[rangeIndex];
          totalBranches++;
          if (range.count > 0) {
            coveredBranches++;
          }
        }
      }
    }

    totalLines += lines.length;
    coveredLines += coveredLineSet.size;
  }

  const lineCoverage = totalLines > 0 ? (coveredLines / totalLines) * 100 : 0;
  const branchCoverage =
    totalBranches > 0 ? (coveredBranches / totalBranches) * 100 : 0;
  const functionCoverage =
    totalFunctions > 0 ? (coveredFunctions / totalFunctions) * 100 : 0;

  // Overall coverage is weighted average
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
function isPluginScript(url: string): boolean {
  // Plugin scripts in Obsidian have URL format: plugin:onenote-ribbon
  if (url === 'plugin:onenote-ribbon') {
    return true;
  }

  // Also check for any URL containing onenote-ribbon
  if (url.includes('onenote-ribbon')) {
    return true;
  }

  // Check for main.js which is our bundled plugin
  if (url.endsWith('main.js') && !url.includes('node_modules')) {
    return true;
  }

  return false;
}

/**
 * Get line number from byte offset in source.
 */
function getLineFromOffset(source: string, offset: number): number {
  let line = 1;
  for (let index = 0; index < Math.min(offset, source.length); index++) {
    if (source[index] === '\n') {
      line++;
    }
  }
  return line;
}

/**
 * Get column number from byte offset in source.
 */
function getColumnFromOffset(source: string, offset: number): number {
  let column = 0;
  for (let index = 0; index < Math.min(offset, source.length); index++) {
    if (source[index] === '\n') {
      column = 0;
    } else {
      column++;
    }
  }
  return column;
}

/**
 * Maps coverage data from bundled JavaScript back to original TypeScript source using source maps.
 * This provides accurate coverage reporting at the source file level instead of the bundle level.
 */
export function mapCoverageToSource(
  coverageData: CoverageData,
  bundleContent: string,
): SourceMappedCoverage {
  const sourceMap = extractInlineSourceMap(bundleContent);

  if (!sourceMap) {
    // Fall back to bundle-level coverage if no source map available
    return mapBundleCoverage(coverageData, bundleContent);
  }

  const files = new Map<string, MappedCoverageData>();
  const originalSources = getOriginalSourceFiles(sourceMap);

  // Initialize coverage data for all original source files
  for (const [sourcePath, content] of originalSources) {
    const lines = content.split('\n');
    const executableLines = new Set<number>();

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      if (isExecutableLine(lines[lineIndex])) {
        executableLines.add(lineIndex + 1);
      }
    }

    files.set(sourcePath, {
      filePath: sourcePath,
      coveredLines: new Set(),
      uncoveredLines: executableLines,
      coveredBranches: 0,
      totalBranches: 0,
      coveredFunctions: 0,
      totalFunctions: 0,
    });
  }

  // Map coverage ranges from bundle to original source
  for (const script of coverageData.result) {
    if (!isPluginScript(script.url)) {
      continue;
    }

    for (const func of script.functions) {
      for (const range of func.ranges) {
        const startLine = getLineFromOffset(bundleContent, range.startOffset);
        const startColumn = getColumnFromOffset(bundleContent, range.startOffset);
        const endLine = getLineFromOffset(bundleContent, range.endOffset);
        const endColumn = getColumnFromOffset(bundleContent, range.endOffset);

        // Map start and end positions to original source
        const startMapping = findOriginalPosition(sourceMap, startLine, startColumn);
        const endMapping = findOriginalPosition(sourceMap, endLine, endColumn);

        if (startMapping && endMapping && startMapping.sourcePath === endMapping.sourcePath) {
          const fileData = files.get(startMapping.sourcePath);
          if (!fileData) {
            continue;
          }

          // Mark lines as covered
          for (let line = startMapping.line; line <= endMapping.line; line++) {
            if (range.count > 0) {
              fileData.coveredLines.add(line);
              fileData.uncoveredLines.delete(line);
            }
          }

          // Track function coverage
          if (func.isBlockCoverage) {
            fileData.totalFunctions++;
            if (range.count > 0) {
              fileData.coveredFunctions++;
            }
          }

          // Track branch coverage (ranges after the first are branches)
          if (func.isBlockCoverage && func.ranges.indexOf(range) > 0) {
            fileData.totalBranches++;
            if (range.count > 0) {
              fileData.coveredBranches++;
            }
          }
        }
      }
    }
  }

  // Calculate summary from mapped data
  const summary = calculateMappedSummary(files);

  return { files, summary };
}

/**
 * Falls back to bundle-level coverage when source map is not available.
 */
function mapBundleCoverage(
  coverageData: CoverageData,
  bundleContent: string,
): SourceMappedCoverage {
  const files = new Map<string, MappedCoverageData>();
  const coveredLines = new Set<number>();
  const uncoveredLines = new Set<number>();
  let totalBranches = 0;
  let coveredBranches = 0;
  let totalFunctions = 0;
  let coveredFunctions = 0;

  const lines = bundleContent.split('\n');

  for (const script of coverageData.result) {
    if (!isPluginScript(script.url)) {
      continue;
    }

    for (const func of script.functions) {
      totalFunctions++;
      let functionCovered = false;

      for (const range of func.ranges) {
        const startLine = getLineFromOffset(bundleContent, range.startOffset);
        const endLine = getLineFromOffset(bundleContent, range.endOffset);

        for (let line = startLine; line <= endLine; line++) {
          if (range.count > 0) {
            coveredLines.add(line);
            functionCovered = true;
          } else if (isExecutableLine(lines[line - 1])) {
            uncoveredLines.add(line);
          }
        }

        // Track branch coverage
        if (func.isBlockCoverage && func.ranges.indexOf(range) > 0) {
          totalBranches++;
          if (range.count > 0) {
            coveredBranches++;
          }
        }
      }

      if (functionCovered) {
        coveredFunctions++;
      }
    }
  }

  // Create single entry for the bundle
  files.set('main.js', {
    filePath: 'main.js',
    coveredLines,
    uncoveredLines,
    coveredBranches,
    totalBranches,
    coveredFunctions,
    totalFunctions,
  });

  const totalLines = coveredLines.size + uncoveredLines.size;
  const summary: CoverageSummary = {
    totalLines,
    coveredLines: coveredLines.size,
    totalBranches,
    coveredBranches,
    totalFunctions,
    coveredFunctions,
    lineCoverage: totalLines > 0 ? (coveredLines.size / totalLines) * 100 : 0,
    branchCoverage: totalBranches > 0 ? (coveredBranches / totalBranches) * 100 : 0,
    functionCoverage: totalFunctions > 0 ? (coveredFunctions / totalFunctions) * 100 : 0,
    overallCoverage: 0, // Calculated below
  };

  summary.overallCoverage =
    (summary.lineCoverage * totalLines +
      summary.branchCoverage * totalBranches +
      summary.functionCoverage * totalFunctions) /
    (totalLines + totalBranches + totalFunctions);

  return { files, summary };
}

/**
 * Calculates coverage summary from mapped file data.
 */
function calculateMappedSummary(files: Map<string, MappedCoverageData>): CoverageSummary {
  let totalLines = 0;
  let coveredLines = 0;
  let totalBranches = 0;
  let coveredBranches = 0;
  let totalFunctions = 0;
  let coveredFunctions = 0;

  for (const fileData of files.values()) {
    totalLines += fileData.coveredLines.size + fileData.uncoveredLines.size;
    coveredLines += fileData.coveredLines.size;
    totalBranches += fileData.totalBranches;
    coveredBranches += fileData.coveredBranches;
    totalFunctions += fileData.totalFunctions;
    coveredFunctions += fileData.coveredFunctions;
  }

  const lineCoverage = totalLines > 0 ? (coveredLines / totalLines) * 100 : 0;
  const branchCoverage = totalBranches > 0 ? (coveredBranches / totalBranches) * 100 : 0;
  const functionCoverage = totalFunctions > 0 ? (coveredFunctions / totalFunctions) * 100 : 0;

  const totalMetrics = totalLines + totalBranches + totalFunctions;
  const overallCoverage =
    totalMetrics > 0
      ? (lineCoverage * totalLines + branchCoverage * totalBranches + functionCoverage * totalFunctions) /
        totalMetrics
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
 * Checks if a line contains executable code (not just whitespace or comments).
 */
function isExecutableLine(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length === 0) {
    return false;
  }
  if (trimmed.startsWith('//')) {
    return false;
  }
  if (trimmed.startsWith('/*') && trimmed.endsWith('*/')) {
    return false;
  }
  if (trimmed.startsWith('*')) {
    return false;
  }
  return true;
}

/**
 * Format coverage percentage for display.
 */
export function formatCoveragePercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Generate a coverage report in text format.
 */
export function generateCoverageReport(
  summary: CoverageSummary,
  coverageData: CoverageData,
): string {
  const lines: string[] = [];

  lines.push('='.repeat(60));
  lines.push('E2E CODE COVERAGE REPORT');
  lines.push('='.repeat(60));
  lines.push('');

  lines.push('Summary:');
  lines.push(`  Line Coverage:     ${formatCoveragePercent(summary.lineCoverage)} (${summary.coveredLines}/${summary.totalLines} lines)`);
  lines.push(`  Branch Coverage:   ${formatCoveragePercent(summary.branchCoverage)} (${summary.coveredBranches}/${summary.totalBranches} branches)`);
  lines.push(`  Function Coverage: ${formatCoveragePercent(summary.functionCoverage)} (${summary.coveredFunctions}/${summary.totalFunctions} functions)`);
  lines.push(`  Overall Coverage:  ${formatCoveragePercent(summary.overallCoverage)}`);
  lines.push('');

  // List uncovered files
  const uncoveredScripts = coverageData.result.filter(
    (script) =>
      isPluginScript(script.url) &&
      !script.functions.some((func) =>
        func.ranges.some((range) => range.count > 0),
      ),
  );

  if (uncoveredScripts.length > 0) {
    lines.push('Uncovered Files:');
    for (const script of uncoveredScripts) {
      lines.push(`  - ${script.url}`);
    }
    lines.push('');
  }

  lines.push('='.repeat(60));

  return lines.join('\n');
}

/**
 * Save coverage data to a JSON file for further analysis.
 */
export function saveCoverageData(
  coverageData: CoverageData,
  outputPath: string,
): void {
  const fs = require('fs');
  fs.writeFileSync(outputPath, JSON.stringify(coverageData, null, 2));
}

/**
 * Result of loading source files for coverage analysis.
 */
export interface SourceFilesResult {
  /** Map of file paths to source content */
  files: Map<string, string>;
  /** The full content of the bundled main.js file */
  bundleContent: string;
  /** Path to the bundle file */
  bundlePath: string;
}

/**
 * Load source files for coverage analysis.
 * For E2E tests, we load the bundled main.js since that's what executes in Obsidian.
 * Also returns the bundle content for source map processing.
 */
export async function loadSourceFiles(
  rootPath: string,
): Promise<SourceFilesResult> {
  const fs = require('fs');
  const path = require('path');
  const sourceFiles = new Map<string, string>();

  // Load main.js (the bundled plugin that actually runs in Obsidian)
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
