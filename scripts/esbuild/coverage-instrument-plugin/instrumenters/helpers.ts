import type { BranchInfo } from '../interfaces';
import { coverageCounters } from '../constants';

/** Returns the 1-based line number for a character index. */
export function getLineNumber(code: string, index: number): number {
  return code.slice(0, index).split('\n').length;
}

/** Returns the 0-based column number for a character index. */
export function getColumnNumber(code: string, index: number): number {
  const lines = code.slice(0, index).split('\n');
  return lines[lines.length - 1].length;
}

/** Instruments logical AND (&&) operators. */
export function instrumentLogicalOperators(
  code: string,
  fileId: string,
  filePath: string,
  branchMap: Record<string, BranchInfo>,
): string {
  // Pattern for logical AND: expr1 && expr2
  const andPattern = /(\w+)\s*&&\s*(\w+)/g;

  let result = code;
  let match;

  while ((match = andPattern.exec(code)) !== null) {
    const branchId = ++coverageCounters.branch;

    branchMap[branchId] = {
      line: getLineNumber(code, match.index),
      column: getColumnNumber(code, match.index),
      type: 'binary-expr',
      locations: [
        { line: getLineNumber(code, match.index), column: 0 },
        { line: getLineNumber(code, match.index), column: 0 },
      ],
    };

    // Wrap with instrumentation
    const left = match[1];
    const right = match[2];

    const instrumented = `((__cov_${branchId} = ${left}) ? (__coverage_${fileId}.b[${branchId}] = __coverage_${fileId}.b[${branchId}] || [0, 0], __coverage_${fileId}.b[${branchId}][0]++, ${right}) : (__coverage_${fileId}.b[${branchId}][1]++, __cov_${branchId}))`;

    result =
      result.slice(0, match.index) +
      instrumented +
      result.slice(match.index + match[0].length);
  }

  return result;
}

/** Instruments switch-case statements. */
export function instrumentSwitchStatements(
  code: string,
  fileId: string,
  filePath: string,
  branchMap: Record<string, BranchInfo>,
): string {
  // Pattern for case statements: case value:
  const casePattern = /case\s+[^:]+:/g;

  let result = code;
  let match;
  const matches: Array<{ index: number; length: number }> = [];

  while ((match = casePattern.exec(code)) !== null) {
    matches.push({ index: match.index, length: match[0].length });
  }

  // Process from end to start
  for (let index = matches.length - 1; index >= 0; index--) {
    const matchInfo = matches[index];
    const branchId = ++coverageCounters.branch;

    branchMap[branchId] = {
      line: getLineNumber(code, matchInfo.index),
      column: getColumnNumber(code, matchInfo.index),
      type: 'switch',
      locations: [
        { line: getLineNumber(code, matchInfo.index), column: 0 },
      ],
    };

    // Insert counter after case label
    const insertPos = matchInfo.index + matchInfo.length;
    const counterCode = ` __coverage_${fileId}.b[${branchId}] = __coverage_${fileId}.b[${branchId}] || [0]; __coverage_${fileId}.b[${branchId}][0]++; `;

    result =
      result.slice(0, insertPos) + counterCode + result.slice(insertPos);
  }

  return result;
}
