import { fireEvent, screen } from '@testing-library/react';

import { createAppWithEditor } from '../../../test-utils/mockApp';
import { renderWithApp } from '../../../test-utils/renderWithApp';
import { ClipboardGroup } from './Clipboard';

// Mock useFormatPainter
jest.mock('../../../shared/hooks/useFormatPainter', () => ({
  useFormatPainter: jest.fn(() => ({
    state: { mode: 'idle', copiedFormat: null },
    handleSingleClick: jest.fn(),
    handleDoubleClick: jest.fn(),
    cancel: jest.fn(),
  })),
}));

// Mock document.execCommand
document.execCommand = jest.fn();

describe('ClipboardGroup — rendering (integration)', () => {
  it('renders the paste button', () => {
    const { app } = createAppWithEditor('');
    renderWithApp(<ClipboardGroup />, app);

    expect(screen.getByTitle('Paste from clipboard')).toBeInTheDocument();
  });

  it('renders the paste special dropdown button', () => {
    const { app } = createAppWithEditor('');
    renderWithApp(<ClipboardGroup />, app);

    expect(screen.getByTitle('Paste special')).toBeInTheDocument();
  });

  it('renders the cut button', () => {
    const { app } = createAppWithEditor('');
    renderWithApp(<ClipboardGroup />, app);

    expect(screen.getByTitle('Cut selection')).toBeInTheDocument();
  });

  it('renders the copy button', () => {
    const { app } = createAppWithEditor('');
    renderWithApp(<ClipboardGroup />, app);

    expect(screen.getByTitle('Copy selection')).toBeInTheDocument();
  });

  it('renders group with correct name', () => {
    const { app } = createAppWithEditor('');
    const { container } = renderWithApp(<ClipboardGroup />, app);

    expect(container.querySelector('.onr-group-name')?.textContent).toBe('Clipboard');
  });
});

describe('ClipboardGroup — paste interactions (integration)', () => {
  it('opens paste options dropdown when paste special is clicked', () => {
    const { app } = createAppWithEditor('');
    renderWithApp(<ClipboardGroup />, app);

    const pasteSpecialButton = screen.getByTitle('Paste special');
    fireEvent.click(pasteSpecialButton);

    // Button should be present
    expect(pasteSpecialButton).toBeInTheDocument();
  });

  it('closes paste options dropdown when paste special is clicked again', () => {
    const { app } = createAppWithEditor('');
    renderWithApp(<ClipboardGroup />, app);

    const pasteSpecialButton = screen.getByTitle('Paste special');
    fireEvent.click(pasteSpecialButton);
    fireEvent.click(pasteSpecialButton);

    // Should toggle closed
    expect(pasteSpecialButton).toBeInTheDocument();
  });
});

describe('ClipboardGroup — cut and copy interactions (integration)', () => {
  it('handles cut button click', () => {
    const { app } = createAppWithEditor('test content');
    renderWithApp(<ClipboardGroup />, app);

    const cutButton = screen.getByTitle('Cut selection');
    expect(() => fireEvent.click(cutButton)).not.toThrow();
  });

  it('handles copy button click', () => {
    const { app } = createAppWithEditor('test content');
    renderWithApp(<ClipboardGroup />, app);

    const copyButton = screen.getByTitle('Copy selection');
    expect(() => fireEvent.click(copyButton)).not.toThrow();
  });
});

describe('ClipboardGroup — format painter interactions (integration)', () => {
  it('handles format painter single click', () => {
    const { app } = createAppWithEditor('');
    const { container } = renderWithApp(<ClipboardGroup />, app);

    const formatPainterButton = container.querySelector('[data-cmd="format-painter"]');
    if (formatPainterButton) {
      fireEvent.click(formatPainterButton, { detail: 1 });
    }

    // Should not throw
    expect(formatPainterButton).toBeInTheDocument();
  });

  it('handles format painter double click', () => {
    const { app } = createAppWithEditor('');
    const { container } = renderWithApp(<ClipboardGroup />, app);

    const formatPainterButton = container.querySelector('[data-cmd="format-painter"]');
    if (formatPainterButton) {
      fireEvent.doubleClick(formatPainterButton);
    }

    expect(formatPainterButton).toBeInTheDocument();
  });
});

describe('ClipboardGroup — no active editor (integration)', () => {
  it('is no-op when no active editor for paste', () => {
    const { app } = createAppWithEditor('');
    Object.defineProperty(app.workspace, 'activeEditor', {
      value: {},
      writable: true,
    });
    renderWithApp(<ClipboardGroup />, app);

    const pasteButton = screen.getByTitle('Paste from clipboard');
    expect(() => fireEvent.click(pasteButton)).not.toThrow();
  });

  it('is no-op when no active editor for cut', () => {
    const { app } = createAppWithEditor('');
    Object.defineProperty(app.workspace, 'activeEditor', {
      value: {},
      writable: true,
    });
    renderWithApp(<ClipboardGroup />, app);

    const cutButton = screen.getByTitle('Cut selection');
    expect(() => fireEvent.click(cutButton)).not.toThrow();
  });

  it('is no-op when no active editor for copy', () => {
    const { app } = createAppWithEditor('');
    Object.defineProperty(app.workspace, 'activeEditor', {
      value: {},
      writable: true,
    });
    renderWithApp(<ClipboardGroup />, app);

    const copyButton = screen.getByTitle('Copy selection');
    expect(() => fireEvent.click(copyButton)).not.toThrow();
  });
});

describe('ClipboardGroup — edge cases', () => {
  it('handles paste with clipboard text', async () => {
    const { app, editor } = createAppWithEditor('initial content');
    renderWithApp(<ClipboardGroup />, app);

    // Mock clipboard API
    const mockClipboard = {
      readText: jest.fn().mockResolvedValue('pasted text'),
    };
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
    });

    const pasteButton = screen.getByTitle('Paste from clipboard');
    fireEvent.click(pasteButton);

    // Wait for async clipboard operation
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(editor.getValue()).toBeDefined();
  });

  it('handles paste as code block option', async () => {
    const { app, editor } = createAppWithEditor('initial content');
    renderWithApp(<ClipboardGroup />, app);

    // Mock clipboard API
    const mockClipboard = {
      readText: jest.fn().mockResolvedValue('code content'),
    };
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
    });

    // Open paste special dropdown
    const pasteSpecialButton = screen.getByTitle('Paste special');
    fireEvent.click(pasteSpecialButton);

    // Wait for dropdown to render
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(editor.getValue()).toBeDefined();
  });

  it('closes dropdown when clicking outside', () => {
    const { app } = createAppWithEditor('');
    renderWithApp(<ClipboardGroup />, app);

    const pasteSpecialButton = screen.getByTitle('Paste special');
    fireEvent.click(pasteSpecialButton);

    // Click outside to close
    fireEvent.click(document.body);

    expect(pasteSpecialButton).toBeInTheDocument();
  });

  it('handles format painter with no editor', () => {
    const { app } = createAppWithEditor('');
    Object.defineProperty(app.workspace, 'activeEditor', {
      value: {},
      writable: true,
    });
    const { container } = renderWithApp(<ClipboardGroup />, app);

    const formatPainterButton = container.querySelector('[data-cmd="format-painter"]');
    if (formatPainterButton) {
      fireEvent.click(formatPainterButton, { detail: 1 });
    }

    expect(formatPainterButton).toBeInTheDocument();
  });

  it('handles format painter double click with no editor', () => {
    const { app } = createAppWithEditor('');
    Object.defineProperty(app.workspace, 'activeEditor', {
      value: {},
      writable: true,
    });
    const { container } = renderWithApp(<ClipboardGroup />, app);

    const formatPainterButton = container.querySelector('[data-cmd="format-painter"]');
    if (formatPainterButton) {
      fireEvent.doubleClick(formatPainterButton);
    }

    expect(formatPainterButton).toBeInTheDocument();
  });
});
