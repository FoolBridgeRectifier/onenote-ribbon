/**
 * Tests for decodeVLQ, extractInlineSourceMap, and findOriginalPosition.
 */

import {
  decodeVLQ,
  extractInlineSourceMap,
  findOriginalPosition,
} from './sourceMapResolver';

describe('sourceMapResolver', () => {
  describe('decodeVLQ', () => {
    it('decodes single values correctly', () => {
      // A = 0 in VLQ
      expect(decodeVLQ('A')).toEqual([0]);
      // C = 1 in VLQ
      expect(decodeVLQ('C')).toEqual([1]);
      // D = -1 in VLQ (1 << 1 | 1 = 3, signed = -1)
      expect(decodeVLQ('D')).toEqual([-1]);
    });

    it('decodes multiple values', () => {
      // Test multiple values in sequence
      const result = decodeVLQ('AA');
      expect(result.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('extractInlineSourceMap', () => {
    it('returns null when no source map exists', () => {
      const code = 'console.log("hello");';
      expect(extractInlineSourceMap(code)).toBeNull();
    });

    it('extracts and parses inline source map', () => {
      // Create a minimal valid source map
      const sourceMapObj = {
        version: 3,
        sources: ['test.ts'],
        sourcesContent: ['const x = 1;'],
        names: [],
        mappings: 'AAAA', // Single mapping at line 1, column 0
      };
      const base64 = Buffer.from(JSON.stringify(sourceMapObj)).toString('base64');
      const code = `console.log("test");\n//# sourceMappingURL=data:application/json;base64,${base64}`;

      const result = extractInlineSourceMap(code);

      expect(result).not.toBeNull();
      expect(result!.version).toBe(3);
      expect(result!.sources).toEqual(['test.ts']);
      expect(result!.sourcesContent).toEqual(['const x = 1;']);
    });

    it('handles source map with multiple sources', () => {
      const sourceMapObj = {
        version: 3,
        sources: ['src/a.ts', 'src/b.ts'],
        sourcesContent: ['export const a = 1;', 'export const b = 2;'],
        names: ['a', 'b'],
        mappings: 'AAAA,CCAA',
      };
      const base64 = Buffer.from(JSON.stringify(sourceMapObj)).toString('base64');
      const code = `//# sourceMappingURL=data:application/json;base64,${base64}`;

      const result = extractInlineSourceMap(code);

      expect(result).not.toBeNull();
      expect(result!.sources).toHaveLength(2);
      expect(result!.names).toHaveLength(2);
    });
  });

  describe('findOriginalPosition', () => {
    it('finds correct original position for generated position', () => {
      const sourceMap = {
        version: 3,
        sources: ['src/test.ts'],
        sourcesContent: ['const x = 1;\nconst y = 2;'],
        names: [],
        mappings: [
          {
            generatedLine: 1,
            generatedColumn: 0,
            originalLine: 5,
            originalColumn: 10,
            sourceIndex: 0,
            nameIndex: null,
          },
        ],
      };

      const result = findOriginalPosition(sourceMap, 1, 0);

      expect(result).not.toBeNull();
      expect(result!.sourcePath).toBe('src/test.ts');
      expect(result!.line).toBe(5);
      expect(result!.column).toBe(10);
    });

    it('returns null when no mapping exists', () => {
      const sourceMap = {
        version: 3,
        sources: ['test.ts'],
        sourcesContent: [''],
        names: [],
        mappings: [],
      };

      const result = findOriginalPosition(sourceMap, 1, 0);

      expect(result).toBeNull();
    });

    it('finds closest mapping for inexact positions', () => {
      const sourceMap = {
        version: 3,
        sources: ['test.ts'],
        sourcesContent: [''],
        names: [],
        mappings: [
          {
            generatedLine: 1,
            generatedColumn: 0,
            originalLine: 10,
            originalColumn: 0,
            sourceIndex: 0,
            nameIndex: null,
          },
          {
            generatedLine: 1,
            generatedColumn: 20,
            originalLine: 10,
            originalColumn: 20,
            sourceIndex: 0,
            nameIndex: null,
          },
        ],
      };

      // Position 15 should map to the first mapping (column 0)
      const result = findOriginalPosition(sourceMap, 1, 15);

      expect(result).not.toBeNull();
      expect(result!.line).toBe(10);
    });
  });
});
