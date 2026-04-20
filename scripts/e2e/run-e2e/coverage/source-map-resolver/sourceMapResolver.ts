/**
 * Source Map Resolver
 * Extracts and parses inline source maps from bundled JavaScript
 * to map coverage positions back to original TypeScript source.
 */

import * as fs from 'fs';

import type { ParsedSourceMap, SourceMapping } from './interfaces';
import { parseSourceMap } from './helpers';

// Re-export interfaces and helpers so existing callers keep working
export type { SourceMapping, ParsedSourceMap } from './interfaces';
export { decodeVLQ } from './helpers';

/** Source map cache to avoid re-parsing the same bundle repeatedly. */
const sourceMapCache = new Map<string, ParsedSourceMap>();

/**
 * Extracts an inline source map from a JavaScript bundle.
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
 * Finds the closest source mapping for a given generated position.
 */
export function findOriginalPosition(
  sourceMap: ParsedSourceMap,
  generatedLine: number,
  generatedColumn: number,
): { sourcePath: string; line: number; column: number } | null {
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

/** Gets all original source files from the source map as a path→content map. */
export function getOriginalSourceFiles(sourceMap: ParsedSourceMap): Map<string, string> {
  const files = new Map<string, string>();

  for (let index = 0; index < sourceMap.sources.length; index++) {
    const sourcePath = sourceMap.sources[index];
    const content = sourceMap.sourcesContent[index] || '';
    files.set(sourcePath, content);
  }

  return files;
}

/** Gets or parses the source map for a bundle file, using cache for repeated calls. */
export function getSourceMapForBundle(bundlePath: string): ParsedSourceMap | null {
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

/** Clears the source map cache. */
export function clearSourceMapCache(): void {
  sourceMapCache.clear();
}

/** Converts a source path to be relative to the project src/ directory. */
export function normalizeSourcePath(
  sourcePath: string,
  rootDir: string,
): string {
  let normalized = sourcePath.replace(/^\.\.?\//, '');

  if (normalized.startsWith('src/')) {
    return normalized;
  }

  const srcIndex = normalized.indexOf('src/');
  if (srcIndex >= 0) {
    return normalized.slice(srcIndex);
  }

  return normalized;
}
