import * as fs from 'fs';

import type { DetailedCoverageReport } from '../interfaces';

import { HTML_REPORT_STYLES } from './constants';
import { getCoverageClass, escapeHtml } from './helpers';

/**
 * Generate HTML coverage report.
 */
export function generateHtmlReport(
  report: DetailedCoverageReport,
): string {
  const { summary, files } = report;

  let html = `<!DOCTYPE html>
<html>
<head>
  <title>E2E Coverage Report</title>
  <style>${HTML_REPORT_STYLES}</style>
</head>
<body>
  <div class="container">
    <h1>E2E Code Coverage Report</h1>
    
    <div class="summary">
      <div class="metric ${getCoverageClass(summary.overallCoverage)}">
        <div class="metric-value">${summary.overallCoverage.toFixed(1)}%</div>
        <div class="metric-label">Overall</div>
      </div>
      <div class="metric ${getCoverageClass(summary.lineCoverage)}">
        <div class="metric-value">${summary.lineCoverage.toFixed(1)}%</div>
        <div class="metric-label">Lines</div>
      </div>
      <div class="metric ${getCoverageClass(summary.branchCoverage)}">
        <div class="metric-value">${summary.branchCoverage.toFixed(1)}%</div>
        <div class="metric-label">Branches</div>
      </div>
      <div class="metric ${getCoverageClass(summary.functionCoverage)}">
        <div class="metric-value">${summary.functionCoverage.toFixed(1)}%</div>
        <div class="metric-label">Functions</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>File</th>
          <th>Lines</th>
          <th>Branches</th>
          <th>Functions</th>
          <th>Coverage</th>
        </tr>
      </thead>
      <tbody>
`;

  for (const file of files) {
    const avgCoverage =
      (file.lineCoverage + file.branchCoverage + file.functionCoverage) / 3;

    html += `        <tr>
          <td>${escapeHtml(file.filePath)}</td>
          <td>${file.coveredLines}/${file.totalLines}</td>
          <td>${file.coveredBranches}/${file.totalBranches}</td>
          <td>${file.coveredFunctions}/${file.totalFunctions}</td>
          <td>
            <div class="coverage-bar">
              <div class="coverage-fill" style="width: ${avgCoverage}%"></div>
            </div>
            ${avgCoverage.toFixed(1)}%
          </td>
        </tr>`;

    // Add uncovered details if any
    if (file.uncoveredLines.length > 0) {
      html += `
        <tr>
          <td colspan="5" class="uncovered">
            Uncovered lines: ${file.uncoveredLines.slice(0, 10).join(', ')}${file.uncoveredLines.length > 10 ? '...' : ''}
          </td>
        </tr>`;
    }
  }

  html += `
      </tbody>
    </table>

    <div class="timestamp">
      Generated: ${report.timestamp} | Duration: ${(report.duration / 1000).toFixed(2)}s
      ${report.sourceMapped ? '| Source Mapped (TypeScript)' : '| Bundle-level coverage'}
    </div>
  </div>
</body>
</html>`;

  return html;
}

/**
 * Save HTML report to file.
 */
export function saveHtmlReport(
  report: DetailedCoverageReport,
  outputPath: string,
): void {
  const html = generateHtmlReport(report);
  fs.writeFileSync(outputPath, html);
}

/**
 * Generate uncovered branches report.
 */
export function generateUncoveredBranchesReport(
  report: DetailedCoverageReport,
): string {
  const lines: string[] = [];

  lines.push('# Uncovered Branches Report');
  lines.push('');
  lines.push(`Generated: ${report.timestamp}`);
  lines.push('');

  for (const file of report.files) {
    if (file.uncoveredBranches.length === 0) continue;

    lines.push(`## ${file.filePath}`);
    lines.push('');

    for (const branch of file.uncoveredBranches) {
      lines.push(`- Line ${branch.line}: ${branch.type} branch`);
    }

    lines.push('');
  }

  return lines.join('\n');
}
