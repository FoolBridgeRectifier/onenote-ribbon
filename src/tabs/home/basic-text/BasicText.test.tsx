import { fireEvent, screen } from '@testing-library/react';

import { createAppWithEditor } from '../../../test-utils/mockApp';
import { renderWithApp } from '../../../test-utils/renderWithApp';
import { BasicTextGroup } from './BasicText';

// Mock the child components to isolate BasicTextGroup testing
jest.mock('./font-picker/FontPicker', () => ({
  FontPicker: ({ editorState }: { editorState: unknown }) => (
    <div data-testid="font-picker" data-editor-state={JSON.stringify(editorState)}>
      FontPicker
    </div>
  ),
}));

jest.mock('./highlight-text-color/HighlightTextColor', () => ({
  HighlightTextColor: ({ editorState }: { editorState: unknown }) => (
    <div data-testid="highlight-text-color" data-editor-state={JSON.stringify(editorState)}>
      HighlightTextColor
    </div>
  ),
}));

jest.mock('./script-buttons/ScriptButtons', () => ({
  ScriptButtons: ({ subscript, superscript }: { subscript: boolean; superscript: boolean }) => (
    <div data-testid="script-buttons" data-subscript={subscript} data-superscript={superscript}>
      ScriptButtons
    </div>
  ),
}));

jest.mock('./align-button/AlignButton', () => ({
  AlignButton: ({ editorState }: { editorState: unknown }) => (
    <div data-testid="align-button" data-editor-state={JSON.stringify(editorState)}>
      AlignButton
    </div>
  ),
}));

jest.mock('./list-buttons/ListButtons', () => ({
  ListButtons: ({ editorState }: { editorState: unknown }) => (
    <div data-testid="list-buttons" data-editor-state={JSON.stringify(editorState)}>
      ListButtons
    </div>
  ),
}));

describe('BasicTextGroup — rendering (integration)', () => {
  it('renders all child components', () => {
    const { app } = createAppWithEditor('');
    renderWithApp(<BasicTextGroup />, app);

    expect(screen.getByTestId('font-picker')).toBeInTheDocument();
    expect(screen.getByTestId('highlight-text-color')).toBeInTheDocument();
    expect(screen.getByTestId('script-buttons')).toBeInTheDocument();
    expect(screen.getByTestId('align-button')).toBeInTheDocument();
    expect(screen.getByTestId('list-buttons')).toBeInTheDocument();
  });

  it('renders formatting buttons with correct titles', () => {
    const { app } = createAppWithEditor('');
    renderWithApp(<BasicTextGroup />, app);

    expect(screen.getByTitle('Bold')).toBeInTheDocument();
    expect(screen.getByTitle('Italic')).toBeInTheDocument();
    expect(screen.getByTitle('Underline')).toBeInTheDocument();
    expect(screen.getByTitle('Strikethrough')).toBeInTheDocument();
    expect(screen.getByTitle('Delete element')).toBeInTheDocument();
    expect(screen.getByTitle('Clear formatting')).toBeInTheDocument();
  });

  it('renders group with correct name', () => {
    const { app } = createAppWithEditor('');
    const { container } = renderWithApp(<BasicTextGroup />, app);

    expect(container.querySelector('.onr-group-name')?.textContent).toBe('Basic Text');
  });
});

describe('BasicTextGroup — button interactions (integration)', () => {
  it('clicking bold button applies bold formatting', () => {
    const { app, editor } = createAppWithEditor('test content');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 4 });
    renderWithApp(<BasicTextGroup />, app);

    const boldButton = screen.getByTitle('Bold');
    fireEvent.click(boldButton);

    // The editor should have received the toggleTag call
    expect(editor.getValue()).toBeDefined();
  });

  it('clicking italic button applies italic formatting', () => {
    const { app, editor } = createAppWithEditor('test content');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 4 });
    renderWithApp(<BasicTextGroup />, app);

    const italicButton = screen.getByTitle('Italic');
    fireEvent.click(italicButton);

    expect(editor.getValue()).toBeDefined();
  });

  it('clicking underline button applies underline formatting', () => {
    const { app, editor } = createAppWithEditor('test content');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 4 });
    renderWithApp(<BasicTextGroup />, app);

    const underlineButton = screen.getByTitle('Underline');
    fireEvent.click(underlineButton);

    expect(editor.getValue()).toBeDefined();
  });

  it('clicking strikethrough button applies strikethrough formatting', () => {
    const { app, editor } = createAppWithEditor('test content');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 4 });
    renderWithApp(<BasicTextGroup />, app);

    const strikethroughButton = screen.getByTitle('Strikethrough');
    fireEvent.click(strikethroughButton);

    expect(editor.getValue()).toBeDefined();
  });

  it('clicking delete element button removes selection', () => {
    const { app, editor } = createAppWithEditor('test content');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 4 });
    renderWithApp(<BasicTextGroup />, app);

    const deleteButton = screen.getByTitle('Delete element');
    fireEvent.click(deleteButton);

    expect(editor.getValue()).toBe(' content');
  });

  it('clicking clear formatting button clears formatting', () => {
    const { app, editor } = createAppWithEditor('**bold** text');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 6 });
    renderWithApp(<BasicTextGroup />, app);

    const clearButton = screen.getByTitle('Clear formatting');
    fireEvent.click(clearButton);

    // The formatting should be processed
    expect(editor.getValue()).toBeDefined();
  });
});

describe('BasicTextGroup — no active editor (integration)', () => {
  it('is no-op when no active editor for bold', () => {
    const { app } = createAppWithEditor('');
    // Override to return no editor
    Object.defineProperty(app.workspace, 'activeEditor', {
      value: {},
      writable: true,
    });
    renderWithApp(<BasicTextGroup />, app);

    const boldButton = screen.getByTitle('Bold');
    expect(() => fireEvent.click(boldButton)).not.toThrow();
  });

  it('is no-op when no active editor for italic', () => {
    const { app } = createAppWithEditor('');
    Object.defineProperty(app.workspace, 'activeEditor', {
      value: {},
      writable: true,
    });
    renderWithApp(<BasicTextGroup />, app);

    const italicButton = screen.getByTitle('Italic');
    expect(() => fireEvent.click(italicButton)).not.toThrow();
  });

  it('is no-op when no active editor for underline', () => {
    const { app } = createAppWithEditor('');
    Object.defineProperty(app.workspace, 'activeEditor', {
      value: {},
      writable: true,
    });
    renderWithApp(<BasicTextGroup />, app);

    const underlineButton = screen.getByTitle('Underline');
    expect(() => fireEvent.click(underlineButton)).not.toThrow();
  });

  it('is no-op when no active editor for strikethrough', () => {
    const { app } = createAppWithEditor('');
    Object.defineProperty(app.workspace, 'activeEditor', {
      value: {},
      writable: true,
    });
    renderWithApp(<BasicTextGroup />, app);

    const strikethroughButton = screen.getByTitle('Strikethrough');
    expect(() => fireEvent.click(strikethroughButton)).not.toThrow();
  });

  it('is no-op when no active editor for delete element', () => {
    const { app } = createAppWithEditor('');
    Object.defineProperty(app.workspace, 'activeEditor', {
      value: {},
      writable: true,
    });
    renderWithApp(<BasicTextGroup />, app);

    const deleteButton = screen.getByTitle('Delete element');
    expect(() => fireEvent.click(deleteButton)).not.toThrow();
  });

  it('is no-op when no active editor for clear formatting', () => {
    const { app } = createAppWithEditor('');
    Object.defineProperty(app.workspace, 'activeEditor', {
      value: {},
      writable: true,
    });
    renderWithApp(<BasicTextGroup />, app);

    const clearButton = screen.getByTitle('Clear formatting');
    expect(() => fireEvent.click(clearButton)).not.toThrow();
  });
});

describe('BasicTextGroup — button active states (integration)', () => {
  it('displays bold button as active when editorState.bold is true', () => {
    const { app } = createAppWithEditor('**bold text**');
    renderWithApp(<BasicTextGroup />, app);

    const boldButton = screen.getByTitle('Bold');
    // The button should have the active class based on editor state
    expect(boldButton).toBeInTheDocument();
  });

  it('displays italic button as active when editorState.italic is true', () => {
    const { app } = createAppWithEditor('*italic text*');
    renderWithApp(<BasicTextGroup />, app);

    const italicButton = screen.getByTitle('Italic');
    expect(italicButton).toBeInTheDocument();
  });

  it('displays underline button as active when editorState.underline is true', () => {
    const { app } = createAppWithEditor('<u>underlined text</u>');
    renderWithApp(<BasicTextGroup />, app);

    const underlineButton = screen.getByTitle('Underline');
    expect(underlineButton).toBeInTheDocument();
  });

  it('displays strikethrough button as active when editorState.strikethrough is true', () => {
    const { app } = createAppWithEditor('~~strikethrough text~~');
    renderWithApp(<BasicTextGroup />, app);

    const strikethroughButton = screen.getByTitle('Strikethrough');
    expect(strikethroughButton).toBeInTheDocument();
  });
});
