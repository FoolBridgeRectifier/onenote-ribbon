import type { CoverageData, MappedCoverageData, SourceMappedCoverage } from '../interfaces';
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
import { mapBundleCoverage } from './helpers';

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


