/**
 * Coverage Report Generator
 * Generates detailed coverage reports from CDP coverage data.
 * Supports source map resolution to report coverage at original TypeScript source level.
 */

import * as fs from 'fs';
import * as path from 'path';

import type { CoverageData, CoverageSummary, SourceMappedCoverage } from './cdpCoverage';
import { mapCoverageToSource } from './cdpCoverage';

export interface FileCoverage {
  filePath: string;
  totalLines: number;
  coveredLines: number;
  totalBranches: number;
  coveredBranches: number;
  totalFunctions: number;
  coveredFunctions: number;
  lineCoverage: number;
  branchCoverage: number;
  functionCoverage: number;
  uncoveredLines: number[];
  uncoveredBranches: Array<{ line: number; type: string }>;
  uncoveredFunctions: string[];
}

export interface DetailedCoverageReport {
  summary: CoverageSummary;
  files: FileCoverage[];
  timestamp: string;
  duration: number;
  sourceMapped: boolean;
}

/**
 * Generate a detailed coverage report from CDP coverage data.
 * Uses source maps to map coverage back to original TypeScript source files.
 */
export function generateDetailedReport(
  coverageData: CoverageData,
  sourceFiles: Map<string, string>,
  duration: number,
  bundleContent?: string,
): DetailedCoverageReport {
  // If we have bundle content with source maps, use source-mapped coverage
  if (bundleContent) {
    const mappedCoverage = mapCoverageToSource(coverageData, bundleContent);
    const files = convertMappedToFileCoverage(mappedCoverage.files);

    return {
      summary: mappedCoverage.summary,
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
 * Converts mapped coverage data to FileCoverage format.
 */
function convertMappedToFileCoverage(
  mappedFiles: Map<string, { filePath: string; coveredLines: Set<number>; uncoveredLines: Set<number>; coveredBranches: number; totalBranches: number; coveredFunctions: number; totalFunctions: number }>,
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
      branchCoverage: data.totalBranches > 0 ? (data.coveredBranches / data.totalBranches) * 100 : 0,
      functionCoverage: data.totalFunctions > 0 ? (data.coveredFunctions / data.totalFunctions) * 100 : 0,
      uncoveredLines,
      uncoveredBranches: [], // Would need additional tracking for branch types
      uncoveredFunctions: [], // Would need function name tracking
    });
  }

  return files;
}

/**
 * Analyze coverage for a single file.
 */
function analyzeFileCoverage(
  script: any,
  source: string,
  filePath: string,
): FileCoverage {
  const lines = source.split('\n');
  const coveredLineSet = new Set<number>();
  const uncoveredLineSet = new Set<number>();
  const uncoveredBranches: Array<{ line: number; type: string }> = [];
  const uncoveredFunctions: string[] = [];

  let totalFunctions = 0;
  let coveredFunctions = 0;
  let totalBranches = 0;
  let coveredBranches = 0;

  for (const func of script.functions) {
    totalFunctions++;
    let functionCovered = false;

    for (const range of func.ranges) {
      const startLine = getLineFromOffset(source, range.startOffset);
      const endLine = getLineFromOffset(source, range.endOffset);

      for (let line = startLine; line <= endLine; line++) {
        if (range.count > 0) {
          coveredLineSet.add(line);
          functionCovered = true;
        } else {
          uncoveredLineSet.add(line);
        }
      }

      // Track branch coverage
      if (func.isBlockCoverage && func.ranges.length > 1) {
        totalBranches++;
        if (range.count > 0) {
          coveredBranches++;
        } else {
          uncoveredBranches.push({
            line: startLine,
            type: inferBranchType(source, startLine),
          });
        }
      }
    }

    if (functionCovered) {
      coveredFunctions++;
    } else {
      uncoveredFunctions.push(func.functionName || 'anonymous');
    }
  }

  // Determine uncovered lines (lines that exist but weren't covered)
  const uncoveredLines: number[] = [];
  for (let line = 1; line <= lines.length; line++) {
    if (!coveredLineSet.has(line) && isExecutableLine(lines[line - 1])) {
      uncoveredLines.push(line);
    }
  }

  const totalLines = lines.filter(isExecutableLine).length;
  const coveredLines = coveredLineSet.size;

  return {
    filePath,
    totalLines,
    coveredLines,
    totalBranches,
    coveredBranches,
    totalFunctions,
    coveredFunctions,
    lineCoverage: totalLines > 0 ? (coveredLines / totalLines) * 100 : 0,
    branchCoverage: totalBranches > 0 ? (coveredBranches / totalBranches) * 100 : 0,
    functionCoverage:
      totalFunctions > 0 ? (coveredFunctions / totalFunctions) * 100 : 0,
    uncoveredLines,
    uncoveredBranches,
    uncoveredFunctions,
  };
}

/**
 * Check if a line is executable (not empty, comment, or brace-only).
 */
function isExecutableLine(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length === 0) return false;
  if (trimmed.startsWith('//')) return false;
  if (trimmed.startsWith('/*') && trimmed.endsWith('*/')) return false;
  if (trimmed === '{' || trimmed === '}') return false;
  return true;
}

/**
 * Infer the type of branch from source context.
 */
function inferBranchType(source: string, line: number): string {
  const lines = source.split('\n');
  if (line <= 0 || line > lines.length) {
    return 'unknown';
  }

  const lineContent = lines[line - 1].toLowerCase();

  if (lineContent.includes('if ')) return 'if';
  if (lineContent.includes('else')) return 'else';
  if (lineContent.includes('case ')) return 'case';
  if (lineContent.includes('?')) return 'ternary';
  if (lineContent.includes('&&') || lineContent.includes('||')) {
    return 'logical';
  }
  if (lineContent.includes('catch')) return 'catch';

  return 'branch';
}

/**
 * Calculate summary from file coverages.
 */
function calculateSummaryFromFiles(files: FileCoverage[]): CoverageSummary {
  let totalLines = 0;
  let coveredLines = 0;
  let totalBranches = 0;
  let coveredBranches = 0;
  let totalFunctions = 0;
  let coveredFunctions = 0;

  for (const file of files) {
    totalLines += file.totalLines;
    coveredLines += file.coveredLines;
    totalBranches += file.totalBranches;
    coveredBranches += file.coveredBranches;
    totalFunctions += file.totalFunctions;
    coveredFunctions += file.coveredFunctions;
  }

  const lineCoverage = totalLines > 0 ? (coveredLines / totalLines) * 100 : 0;
  const branchCoverage =
    totalBranches > 0 ? (coveredBranches / totalBranches) * 100 : 0;
  const functionCoverage =
    totalFunctions > 0 ? (coveredFunctions / totalFunctions) * 100 : 0;

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
  if (url.includes('onenote-ribbon')) return true;
  if (url.endsWith('main.js') && !url.includes('node_modules')) return true;
  return false;
}

/**
 * Extract file path from URL.
 */
function extractFilePath(url: string): string {
  // Handle app://obsidian.md/... URLs
  if (url.startsWith('app://')) {
    const parts = url.split('/');
    return parts[parts.length - 1] || url;
  }
  return url;
}

/**
 * Get line number from byte offset.
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
 * Save coverage report to JSON file.
 */
export function saveReportJson(
  report: DetailedCoverageReport,
  outputPath: string,
): void {
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
}

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
 * Get CSS class based on coverage percentage.
 */
function getCoverageClass(coverage: number): string {
  if (coverage >= 80) return 'good';
  if (coverage >= 60) return 'warning';
  return 'danger';
}

/**
 * Escape HTML special characters.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/\u0026/g, '&amp;')
    .replace(/\u003c/g, '&lt;')
    .replace(/\u003e/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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
