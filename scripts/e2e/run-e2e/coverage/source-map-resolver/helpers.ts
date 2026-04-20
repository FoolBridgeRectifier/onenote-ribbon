import type { SourceMapping, ParsedSourceMap } from './interfaces';
import {
  VLQ_BASE_SHIFT,
  VLQ_BASE_MASK,
  VLQ_CONTINUATION_BIT,
  VLQ_BASE64_DECODE,
} from './constants';

/** Decodes a VLQ-encoded string into an array of numbers. */
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

/** Parses a raw source map object into a structured format with decoded mappings. */
export function parseSourceMap(sourceMap: {
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

  // Each semicolon-separated group represents a generated code line
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

      // [generatedColumnDelta, sourceIndexDelta, originalLineDelta, originalColumnDelta, nameIndexDelta?]
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
