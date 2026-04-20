import type { CoverageInstrumentOptions } from './interfaces';
import { COVERAGE_GLOBAL } from './constants';
import { instrumentSource } from './source-instrumenter/sourceInstrumenter';

export { instrumentSource };

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
