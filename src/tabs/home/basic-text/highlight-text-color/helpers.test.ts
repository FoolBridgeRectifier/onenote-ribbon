import type { Editor } from 'obsidian';
import {
  removeBackgroundSpanIfPresent,
  applyHighlightClick,
  applyHighlightColorSelect,
  applyHighlightNoColor,
  applyFontColorClick,
  applyFontColorSelect,
  applyFontColorNoColor,
} from './helpers';
import type { HighlightEditorState } from './interfaces';
import { DEFAULT_HIGHLIGHT_COLOR } from './constants';

// Mock dependencies
jest.mock('../../../../shared/editor/styling-engine/editor-integration/helpers', () => ({
  addTagInEditor: jest.fn(),
  removeTagInEditor: jest.fn(),
  toggleTagInEditor: jest.fn(),
}));

jest.mock('../../../../shared/editor/styling-engine/tag-manipulation/TagManipulation', () => ({
  buildSpanTagDefinition: jest.fn((type, value) => ({ type, value })),
}));

import {
  addTagInEditor,
  removeTagInEditor,
  toggleTagInEditor,
} from '../../../../shared/editor/styling-engine/editor-integration/helpers';
import { buildSpanTagDefinition } from '../../../../shared/editor/styling-engine/tag-manipulation/TagManipulation';
import { HIGHLIGHT_MD_TAG } from '../../../../shared/editor/styling-engine/constants';

describe('highlight-text-color helpers', () => {
  const mockAddTagInEditor = addTagInEditor as jest.Mock;
  const mockRemoveTagInEditor = removeTagInEditor as jest.Mock;
  const mockToggleTagInEditor = toggleTagInEditor as jest.Mock;
  const mockBuildSpanTagDefinition = buildSpanTagDefinition as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockBuildSpanTagDefinition.mockImplementation((type, value) => ({ type, value }));
  });

  describe('removeBackgroundSpanIfPresent', () => {
    it('removes background span when highlightColor is present', () => {
      const mockEditor = {} as Editor;
      removeBackgroundSpanIfPresent(mockEditor, '#ffff00');

      expect(mockRemoveTagInEditor).toHaveBeenCalledWith(mockEditor, {
        type: 'background',
        value: '#ffff00',
      });
    });

    it('does nothing when highlightColor is null', () => {
      const mockEditor = {} as Editor;
      removeBackgroundSpanIfPresent(mockEditor, null);

      expect(mockRemoveTagInEditor).not.toHaveBeenCalled();
    });

    it('does nothing when highlightColor is empty string', () => {
      const mockEditor = {} as Editor;
      removeBackgroundSpanIfPresent(mockEditor, '');

      // Empty string is falsy, so nothing happens
      expect(mockRemoveTagInEditor).not.toHaveBeenCalled();
    });
  });

  describe('applyHighlightClick', () => {
    it('toggles highlight when using default color', () => {
      const mockEditor = {} as Editor;
      const editorState: HighlightEditorState = {
        highlight: false,
        highlightColor: null,
        fontColor: null,
      };

      applyHighlightClick(mockEditor, editorState, DEFAULT_HIGHLIGHT_COLOR);

      // When using default color and no current highlight, it toggles the highlight tag
      expect(mockToggleTagInEditor).toHaveBeenCalledWith(mockEditor, HIGHLIGHT_MD_TAG);
    });

    it('removes background span when clicking same color', () => {
      const mockEditor = {} as Editor;
      const editorState: HighlightEditorState = {
        highlight: true,
        highlightColor: '#ff0000',
        fontColor: null,
      };

      applyHighlightClick(mockEditor, editorState, '#ff0000');

      expect(mockRemoveTagInEditor).toHaveBeenCalledWith(mockEditor, {
        type: 'background',
        value: '#ff0000',
      });
      expect(mockToggleTagInEditor).not.toHaveBeenCalled();
    });

    it('applies new color when different from current', () => {
      const mockEditor = {} as Editor;
      const editorState: HighlightEditorState = {
        highlight: false,
        highlightColor: '#00ff00',
        fontColor: null,
      };

      applyHighlightClick(mockEditor, editorState, '#ff0000');

      expect(mockRemoveTagInEditor).toHaveBeenCalledWith(mockEditor, HIGHLIGHT_MD_TAG);
      expect(mockRemoveTagInEditor).toHaveBeenCalledWith(mockEditor, {
        type: 'background',
        value: '#00ff00',
      });
      expect(mockAddTagInEditor).toHaveBeenCalledWith(mockEditor, {
        type: 'background',
        value: '#ff0000',
      });
    });

    it('applies new color when no current color', () => {
      const mockEditor = {} as Editor;
      const editorState: HighlightEditorState = {
        highlight: false,
        highlightColor: null,
        fontColor: null,
      };

      applyHighlightClick(mockEditor, editorState, '#ff0000');

      expect(mockRemoveTagInEditor).toHaveBeenCalledWith(mockEditor, HIGHLIGHT_MD_TAG);
      expect(mockAddTagInEditor).toHaveBeenCalledWith(mockEditor, {
        type: 'background',
        value: '#ff0000',
      });
    });
  });

  describe('applyHighlightColorSelect', () => {
    it('removes highlight tag and adds background span with selected color', () => {
      const mockEditor = {} as Editor;

      applyHighlightColorSelect(mockEditor, '#00ff00');

      expect(mockRemoveTagInEditor).toHaveBeenCalledWith(mockEditor, HIGHLIGHT_MD_TAG);
      expect(mockAddTagInEditor).toHaveBeenCalledWith(mockEditor, {
        type: 'background',
        value: '#00ff00',
      });
    });

    it('handles different color values', () => {
      const mockEditor = {} as Editor;

      applyHighlightColorSelect(mockEditor, '#123abc');

      expect(mockAddTagInEditor).toHaveBeenCalledWith(mockEditor, {
        type: 'background',
        value: '#123abc',
      });
    });
  });

  describe('applyHighlightNoColor', () => {
    it('removes highlight tag and background span', () => {
      const mockEditor = {} as Editor;

      applyHighlightNoColor(mockEditor, '#ffff00');

      expect(mockRemoveTagInEditor).toHaveBeenCalledWith(mockEditor, HIGHLIGHT_MD_TAG);
      expect(mockRemoveTagInEditor).toHaveBeenCalledWith(mockEditor, {
        type: 'background',
        value: '#ffff00',
      });
    });

    it('only removes highlight tag when no color', () => {
      const mockEditor = {} as Editor;

      applyHighlightNoColor(mockEditor, null);

      expect(mockRemoveTagInEditor).toHaveBeenCalledWith(mockEditor, HIGHLIGHT_MD_TAG);
      expect(mockRemoveTagInEditor).toHaveBeenCalledTimes(1);
    });

    it('handles empty string color', () => {
      const mockEditor = {} as Editor;

      applyHighlightNoColor(mockEditor, '');

      expect(mockRemoveTagInEditor).toHaveBeenCalledWith(mockEditor, HIGHLIGHT_MD_TAG);
      // Empty string is falsy, so background span is not removed
    });
  });

  describe('applyFontColorClick', () => {
    it('adds color span with last used font color', () => {
      const mockEditor = {} as Editor;

      applyFontColorClick(mockEditor, '#ff0000');

      expect(mockAddTagInEditor).toHaveBeenCalledWith(mockEditor, {
        type: 'color',
        value: '#ff0000',
      });
    });

    it('handles different color formats', () => {
      const mockEditor = {} as Editor;

      applyFontColorClick(mockEditor, 'rgb(255, 0, 0)');

      expect(mockAddTagInEditor).toHaveBeenCalledWith(mockEditor, {
        type: 'color',
        value: 'rgb(255, 0, 0)',
      });
    });
  });

  describe('applyFontColorSelect', () => {
    it('adds color span with selected color', () => {
      const mockEditor = {} as Editor;

      applyFontColorSelect(mockEditor, '#00ff00');

      expect(mockAddTagInEditor).toHaveBeenCalledWith(mockEditor, {
        type: 'color',
        value: '#00ff00',
      });
    });

    it('handles named colors', () => {
      const mockEditor = {} as Editor;

      applyFontColorSelect(mockEditor, 'red');

      expect(mockAddTagInEditor).toHaveBeenCalledWith(mockEditor, { type: 'color', value: 'red' });
    });
  });

  describe('applyFontColorNoColor', () => {
    it('removes color span when fontColor is present', () => {
      const mockEditor = {} as Editor;

      applyFontColorNoColor(mockEditor, '#ff0000');

      expect(mockRemoveTagInEditor).toHaveBeenCalledWith(mockEditor, {
        type: 'color',
        value: '#ff0000',
      });
    });

    it('does nothing when fontColor is null', () => {
      const mockEditor = {} as Editor;

      applyFontColorNoColor(mockEditor, null);

      expect(mockRemoveTagInEditor).not.toHaveBeenCalled();
    });

    it('does nothing when fontColor is empty string', () => {
      const mockEditor = {} as Editor;

      applyFontColorNoColor(mockEditor, '');

      // Empty string is falsy, so nothing happens
      expect(mockRemoveTagInEditor).not.toHaveBeenCalled();
    });
  });
});
