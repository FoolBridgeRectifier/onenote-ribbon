import * as fs from 'fs';

import type { CoverageData } from '../cdpCoverage';
import { mapCoverageToSource } from '../cdpCoverage';
import type { MappedCoverageData } from '../interfaces';
import {
  readCollectCoverageFrom,
  readCoveragePathIgnorePatterns,
  normalizeRawSourcePath,
  shouldIncludeSourceFile,
} from '../jest-coverage-filter/jestCoverageFilter';

import type { FileCoverage, DetailedCoverageReport } from './interfaces';
import {
  analyzeFileCoverage,
  calculateSummaryFromFiles,
  isPluginScript,
  extractFilePath,
} from './helpers';

// Re-export so callers don't need to know about subfolders
export type { FileCoverage, DetailedCoverageReport } from './interfaces';
export { saveHtmlReport, generateUncoveredBranchesReport } from './html-report/htmlReport';

/**
 * Generate a detailed coverage report from CDP coverage data.
 * Uses source maps to map coverage back to original TypeScript source files.
 */
export function generateDetailedReport(
  coverageData: CoverageData,
  sourceFiles: Map<string, string>,
  duration: number,
  bundleContent?: string,
  rootPath?: string
): DetailedCoverageReport {
  // If we have bundle content with source maps, use source-mapped coverage
  if (bundleContent) {
    const mappedCoverage = mapCoverageToSource(coverageData, bundleContent);

    // Filter to only the files jest would include via collectCoverageFrom and coveragePathIgnorePatterns
    const coverageFromPatterns = rootPath ? readCollectCoverageFrom(rootPath) : [];
    const ignorePatterns = rootPath ? readCoveragePathIgnorePatterns(rootPath) : [];
    const filteredFiles = filterAndNormalizeMappedFiles(
      mappedCoverage.files,
      coverageFromPatterns,
      ignorePatterns
    );

    const files = convertMappedToFileCoverage(filteredFiles);
    // Recalculate summary so it reflects the filtered file set
    const summary = calculateSummaryFromFiles(files);

    return {
      summary,
      files: files.sort((a, b) => b.lineCoverage - a.lineCoverage),
      timestamp: new Date().toISOString(),
      duration,
      sourceMapped: true,
    };
  }

  // Fall back to bundle-level coverage
  const files: FileCoverage[] = [];

  for (const script of coverageData.result) {
    // Skip non-plugin scripts
    if (!isPluginScript(script.url)) {
      continue;
    }

    const filePath = extractFilePath(script.url);
    const source = sourceFiles.get(filePath) || sourceFiles.get(script.url);

    if (!source) {
      continue;
    }

    const fileCoverage = analyzeFileCoverage(script, source, filePath);
    files.push(fileCoverage);
  }

  // Calculate overall summary
  const summary = calculateSummaryFromFiles(files);

  return {
    summary,
    files: files.sort((a, b) => b.lineCoverage - a.lineCoverage),
    timestamp: new Date().toISOString(),
    duration,
    sourceMapped: false,
  };
}

/**
 * Filters mapped coverage files using jest's collectCoverageFrom patterns and
 * coveragePathIgnorePatterns, normalizing raw source map paths (e.g. ../../src/foo.ts → src/foo.ts).
 * When no patterns are provided every file is retained as-is.
 */
function filterAndNormalizeMappedFiles(
  mappedFiles: Map<string, MappedCoverageData>,
  collectCoverageFromPatterns: string[],
  ignorePatterns: string[] = []
): Map<string, MappedCoverageData> {
  const filtered = new Map<string, MappedCoverageData>();

  for (const [rawPath, data] of mappedFiles) {
    const normalizedPath = normalizeRawSourcePath(rawPath);

    if (!shouldIncludeSourceFile(normalizedPath, collectCoverageFromPatterns, ignorePatterns)) {
      continue;
    }

    filtered.set(normalizedPath, { ...data, filePath: normalizedPath });
  }

  return filtered;
}

/**
 * Converts mapped coverage data to FileCoverage format.
 */
function convertMappedToFileCoverage(
  mappedFiles: Map<
    string,
    {
      filePath: string;
      coveredLines: Set<number>;
      uncoveredLines: Set<number>;
      coveredBranches: number;
      totalBranches: number;
      coveredFunctions: number;
      totalFunctions: number;
    }
  >
): FileCoverage[] {
  const files: FileCoverage[] = [];

  for (const [filePath, data] of mappedFiles) {
    const totalLines = data.coveredLines.size + data.uncoveredLines.size;
    const uncoveredLines = Array.from(data.uncoveredLines).sort((a, b) => a - b);

    files.push({
      filePath,
      totalLines,
      coveredLines: data.coveredLines.size,
      totalBranches: data.totalBranches,
      coveredBranches: data.coveredBranches,
      totalFunctions: data.totalFunctions,
      coveredFunctions: data.coveredFunctions,
      lineCoverage: totalLines > 0 ? (data.coveredLines.size / totalLines) * 100 : 0,
      branchCoverage:
        data.totalBranches > 0 ? (data.coveredBranches / data.totalBranches) * 100 : 0,
      functionCoverage:
        data.totalFunctions > 0 ? (data.coveredFunctions / data.totalFunctions) * 100 : 0,
      uncoveredLines,
      uncoveredBranches: [],
      uncoveredFunctions: [],
    });
  }

  return files;
}

/**
 * Save coverage report to JSON file.
 */
export function saveReportJson(report: DetailedCoverageReport, outputPath: string): void {
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
}
