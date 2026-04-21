import type { CoverageData, MappedCoverageData, SourceMappedCoverage } from '../interfaces';
import {
  extractInlineSourceMap,
  findOriginalPosition,
  getOriginalSourceFiles,
} from '../source-map-resolver/sourceMapResolver';
import { calculateMappedSummary } from '../coverage-calculator/coverageCalculator';
import { isPluginScript, getLineFromOffset, getColumnFromOffset } from '../helpers';
import {
  buildExecutableLineSet,
  isPureConstantsOrTypesFile,
  isPureIconFile,
  hasExportedFunctions,
} from '../coverage-report-generator/analyze-file-coverage/analyzeFileCoverage';
import { mapBundleCoverage } from './helpers';

/**
 * Maps coverage data from bundled JavaScript back to original TypeScript source using source maps.
 * Falls back to bundle-level coverage when no source map is present.
 */
export function mapCoverageToSource(
  coverageData: CoverageData,
  bundleContent: string
): SourceMappedCoverage {
  const sourceMap = extractInlineSourceMap(bundleContent);

  if (!sourceMap) {
    return mapBundleCoverage(coverageData, bundleContent);
  }

  const files = new Map<string, MappedCoverageData>();
  const originalSources = getOriginalSourceFiles(sourceMap);

  for (const [sourcePath, content] of originalSources) {
    // Skip files that can never show coverage due to esbuild/CDP source-map limitations
    if (isPureConstantsOrTypesFile(sourcePath, content) || isPureIconFile(sourcePath, content)) {
      continue;
    }

    // Use the stateful builder so multi-line import blocks are fully excluded
    const executableLines = buildExecutableLineSet(content);

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

  // Post-process: remove files where CDP found no function ranges attributed to them
  // but the file clearly contains exported functions. This indicates an esbuild/CDP
  // source-map attribution failure — the code IS running but the source map doesn't
  // produce position entries pointing into these files' function bodies.
  // Also remove files with 0/0 functions AND 0 covered lines that contain no functions at all
  // (pure data/constant files like tag array definitions that use JSX object literals).
  for (const [sourcePath, fileData] of files) {
    const content = originalSources.get(sourcePath) ?? '';
    const hasZeroCdpAttribution = fileData.totalFunctions === 0 && fileData.coveredLines.size === 0;

    if (hasZeroCdpAttribution && hasExportedFunctions(content)) {
      files.delete(sourcePath);
      continue;
    }

    // Pure data files: no function definitions at all → also unmappable by CDP
    const hasFunctionDefinition = /(?:function\s+\w|\(.*\)\s*=>\s*[{(]|\bclass\s+\w)/.test(content);
    if (hasZeroCdpAttribution && !hasFunctionDefinition) {
      files.delete(sourcePath);
    }
  }

  const summary = calculateMappedSummary(files);
  return { files, summary };
}
