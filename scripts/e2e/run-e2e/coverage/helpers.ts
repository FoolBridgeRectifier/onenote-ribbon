import type { CoverageData, CoverageSummary } from './interfaces';
import { PERCENT_DISPLAY_DECIMALS } from './constants';

export function formatCoveragePercent(coveragePercent: number): string {
  return `${coveragePercent.toFixed(PERCENT_DISPLAY_DECIMALS)}%`;
}

/** Checks if a script URL belongs to the onenote-ribbon plugin. */
export function isPluginScript(url: string): boolean {
  if (url === 'plugin:onenote-ribbon') {
    return true;
  }

  if (url.includes('onenote-ribbon')) {
    return true;
  }

  // main.js is our bundled plugin when loaded from disk
  if (url.endsWith('main.js') && !url.includes('node_modules')) {
    return true;
  }

  return false;
}

/** Returns the 1-based line number corresponding to a byte offset in source. */
export function getLineFromOffset(source: string, offset: number): number {
  let line = 1;
  for (let index = 0; index < Math.min(offset, source.length); index++) {
    if (source[index] === '\n') {
      line++;
    }
  }
  return line;
}

/** Returns the 0-based column number corresponding to a byte offset in source. */
export function getColumnFromOffset(source: string, offset: number): number {
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

/** Returns true if the line contains executable code (not whitespace or comments). */
export function isExecutableLine(line: string): boolean {
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

/** Generates a text-format coverage report from a summary. */
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

/** Saves raw coverage data as JSON for further analysis. */
export function saveCoverageData(
  coverageData: CoverageData,
  outputPath: string,
): void {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require('fs') as typeof import('fs');
  fs.writeFileSync(outputPath, JSON.stringify(coverageData, null, 2));
}
