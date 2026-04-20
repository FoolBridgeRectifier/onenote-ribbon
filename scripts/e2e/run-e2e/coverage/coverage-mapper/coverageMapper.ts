import type { CoverageData, MappedCoverageData, SourceMappedCoverage, CoverageSummary } from '../interfaces';
import {
  extractInlineSourceMap,
  findOriginalPosition,
  getOriginalSourceFiles,
} from '../source-map-resolver/sourceMapResolver';
import { calculateMappedSummary } from '../coverage-calculator/coverageCalculator';
import {
  isPluginScript,
  getLineFromOffset,
  getColumnFromOffset,
  isExecutableLine,
} from '../helpers';

/**
 * Maps coverage data from bundled JavaScript back to original TypeScript source using source maps.
 * Falls back to bundle-level coverage when no source map is present.
 */
export function mapCoverageToSource(
  coverageData: CoverageData,
  bundleContent: string,
): SourceMappedCoverage {
  const sourceMap = extractInlineSourceMap(bundleContent);

  if (!sourceMap) {
    return mapBundleCoverage(coverageData, bundleContent);
  }

  const files = new Map<string, MappedCoverageData>();
  const originalSources = getOriginalSourceFiles(sourceMap);

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

        const startMapping = findOriginalPosition(sourceMap, startLine, startColumn);
        const endMapping = findOriginalPosition(sourceMap, endLine, endColumn);

        if (startMapping && endMapping && startMapping.sourcePath === endMapping.sourcePath) {
          const fileData = files.get(startMapping.sourcePath);
          if (!fileData) {
            continue;
          }

          for (let line = startMapping.line; line <= endMapping.line; line++) {
            if (range.count > 0) {
              fileData.coveredLines.add(line);
              fileData.uncoveredLines.delete(line);
            }
          }

          if (func.isBlockCoverage) {
            fileData.totalFunctions++;
            if (range.count > 0) {
              fileData.coveredFunctions++;
            }
          }

          // ranges after the first are branch blocks
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

  const summary = calculateMappedSummary(files);
  return { files, summary };
}

/** Falls back to bundle-level coverage when no source map is available. */
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
    overallCoverage: 0,
  };

  summary.overallCoverage =
    (summary.lineCoverage * totalLines +
      summary.branchCoverage * totalBranches +
      summary.functionCoverage * totalFunctions) /
    (totalLines + totalBranches + totalFunctions);

  return { files, summary };
}
