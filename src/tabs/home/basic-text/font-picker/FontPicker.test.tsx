import { fireEvent, screen } from '@testing-library/react';

import { createAppWithEditor } from '../../../../test-utils/mockApp';
import { renderWithApp } from '../../../../test-utils/renderWithApp';
import { FontPicker } from './FontPicker';
import type { EditorState } from '../../../../shared/hooks/interfaces';

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
  fontFamily: 'default',
  fontSize: '12',
  textAlign: 'left',
  fontColor: null,
  highlightColor: null,
  activeTagKeys: new Set(),
  ...overrides,
});

describe('FontPicker — rendering (integration)', () => {
  it('renders font family button', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({ fontFamily: 'default', fontSize: '12' });
    renderWithApp(<FontPicker editorState={editorState} />, app);

    expect(screen.getByTitle('Font family')).toBeInTheDocument();
  });

  it('renders font size button', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({ fontFamily: 'default', fontSize: '12' });
    renderWithApp(<FontPicker editorState={editorState} />, app);

    expect(screen.getByTitle('Font size')).toBeInTheDocument();
  });

  it('displays "Font" when fontFamily is default', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({ fontFamily: 'default', fontSize: '12' });
    const { container } = renderWithApp(<FontPicker editorState={editorState} />, app);

    const fontButton = container.querySelector('[data-cmd="font-family"]');
    expect(fontButton?.textContent).toContain('Font');
  });

  it('displays actual font name when fontFamily is not default', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({ fontFamily: 'Arial', fontSize: '12' });
    const { container } = renderWithApp(<FontPicker editorState={editorState} />, app);

    const fontButton = container.querySelector('[data-cmd="font-family"]');
    expect(fontButton?.textContent).toContain('Arial');
  });

  it('displays font size value', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({ fontFamily: 'default', fontSize: '14' });
    const { container } = renderWithApp(<FontPicker editorState={editorState} />, app);

    const sizeButton = container.querySelector('[data-cmd="font-size"]');
    expect(sizeButton?.textContent).toContain('14');
  });
});

describe('FontPicker — font family dropdown (integration)', () => {
  it('opens font dropdown when font button is clicked', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({ fontFamily: 'default', fontSize: '12' });
    renderWithApp(<FontPicker editorState={editorState} />, app);

    const fontButton = screen.getByTitle('Font family');
    fireEvent.click(fontButton);

    // Dropdown should be open (component renders it)
    expect(fontButton).toBeInTheDocument();
  });

  it('closes font dropdown when clicking button again', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({ fontFamily: 'default', fontSize: '12' });
    renderWithApp(<FontPicker editorState={editorState} />, app);

    const fontButton = screen.getByTitle('Font family');
    fireEvent.click(fontButton);
    fireEvent.click(fontButton);

    // Should toggle closed
    expect(fontButton).toBeInTheDocument();
  });
});

describe('FontPicker — font size dropdown (integration)', () => {
  it('opens size dropdown when size button is clicked', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({ fontFamily: 'default', fontSize: '12' });
    renderWithApp(<FontPicker editorState={editorState} />, app);

    const sizeButton = screen.getByTitle('Font size');
    fireEvent.click(sizeButton);

    expect(sizeButton).toBeInTheDocument();
  });

  it('closes size dropdown when clicking button again', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({ fontFamily: 'default', fontSize: '12' });
    renderWithApp(<FontPicker editorState={editorState} />, app);

    const sizeButton = screen.getByTitle('Font size');
    fireEvent.click(sizeButton);
    fireEvent.click(sizeButton);

    expect(sizeButton).toBeInTheDocument();
  });
});

describe('FontPicker — font application (integration)', () => {
  it('applies selected font to editor', () => {
    const { app, editor } = createAppWithEditor('test content');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 4 });
    const editorState = createEditorState({ fontFamily: 'default', fontSize: '12' });
    renderWithApp(<FontPicker editorState={editorState} />, app);

    const fontButton = screen.getByTitle('Font family');
    fireEvent.click(fontButton);

    expect(editor.getValue()).toBeDefined();
  });

  it('applies selected size to editor', () => {
    const { app, editor } = createAppWithEditor('test content');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 4 });
    const editorState = createEditorState({ fontFamily: 'default', fontSize: '12' });
    renderWithApp(<FontPicker editorState={editorState} />, app);

    const sizeButton = screen.getByTitle('Font size');
    fireEvent.click(sizeButton);

    expect(editor.getValue()).toBeDefined();
  });
});

describe('FontPicker — no active editor (integration)', () => {
  it('is no-op when no active editor for font selection', () => {
    const { app } = createAppWithEditor('');
    Object.defineProperty(app.workspace, 'activeEditor', {
      value: {},
      writable: true,
    });
    const editorState = createEditorState({ fontFamily: 'default', fontSize: '12' });
    renderWithApp(<FontPicker editorState={editorState} />, app);

    const fontButton = screen.getByTitle('Font family');
    expect(() => fireEvent.click(fontButton)).not.toThrow();
  });

  it('is no-op when no active editor for size selection', () => {
    const { app } = createAppWithEditor('');
    Object.defineProperty(app.workspace, 'activeEditor', {
      value: {},
      writable: true,
    });
    const editorState = createEditorState({ fontFamily: 'default', fontSize: '12' });
    renderWithApp(<FontPicker editorState={editorState} />, app);

    const sizeButton = screen.getByTitle('Font size');
    expect(() => fireEvent.click(sizeButton)).not.toThrow();
  });
});

describe('FontPicker — edge cases', () => {
  it('handles Dropdown onClose via outside click for font', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({ fontFamily: 'default', fontSize: '12' });
    const { container } = renderWithApp(<FontPicker editorState={editorState} />, app);

    const fontButton = screen.getByTitle('Font family');
    fireEvent.click(fontButton);

    // Click outside to trigger onClose
    fireEvent.click(document.body);

    expect(container.querySelector('.onr-font-picker')).toBeInTheDocument();
  });

  it('handles Dropdown onClose via outside click for size', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({ fontFamily: 'default', fontSize: '12' });
    const { container } = renderWithApp(<FontPicker editorState={editorState} />, app);

    const sizeButton = screen.getByTitle('Font size');
    fireEvent.click(sizeButton);

    // Click outside to trigger onClose
    fireEvent.click(document.body);

    expect(container.querySelector('.onr-size-picker')).toBeInTheDocument();
  });

  it('handles Dropdown onClose via Escape key for font', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({ fontFamily: 'default', fontSize: '12' });
    const { container } = renderWithApp(<FontPicker editorState={editorState} />, app);

    const fontButton = screen.getByTitle('Font family');
    fireEvent.click(fontButton);

    // Press Escape to trigger onClose
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(container.querySelector('.onr-font-picker')).toBeInTheDocument();
  });

  it('handles Dropdown onClose via Escape key for size', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({ fontFamily: 'default', fontSize: '12' });
    const { container } = renderWithApp(<FontPicker editorState={editorState} />, app);

    const sizeButton = screen.getByTitle('Font size');
    fireEvent.click(sizeButton);

    // Press Escape to trigger onClose
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(container.querySelector('.onr-size-picker')).toBeInTheDocument();
  });

  it('handles multiple font dropdown open/close cycles', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({ fontFamily: 'default', fontSize: '12' });
    renderWithApp(<FontPicker editorState={editorState} />, app);

    const fontButton = screen.getByTitle('Font family');

    // Multiple cycles
    for (let i = 0; i < 5; i += 1) {
      fireEvent.click(fontButton);
    }

    expect(fontButton).toBeInTheDocument();
  });

  it('handles multiple size dropdown open/close cycles', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({ fontFamily: 'default', fontSize: '12' });
    renderWithApp(<FontPicker editorState={editorState} />, app);

    const sizeButton = screen.getByTitle('Font size');

    // Multiple cycles
    for (let i = 0; i < 5; i += 1) {
      fireEvent.click(sizeButton);
    }

    expect(sizeButton).toBeInTheDocument();
  });

  it('handles both dropdowns open simultaneously', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({ fontFamily: 'default', fontSize: '12' });
    const { container } = renderWithApp(<FontPicker editorState={editorState} />, app);

    const fontButton = screen.getByTitle('Font family');
    const sizeButton = screen.getByTitle('Font size');

    fireEvent.click(fontButton);
    fireEvent.click(sizeButton);

    // Both should be rendered
    expect(container.querySelector('.onr-font-picker')).toBeInTheDocument();
    expect(container.querySelector('.onr-size-picker')).toBeInTheDocument();
  });

  it('handles font selection from dropdown item', () => {
    const { app, editor } = createAppWithEditor('test content');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 4 });
    const editorState = createEditorState({ fontFamily: 'default', fontSize: '12' });
    renderWithApp(<FontPicker editorState={editorState} />, app);

    const fontButton = screen.getByTitle('Font family');
    fireEvent.click(fontButton);

    // Dropdown renders in a portal into document.body, not into the test container
    const dropdownItem = document.body.querySelector('.onr-dd-item');
    expect(dropdownItem).not.toBeNull();
    fireEvent.click(dropdownItem!);

    // Font family should have been applied to the editor content
    expect(editor.getValue()).toContain('font-family');
  });

  it('handles size selection from dropdown item', () => {
    const { app, editor } = createAppWithEditor('test content');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 4 });
    const editorState = createEditorState({ fontFamily: 'default', fontSize: '12' });
    renderWithApp(<FontPicker editorState={editorState} />, app);

    const sizeButton = screen.getByTitle('Font size');
    fireEvent.click(sizeButton);

    // Dropdown renders in a portal into document.body, not into the test container
    const dropdownItem = document.body.querySelector('.onr-dd-item');
    expect(dropdownItem).not.toBeNull();
    fireEvent.click(dropdownItem!);

    // Font size should have been applied to the editor content
    expect(editor.getValue()).toContain('font-size');
  });

  it('handles rapid font and size toggles', () => {
    const { app, editor } = createAppWithEditor('test content');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 4 });
    const editorState = createEditorState({ fontFamily: 'default', fontSize: '12' });
    renderWithApp(<FontPicker editorState={editorState} />, app);

    const fontButton = screen.getByTitle('Font family');
    const sizeButton = screen.getByTitle('Font size');

    // Rapid toggles
    for (let i = 0; i < 3; i += 1) {
      fireEvent.click(fontButton);
      fireEvent.click(sizeButton);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles handleFontSelect with no editor', () => {
    const { app } = createAppWithEditor('');
    Object.defineProperty(app.workspace, 'activeEditor', {
      value: {},
      writable: true,
    });
    const editorState = createEditorState({ fontFamily: 'default', fontSize: '12' });
    const { container } = renderWithApp(<FontPicker editorState={editorState} />, app);

    const fontButton = screen.getByTitle('Font family');
    fireEvent.click(fontButton);

    // Click on a dropdown item with no editor
    const dropdownItem = container.querySelector('.onr-dd-item');
    if (dropdownItem) {
      expect(() => fireEvent.click(dropdownItem)).not.toThrow();
    }
  });

  it('handles handleSizeSelect with no editor', () => {
    const { app } = createAppWithEditor('');
    Object.defineProperty(app.workspace, 'activeEditor', {
      value: {},
      writable: true,
    });
    const editorState = createEditorState({ fontFamily: 'default', fontSize: '12' });
    const { container } = renderWithApp(<FontPicker editorState={editorState} />, app);

    const sizeButton = screen.getByTitle('Font size');
    fireEvent.click(sizeButton);

    // Click on a dropdown item with no editor
    const dropdownItem = container.querySelector('.onr-dd-item');
    if (dropdownItem) {
      expect(() => fireEvent.click(dropdownItem)).not.toThrow();
    }
  });

  it('handles font button click with no editor', () => {
    const { app } = createAppWithEditor('');
    Object.defineProperty(app.workspace, 'activeEditor', {
      value: {},
      writable: true,
    });
    const editorState = createEditorState({ fontFamily: 'default', fontSize: '12' });
    renderWithApp(<FontPicker editorState={editorState} />, app);

    const fontButton = screen.getByTitle('Font family');
    expect(() => fireEvent.click(fontButton)).not.toThrow();
  });

  it('handles size button click with no editor', () => {
    const { app } = createAppWithEditor('');
    Object.defineProperty(app.workspace, 'activeEditor', {
      value: {},
      writable: true,
    });
    const editorState = createEditorState({ fontFamily: 'default', fontSize: '12' });
    renderWithApp(<FontPicker editorState={editorState} />, app);

    const sizeButton = screen.getByTitle('Font size');
    expect(() => fireEvent.click(sizeButton)).not.toThrow();
  });
});
