export interface CoverageInstrumentOptions {
  /** Root directory of the project */
  rootDir: string;
  /** Files to instrument (glob patterns) */
  include?: string[];
  /** Files to exclude from instrumentation */
  exclude?: string[];
}

export interface InstrumentedFile {
  filePath: string;
  branchMap: Record<string, BranchInfo>;
  fnMap: Record<string, FunctionInfo>;
  statementMap: Record<string, StatementInfo>;
}

export interface BranchInfo {
  line: number;
  column: number;
  type: string;
  locations: Location[];
}

export interface FunctionInfo {
  name: string;
  line: number;
  column: number;
  decl: Location;
  loc: Location;
}

export interface StatementInfo {
  start: Location;
  end: Location;
}

export interface Location {
  line: number;
  column: number;
}

export interface InstrumentResult {
  code: string;
  branchMap: Record<string, BranchInfo>;
  fnMap: Record<string, FunctionInfo>;
  statementMap: Record<string, StatementInfo>;
}
export interface CoverageInstrumentOptions {
  rootDir: string;
  include?: string[];
  exclude?: string[];
}

export type SupportedLoader = 'js' | 'jsx' | 'ts' | 'tsx';

export type CoverageMetadataMap = Record<string, Record<string, unknown>>;

export interface InstrumentedFile {
  filePath: string;
  branchMap: CoverageMetadataMap;
  fnMap: CoverageMetadataMap;
  statementMap: CoverageMetadataMap;
}

export interface RawCoverageFile {
  branchMap: CoverageMetadataMap;
  fnMap: CoverageMetadataMap;
  statementMap: CoverageMetadataMap;
}