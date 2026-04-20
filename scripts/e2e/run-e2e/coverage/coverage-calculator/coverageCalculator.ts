import type { CoverageData, CoverageSummary, MappedCoverageData } from '../interfaces';
import { isPluginScript, getLineFromOffset } from '../helpers';

/** Calculates coverage summary from raw CDP coverage data. */
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

      const functionCalled = func.ranges.some((range) => range.count > 0);
      if (functionCalled) {
        coveredFunctions++;
      }

      for (const range of func.ranges) {
        const startLine = getLineFromOffset(source, range.startOffset);
        const endLine = getLineFromOffset(source, range.endOffset);

        for (let line = startLine; line <= endLine; line++) {
          if (range.count > 0) {
            coveredLineSet.add(line);
          }
        }
      }

      // ranges[1+] are branch blocks when isBlockCoverage is true
      if (func.isBlockCoverage && func.ranges.length > 1) {
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
  const branchCoverage = totalBranches > 0 ? (coveredBranches / totalBranches) * 100 : 0;
  const functionCoverage = totalFunctions > 0 ? (coveredFunctions / totalFunctions) * 100 : 0;

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

/** Calculates coverage summary from per-file mapped data. */
export function calculateMappedSummary(files: Map<string, MappedCoverageData>): CoverageSummary {
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
      ? (lineCoverage * totalLines +
          branchCoverage * totalBranches +
          functionCoverage * totalFunctions) /
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
