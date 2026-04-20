import * as fs from 'fs';
import * as path from 'path';

import type {
  CoverageInstrumentOptions,
  InstrumentedFile,
  RawCoverageFile,
  SupportedLoader,
  BranchInfo,
  FunctionInfo,
  StatementInfo,
} from './interfaces';
import { COVERAGE_GLOBAL } from './constants';
import { instrumentSource } from './source-instrumenter/SourceInstrumenter';

export { instrumentSource };

/** Returns true if the file should be excluded from instrumentation. */
export function shouldSkipFile(filePath: string, options: CoverageInstrumentOptions): boolean {
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

/** Returns the esbuild loader type based on the file extension. */
export function getInstrumentLoader(filePath: string): SupportedLoader {
  if (filePath.endsWith('.tsx')) return 'tsx';
  if (filePath.endsWith('.jsx')) return 'jsx';
  if (filePath.endsWith('.js')) return 'js';
  return 'ts';
}

/** Converts raw Istanbul coverage output to our InstrumentedFile shape. */
export function toInstrumentedFile(
  relativeFilePath: string,
  rawCoverage: RawCoverageFile
): InstrumentedFile {
  return {
    filePath: relativeFilePath,
    /* eslint-disable strict-structure/no-double-cast -- Istanbul's raw JSON uses numeric-keyed `{ [n]: T }` maps; cast to Record<string, T> is safe and avoids an index-signature shim */
    branchMap: rawCoverage.branchMap as unknown as Record<string, BranchInfo>,
    fnMap: rawCoverage.fnMap as unknown as Record<string, FunctionInfo>,
    statementMap: rawCoverage.statementMap as unknown as Record<string, StatementInfo>,
    /* eslint-enable strict-structure/no-double-cast */
  };
}

/** Writes instrumentation metadata JSON to the .coverage-meta directory. */
export function writeInstrumentationMetadata(
  rootDir: string,
  instrumentedFiles: Map<string, InstrumentedFile>
): void {
  const coverageMetaDir = path.join(rootDir, '.coverage-meta');
  if (!fs.existsSync(coverageMetaDir)) {
    fs.mkdirSync(coverageMetaDir, { recursive: true });
  }

  const metadata: Record<string, InstrumentedFile> = {};
  instrumentedFiles.forEach((value, key) => {
    metadata[key] = value;
  });

  fs.writeFileSync(
    path.join(coverageMetaDir, 'instrumentation.json'),
    JSON.stringify(metadata, null, 2)
  );
}
