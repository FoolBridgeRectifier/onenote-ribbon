export interface CoverageRange {
  startOffset: number;
  endOffset: number;
  count: number;
}

export interface FunctionCoverage {
  functionName: string;
  ranges: CoverageRange[];
  isBlockCoverage: boolean;
}

export interface ScriptCoverage {
  scriptId: string;
  url: string;
  functions: FunctionCoverage[];
}

export interface CoverageData {
  result: ScriptCoverage[];
  timestamp: number;
}

export interface CoverageSummary {
  totalLines: number;
  coveredLines: number;
  totalBranches: number;
  coveredBranches: number;
  totalFunctions: number;
  coveredFunctions: number;
  lineCoverage: number;
  branchCoverage: number;
  functionCoverage: number;
  overallCoverage: number;
}

/** Mapped coverage data for original source files. */
export interface MappedCoverageData {
  filePath: string;
  coveredLines: Set<number>;
  uncoveredLines: Set<number>;
  coveredBranches: number;
  totalBranches: number;
  coveredFunctions: number;
  totalFunctions: number;
}

/** Result of mapping coverage from bundled code to original source. */
export interface SourceMappedCoverage {
  files: Map<string, MappedCoverageData>;
  summary: CoverageSummary;
}

/** Result of loading source files for coverage analysis. */
export interface SourceFilesResult {
  /** Map of file paths to source content */
  files: Map<string, string>;
  /** The full content of the bundled main.js file */
  bundleContent: string;
  /** Path to the bundle file */
  bundlePath: string;
}

