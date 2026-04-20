import * as fs from 'fs';

import type { DetailedCoverageReport } from '../interfaces';

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
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
      border-bottom: 2px solid #6b2ca6;
      padding-bottom: 10px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin: 30px 0;
    }
    .metric {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 6px;
      text-align: center;
    }
    .metric-value {
      font-size: 2em;
      font-weight: bold;
      color: #6b2ca6;
    }
    .metric-label {
      color: #666;
      margin-top: 5px;
    }
    .metric.good { border-left: 4px solid #28a745; }
    .metric.warning { border-left: 4px solid #ffc107; }
    .metric.danger { border-left: 4px solid #dc3545; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 30px;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background: #6b2ca6;
      color: white;
      font-weight: 600;
    }
    tr:hover {
      background: #f8f9fa;
    }
    .coverage-bar {
      height: 20px;
      background: #e9ecef;
      border-radius: 10px;
      overflow: hidden;
    }
    .coverage-fill {
      height: 100%;
      background: linear-gradient(90deg, #dc3545 0%, #ffc107 50%, #28a745 100%);
      transition: width 0.3s ease;
    }
    .timestamp {
      color: #666;
      font-size: 0.9em;
      margin-top: 20px;
    }
    .uncovered {
      color: #dc3545;
      font-size: 0.85em;
    }
  </style>
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
