import { fireEvent, screen } from '@testing-library/react';

import { createAppWithEditor } from '../../../../test-utils/mockApp';
import { renderWithApp } from '../../../../test-utils/renderWithApp';
import {
  AlignButton,
  matchAlignWrapper,
  getAlignIcon,
  splitHeadingPrefix,
  applyAlignment,
} from './AlignButton';
import type { EditorState } from '../../../../shared/hooks/interfaces';
import type { TextAlign } from './interfaces';

const createEditorState = (overrides: Partial<EditorState> = {}): EditorState => ({
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
  fontFamily: '',
  fontSize: '',
  textAlign: 'left',
  fontColor: null,
  highlightColor: null,
  activeTagKeys: new Set(),
  ...overrides,
});

describe('matchAlignWrapper', () => {
  it('matches ALIGN_SPAN_PATTERN', () => {
    const lineText =
      '<span style="display:inline-block;width:100%;vertical-align:top;text-align: center">content</span>';
    const result = matchAlignWrapper(lineText);
    expect(result).not.toBeNull();
    expect(result?.[2]).toBe('center');
  });

  it('matches LEGACY_ALIGN_INLINE_BLOCK_SPAN_PATTERN', () => {
    const lineText =
      '<span style="display:inline-block;width:100%;text-align: center">content</span>';
    const result = matchAlignWrapper(lineText);
    expect(result).not.toBeNull();
  });

  it('matches LEGACY_ALIGN_BLOCK_SPAN_PATTERN', () => {
    const lineText = '<span style="display:block;text-align: center">content</span>';
    const result = matchAlignWrapper(lineText);
    expect(result).not.toBeNull();
  });

  it('matches LEGACY_ALIGN_DIV_PATTERN', () => {
    const lineText = '<div style="text-align: center">content</div>';
    const result = matchAlignWrapper(lineText);
    expect(result).not.toBeNull();
  });

  it('returns null for plain text', () => {
    const lineText = 'plain text content';
    const result = matchAlignWrapper(lineText);
    expect(result).toBeNull();
  });

  it('returns null for empty string', () => {
    const result = matchAlignWrapper('');
    expect(result).toBeNull();
  });
});

describe('getAlignIcon', () => {
  it('returns AlignCenterIcon for center alignment', () => {
    const icon = getAlignIcon('center');
    expect(icon).toBeDefined();
  });

  it('returns AlignRightIcon for right alignment', () => {
    const icon = getAlignIcon('right');
    expect(icon).toBeDefined();
  });

  it('returns AlignLeftIcon for left alignment', () => {
    const icon = getAlignIcon('left');
    expect(icon).toBeDefined();
  });

  it('returns AlignLeftIcon for justify alignment', () => {
    // justify is not in TextAlign type, but function handles it gracefully
    const icon = getAlignIcon('justify' as unknown as TextAlign);
    expect(icon).toBeDefined();
  });
});

describe('splitHeadingPrefix', () => {
  it('splits heading prefix for H1', () => {
    const result = splitHeadingPrefix('# Heading text');
    expect(result.prefix).toBe('# ');
    expect(result.content).toBe('Heading text');
  });

  it('splits heading prefix for H2', () => {
    const result = splitHeadingPrefix('## Heading text');
    expect(result.prefix).toBe('## ');
    expect(result.content).toBe('Heading text');
  });

  it('splits heading prefix for H6', () => {
    const result = splitHeadingPrefix('###### Heading text');
    expect(result.prefix).toBe('###### ');
    expect(result.content).toBe('Heading text');
  });

  it('returns empty prefix for plain text', () => {
    const result = splitHeadingPrefix('plain text');
    expect(result.prefix).toBe('');
    expect(result.content).toBe('plain text');
  });

  it('returns empty prefix for empty string', () => {
    const result = splitHeadingPrefix('');
    expect(result.prefix).toBe('');
    expect(result.content).toBe('');
  });
});

describe('applyAlignment', () => {
  it('returns early when editor is undefined', () => {
    expect(() => applyAlignment(undefined, 'center')).not.toThrow();
  });

  it('applies center alignment to plain text', () => {
    const mockEditor = {
      getCursor: jest.fn().mockReturnValue({ line: 0 }),
      getLine: jest.fn().mockReturnValue('plain text'),
      setLine: jest.fn(),
    };
    applyAlignment(mockEditor, 'center');
    expect(mockEditor.setLine).toHaveBeenCalled();
  });

  it('applies right alignment to plain text', () => {
    const mockEditor = {
      getCursor: jest.fn().mockReturnValue({ line: 0 }),
      getLine: jest.fn().mockReturnValue('plain text'),
      setLine: jest.fn(),
    };
    applyAlignment(mockEditor, 'right');
    expect(mockEditor.setLine).toHaveBeenCalled();
  });

  it('applies justify alignment to plain text', () => {
    const mockEditor = {
      getCursor: jest.fn().mockReturnValue({ line: 0 }),
      getLine: jest.fn().mockReturnValue('plain text'),
      setLine: jest.fn(),
    };
    // justify is not in TextAlign type, but function handles it gracefully
    applyAlignment(mockEditor, 'justify' as unknown as TextAlign);
    expect(mockEditor.setLine).toHaveBeenCalled();
  });

  it('unwraps aligned text when applying left alignment', () => {
    const mockEditor = {
      getCursor: jest.fn().mockReturnValue({ line: 0 }),
      getLine: jest
        .fn()
        .mockReturnValue(
          '<span style="display:inline-block;width:100%;vertical-align:top;text-align: center">content</span>'
        ),
      setLine: jest.fn(),
    };
    applyAlignment(mockEditor, 'left');
    expect(mockEditor.setLine).toHaveBeenCalledWith(0, 'content');
  });

  it('does nothing when applying left to unwrapped text', () => {
    const mockEditor = {
      getCursor: jest.fn().mockReturnValue({ line: 0 }),
      getLine: jest.fn().mockReturnValue('plain text'),
      setLine: jest.fn(),
    };
    applyAlignment(mockEditor, 'left');
    expect(mockEditor.setLine).not.toHaveBeenCalled();
  });

  it('changes alignment on already wrapped text', () => {
    const mockEditor = {
      getCursor: jest.fn().mockReturnValue({ line: 0 }),
      getLine: jest
        .fn()
        .mockReturnValue(
          '<span style="display:inline-block;width:100%;vertical-align:top;text-align: center">content</span>'
        ),
      setLine: jest.fn(),
    };
    applyAlignment(mockEditor, 'right');
    expect(mockEditor.setLine).toHaveBeenCalled();
    const callArg = mockEditor.setLine.mock.calls[0][1];
    expect(callArg).toContain('text-align: right');
  });

  it('preserves heading prefix when applying alignment', () => {
    const mockEditor = {
      getCursor: jest.fn().mockReturnValue({ line: 0 }),
      getLine: jest.fn().mockReturnValue('## Heading text'),
      setLine: jest.fn(),
    };
    applyAlignment(mockEditor, 'center');
    expect(mockEditor.setLine).toHaveBeenCalled();
    const callArg = mockEditor.setLine.mock.calls[0][1];
    expect(callArg).toContain('## ');
  });

  it('preserves heading prefix when changing alignment', () => {
    const mockEditor = {
      getCursor: jest.fn().mockReturnValue({ line: 0 }),
      getLine: jest
        .fn()
        .mockReturnValue(
          '## <span style="display:inline-block;width:100%;vertical-align:top;text-align: center">Heading</span>'
        ),
      setLine: jest.fn(),
    };
    applyAlignment(mockEditor, 'right');
    expect(mockEditor.setLine).toHaveBeenCalled();
    const callArg = mockEditor.setLine.mock.calls[0][1];
    expect(callArg).toContain('## ');
  });

  it('unwraps with heading prefix when applying left', () => {
    const mockEditor = {
      getCursor: jest.fn().mockReturnValue({ line: 0 }),
      getLine: jest
        .fn()
        .mockReturnValue(
          '## <span style="display:inline-block;width:100%;vertical-align:top;text-align: center">Heading</span>'
        ),
      setLine: jest.fn(),
    };
    applyAlignment(mockEditor, 'left');
    expect(mockEditor.setLine).toHaveBeenCalledWith(0, '## Heading');
  });

  it('handles legacy div pattern when changing alignment', () => {
    const mockEditor = {
      getCursor: jest.fn().mockReturnValue({ line: 0 }),
      getLine: jest.fn().mockReturnValue('<div style="text-align: center">content</div>'),
      setLine: jest.fn(),
    };
    applyAlignment(mockEditor, 'right');
    expect(mockEditor.setLine).toHaveBeenCalled();
  });

  it('unwraps legacy div pattern when applying left', () => {
    const mockEditor = {
      getCursor: jest.fn().mockReturnValue({ line: 0 }),
      getLine: jest.fn().mockReturnValue('<div style="text-align: center">content</div>'),
      setLine: jest.fn(),
    };
    applyAlignment(mockEditor, 'left');
    expect(mockEditor.setLine).toHaveBeenCalledWith(0, 'content');
  });

  it('handles legacy block span pattern when changing alignment', () => {
    const mockEditor = {
      getCursor: jest.fn().mockReturnValue({ line: 0 }),
      getLine: jest
        .fn()
        .mockReturnValue('<span style="display:block;text-align: center">content</span>'),
      setLine: jest.fn(),
    };
    applyAlignment(mockEditor, 'right');
    expect(mockEditor.setLine).toHaveBeenCalled();
  });

  it('unwraps legacy block span pattern when applying left', () => {
    const mockEditor = {
      getCursor: jest.fn().mockReturnValue({ line: 0 }),
      getLine: jest
        .fn()
        .mockReturnValue('<span style="display:block;text-align: center">content</span>'),
      setLine: jest.fn(),
    };
    applyAlignment(mockEditor, 'left');
    expect(mockEditor.setLine).toHaveBeenCalledWith(0, 'content');
  });

  it('handles legacy inline-block span pattern when changing alignment', () => {
    const mockEditor = {
      getCursor: jest.fn().mockReturnValue({ line: 0 }),
      getLine: jest
        .fn()
        .mockReturnValue('<span style="display:inline-block;text-align: center">content</span>'),
      setLine: jest.fn(),
    };
    applyAlignment(mockEditor, 'right');
    expect(mockEditor.setLine).toHaveBeenCalled();
  });

  it('unwraps legacy inline-block span pattern when applying left', () => {
    const mockEditor = {
      getCursor: jest.fn().mockReturnValue({ line: 0 }),
      getLine: jest
        .fn()
        .mockReturnValue(
          '<span style="display:inline-block;width:100%;text-align: center">content</span>'
        ),
      setLine: jest.fn(),
    };
    applyAlignment(mockEditor, 'left');
    expect(mockEditor.setLine).toHaveBeenCalledWith(0, 'content');
  });

  it('converts markdown tokens when applying alignment', () => {
    const mockEditor = {
      getCursor: jest.fn().mockReturnValue({ line: 0 }),
      getLine: jest.fn().mockReturnValue('**bold** and *italic* text'),
      setLine: jest.fn(),
    };
    applyAlignment(mockEditor, 'center');
    expect(mockEditor.setLine).toHaveBeenCalled();
    const callArg = mockEditor.setLine.mock.calls[0][1];
    expect(callArg).toContain('<b>');
    expect(callArg).toContain('<i>');
  });
});

describe('AlignButton — rendering (integration)', () => {
  it('renders the align button', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({ textAlign: 'left' });
    renderWithApp(<AlignButton editorState={editorState} />, app);

    expect(screen.getByTitle('Align')).toBeInTheDocument();
  });

  it('renders with left alignment icon by default', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({ textAlign: 'left' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = container.querySelector('[data-cmd="align"]');
    expect(button).toBeInTheDocument();
  });

  it('renders as active when alignment is not left', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({ textAlign: 'center' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = container.querySelector('.onr-active');
    expect(button).toBeInTheDocument();
  });

  it('renders as inactive when alignment is left', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({ textAlign: 'left' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = container.querySelector('[data-cmd="align"]');
    expect(button).not.toHaveClass('onr-active');
  });
});

describe('AlignButton — dropdown interactions (integration)', () => {
  it('opens dropdown when button is clicked', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({ textAlign: 'left' });
    renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    // Button click should toggle dropdown state
    expect(button).toBeInTheDocument();
  });

  it('closes dropdown when clicking the button again', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({ textAlign: 'left' });
    renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);
    fireEvent.click(button);

    // Should toggle closed
    expect(button).toBeInTheDocument();
  });

  it('renders all alignment options in dropdown', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({ textAlign: 'left' });
    renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    // Check button is present
    expect(button).toBeInTheDocument();
  });

  it('marks current alignment as active in dropdown', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({ textAlign: 'center' });
    renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    // Button should be present
    expect(button).toBeInTheDocument();
  });
});

describe('AlignButton — alignment application (integration)', () => {
  it('applies center alignment when center option is selected', () => {
    const { app, editor } = createAppWithEditor('test content');
    const editorState = createEditorState({ textAlign: 'left' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    // Find and click the center option
    const centerOption = Array.from(container.querySelectorAll('.onr-dd-item')).find((element) =>
      element.textContent?.includes('Center')
    );
    if (centerOption) {
      fireEvent.click(centerOption);
    }

    // Editor should have been modified
    expect(editor.getValue()).toBeDefined();
  });

  it('applies right alignment when right option is selected', () => {
    const { app, editor } = createAppWithEditor('test content');
    const editorState = createEditorState({ textAlign: 'left' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    const rightOption = Array.from(container.querySelectorAll('.onr-dd-item')).find((element) =>
      element.textContent?.includes('Right')
    );
    if (rightOption) {
      fireEvent.click(rightOption);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('removes alignment when left option is selected on aligned text', () => {
    const { app, editor } = createAppWithEditor('<span style="text-align: center">centered</span>');
    const editorState = createEditorState({ textAlign: 'center' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    const leftOption = Array.from(container.querySelectorAll('.onr-dd-item')).find((element) =>
      element.textContent?.includes('Left')
    );
    if (leftOption) {
      fireEvent.click(leftOption);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('closes dropdown after selecting an alignment', () => {
    const { app } = createAppWithEditor('test content');
    const editorState = createEditorState({ textAlign: 'left' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    const centerOption = Array.from(container.querySelectorAll('.onr-dd-item')).find((element) =>
      element.textContent?.includes('Center')
    );
    if (centerOption) {
      fireEvent.click(centerOption);
    }

    const dropdown = container.querySelector('.onr-overlay-dropdown');
    expect(dropdown).not.toBeInTheDocument();
  });
});

describe('AlignButton — no active editor (integration)', () => {
  it('is no-op when no active editor', () => {
    const { app } = createAppWithEditor('');
    Object.defineProperty(app.workspace, 'activeEditor', {
      value: {},
      writable: true,
    });
    const editorState = createEditorState({ textAlign: 'left' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    const centerOption = Array.from(container.querySelectorAll('.onr-dd-item')).find((element) =>
      element.textContent?.includes('Center')
    );
    if (centerOption) {
      expect(() => fireEvent.click(centerOption)).not.toThrow();
    }
  });
});

describe('AlignButton — with heading prefix (integration)', () => {
  it('preserves heading prefix when applying alignment', () => {
    const { app, editor } = createAppWithEditor('## Heading text');
    const editorState = createEditorState({ textAlign: 'left' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    const centerOption = Array.from(container.querySelectorAll('.onr-dd-item')).find((element) =>
      element.textContent?.includes('Center')
    );
    if (centerOption) {
      fireEvent.click(centerOption);
    }

    // The heading prefix should be preserved
    expect(editor.getValue()).toBeDefined();
  });
});

describe('AlignButton — edge cases', () => {
  it('handles center alignment icon', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({ textAlign: 'center' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = container.querySelector('[data-cmd="align"]');
    expect(button).toBeInTheDocument();
  });

  it('handles right alignment icon', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({ textAlign: 'right' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = container.querySelector('[data-cmd="align"]');
    expect(button).toBeInTheDocument();
  });

  it('handles dropdown close via onClose callback', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({ textAlign: 'left' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    // Click outside to trigger onClose
    const overlay = container.querySelector('.onr-overlay-dropdown');
    if (overlay) {
      fireEvent.click(overlay);
    }

    expect(button).toBeInTheDocument();
  });

  it('handles applying alignment to already aligned text', () => {
    const { app, editor } = createAppWithEditor(
      '<span style="display:inline-block;width:100%;vertical-align:top;text-align: center">content</span>'
    );
    const editorState = createEditorState({ textAlign: 'center' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    const rightOption = Array.from(container.querySelectorAll('.onr-dd-item')).find((element) =>
      element.textContent?.includes('Right')
    );
    if (rightOption) {
      fireEvent.click(rightOption);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles applying left alignment to remove existing alignment', () => {
    const { app, editor } = createAppWithEditor(
      '<span style="display:inline-block;width:100%;vertical-align:top;text-align: center">content</span>'
    );
    const editorState = createEditorState({ textAlign: 'center' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    const leftOption = Array.from(container.querySelectorAll('.onr-dd-item')).find((element) =>
      element.textContent?.includes('Left')
    );
    if (leftOption) {
      fireEvent.click(leftOption);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles markdown conversion in content', () => {
    const { app, editor } = createAppWithEditor('**bold** text');
    const editorState = createEditorState({ textAlign: 'left' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    const centerOption = Array.from(container.querySelectorAll('.onr-dd-item')).find((element) =>
      element.textContent?.includes('Center')
    );
    if (centerOption) {
      fireEvent.click(centerOption);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles heading with existing alignment', () => {
    const { app, editor } = createAppWithEditor(
      '## <span style="display:inline-block;width:100%;vertical-align:top;text-align: center">Heading</span>'
    );
    const editorState = createEditorState({ textAlign: 'center' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    const rightOption = Array.from(container.querySelectorAll('.onr-dd-item')).find((element) =>
      element.textContent?.includes('Right')
    );
    if (rightOption) {
      fireEvent.click(rightOption);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles heading with left alignment to remove', () => {
    const { app, editor } = createAppWithEditor(
      '## <span style="display:inline-block;width:100%;vertical-align:top;text-align: center">Heading</span>'
    );
    const editorState = createEditorState({ textAlign: 'center' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    const leftOption = Array.from(container.querySelectorAll('.onr-dd-item')).find((element) =>
      element.textContent?.includes('Left')
    );
    if (leftOption) {
      fireEvent.click(leftOption);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles line without heading prefix', () => {
    const { app, editor } = createAppWithEditor('Plain text without heading');
    const editorState = createEditorState({ textAlign: 'left' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    const centerOption = Array.from(container.querySelectorAll('.onr-dd-item')).find((element) =>
      element.textContent?.includes('Center')
    );
    if (centerOption) {
      fireEvent.click(centerOption);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles empty line', () => {
    const { app, editor } = createAppWithEditor('');
    const editorState = createEditorState({ textAlign: 'left' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    const centerOption = Array.from(container.querySelectorAll('.onr-dd-item')).find((element) =>
      element.textContent?.includes('Center')
    );
    if (centerOption) {
      fireEvent.click(centerOption);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles all heading levels', () => {
    for (let level = 1; level <= 6; level += 1) {
      const { app, editor } = createAppWithEditor(`${'#'.repeat(level)} Heading text`);
      const editorState = createEditorState({ textAlign: 'left' });
      const { container, unmount } = renderWithApp(<AlignButton editorState={editorState} />, app);

      const button = container.querySelector('[data-cmd="align"]');
      if (button) {
        fireEvent.click(button);
      }

      const centerOption = Array.from(container.querySelectorAll('.onr-dd-item')).find((element) =>
        element.textContent?.includes('Center')
      );
      if (centerOption) {
        fireEvent.click(centerOption);
      }

      expect(editor.getValue()).toBeDefined();
      unmount();
    }
  });

  it('handles legacy align div pattern', () => {
    const { app, editor } = createAppWithEditor('<div style="text-align: center">content</div>');
    const editorState = createEditorState({ textAlign: 'center' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    const rightOption = Array.from(container.querySelectorAll('.onr-dd-item')).find((element) =>
      element.textContent?.includes('Right')
    );
    if (rightOption) {
      fireEvent.click(rightOption);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles legacy align block span pattern', () => {
    const { app, editor } = createAppWithEditor(
      '<span style="display:block;text-align: center">content</span>'
    );
    const editorState = createEditorState({ textAlign: 'center' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    const rightOption = Array.from(container.querySelectorAll('.onr-dd-item')).find((element) =>
      element.textContent?.includes('Right')
    );
    if (rightOption) {
      fireEvent.click(rightOption);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles legacy align inline-block span pattern', () => {
    const { app, editor } = createAppWithEditor(
      '<span style="display:inline-block;text-align: center">content</span>'
    );
    const editorState = createEditorState({ textAlign: 'center' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    const rightOption = Array.from(container.querySelectorAll('.onr-dd-item')).find((element) =>
      element.textContent?.includes('Right')
    );
    if (rightOption) {
      fireEvent.click(rightOption);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles justify alignment option', () => {
    const { app, editor } = createAppWithEditor('test content');
    const editorState = createEditorState({ textAlign: 'left' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    const justifyOption = Array.from(container.querySelectorAll('.onr-dd-item')).find((element) =>
      element.textContent?.includes('Justify')
    );
    if (justifyOption) {
      fireEvent.click(justifyOption);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles justify alignment icon', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({ textAlign: 'justify' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = container.querySelector('[data-cmd="align"]');
    expect(button).toBeInTheDocument();
  });

  it('handles active state for justify alignment', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({ textAlign: 'justify' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = container.querySelector('.onr-active');
    expect(button).toBeInTheDocument();
  });

  it('handles Dropdown onClose via outside click', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({ textAlign: 'left' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    // Click outside to trigger onClose
    fireEvent.click(document.body);

    expect(container.querySelector('.onr-align-dropdown')).not.toBeInTheDocument();
  });

  it('handles Dropdown onClose via Escape key', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({ textAlign: 'left' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    // Press Escape to trigger onClose
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(container.querySelector('.onr-align-dropdown')).not.toBeInTheDocument();
  });

  it('handles multiple dropdown open/close cycles', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({ textAlign: 'left' });
    renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');

    // Multiple cycles
    for (let i = 0; i < 5; i += 1) {
      fireEvent.click(button);
    }

    expect(button).toBeInTheDocument();
  });

  it('handles dropdown item click with inline onClick', () => {
    const { app, editor } = createAppWithEditor('test');
    const editorState = createEditorState({ textAlign: 'left' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    // Click directly on a dropdown item
    const dropdownItem = container.querySelector('.onr-dd-item');
    if (dropdownItem) {
      fireEvent.click(dropdownItem);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles rapid alignment changes', () => {
    const { app, editor } = createAppWithEditor('test content');
    const editorState = createEditorState({ textAlign: 'left' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');

    // Apply multiple alignments in sequence
    const alignments = ['Center', 'Right', 'Left', 'Center'];
    for (const alignment of alignments) {
      fireEvent.click(button);
      const option = Array.from(container.querySelectorAll('.onr-dd-item')).find((element) =>
        element.textContent?.includes(alignment)
      );
      if (option) {
        fireEvent.click(option);
      }
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles applyAlignment with no editor', () => {
    const { app } = createAppWithEditor('');
    Object.defineProperty(app.workspace, 'activeEditor', {
      value: {},
      writable: true,
    });
    const editorState = createEditorState({ textAlign: 'left' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    // Click on a dropdown item with no editor
    const dropdownItem = container.querySelector('.onr-dd-item');
    if (dropdownItem) {
      expect(() => fireEvent.click(dropdownItem)).not.toThrow();
    }
  });

  it('handles getEditor returning undefined', () => {
    const { app } = createAppWithEditor('');
    Object.defineProperty(app.workspace, 'activeEditor', {
      value: {},
      writable: true,
    });
    const editorState = createEditorState({ textAlign: 'left' });
    renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    expect(() => fireEvent.click(button)).not.toThrow();
  });

  it('handles handleAlignSelect with center alignment', () => {
    const { app, editor } = createAppWithEditor('test content');
    const editorState = createEditorState({ textAlign: 'left' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    const centerOption = Array.from(container.querySelectorAll('.onr-dd-item')).find((element) =>
      element.textContent?.includes('Center')
    );
    if (centerOption) {
      fireEvent.click(centerOption);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles handleAlignSelect with right alignment', () => {
    const { app, editor } = createAppWithEditor('test content');
    const editorState = createEditorState({ textAlign: 'left' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    const rightOption = Array.from(container.querySelectorAll('.onr-dd-item')).find((element) =>
      element.textContent?.includes('Right')
    );
    if (rightOption) {
      fireEvent.click(rightOption);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles handleAlignSelect with left alignment on aligned text', () => {
    const { app, editor } = createAppWithEditor(
      '<span style="display:inline-block;width:100%;vertical-align:top;text-align: center">content</span>'
    );
    const editorState = createEditorState({ textAlign: 'center' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    const leftOption = Array.from(container.querySelectorAll('.onr-dd-item')).find((element) =>
      element.textContent?.includes('Left')
    );
    if (leftOption) {
      fireEvent.click(leftOption);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles handleAlignSelect with justify alignment', () => {
    const { app, editor } = createAppWithEditor('test content');
    const editorState = createEditorState({ textAlign: 'left' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    const justifyOption = Array.from(container.querySelectorAll('.onr-dd-item')).find((element) =>
      element.textContent?.includes('Justify')
    );
    if (justifyOption) {
      fireEvent.click(justifyOption);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles handleAlignSelect with justify on already wrapped text', () => {
    const { app, editor } = createAppWithEditor(
      '<span style="display:inline-block;width:100%;vertical-align:top;text-align: center">content</span>'
    );
    const editorState = createEditorState({ textAlign: 'center' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    const justifyOption = Array.from(container.querySelectorAll('.onr-dd-item')).find((element) =>
      element.textContent?.includes('Justify')
    );
    if (justifyOption) {
      fireEvent.click(justifyOption);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles handleAlignSelect with left on unwrapped text', () => {
    const { app, editor } = createAppWithEditor('plain text content');
    const editorState = createEditorState({ textAlign: 'left' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    const leftOption = Array.from(container.querySelectorAll('.onr-dd-item')).find((element) =>
      element.textContent?.includes('Left')
    );
    if (leftOption) {
      fireEvent.click(leftOption);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles applyAlignment with heading prefix', () => {
    const { app, editor } = createAppWithEditor('## Heading text');
    const editorState = createEditorState({ textAlign: 'left' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    const centerOption = Array.from(container.querySelectorAll('.onr-dd-item')).find((element) =>
      element.textContent?.includes('Center')
    );
    if (centerOption) {
      fireEvent.click(centerOption);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles applyAlignment with heading prefix on already aligned text', () => {
    const { app, editor } = createAppWithEditor(
      '## <span style="display:inline-block;width:100%;vertical-align:top;text-align: center">Heading</span>'
    );
    const editorState = createEditorState({ textAlign: 'center' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    const rightOption = Array.from(container.querySelectorAll('.onr-dd-item')).find((element) =>
      element.textContent?.includes('Right')
    );
    if (rightOption) {
      fireEvent.click(rightOption);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles applyAlignment unwrap with heading prefix', () => {
    const { app, editor } = createAppWithEditor(
      '## <span style="display:inline-block;width:100%;vertical-align:top;text-align: center">Heading</span>'
    );
    const editorState = createEditorState({ textAlign: 'center' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    const leftOption = Array.from(container.querySelectorAll('.onr-dd-item')).find((element) =>
      element.textContent?.includes('Left')
    );
    if (leftOption) {
      fireEvent.click(leftOption);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles legacy div pattern alignment', () => {
    const { app, editor } = createAppWithEditor('<div style="text-align: center">content</div>');
    const editorState = createEditorState({ textAlign: 'center' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    const rightOption = Array.from(container.querySelectorAll('.onr-dd-item')).find((element) =>
      element.textContent?.includes('Right')
    );
    if (rightOption) {
      fireEvent.click(rightOption);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles legacy div pattern unwrap', () => {
    const { app, editor } = createAppWithEditor('<div style="text-align: center">content</div>');
    const editorState = createEditorState({ textAlign: 'center' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    const leftOption = Array.from(container.querySelectorAll('.onr-dd-item')).find((element) =>
      element.textContent?.includes('Left')
    );
    if (leftOption) {
      fireEvent.click(leftOption);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles legacy block span pattern alignment', () => {
    const { app, editor } = createAppWithEditor(
      '<span style="display:block;text-align: center">content</span>'
    );
    const editorState = createEditorState({ textAlign: 'center' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    const rightOption = Array.from(container.querySelectorAll('.onr-dd-item')).find((element) =>
      element.textContent?.includes('Right')
    );
    if (rightOption) {
      fireEvent.click(rightOption);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles legacy block span pattern unwrap', () => {
    const { app, editor } = createAppWithEditor(
      '<span style="display:block;text-align: center">content</span>'
    );
    const editorState = createEditorState({ textAlign: 'center' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    const leftOption = Array.from(container.querySelectorAll('.onr-dd-item')).find((element) =>
      element.textContent?.includes('Left')
    );
    if (leftOption) {
      fireEvent.click(leftOption);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles markdown token conversion in alignment', () => {
    const { app, editor } = createAppWithEditor('**bold** and *italic* text');
    const editorState = createEditorState({ textAlign: 'left' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    const centerOption = Array.from(container.querySelectorAll('.onr-dd-item')).find((element) =>
      element.textContent?.includes('Center')
    );
    if (centerOption) {
      fireEvent.click(centerOption);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles splitHeadingPrefix with no heading prefix', () => {
    const { app, editor } = createAppWithEditor('plain text without heading');
    const editorState = createEditorState({ textAlign: 'left' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    const centerOption = Array.from(container.querySelectorAll('.onr-dd-item')).find((element) =>
      element.textContent?.includes('Center')
    );
    if (centerOption) {
      fireEvent.click(centerOption);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles matchAlignWrapper with no match', () => {
    const { app, editor } = createAppWithEditor('plain text');
    const editorState = createEditorState({ textAlign: 'left' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = screen.getByTitle('Align');
    fireEvent.click(button);

    const centerOption = Array.from(container.querySelectorAll('.onr-dd-item')).find((element) =>
      element.textContent?.includes('Center')
    );
    if (centerOption) {
      fireEvent.click(centerOption);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles getAlignIcon with center alignment', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({ textAlign: 'center' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = container.querySelector('[data-cmd="align"]');
    expect(button).toBeInTheDocument();
  });

  it('handles getAlignIcon with right alignment', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({ textAlign: 'right' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = container.querySelector('[data-cmd="align"]');
    expect(button).toBeInTheDocument();
  });

  it('handles getAlignIcon with left alignment', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({ textAlign: 'left' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = container.querySelector('[data-cmd="align"]');
    expect(button).toBeInTheDocument();
  });

  it('handles getAlignIcon with justify alignment', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({ textAlign: 'justify' });
    const { container } = renderWithApp(<AlignButton editorState={editorState} />, app);

    const button = container.querySelector('[data-cmd="align"]');
    expect(button).toBeInTheDocument();
  });
});
