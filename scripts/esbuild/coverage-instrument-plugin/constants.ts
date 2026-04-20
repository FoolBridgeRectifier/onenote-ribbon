// Global coverage object name injected into the bundle
export const COVERAGE_GLOBAL = '__ONR_COVERAGE__';

// Name registered with esbuild for this plugin
export const COVERAGE_PLUGIN_NAME = 'coverage-instrument';

// Regex filter matching TypeScript and JavaScript source files
export const SCRIPT_FILE_FILTER = /\.(ts|tsx|js|jsx)$/;

/** Mutable per-file instrumentation counters — reset at the start of each file. */
export const coverageCounters = {
  branch: 0,
  function: 0,
  statement: 0,
};
