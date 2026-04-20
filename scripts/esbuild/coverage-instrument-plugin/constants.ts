// Global coverage object name injected into the bundle
export const COVERAGE_GLOBAL = '__ONR_COVERAGE__';

/** Mutable per-file instrumentation counters — reset at the start of each file. */
export const coverageCounters = {
  branch: 0,
  function: 0,
  statement: 0,
};
