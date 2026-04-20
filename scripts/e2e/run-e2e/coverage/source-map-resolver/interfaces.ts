/** Represents a mapping from a position in generated code to original source. */
export interface SourceMapping {
  generatedLine: number;
  generatedColumn: number;
  originalLine: number;
  originalColumn: number;
  sourceIndex: number;
  nameIndex: number | null;
}

/** Parsed source map with all necessary data for resolution. */
export interface ParsedSourceMap {
  sources: string[];
  sourcesContent: string[];
  mappings: SourceMapping[];
  names: string[];
  version: number;
}
