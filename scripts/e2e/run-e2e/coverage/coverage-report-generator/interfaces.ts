import type { CoverageSummary } from '../interfaces';

export interface FileCoverage {
  filePath: string;
  totalLines: number;
  coveredLines: number;
  totalBranches: number;
  coveredBranches: number;
  totalFunctions: number;
  coveredFunctions: number;
  lineCoverage: number;
  branchCoverage: number;
  functionCoverage: number;
  uncoveredLines: number[];
  uncoveredBranches: Array<{ line: number; type: string }>;
  uncoveredFunctions: string[];
}

export interface DetailedCoverageReport {
  summary: CoverageSummary;
  files: FileCoverage[];
  timestamp: string;
  duration: number;
  sourceMapped: boolean;
}
