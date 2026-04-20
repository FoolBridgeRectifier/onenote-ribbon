import type { BranchInfo, FunctionInfo } from '../interfaces';
import { coverageCounters } from '../constants';
import { getLineNumber, getColumnNumber } from './helpers';

/** Instruments function declarations to track call counts. */
export function instrumentFunctions(
  code: string,
  fileId: string,
  filePath: string,
  fnMap: Record<string, FunctionInfo>,
): string {
  // Pattern for function declarations: function name(...) { ... }
  const functionDeclarationPattern =
    /function\s+(\w+)\s*\([^)]*\)\s*\{/g;

  // Pattern for arrow functions: const name = (...) => { ... }
  const arrowFunctionPattern =
    /(?:const|let|var)\s+(\w+)\s*=\s*(?:\([^)]*\)|[^=]+)\s*=>\s*\{/g;

  // Pattern for method definitions: methodName(...) { ... }
  const methodPattern = /(\w+)\s*\([^)]*\)\s*\{/g;

  let result = code;
  let match;

  // Instrument function declarations
  while ((match = functionDeclarationPattern.exec(code)) !== null) {
    const functionName = match[1];
    const functionId = ++coverageCounters.function;

    fnMap[functionId] = {
      name: functionName,
      line: getLineNumber(code, match.index),
      column: getColumnNumber(code, match.index),
      decl: { line: getLineNumber(code, match.index), column: 0 },
      loc: { line: getLineNumber(code, match.index), column: 0 },
    };

    // Insert coverage counter after opening brace
    const insertPos = match.index + match[0].length;
    const counterCode = `__coverage_${fileId}.f[${functionId}] = (__coverage_${fileId}.f[${functionId}] || 0) + 1; `;

    result =
      result.slice(0, insertPos) + counterCode + result.slice(insertPos);
  }

  return result;
}

/** Instruments if-statement true/false branches. */
export function instrumentIfStatements(
  code: string,
  fileId: string,
  filePath: string,
  branchMap: Record<string, BranchInfo>,
): string {
  // Pattern for if statements: if (condition) { ... }
  const ifPattern = /if\s*\(([^)]+)\)\s*\{/g;

  let result = code;
  let match;
  const matches: Array<{ index: number; length: number; condition: string }> =
    [];

  // Collect all matches first
  while ((match = ifPattern.exec(code)) !== null) {
    matches.push({
      index: match.index,
      length: match[0].length,
      condition: match[1],
    });
  }

  // Process from end to start to preserve indices
  for (let index = matches.length - 1; index >= 0; index--) {
    const matchInfo = matches[index];
    const branchId = ++coverageCounters.branch;

    branchMap[branchId] = {
      line: getLineNumber(code, matchInfo.index),
      column: getColumnNumber(code, matchInfo.index),
      type: 'if',
      locations: [
        { line: getLineNumber(code, matchInfo.index), column: 0 },
        { line: getLineNumber(code, matchInfo.index), column: 0 },
      ],
    };

    // Insert branch counters
    const insertPos = matchInfo.index + matchInfo.length;
    const trueCounter = `__coverage_${fileId}.b[${branchId}] = __coverage_${fileId}.b[${branchId}] || [0, 0]; __coverage_${fileId}.b[${branchId}][0]++; `;

    result =
      result.slice(0, insertPos) + trueCounter + result.slice(insertPos);
  }

  return result;
}

/** Instruments ternary (condition ? true : false) operators. */
export function instrumentTernaryOperators(
  code: string,
  fileId: string,
  filePath: string,
  branchMap: Record<string, BranchInfo>,
): string {
  // Pattern for ternary: condition ? trueExpr : falseExpr
  // This is complex - we wrap the entire ternary in a function
  const ternaryPattern = /(\w+)\s*\?\s*([^:]+)\s*:\s*([^;\n,]+)/g;

  let result = code;
  let match;

  while ((match = ternaryPattern.exec(code)) !== null) {
    const branchId = ++coverageCounters.branch;

    branchMap[branchId] = {
      line: getLineNumber(code, match.index),
      column: getColumnNumber(code, match.index),
      type: 'cond-expr',
      locations: [
        { line: getLineNumber(code, match.index), column: 0 },
        { line: getLineNumber(code, match.index), column: 0 },
      ],
    };

    // Replace with instrumented version
    const condition = match[1];
    const trueExpr = match[2];
    const falseExpr = match[3];

    const instrumented = `((__cov_${branchId} = ${condition}) ? (__coverage_${fileId}.b[${branchId}] = __coverage_${fileId}.b[${branchId}] || [0, 0], __coverage_${fileId}.b[${branchId}][0]++, ${trueExpr}) : (__coverage_${fileId}.b[${branchId}][1]++, ${falseExpr}))`;

    result =
      result.slice(0, match.index) +
      instrumented +
      result.slice(match.index + match[0].length);
  }

  return result;
}
