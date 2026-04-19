/**
 * Source Map Resolver
 * Extracts and parses inline source maps from bundled JavaScript
 * to map coverage positions back to original TypeScript source.
 */

import * as fs from 'fs';
import * as path from 'path';

// VLQ character mapping for source map decoding
const VLQ_BASE_SHIFT = 5;
const VLQ_BASE_MASK = (1 << VLQ_BASE_SHIFT) - 1;
const VLQ_CONTINUATION_BIT = 1 << VLQ_BASE_SHIFT;
const VLQ_BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const VLQ_BASE64_DECODE: Map<string, number> = new Map();

// Initialize base64 decode map
for (let index = 0; index < VLQ_BASE64_CHARS.length; index++) {
  VLQ_BASE64_DECODE.set(VLQ_BASE64_CHARS[index], index);
}

/**
 * Decodes a VLQ-encoded string into an array of numbers.
 */
export function decodeVLQ(encoded: string): number[] {
  const result: number[] = [];
  let currentIndex = 0;

  while (currentIndex < encoded.length) {
    let value = 0;
    let shift = 0;
    let continuation = true;

    while (continuation) {
      const char = encoded[currentIndex++];
      const digit = VLQ_BASE64_DECODE.get(char);

      if (digit === undefined) {
        throw new Error(`Invalid base64 character: ${char}`);
      }

      continuation = (digit & VLQ_CONTINUATION_BIT) !== 0;
      value += (digit & VLQ_BASE_MASK) << shift;
      shift += VLQ_BASE_SHIFT;
    }

    // Convert from unsigned to signed
    const isNegative = (value & 1) === 1;
    value = value >> 1;
    if (isNegative) {
      value = -value;
    }

    result.push(value);
  }

  return result;
}

/**
 * Represents a mapping from generated code to original source.
 */
export interface SourceMapping {
  generatedLine: number;
  generatedColumn: number;
  originalLine: number;
  originalColumn: number;
  sourceIndex: number;
  nameIndex: number | null;
}

/**
 * Parsed source map with all necessary data for resolution.
 */
export interface ParsedSourceMap {
  sources: string[];
  sourcesContent: string[];
  mappings: SourceMapping[];
  names: string[];
  version: number;
}

/**
 * Extracts inline source map from JavaScript bundle.
 * Looks for //# sourceMappingURL=data:application/json;base64,... pattern.
 */
export function extractInlineSourceMap(bundleContent: string): ParsedSourceMap | null {
  const sourceMapPattern = /\/\/#\s*sourceMappingURL=data:application\/json[^;]*;base64,([A-Za-z0-9+/=]+)/;
  const match = bundleContent.match(sourceMapPattern);

  if (!match) {
    return null;
  }

  const base64Data = match[1];
  const jsonString = Buffer.from(base64Data, 'base64').toString('utf8');

  try {
    const sourceMap = JSON.parse(jsonString) as {
      version: number;
      sources: string[];
      sourcesContent?: string[];
      names: string[];
      mappings: string;
    };

    return parseSourceMap(sourceMap);
  } catch (error) {
    console.error('Failed to parse source map:', error);
    return null;
  }
}

/**
 * Parses a source map object into a structured format with decoded mappings.
 */
function parseSourceMap(sourceMap: {
  version: number;
  sources: string[];
  sourcesContent?: string[];
  names: string[];
  mappings: string;
}): ParsedSourceMap {
  const mappings: SourceMapping[] = [];
  const sources = sourceMap.sources || [];
  const sourcesContent = sourceMap.sourcesContent || [];
  const names = sourceMap.names || [];

  // Parse the mappings string
  // Format: Each semicolon-separated group represents a line in the generated code
  // Within each group, comma-separated segments represent mappings for that line
  const lines = sourceMap.mappings.split(';');

  let currentSourceIndex = 0;
  let currentOriginalLine = 1;
  let currentOriginalColumn = 0;
  let currentNameIndex = 0;

  for (let generatedLine = 1; generatedLine <= lines.length; generatedLine++) {
    const line = lines[generatedLine - 1];
    if (!line) {
      continue;
    }

    let generatedColumn = 0;
    const segments = line.split(',');

    for (const segment of segments) {
      if (!segment) {
        continue;
      }

      const values = decodeVLQ(segment);

      // Segment format: [generatedColumnDelta, sourceIndexDelta, originalLineDelta, originalColumnDelta, nameIndexDelta?]
      if (values.length < 4) {
        continue;
      }

      generatedColumn += values[0];
      currentSourceIndex += values[1];
      currentOriginalLine += values[2];
      currentOriginalColumn += values[3];

      let nameIndex: number | null = null;
      if (values.length >= 5) {
        currentNameIndex += values[4];
        nameIndex = currentNameIndex;
      }

      mappings.push({
        generatedLine,
        generatedColumn,
        originalLine: currentOriginalLine,
        originalColumn: currentOriginalColumn,
        sourceIndex: currentSourceIndex,
        nameIndex,
      });
    }
  }

  return {
    version: sourceMap.version || 3,
    sources,
    sourcesContent,
    mappings,
    names,
  };
}

/**
 * Finds the closest source mapping for a given generated position.
 */
export function findOriginalPosition(
  sourceMap: ParsedSourceMap,
  generatedLine: number,
  generatedColumn: number,
): { sourcePath: string; line: number; column: number } | null {
  // Find the mapping that is closest to but not after the generated position
  let bestMapping: SourceMapping | null = null;
  let bestDistance = Number.MAX_SAFE_INTEGER;

  for (const mapping of sourceMap.mappings) {
    if (mapping.generatedLine > generatedLine) {
      continue;
    }

    if (mapping.generatedLine === generatedLine && mapping.generatedColumn > generatedColumn) {
      continue;
    }

    const distance =
      (generatedLine - mapping.generatedLine) * 10000 +
      (generatedColumn - mapping.generatedColumn);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestMapping = mapping;
    }
  }

  if (!bestMapping) {
    return null;
  }

  const sourcePath = sourceMap.sources[bestMapping.sourceIndex];
  if (!sourcePath) {
    return null;
  }

  return {
    sourcePath,
    line: bestMapping.originalLine,
    column: bestMapping.originalColumn,
  };
}

/**
 * Gets all original source files from the source map.
 */
export function getOriginalSourceFiles(sourceMap: ParsedSourceMap): Map<string, string> {
  const files = new Map<string, string>();

  for (let index = 0; index < sourceMap.sources.length; index++) {
    const sourcePath = sourceMap.sources[index];
    const content = sourceMap.sourcesContent[index] || '';
    files.set(sourcePath, content);
  }

  return files;
}

/**
 * Source map cache to avoid re-parsing.
 */
const sourceMapCache = new Map<string, ParsedSourceMap>();

/**
 * Gets or parses source map for a bundle file.
 */
export function getSourceMapForBundle(bundlePath: string): ParsedSourceMap | null {
  // Check cache first
  const cached = sourceMapCache.get(bundlePath);
  if (cached) {
    return cached;
  }

  if (!fs.existsSync(bundlePath)) {
    return null;
  }

  const content = fs.readFileSync(bundlePath, 'utf8');
  const sourceMap = extractInlineSourceMap(content);

  if (sourceMap) {
    sourceMapCache.set(bundlePath, sourceMap);
  }

  return sourceMap;
}

/**
 * Clears the source map cache.
 */
export function clearSourceMapCache(): void {
  sourceMapCache.clear();
}

/**
 * Converts a file path to be relative to the project root.
 */
export function normalizeSourcePath(
  sourcePath: string,
  rootDir: string,
): string {
  // Remove any leading ./ or ../
  let normalized = sourcePath.replace(/^\.\.?\//, '');

  // If it's already relative to src/, keep it as is
  if (normalized.startsWith('src/')) {
    return normalized;
  }

  // If it contains src/, extract from there
  const srcIndex = normalized.indexOf('src/');
  if (srcIndex >= 0) {
    return normalized.slice(srcIndex);
  }

  return normalized;
}
