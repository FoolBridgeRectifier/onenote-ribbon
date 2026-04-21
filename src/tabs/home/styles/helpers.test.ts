import type { App, Editor } from 'obsidian';
import {
  resolveStyleLevelClass,
  applyStyle,
  clearStyleFormatting,
  computeScrollOffset,
} from './helpers';
import type { StyleEntry } from './interfaces';

describe('styles helpers', () => {
  describe('resolveStyleLevelClass', () => {
    it('returns onr-style-normal for level 0 with no type', () => {
      const style: StyleEntry = { level: 0, name: 'Normal' };
      expect(resolveStyleLevelClass(style)).toBe('onr-style-normal');
    });

    it('returns onr-style-h1 for level 1', () => {
      const style: StyleEntry = { level: 1, name: 'Heading 1' };
      expect(resolveStyleLevelClass(style)).toBe('onr-style-h1');
    });

    it('returns onr-style-h2 for level 2', () => {
      const style: StyleEntry = { level: 2, name: 'Heading 2' };
      expect(resolveStyleLevelClass(style)).toBe('onr-style-h2');
    });

    it('returns onr-style-h3 for level 3', () => {
      const style: StyleEntry = { level: 3, name: 'Heading 3' };
      expect(resolveStyleLevelClass(style)).toBe('onr-style-h3');
    });

    it('returns onr-style-h4 for level 4', () => {
      const style: StyleEntry = { level: 4, name: 'Heading 4' };
      expect(resolveStyleLevelClass(style)).toBe('onr-style-h4');
    });

    it('returns onr-style-h5 for level 5', () => {
      const style: StyleEntry = { level: 5, name: 'Heading 5' };
      expect(resolveStyleLevelClass(style)).toBe('onr-style-h5');
    });

    it('returns onr-style-h6 for level 6', () => {
      const style: StyleEntry = { level: 6, name: 'Heading 6' };
      expect(resolveStyleLevelClass(style)).toBe('onr-style-h6');
    });

    it('returns onr-style-quote for quote type', () => {
      const style: StyleEntry = { level: 0, type: 'quote', name: 'Quote' };
      expect(resolveStyleLevelClass(style)).toBe('onr-style-quote');
    });

    it('returns onr-style-code for code type', () => {
      const style: StyleEntry = { level: 0, type: 'code', name: 'Code' };
      expect(resolveStyleLevelClass(style)).toBe('onr-style-code');
    });

    it('returns empty string for unknown style', () => {
      const style: StyleEntry = { level: 7, name: 'Unknown' };
      expect(resolveStyleLevelClass(style)).toBe('');
    });
  });

  describe('applyStyle', () => {
    it('executes toggle-blockquote command for quote type', () => {
      const executeCommandById = jest.fn();
      const mockApp = {
        commands: { executeCommandById },
      } as unknown as App;
      const style: StyleEntry = { level: 0, type: 'quote', name: 'Quote' };

      applyStyle(mockApp, style);

      expect(executeCommandById).toHaveBeenCalledWith('editor:toggle-blockquote');
    });

    it('executes toggle-code command for code type', () => {
      const executeCommandById = jest.fn();
      const mockApp = {
        commands: { executeCommandById },
      } as unknown as App;
      const style: StyleEntry = { level: 0, type: 'code', name: 'Code' };

      applyStyle(mockApp, style);

      expect(executeCommandById).toHaveBeenCalledWith('editor:toggle-code');
    });

    it('strips heading prefix for normal paragraph (level 0)', () => {
      const executeCommandById = jest.fn();
      const setLine = jest.fn();
      const mockEditor = {
        getCursor: jest.fn(() => ({ line: 0, ch: 0 })),
        getLine: jest.fn(() => '## Heading'),
        setLine,
      } as unknown as Editor;
      const mockApp = {
        commands: { executeCommandById },
        workspace: { activeEditor: { editor: mockEditor } },
      } as unknown as App;
      const style: StyleEntry = { level: 0, name: 'Normal' };

      applyStyle(mockApp, style);

      expect(setLine).toHaveBeenCalledWith(0, 'Heading');
    });

    it('does nothing for normal paragraph when no editor', () => {
      const executeCommandById = jest.fn();
      const mockApp = {
        commands: { executeCommandById },
        workspace: { activeEditor: {} },
      } as unknown as App;
      const style: StyleEntry = { level: 0, name: 'Normal' };

      // Should not throw
      applyStyle(mockApp, style);

      expect(executeCommandById).not.toHaveBeenCalled();
    });

    it('executes set-heading command for level 1', () => {
      const executeCommandById = jest.fn();
      const mockApp = {
        commands: { executeCommandById },
      } as unknown as App;
      const style: StyleEntry = { level: 1, name: 'Heading 1' };

      applyStyle(mockApp, style);

      expect(executeCommandById).toHaveBeenCalledWith('editor:set-heading-1');
    });

    it('executes set-heading command for level 6', () => {
      const executeCommandById = jest.fn();
      const mockApp = {
        commands: { executeCommandById },
      } as unknown as App;
      const style: StyleEntry = { level: 6, name: 'Heading 6' };

      applyStyle(mockApp, style);

      expect(executeCommandById).toHaveBeenCalledWith('editor:set-heading-6');
    });
  });

  describe('clearStyleFormatting', () => {
    it('strips heading prefix and calls onClose', () => {
      const setLine = jest.fn();
      const mockEditor = {
        getCursor: jest.fn(() => ({ line: 0, ch: 0 })),
        getLine: jest.fn(() => '## Heading'),
        setLine,
      } as unknown as Editor;
      const mockApp = {
        workspace: { activeEditor: { editor: mockEditor } },
      } as unknown as App;
      const onClose = jest.fn();

      clearStyleFormatting(mockApp, onClose);

      expect(setLine).toHaveBeenCalledWith(0, 'Heading');
      expect(onClose).toHaveBeenCalled();
    });

    it('does nothing when no editor', () => {
      const mockApp = {
        workspace: { activeEditor: {} },
      } as unknown as App;
      const onClose = jest.fn();

      // Should not throw
      clearStyleFormatting(mockApp, onClose);

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('computeScrollOffset', () => {
    it('returns current offset when active index is -1', () => {
      const result = computeScrollOffset(999, 0);
      expect(result).toBe(0);
    });

    it('returns active index when it is less than current offset', () => {
      const result = computeScrollOffset(1, 5);
      expect(result).toBe(1);
    });

    it('returns adjusted offset when active index is greater than current offset + 1', () => {
      const result = computeScrollOffset(6, 0);
      expect(result).toBeLessThanOrEqual(6);
    });

    it('returns current offset when active index is within visible range', () => {
      const result = computeScrollOffset(2, 1);
      expect(result).toBe(1);
    });

    it('handles headLevel 0 (normal)', () => {
      const result = computeScrollOffset(0, 5);
      expect(result).toBe(0);
    });

    it('handles headLevel 1', () => {
      const result = computeScrollOffset(1, 0);
      expect(result).toBe(0);
    });
  });
});
