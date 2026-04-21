import type { ObsidianEditor } from '../../../../shared/editor/styling-engine/interfaces';
import { applyFontFamily, applyFontSize } from './helpers';

// Mock dependencies
jest.mock('../../../../shared/editor/styling-engine/editor-integration/helpers', () => ({
  addTagInEditor: jest.fn(),
}));

jest.mock('../../../../shared/editor/styling-engine/tag-manipulation/TagManipulation', () => ({
  buildSpanTagDefinition: jest.fn((type, value) => ({ type, value })),
}));

import { addTagInEditor } from '../../../../shared/editor/styling-engine/editor-integration/helpers';
import { buildSpanTagDefinition } from '../../../../shared/editor/styling-engine/tag-manipulation/TagManipulation';

describe('font-picker helpers', () => {
  const mockAddTagInEditor = addTagInEditor as jest.Mock;
  const mockBuildSpanTagDefinition = buildSpanTagDefinition as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockBuildSpanTagDefinition.mockImplementation((type, value) => ({ type, value }));
  });

  describe('applyFontFamily', () => {
    it('applies font family with quotes', () => {
      const mockEditor = {} as ObsidianEditor;
      applyFontFamily(mockEditor, 'Arial');

      expect(mockBuildSpanTagDefinition).toHaveBeenCalledWith('font-family', "'Arial'");
      expect(mockAddTagInEditor).toHaveBeenCalledWith(mockEditor, {
        type: 'font-family',
        value: "'Arial'",
      });
    });

    it('handles font names with spaces', () => {
      const mockEditor = {} as ObsidianEditor;
      applyFontFamily(mockEditor, 'Times New Roman');

      expect(mockBuildSpanTagDefinition).toHaveBeenCalledWith('font-family', "'Times New Roman'");
      expect(mockAddTagInEditor).toHaveBeenCalledWith(mockEditor, {
        type: 'font-family',
        value: "'Times New Roman'",
      });
    });

    it('handles generic font families', () => {
      const mockEditor = {} as ObsidianEditor;
      applyFontFamily(mockEditor, 'sans-serif');

      expect(mockBuildSpanTagDefinition).toHaveBeenCalledWith('font-family', "'sans-serif'");
      expect(mockAddTagInEditor).toHaveBeenCalledWith(mockEditor, {
        type: 'font-family',
        value: "'sans-serif'",
      });
    });

    it('handles monospace fonts', () => {
      const mockEditor = {} as ObsidianEditor;
      applyFontFamily(mockEditor, 'Courier New');

      expect(mockBuildSpanTagDefinition).toHaveBeenCalledWith('font-family', "'Courier New'");
      expect(mockAddTagInEditor).toHaveBeenCalledWith(mockEditor, {
        type: 'font-family',
        value: "'Courier New'",
      });
    });
  });

  describe('applyFontSize', () => {
    it('applies font size with pt suffix', () => {
      const mockEditor = {} as ObsidianEditor;
      applyFontSize(mockEditor, 12);

      expect(mockBuildSpanTagDefinition).toHaveBeenCalledWith('font-size', '12pt');
      expect(mockAddTagInEditor).toHaveBeenCalledWith(mockEditor, {
        type: 'font-size',
        value: '12pt',
      });
    });

    it('handles different font sizes', () => {
      const mockEditor = {} as ObsidianEditor;
      applyFontSize(mockEditor, 16);

      expect(mockBuildSpanTagDefinition).toHaveBeenCalledWith('font-size', '16pt');
      expect(mockAddTagInEditor).toHaveBeenCalledWith(mockEditor, {
        type: 'font-size',
        value: '16pt',
      });
    });

    it('handles small font sizes', () => {
      const mockEditor = {} as ObsidianEditor;
      applyFontSize(mockEditor, 8);

      expect(mockBuildSpanTagDefinition).toHaveBeenCalledWith('font-size', '8pt');
      expect(mockAddTagInEditor).toHaveBeenCalledWith(mockEditor, {
        type: 'font-size',
        value: '8pt',
      });
    });

    it('handles large font sizes', () => {
      const mockEditor = {} as ObsidianEditor;
      applyFontSize(mockEditor, 72);

      expect(mockBuildSpanTagDefinition).toHaveBeenCalledWith('font-size', '72pt');
      expect(mockAddTagInEditor).toHaveBeenCalledWith(mockEditor, {
        type: 'font-size',
        value: '72pt',
      });
    });

    it('handles decimal font sizes', () => {
      const mockEditor = {} as ObsidianEditor;
      applyFontSize(mockEditor, 10.5);

      expect(mockBuildSpanTagDefinition).toHaveBeenCalledWith('font-size', '10.5pt');
      expect(mockAddTagInEditor).toHaveBeenCalledWith(mockEditor, {
        type: 'font-size',
        value: '10.5pt',
      });
    });
  });
});
