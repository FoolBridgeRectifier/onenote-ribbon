import type {
  InstrumentResult,
  BranchInfo,
  FunctionInfo,
  StatementInfo,
} from '../interfaces';
import { COVERAGE_GLOBAL, coverageCounters } from '../constants';
import {
  instrumentFunctions,
  instrumentIfStatements,
  instrumentTernaryOperators,
} from '../instrumenters/instrumenters';
import {
  instrumentLogicalOperators,
  instrumentSwitchStatements,
} from '../instrumenters/helpers';

/**
 * Instruments source code with coverage counters.
 * Resets per-file counters and injects branch/function trackers.
 */
export function instrumentSource(source: string, filePath: string): InstrumentResult {
  const branchMap: Record<string, BranchInfo> = {};
  const fnMap: Record<string, FunctionInfo> = {};
  const statementMap: Record<string, StatementInfo> = {};

  let instrumentedCode = source;

  // Reset counters for this file
  coverageCounters.branch = 0;
  coverageCounters.function = 0;
  coverageCounters.statement = 0;

  // Get file ID for coverage tracking
  const fileId = filePath.replace(/[^a-zA-Z0-9]/g, '_');

  // Inject coverage initialization at the start of the file
  const coverageInit = `
const __coverage_${fileId} = (typeof globalThis !== 'undefined' ? globalThis : window).${COVERAGE_GLOBAL}['${filePath}'] = (typeof globalThis !== 'undefined' ? globalThis : window).${COVERAGE_GLOBAL}['${filePath}'] || { s: {}, b: {}, f: {} };
`;

  // Pattern-based instrumentation for common branch types
  // Note: This is a simplified approach. For production, consider using
  // a proper AST-based tool like istanbul-lib-instrument

  // Instrument function declarations
  instrumentedCode = instrumentFunctions(
    instrumentedCode,
    fileId,
    filePath,
    fnMap,
  );

  // Instrument if statements
  instrumentedCode = instrumentIfStatements(
    instrumentedCode,
    fileId,
    filePath,
    branchMap,
  );

  // Instrument ternary operators
  instrumentedCode = instrumentTernaryOperators(
    instrumentedCode,
    fileId,
    filePath,
    branchMap,
  );

  // Instrument logical operators (&&, ||)
  instrumentedCode = instrumentLogicalOperators(
    instrumentedCode,
    fileId,
    filePath,
    branchMap,
  );

  // Instrument switch statements
  instrumentedCode = instrumentSwitchStatements(
    instrumentedCode,
    fileId,
    filePath,
    branchMap,
  );

  return {
    code: coverageInit + instrumentedCode,
    branchMap,
    fnMap,
    statementMap,
  };
}
