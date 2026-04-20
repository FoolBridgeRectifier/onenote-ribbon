import * as fs from 'fs';
import * as path from 'path';

import type {
  CoverageInstrumentOptions,
  InstrumentResult,
  BranchInfo,
  FunctionInfo,
  StatementInfo,
} from './interfaces';
import { COVERAGE_GLOBAL, coverageCounters } from './constants';
import {
  instrumentFunctions,
  instrumentIfStatements,
  instrumentTernaryOperators,
} from './instrumenters/instrumenters';
import {
  instrumentLogicalOperators,
  instrumentSwitchStatements,
} from './instrumenters/helpers';

/** Returns true if the file should be excluded from instrumentation. */
export function shouldSkipFile(
  filePath: string,
  options: CoverageInstrumentOptions,
): boolean {
  // Skip node_modules and test files
  if (filePath.includes('node_modules')) return true;
  if (filePath.includes('.test.')) return true;
  if (filePath.includes('__mocks__')) return true;
  if (filePath.includes('test-utils')) return true;
  if (filePath.includes('e2e/')) return true;

  // Skip based on exclude patterns
  if (options.exclude) {
    for (const pattern of options.exclude) {
      if (filePath.includes(pattern)) return true;
    }
  }

  // Check include patterns if specified
  if (options.include) {
    return !options.include.some((pattern) => filePath.includes(pattern));
  }

  return false;
}

/** Generates the JavaScript code that initializes the global coverage object. */
export function createCoverageGlobalInit(): string {
  return `
if (typeof globalThis !== 'undefined' && !globalThis.${COVERAGE_GLOBAL}) {
  globalThis.${COVERAGE_GLOBAL} = {};
}
if (typeof window !== 'undefined' && !window.${COVERAGE_GLOBAL}) {
  window.${COVERAGE_GLOBAL} = {};
}
export {};
`;
}

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
import * as fs from 'fs';
import * as path from 'path';

import {
  COVERAGE_METADATA_DIRECTORY,
  COVERAGE_METADATA_FILE,
  SCRIPT_EXTENSION_TO_LOADER,
  SKIPPED_PATH_MARKERS,
} from './constants';
import type {
  CoverageInstrumentOptions,
  InstrumentedFile,
  RawCoverageFile,
  SupportedLoader,
} from './interfaces';

function normalizePathForMatching(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

function matchesPathPatterns(
  normalizedPath: string,
  patterns?: string[],
): boolean {
  return (patterns ?? []).some((pattern) => {
    return normalizedPath.includes(normalizePathForMatching(pattern));
  });
}

export function shouldSkipFile(
  filePath: string,
  options: CoverageInstrumentOptions,
): boolean {
  const normalizedPath = normalizePathForMatching(filePath);

  if (SKIPPED_PATH_MARKERS.some((marker) => normalizedPath.includes(marker))) {
    return true;
  }

  if (matchesPathPatterns(normalizedPath, options.exclude)) {
    return true;
  }

  if (!options.include || options.include.length === 0) {
    return false;
  }

  return !matchesPathPatterns(normalizedPath, options.include);
}

export function getInstrumentLoader(filePath: string): SupportedLoader {
  const extension = path.extname(filePath).toLowerCase();

  return SCRIPT_EXTENSION_TO_LOADER[extension] ?? 'ts';
}

export function toInstrumentedFile(
  relativeFilePath: string,
  coverageFile: RawCoverageFile,
): InstrumentedFile {
  return {
    filePath: relativeFilePath,
    branchMap: coverageFile.branchMap,
    fnMap: coverageFile.fnMap,
    statementMap: coverageFile.statementMap,
  };
}

export function writeInstrumentationMetadata(
  rootDir: string,
  instrumentedFiles: Map<string, InstrumentedFile>,
): void {
  const coverageDirectory = path.join(rootDir, COVERAGE_METADATA_DIRECTORY);

  if (!fs.existsSync(coverageDirectory)) {
    fs.mkdirSync(coverageDirectory, { recursive: true });
  }

  const instrumentationFilePath = path.join(
    coverageDirectory,
    COVERAGE_METADATA_FILE,
  );
  const metadata = Object.fromEntries(instrumentedFiles.entries());

  fs.writeFileSync(
    instrumentationFilePath,
    JSON.stringify(metadata, null, 2),
  );
}