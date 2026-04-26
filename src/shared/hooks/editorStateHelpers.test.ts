import { buildDefaultState, deriveEditorState } from './editorStateHelpers';
import type { App, Editor } from 'obsidian';

// Mock dependencies
jest.mock('../editor/enclosing-html-tags/enclosingHtmlTags', () => ({
  createEnclosingHtmlTagFinder: jest.fn(),
}));

jest.mock(
  '../editor-v2/styling-engine/editor-integration/detect-active-tag-keys/detectActiveTagKeys',
  () => ({
    detectActiveTagKeys: jest.fn(),
  })
);

jest.mock('./spanState', () => ({
  extractSpanAndDivState: jest.fn(),
}));

import { createEnclosingHtmlTagFinder } from '../editor/enclosing-html-tags/enclosingHtmlTags';
import { detectActiveTagKeys } from '../editor-v2/styling-engine/editor-integration/detect-active-tag-keys/detectActiveTagKeys';
import { extractSpanAndDivState } from './spanState';

describe('editorStateHelpers', () => {
  const mockCreateEnclosingHtmlTagFinder = createEnclosingHtmlTagFinder as jest.Mock;
  const mockDetectActiveTagKeys = detectActiveTagKeys as jest.Mock;
  const mockExtractSpanAndDivState = extractSpanAndDivState as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('buildDefaultState', () => {
    it('returns default state with vault config values', () => {
      const mockApp = {
        vault: {
          getConfig: jest.fn((key: string) => {
            if (key === 'fontText') return 'Arial';
            if (key === 'baseFontSize') return 14;
            return undefined;
          }),
        },
      } as unknown as App;

      const state = buildDefaultState(mockApp);

      expect(state).toEqual({
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        highlight: false,
        subscript: false,
        superscript: false,
        bulletList: false,
        numberedList: false,
        headLevel: 0,
        fontFamily: 'Arial',
        fontSize: '14',
        textAlign: 'left',
        fontColor: null,
        highlightColor: null,
        activeTagKeys: new Set<string>(),
      });
    });

    it('uses fallback values when vault config is undefined', () => {
      const mockApp = {
        vault: {
          getConfig: jest.fn(() => undefined),
        },
      } as unknown as App;

      const state = buildDefaultState(mockApp);

      expect(state.fontFamily).toBe('default');
      expect(state.fontSize).toBe('16');
    });
  });

  describe('deriveEditorState', () => {
    it('returns default state when no active editor', () => {
      const mockApp = {
        workspace: {
          activeEditor: null,
        },
        vault: {
          getConfig: jest.fn(() => 'default'),
        },
      } as unknown as App;

      const state = deriveEditorState(mockApp, null, null);

      expect(state.fontFamily).toBe('default');
      expect(state.bold).toBe(false);
    });

    it('returns default state when editor is undefined', () => {
      const mockApp = {
        workspace: {
          activeEditor: {},
        },
        vault: {
          getConfig: jest.fn(() => 'default'),
        },
      } as unknown as App;

      const state = deriveEditorState(mockApp, null, null);

      expect(state.fontFamily).toBe('default');
    });

    it('derives state from enclosing tags', () => {
      const mockEditor = {
        getValue: jest.fn(() => '<b>test</b>'),
        getCursor: jest.fn(() => ({ line: 0, ch: 2 })),
        getLine: jest.fn(() => 'test'),
      } as unknown as Editor;

      const mockFinder = {
        getEnclosingTagRanges: jest.fn(() => [{ tagName: 'b', start: 0, end: 9 }]),
      };

      mockCreateEnclosingHtmlTagFinder.mockReturnValue(mockFinder);
      mockExtractSpanAndDivState.mockReturnValue({
        fontColor: null,
        highlightColor: null,
        fontFamily: 'default',
        fontSize: '16',
        textAlign: 'left',
      });
      mockDetectActiveTagKeys.mockReturnValue(new Set());

      const mockApp = {
        workspace: {
          activeEditor: { editor: mockEditor },
        },
        vault: {
          getConfig: jest.fn(() => 'default'),
        },
      } as unknown as App;

      const state = deriveEditorState(mockApp, null, null);

      expect(state.bold).toBe(true);
      expect(mockCreateEnclosingHtmlTagFinder).toHaveBeenCalledWith('<b>test</b>');
    });

    it('derives state from italic tag', () => {
      const mockEditor = {
        getValue: jest.fn(() => '<i>test</i>'),
        getCursor: jest.fn(() => ({ line: 0, ch: 2 })),
        getLine: jest.fn(() => 'test'),
      } as unknown as Editor;

      const mockFinder = {
        getEnclosingTagRanges: jest.fn(() => [{ tagName: 'i', start: 0, end: 9 }]),
      };

      mockCreateEnclosingHtmlTagFinder.mockReturnValue(mockFinder);
      mockExtractSpanAndDivState.mockReturnValue({
        fontColor: null,
        highlightColor: null,
        fontFamily: 'default',
        fontSize: '16',
        textAlign: 'left',
      });
      mockDetectActiveTagKeys.mockReturnValue(new Set());

      const mockApp = {
        workspace: {
          activeEditor: { editor: mockEditor },
        },
        vault: {
          getConfig: jest.fn(() => 'default'),
        },
      } as unknown as App;

      const state = deriveEditorState(mockApp, null, null);

      expect(state.italic).toBe(true);
    });

    it('derives state from underline tag', () => {
      const mockEditor = {
        getValue: jest.fn(() => '<u>test</u>'),
        getCursor: jest.fn(() => ({ line: 0, ch: 2 })),
        getLine: jest.fn(() => 'test'),
      } as unknown as Editor;

      const mockFinder = {
        getEnclosingTagRanges: jest.fn(() => [{ tagName: 'u', start: 0, end: 9 }]),
      };

      mockCreateEnclosingHtmlTagFinder.mockReturnValue(mockFinder);
      mockExtractSpanAndDivState.mockReturnValue({
        fontColor: null,
        highlightColor: null,
        fontFamily: 'default',
        fontSize: '16',
        textAlign: 'left',
      });
      mockDetectActiveTagKeys.mockReturnValue(new Set());

      const mockApp = {
        workspace: {
          activeEditor: { editor: mockEditor },
        },
        vault: {
          getConfig: jest.fn(() => 'default'),
        },
      } as unknown as App;

      const state = deriveEditorState(mockApp, null, null);

      expect(state.underline).toBe(true);
    });

    it('derives state from strikethrough tag', () => {
      const mockEditor = {
        getValue: jest.fn(() => '<s>test</s>'),
        getCursor: jest.fn(() => ({ line: 0, ch: 2 })),
        getLine: jest.fn(() => 'test'),
      } as unknown as Editor;

      const mockFinder = {
        getEnclosingTagRanges: jest.fn(() => [{ tagName: 's', start: 0, end: 9 }]),
      };

      mockCreateEnclosingHtmlTagFinder.mockReturnValue(mockFinder);
      mockExtractSpanAndDivState.mockReturnValue({
        fontColor: null,
        highlightColor: null,
        fontFamily: 'default',
        fontSize: '16',
        textAlign: 'left',
      });
      mockDetectActiveTagKeys.mockReturnValue(new Set());

      const mockApp = {
        workspace: {
          activeEditor: { editor: mockEditor },
        },
        vault: {
          getConfig: jest.fn(() => 'default'),
        },
      } as unknown as App;

      const state = deriveEditorState(mockApp, null, null);

      expect(state.strikethrough).toBe(true);
    });

    it('derives state from mark tag (highlight)', () => {
      const mockEditor = {
        getValue: jest.fn(() => '<mark>test</mark>'),
        getCursor: jest.fn(() => ({ line: 0, ch: 2 })),
        getLine: jest.fn(() => 'test'),
      } as unknown as Editor;

      const mockFinder = {
        getEnclosingTagRanges: jest.fn(() => [{ tagName: 'mark', start: 0, end: 14 }]),
      };

      mockCreateEnclosingHtmlTagFinder.mockReturnValue(mockFinder);
      mockExtractSpanAndDivState.mockReturnValue({
        fontColor: null,
        highlightColor: null,
        fontFamily: 'default',
        fontSize: '16',
        textAlign: 'left',
      });
      mockDetectActiveTagKeys.mockReturnValue(new Set());

      const mockApp = {
        workspace: {
          activeEditor: { editor: mockEditor },
        },
        vault: {
          getConfig: jest.fn(() => 'default'),
        },
      } as unknown as App;

      const state = deriveEditorState(mockApp, null, null);

      expect(state.highlight).toBe(true);
    });

    it('derives state from sub tag', () => {
      const mockEditor = {
        getValue: jest.fn(() => '<sub>test</sub>'),
        getCursor: jest.fn(() => ({ line: 0, ch: 2 })),
        getLine: jest.fn(() => 'test'),
      } as unknown as Editor;

      const mockFinder = {
        getEnclosingTagRanges: jest.fn(() => [{ tagName: 'sub', start: 0, end: 12 }]),
      };

      mockCreateEnclosingHtmlTagFinder.mockReturnValue(mockFinder);
      mockExtractSpanAndDivState.mockReturnValue({
        fontColor: null,
        highlightColor: null,
        fontFamily: 'default',
        fontSize: '16',
        textAlign: 'left',
      });
      mockDetectActiveTagKeys.mockReturnValue(new Set());

      const mockApp = {
        workspace: {
          activeEditor: { editor: mockEditor },
        },
        vault: {
          getConfig: jest.fn(() => 'default'),
        },
      } as unknown as App;

      const state = deriveEditorState(mockApp, null, null);

      expect(state.subscript).toBe(true);
    });

    it('derives state from sup tag', () => {
      const mockEditor = {
        getValue: jest.fn(() => '<sup>test</sup>'),
        getCursor: jest.fn(() => ({ line: 0, ch: 2 })),
        getLine: jest.fn(() => 'test'),
      } as unknown as Editor;

      const mockFinder = {
        getEnclosingTagRanges: jest.fn(() => [{ tagName: 'sup', start: 0, end: 12 }]),
      };

      mockCreateEnclosingHtmlTagFinder.mockReturnValue(mockFinder);
      mockExtractSpanAndDivState.mockReturnValue({
        fontColor: null,
        highlightColor: null,
        fontFamily: 'default',
        fontSize: '16',
        textAlign: 'left',
      });
      mockDetectActiveTagKeys.mockReturnValue(new Set());

      const mockApp = {
        workspace: {
          activeEditor: { editor: mockEditor },
        },
        vault: {
          getConfig: jest.fn(() => 'default'),
        },
      } as unknown as App;

      const state = deriveEditorState(mockApp, null, null);

      expect(state.superscript).toBe(true);
    });

    it('detects bullet list from line prefix', () => {
      const mockEditor = {
        getValue: jest.fn(() => 'test'),
        getCursor: jest.fn(() => ({ line: 0, ch: 0 })),
        getLine: jest.fn(() => '- item'),
      } as unknown as Editor;

      const mockFinder = {
        getEnclosingTagRanges: jest.fn(() => []),
      };

      mockCreateEnclosingHtmlTagFinder.mockReturnValue(mockFinder);
      mockExtractSpanAndDivState.mockReturnValue({
        fontColor: null,
        highlightColor: null,
        fontFamily: 'default',
        fontSize: '16',
        textAlign: 'left',
      });
      mockDetectActiveTagKeys.mockReturnValue(new Set());

      const mockApp = {
        workspace: {
          activeEditor: { editor: mockEditor },
        },
        vault: {
          getConfig: jest.fn(() => 'default'),
        },
      } as unknown as App;

      const state = deriveEditorState(mockApp, null, null);

      expect(state.bulletList).toBe(true);
    });

    it('detects numbered list from line prefix', () => {
      const mockEditor = {
        getValue: jest.fn(() => 'test'),
        getCursor: jest.fn(() => ({ line: 0, ch: 0 })),
        getLine: jest.fn(() => '1. item'),
      } as unknown as Editor;

      const mockFinder = {
        getEnclosingTagRanges: jest.fn(() => []),
      };

      mockCreateEnclosingHtmlTagFinder.mockReturnValue(mockFinder);
      mockExtractSpanAndDivState.mockReturnValue({
        fontColor: null,
        highlightColor: null,
        fontFamily: 'default',
        fontSize: '16',
        textAlign: 'left',
      });
      mockDetectActiveTagKeys.mockReturnValue(new Set());

      const mockApp = {
        workspace: {
          activeEditor: { editor: mockEditor },
        },
        vault: {
          getConfig: jest.fn(() => 'default'),
        },
      } as unknown as App;

      const state = deriveEditorState(mockApp, null, null);

      expect(state.numberedList).toBe(true);
    });

    it('detects heading level from line prefix', () => {
      const mockEditor = {
        getValue: jest.fn(() => 'test'),
        getCursor: jest.fn(() => ({ line: 0, ch: 0 })),
        getLine: jest.fn(() => '## Heading'),
      } as unknown as Editor;

      const mockFinder = {
        getEnclosingTagRanges: jest.fn(() => []),
      };

      mockCreateEnclosingHtmlTagFinder.mockReturnValue(mockFinder);
      mockExtractSpanAndDivState.mockReturnValue({
        fontColor: null,
        highlightColor: null,
        fontFamily: 'default',
        fontSize: '16',
        textAlign: 'left',
      });
      mockDetectActiveTagKeys.mockReturnValue(new Set());

      const mockApp = {
        workspace: {
          activeEditor: { editor: mockEditor },
        },
        vault: {
          getConfig: jest.fn(() => 'default'),
        },
      } as unknown as App;

      const state = deriveEditorState(mockApp, null, null);

      expect(state.headLevel).toBe(2);
    });

    it('uses cached finder when source text matches', () => {
      const mockEditor = {
        getValue: jest.fn(() => 'cached content'),
        getCursor: jest.fn(() => ({ line: 0, ch: 0 })),
        getLine: jest.fn(() => 'test'),
      } as unknown as Editor;

      const mockFinder = {
        getEnclosingTagRanges: jest.fn(() => []),
      };

      mockExtractSpanAndDivState.mockReturnValue({
        fontColor: null,
        highlightColor: null,
        fontFamily: 'default',
        fontSize: '16',
        textAlign: 'left',
      });
      mockDetectActiveTagKeys.mockReturnValue(new Set());

      const mockApp = {
        workspace: {
          activeEditor: { editor: mockEditor },
        },
        vault: {
          getConfig: jest.fn(() => 'default'),
        },
      } as unknown as App;

      deriveEditorState(
        mockApp,
        mockFinder as unknown as ReturnType<typeof createEnclosingHtmlTagFinder>,
        'cached content'
      );

      expect(mockCreateEnclosingHtmlTagFinder).not.toHaveBeenCalled();
    });

    it('creates new finder when source text differs', () => {
      const mockEditor = {
        getValue: jest.fn(() => 'new content'),
        getCursor: jest.fn(() => ({ line: 0, ch: 0 })),
        getLine: jest.fn(() => 'test'),
      } as unknown as Editor;

      const mockFinder = {
        getEnclosingTagRanges: jest.fn(() => []),
      };

      mockCreateEnclosingHtmlTagFinder.mockReturnValue(mockFinder);
      mockExtractSpanAndDivState.mockReturnValue({
        fontColor: null,
        highlightColor: null,
        fontFamily: 'default',
        fontSize: '16',
        textAlign: 'left',
      });
      mockDetectActiveTagKeys.mockReturnValue(new Set());

      const mockApp = {
        workspace: {
          activeEditor: { editor: mockEditor },
        },
        vault: {
          getConfig: jest.fn(() => 'default'),
        },
      } as unknown as App;

      deriveEditorState(
        mockApp,
        mockFinder as unknown as ReturnType<typeof createEnclosingHtmlTagFinder>,
        'old content'
      );

      expect(mockCreateEnclosingHtmlTagFinder).toHaveBeenCalledWith('new content');
    });

    it('sets highlight when spanState has highlightColor', () => {
      const mockEditor = {
        getValue: jest.fn(() => 'test'),
        getCursor: jest.fn(() => ({ line: 0, ch: 0 })),
        getLine: jest.fn(() => 'test'),
      } as unknown as Editor;

      const mockFinder = {
        getEnclosingTagRanges: jest.fn(() => []),
      };

      mockCreateEnclosingHtmlTagFinder.mockReturnValue(mockFinder);
      mockExtractSpanAndDivState.mockReturnValue({
        fontColor: null,
        highlightColor: '#ffff00',
        fontFamily: 'default',
        fontSize: '16',
        textAlign: 'left',
      });
      mockDetectActiveTagKeys.mockReturnValue(new Set());

      const mockApp = {
        workspace: {
          activeEditor: { editor: mockEditor },
        },
        vault: {
          getConfig: jest.fn(() => 'default'),
        },
      } as unknown as App;

      const state = deriveEditorState(mockApp, null, null);

      expect(state.highlight).toBe(true);
      expect(state.highlightColor).toBe('#ffff00');
    });

    it('includes activeTagKeys from detectActiveTagKeys', () => {
      const mockEditor = {
        getValue: jest.fn(() => 'test'),
        getCursor: jest.fn(() => ({ line: 0, ch: 0 })),
        getLine: jest.fn(() => 'test'),
      } as unknown as Editor;

      const mockFinder = {
        getEnclosingTagRanges: jest.fn(() => []),
      };

      const activeTags = new Set(['task', 'important']);

      mockCreateEnclosingHtmlTagFinder.mockReturnValue(mockFinder);
      mockExtractSpanAndDivState.mockReturnValue({
        fontColor: null,
        highlightColor: null,
        fontFamily: 'default',
        fontSize: '16',
        textAlign: 'left',
      });
      mockDetectActiveTagKeys.mockReturnValue(activeTags);

      const mockApp = {
        workspace: {
          activeEditor: { editor: mockEditor },
        },
        vault: {
          getConfig: jest.fn(() => 'default'),
        },
      } as unknown as App;

      const state = deriveEditorState(mockApp, null, null);

      expect(state.activeTagKeys).toBe(activeTags);
    });

    it('handles unknown tag names gracefully', () => {
      const mockEditor = {
        getValue: jest.fn(() => '<unknown>test</unknown>'),
        getCursor: jest.fn(() => ({ line: 0, ch: 2 })),
        getLine: jest.fn(() => 'test'),
      } as unknown as Editor;

      const mockFinder = {
        getEnclosingTagRanges: jest.fn(() => [{ tagName: 'unknown', start: 0, end: 20 }]),
      };

      mockCreateEnclosingHtmlTagFinder.mockReturnValue(mockFinder);
      mockExtractSpanAndDivState.mockReturnValue({
        fontColor: null,
        highlightColor: null,
        fontFamily: 'default',
        fontSize: '16',
        textAlign: 'left',
      });
      mockDetectActiveTagKeys.mockReturnValue(new Set());

      const mockApp = {
        workspace: {
          activeEditor: { editor: mockEditor },
        },
        vault: {
          getConfig: jest.fn(() => 'default'),
        },
      } as unknown as App;

      // Should not throw
      const state = deriveEditorState(mockApp, null, null);

      expect(state.bold).toBe(false);
    });

    it('handles empty active line', () => {
      const mockEditor = {
        getValue: jest.fn(() => ''),
        getCursor: jest.fn(() => ({ line: 0, ch: 0 })),
        getLine: jest.fn(() => ''),
      } as unknown as Editor;

      const mockFinder = {
        getEnclosingTagRanges: jest.fn(() => []),
      };

      mockCreateEnclosingHtmlTagFinder.mockReturnValue(mockFinder);
      mockExtractSpanAndDivState.mockReturnValue({
        fontColor: null,
        highlightColor: null,
        fontFamily: 'default',
        fontSize: '16',
        textAlign: 'left',
      });
      mockDetectActiveTagKeys.mockReturnValue(new Set());

      const mockApp = {
        workspace: {
          activeEditor: { editor: mockEditor },
        },
        vault: {
          getConfig: jest.fn(() => 'default'),
        },
      } as unknown as App;

      const state = deriveEditorState(mockApp, null, null);

      expect(state.bulletList).toBe(false);
      expect(state.numberedList).toBe(false);
      expect(state.headLevel).toBe(0);
    });
  });
});
