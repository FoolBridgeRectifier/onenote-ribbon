import type { CoverageData, MappedCoverageData, SourceMappedCoverage, CoverageSummary } from '../interfaces';
import { isPluginScript, getLineFromOffset, isExecutableLine } from '../helpers';

/** Falls back to bundle-level coverage when no source map is available. */
export function mapBundleCoverage(
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
