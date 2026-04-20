/**
 * Tests for getOriginalSourceFiles and normalizeSourcePath.
 */

import {
  getOriginalSourceFiles,
  normalizeSourcePath,
} from './sourceMapResolver';

describe('sourceMapResolver', () => {
  describe('getOriginalSourceFiles', () => {
    it('returns map of source files', () => {
      const sourceMap = {
        version: 3,
        sources: ['a.ts', 'b.ts'],
        sourcesContent: ['content A', 'content B'],
        names: [],
        mappings: [],
      };

      const files = getOriginalSourceFiles(sourceMap);

      expect(files.size).toBe(2);
      expect(files.get('a.ts')).toBe('content A');
      expect(files.get('b.ts')).toBe('content B');
    });

    it('handles missing sourcesContent', () => {
      const sourceMap = {
        version: 3,
        sources: ['a.ts'],
        sourcesContent: [],
        names: [],
        mappings: [],
      };

      const files = getOriginalSourceFiles(sourceMap);

      expect(files.get('a.ts')).toBe('');
    });
  });

  describe('normalizeSourcePath', () => {
    it('keeps src/ paths as-is', () => {
      expect(normalizeSourcePath('src/components/Button.tsx', '/root')).toBe(
        'src/components/Button.tsx',
      );
    });

    it('extracts src/ from longer paths', () => {
      expect(normalizeSourcePath('some/path/src/utils/helpers.ts', '/root')).toBe(
        'src/utils/helpers.ts',
      );
    });

    it('removes leading ./', () => {
      expect(normalizeSourcePath('./src/main.ts', '/root')).toBe('src/main.ts');
    });

    it('handles paths without src/', () => {
      expect(normalizeSourcePath('components/App.tsx', '/root')).toBe(
        'components/App.tsx',
      );
    });
  });
});
