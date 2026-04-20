import type { FileCoverage } from '../interfaces';

/**
 * Check if a line is executable (not empty, comment, or brace-only).
 */
export function isExecutableLine(line: string): boolean {
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
export function inferBranchType(source: string, line: number): string {
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
 * Get line number from byte offset.
 */
export function getLineFromOffset(source: string, offset: number): number {
  let line = 1;
  for (let index = 0; index < Math.min(offset, source.length); index++) {
    if (source[index] === '\n') {
      line++;
    }
  }
  return line;
}

/**
 * Analyze coverage for a single file.
 */
export function analyzeFileCoverage(
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
