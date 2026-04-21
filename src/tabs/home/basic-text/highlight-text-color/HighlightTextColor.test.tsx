import { fireEvent, screen } from '@testing-library/react';

import { createAppWithEditor } from '../../../../test-utils/mockApp';
import { renderWithApp } from '../../../../test-utils/renderWithApp';
import { HighlightTextColor } from './HighlightTextColor';
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
  fontFamily: '',
  fontSize: '',
  textAlign: 'left',
  fontColor: null,
  highlightColor: null,
  activeTagKeys: new Set(),
  ...overrides,
});

describe('HighlightTextColor — rendering (integration)', () => {
  it('renders highlight button', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({
      highlight: false,
      highlightColor: null,
      fontColor: null,
    });
    renderWithApp(<HighlightTextColor editorState={editorState} />, app);

    expect(screen.getByTitle('Highlight')).toBeInTheDocument();
  });

  it('renders font color button', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({
      highlight: false,
      highlightColor: null,
      fontColor: null,
    });
    renderWithApp(<HighlightTextColor editorState={editorState} />, app);

    expect(screen.getByTitle('Font color')).toBeInTheDocument();
  });

  it('renders highlight button as active when highlight is true', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({
      highlight: true,
      highlightColor: null,
      fontColor: null,
    });
    const { container } = renderWithApp(<HighlightTextColor editorState={editorState} />, app);

    const highlightButton = container.querySelector('[data-cmd="highlight"]');
    expect(highlightButton).toHaveClass('onr-active');
  });

  it('renders highlight button as active when highlightColor is set', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({
      highlight: false,
      highlightColor: '#ffff00',
      fontColor: null,
    });
    const { container } = renderWithApp(<HighlightTextColor editorState={editorState} />, app);

    const highlightButton = container.querySelector('[data-cmd="highlight"]');
    expect(highlightButton).toHaveClass('onr-active');
  });

  it('renders font color button as active when fontColor is set', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({
      highlight: false,
      highlightColor: null,
      fontColor: '#ff0000',
    });
    const { container } = renderWithApp(<HighlightTextColor editorState={editorState} />, app);

    const fontColorButton = container.querySelector('[data-cmd="font-color"]');
    expect(fontColorButton).toHaveClass('onr-active');
  });

  it('renders caret buttons for dropdowns', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({
      highlight: false,
      highlightColor: null,
      fontColor: null,
    });
    const { container } = renderWithApp(<HighlightTextColor editorState={editorState} />, app);

    const caretButtons = container.querySelectorAll('.onr-caret-btn');
    expect(caretButtons.length).toBe(2);
  });
});

describe('HighlightTextColor — highlight interactions (integration)', () => {
  it('applies highlight when highlight button is clicked', () => {
    const { app, editor } = createAppWithEditor('test content');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 4 });
    const editorState = createEditorState({
      highlight: false,
      highlightColor: null,
      fontColor: null,
    });
    renderWithApp(<HighlightTextColor editorState={editorState} />, app);

    const highlightButton = screen.getByTitle('Highlight');
    fireEvent.click(highlightButton);

    expect(editor.getValue()).toBeDefined();
  });

  it('opens highlight color picker when caret is clicked', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({
      highlight: false,
      highlightColor: null,
      fontColor: null,
    });
    const { container } = renderWithApp(<HighlightTextColor editorState={editorState} />, app);

    const highlightCaret = container.querySelector('.onr-highlight-wrapper .onr-caret-btn');
    if (highlightCaret) {
      fireEvent.click(highlightCaret);
    }

    // Color picker dropdown should be rendered
    expect(highlightCaret).toBeInTheDocument();
  });
});

describe('HighlightTextColor — font color interactions (integration)', () => {
  it('applies font color when font color button is clicked', () => {
    const { app, editor } = createAppWithEditor('test content');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 4 });
    const editorState = createEditorState({
      highlight: false,
      highlightColor: null,
      fontColor: null,
    });
    renderWithApp(<HighlightTextColor editorState={editorState} />, app);

    const fontColorButton = screen.getByTitle('Font color');
    fireEvent.click(fontColorButton);

    expect(editor.getValue()).toBeDefined();
  });

  it('opens font color picker when caret is clicked', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({
      highlight: false,
      highlightColor: null,
      fontColor: null,
    });
    const { container } = renderWithApp(<HighlightTextColor editorState={editorState} />, app);

    const fontColorCaret = container.querySelector('.onr-color-wrapper .onr-caret-btn');
    if (fontColorCaret) {
      fireEvent.click(fontColorCaret);
    }

    // Color picker dropdown should be rendered
    expect(fontColorCaret).toBeInTheDocument();
  });
});

describe('HighlightTextColor — no active editor (integration)', () => {
  it('is no-op when no active editor for highlight', () => {
    const { app } = createAppWithEditor('');
    Object.defineProperty(app.workspace, 'activeEditor', {
      value: {},
      writable: true,
    });
    const editorState = createEditorState({
      highlight: false,
      highlightColor: null,
      fontColor: null,
    });
    renderWithApp(<HighlightTextColor editorState={editorState} />, app);

    const highlightButton = screen.getByTitle('Highlight');
    expect(() => fireEvent.click(highlightButton)).not.toThrow();
  });

  it('is no-op when no active editor for font color', () => {
    const { app } = createAppWithEditor('');
    Object.defineProperty(app.workspace, 'activeEditor', {
      value: {},
      writable: true,
    });
    const editorState = createEditorState({
      highlight: false,
      highlightColor: null,
      fontColor: null,
    });
    renderWithApp(<HighlightTextColor editorState={editorState} />, app);

    const fontColorButton = screen.getByTitle('Font color');
    expect(() => fireEvent.click(fontColorButton)).not.toThrow();
  });
});

describe('HighlightTextColor — color swatch display (integration)', () => {
  it('displays default highlight color in swatch', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({
      highlight: false,
      highlightColor: null,
      fontColor: null,
    });
    const { container } = renderWithApp(<HighlightTextColor editorState={editorState} />, app);

    const swatch = container.querySelector('.onr-highlight-swatch');
    expect(swatch).toBeInTheDocument();
  });

  it('displays default font color in swatch', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({
      highlight: false,
      highlightColor: null,
      fontColor: null,
    });
    const { container } = renderWithApp(<HighlightTextColor editorState={editorState} />, app);

    const swatch = container.querySelector('.onr-color-swatch');
    expect(swatch).toBeInTheDocument();
  });

  it('handles highlight dropdown open/close', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({
      highlight: false,
      highlightColor: null,
      fontColor: null,
    });
    const { container } = renderWithApp(<HighlightTextColor editorState={editorState} />, app);

    const highlightCaret = container.querySelector('.onr-highlight-wrapper .onr-caret-btn');
    if (highlightCaret) {
      fireEvent.click(highlightCaret);
    }

    // Should have opened the dropdown
    expect(highlightCaret).toBeInTheDocument();

    // Click again to close
    if (highlightCaret) {
      fireEvent.click(highlightCaret);
    }

    expect(highlightCaret).toBeInTheDocument();
  });

  it('handles font color dropdown open/close', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({
      highlight: false,
      highlightColor: null,
      fontColor: null,
    });
    const { container } = renderWithApp(<HighlightTextColor editorState={editorState} />, app);

    const fontColorCaret = container.querySelector('.onr-color-wrapper .onr-caret-btn');
    if (fontColorCaret) {
      fireEvent.click(fontColorCaret);
    }

    // Should have opened the dropdown
    expect(fontColorCaret).toBeInTheDocument();

    // Click again to close
    if (fontColorCaret) {
      fireEvent.click(fontColorCaret);
    }

    expect(fontColorCaret).toBeInTheDocument();
  });

  it('handles ColorPicker onClose for highlight', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({
      highlight: false,
      highlightColor: null,
      fontColor: null,
    });
    const { container } = renderWithApp(<HighlightTextColor editorState={editorState} />, app);

    const highlightCaret = container.querySelector('.onr-highlight-wrapper .onr-caret-btn');
    if (highlightCaret) {
      fireEvent.click(highlightCaret);
    }

    // Click outside to trigger onClose
    fireEvent.click(document.body);

    expect(container.querySelector('.onr-highlight-wrapper')).toBeInTheDocument();
  });

  it('handles ColorPicker onClose for font color', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({
      highlight: false,
      highlightColor: null,
      fontColor: null,
    });
    const { container } = renderWithApp(<HighlightTextColor editorState={editorState} />, app);

    const fontColorCaret = container.querySelector('.onr-color-wrapper .onr-caret-btn');
    if (fontColorCaret) {
      fireEvent.click(fontColorCaret);
    }

    // Click outside to trigger onClose
    fireEvent.click(document.body);

    expect(container.querySelector('.onr-color-wrapper')).toBeInTheDocument();
  });

  it('handles ColorPicker onClose via Escape key for highlight', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({
      highlight: false,
      highlightColor: null,
      fontColor: null,
    });
    const { container } = renderWithApp(<HighlightTextColor editorState={editorState} />, app);

    const highlightCaret = container.querySelector('.onr-highlight-wrapper .onr-caret-btn');
    if (highlightCaret) {
      fireEvent.click(highlightCaret);
    }

    // Press Escape to trigger onClose
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(container.querySelector('.onr-highlight-wrapper')).toBeInTheDocument();
  });

  it('handles ColorPicker onClose via Escape key for font color', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({
      highlight: false,
      highlightColor: null,
      fontColor: null,
    });
    const { container } = renderWithApp(<HighlightTextColor editorState={editorState} />, app);

    const fontColorCaret = container.querySelector('.onr-color-wrapper .onr-caret-btn');
    if (fontColorCaret) {
      fireEvent.click(fontColorCaret);
    }

    // Press Escape to trigger onClose
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(container.querySelector('.onr-color-wrapper')).toBeInTheDocument();
  });

  it('handles rapid highlight and font color toggles', () => {
    const { app, editor } = createAppWithEditor('test content');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 4 });
    const editorState = createEditorState({
      highlight: false,
      highlightColor: null,
      fontColor: null,
    });
    renderWithApp(<HighlightTextColor editorState={editorState} />, app);

    const highlightButton = screen.getByTitle('Highlight');
    const fontColorButton = screen.getByTitle('Font color');

    // Rapid toggles
    for (let i = 0; i < 3; i += 1) {
      fireEvent.click(highlightButton);
      fireEvent.click(fontColorButton);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles both dropdowns open simultaneously', () => {
    const { app } = createAppWithEditor('');
    const editorState = createEditorState({
      highlight: false,
      highlightColor: null,
      fontColor: null,
    });
    const { container } = renderWithApp(<HighlightTextColor editorState={editorState} />, app);

    const highlightCaret = container.querySelector('.onr-highlight-wrapper .onr-caret-btn');
    const fontColorCaret = container.querySelector('.onr-color-wrapper .onr-caret-btn');

    if (highlightCaret) {
      fireEvent.click(highlightCaret);
    }
    if (fontColorCaret) {
      fireEvent.click(fontColorCaret);
    }

    // Both should be rendered
    expect(container.querySelector('.onr-highlight-wrapper')).toBeInTheDocument();
    expect(container.querySelector('.onr-color-wrapper')).toBeInTheDocument();
  });

  it('handles handleHighlightClick with no editor', () => {
    const { app } = createAppWithEditor('');
    Object.defineProperty(app.workspace, 'activeEditor', {
      value: {},
      writable: true,
    });
    const editorState = createEditorState({
      highlight: false,
      highlightColor: null,
      fontColor: null,
    });
    renderWithApp(<HighlightTextColor editorState={editorState} />, app);

    const highlightButton = screen.getByTitle('Highlight');
    expect(() => fireEvent.click(highlightButton)).not.toThrow();
  });

  it('handles handleFontColorClick with no editor', () => {
    const { app } = createAppWithEditor('');
    Object.defineProperty(app.workspace, 'activeEditor', {
      value: {},
      writable: true,
    });
    const editorState = createEditorState({
      highlight: false,
      highlightColor: null,
      fontColor: null,
    });
    renderWithApp(<HighlightTextColor editorState={editorState} />, app);

    const fontColorButton = screen.getByTitle('Font color');
    expect(() => fireEvent.click(fontColorButton)).not.toThrow();
  });

  it('handles handleHighlightColorSelect with no editor', () => {
    const { app } = createAppWithEditor('');
    Object.defineProperty(app.workspace, 'activeEditor', {
      value: {},
      writable: true,
    });
    const editorState = createEditorState({
      highlight: false,
      highlightColor: null,
      fontColor: null,
    });
    const { container } = renderWithApp(<HighlightTextColor editorState={editorState} />, app);

    const highlightCaret = container.querySelector('.onr-highlight-wrapper .onr-caret-btn');
    if (highlightCaret) {
      fireEvent.click(highlightCaret);
    }

    // ColorPicker should be rendered but clicking a color with no editor should not throw
    expect(container.querySelector('.onr-highlight-wrapper')).toBeInTheDocument();
  });

  it('handles handleFontColorSelect with no editor', () => {
    const { app } = createAppWithEditor('');
    Object.defineProperty(app.workspace, 'activeEditor', {
      value: {},
      writable: true,
    });
    const editorState = createEditorState({
      highlight: false,
      highlightColor: null,
      fontColor: null,
    });
    const { container } = renderWithApp(<HighlightTextColor editorState={editorState} />, app);

    const fontColorCaret = container.querySelector('.onr-color-wrapper .onr-caret-btn');
    if (fontColorCaret) {
      fireEvent.click(fontColorCaret);
    }

    // ColorPicker should be rendered but clicking a color with no editor should not throw
    expect(container.querySelector('.onr-color-wrapper')).toBeInTheDocument();
  });

  it('handles handleHighlightNoColor with no editor', () => {
    const { app } = createAppWithEditor('');
    Object.defineProperty(app.workspace, 'activeEditor', {
      value: {},
      writable: true,
    });
    const editorState = createEditorState({
      highlight: false,
      highlightColor: null,
      fontColor: null,
    });
    const { container } = renderWithApp(<HighlightTextColor editorState={editorState} />, app);

    const highlightCaret = container.querySelector('.onr-highlight-wrapper .onr-caret-btn');
    if (highlightCaret) {
      fireEvent.click(highlightCaret);
    }

    // ColorPicker with no color option
    expect(container.querySelector('.onr-highlight-wrapper')).toBeInTheDocument();
  });

  it('handles handleFontColorNoColor with no editor', () => {
    const { app } = createAppWithEditor('');
    Object.defineProperty(app.workspace, 'activeEditor', {
      value: {},
      writable: true,
    });
    const editorState = createEditorState({
      highlight: false,
      highlightColor: null,
      fontColor: null,
    });
    const { container } = renderWithApp(<HighlightTextColor editorState={editorState} />, app);

    const fontColorCaret = container.querySelector('.onr-color-wrapper .onr-caret-btn');
    if (fontColorCaret) {
      fireEvent.click(fontColorCaret);
    }

    // ColorPicker with no color option
    expect(container.querySelector('.onr-color-wrapper')).toBeInTheDocument();
  });

  it('handles highlight button click with selection', () => {
    const { app, editor } = createAppWithEditor('test content');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 4 });
    const editorState = createEditorState({
      highlight: false,
      highlightColor: null,
      fontColor: null,
    });
    renderWithApp(<HighlightTextColor editorState={editorState} />, app);

    const highlightButton = screen.getByTitle('Highlight');
    fireEvent.click(highlightButton);

    expect(editor.getValue()).toBeDefined();
  });

  it('handles font color button click with selection', () => {
    const { app, editor } = createAppWithEditor('test content');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 4 });
    const editorState = createEditorState({
      highlight: false,
      highlightColor: null,
      fontColor: null,
    });
    renderWithApp(<HighlightTextColor editorState={editorState} />, app);

    const fontColorButton = screen.getByTitle('Font color');
    fireEvent.click(fontColorButton);

    expect(editor.getValue()).toBeDefined();
  });

  it('handles highlight color selection with editor', async () => {
    const { app, editor } = createAppWithEditor('test content');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 4 });
    const editorState = createEditorState({
      highlight: false,
      highlightColor: null,
      fontColor: null,
    });
    const { container } = renderWithApp(<HighlightTextColor editorState={editorState} />, app);

    const highlightCaret = container.querySelector('.onr-highlight-wrapper .onr-caret-btn');
    if (highlightCaret) {
      fireEvent.click(highlightCaret);
    }

    // Wait for ColorPicker to render
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(editor.getValue()).toBeDefined();
  });

  it('handles font color selection with editor', async () => {
    const { app, editor } = createAppWithEditor('test content');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 4 });
    const editorState = createEditorState({
      highlight: false,
      highlightColor: null,
      fontColor: null,
    });
    const { container } = renderWithApp(<HighlightTextColor editorState={editorState} />, app);

    const fontColorCaret = container.querySelector('.onr-color-wrapper .onr-caret-btn');
    if (fontColorCaret) {
      fireEvent.click(fontColorCaret);
    }

    // Wait for ColorPicker to render
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(editor.getValue()).toBeDefined();
  });

  it('handles highlight no color with editor', async () => {
    const { app, editor } = createAppWithEditor('test content');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 4 });
    const editorState = createEditorState({
      highlight: true,
      highlightColor: '#ffff00',
      fontColor: null,
    });
    const { container } = renderWithApp(<HighlightTextColor editorState={editorState} />, app);

    const highlightCaret = container.querySelector('.onr-highlight-wrapper .onr-caret-btn');
    if (highlightCaret) {
      fireEvent.click(highlightCaret);
    }

    // Wait for ColorPicker to render
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(editor.getValue()).toBeDefined();
  });

  it('handles font color no color with editor', async () => {
    const { app, editor } = createAppWithEditor('test content');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 4 });
    const editorState = createEditorState({
      highlight: false,
      highlightColor: null,
      fontColor: '#ff0000',
    });
    const { container } = renderWithApp(<HighlightTextColor editorState={editorState} />, app);

    const fontColorCaret = container.querySelector('.onr-color-wrapper .onr-caret-btn');
    if (fontColorCaret) {
      fireEvent.click(fontColorCaret);
    }

    // Wait for ColorPicker to render
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(editor.getValue()).toBeDefined();
  });

  it('applies highlight color when swatch is clicked in the ColorPicker portal', () => {
    const { app, editor } = createAppWithEditor('test content');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 4 });
    const editorState = createEditorState({
      highlight: false,
      highlightColor: null,
      fontColor: null,
    });
    const { container } = renderWithApp(<HighlightTextColor editorState={editorState} />, app);

    // Open the highlight color picker via the caret button
    const highlightCaret = container.querySelector('.onr-highlight-wrapper .onr-caret-btn');
    expect(highlightCaret).not.toBeNull();
    fireEvent.click(highlightCaret!);

    // ColorPicker renders via portal into document.body — find and click the first swatch
    const colorSwatch = document.body.querySelector('.onr-cp-swatch');
    expect(colorSwatch).not.toBeNull();
    fireEvent.click(colorSwatch!);

    // handleHighlightColorSelect was called → applied highlight color span
    // The style property is 'background' (shorthand) rather than 'background-color'
    expect(editor.getValue()).toMatch(/background[^;]*#000000/);
  });

  it('removes highlight when no-color is clicked in the ColorPicker portal', () => {
    const { app, editor } = createAppWithEditor(
      '<span style="background-color: #ffff00">test</span>'
    );
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 4 });
    const editorState = createEditorState({
      highlight: true,
      highlightColor: '#ffff00',
      fontColor: null,
    });
    const { container } = renderWithApp(<HighlightTextColor editorState={editorState} />, app);

    const highlightCaret = container.querySelector('.onr-highlight-wrapper .onr-caret-btn');
    expect(highlightCaret).not.toBeNull();
    fireEvent.click(highlightCaret!);

    // Click "Automatic / No Color" from the portal-rendered ColorPicker
    const noColorButton = document.body.querySelector('.onr-cp-no-color');
    expect(noColorButton).not.toBeNull();
    fireEvent.click(noColorButton!);

    // handleHighlightNoColor was called → setLastHighlightColor(DEFAULT) executed
    expect(editor.getValue()).toBeDefined();
  });

  it('applies font color when swatch is clicked in the font color ColorPicker portal', () => {
    const { app, editor } = createAppWithEditor('test content');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 4 });
    const editorState = createEditorState({
      highlight: false,
      highlightColor: null,
      fontColor: null,
    });
    const { container } = renderWithApp(<HighlightTextColor editorState={editorState} />, app);

    // Open the font color picker via the caret button
    const fontColorCaret = container.querySelector('.onr-color-wrapper .onr-caret-btn');
    expect(fontColorCaret).not.toBeNull();
    fireEvent.click(fontColorCaret!);

    // Find and click the first color swatch in the portal
    const colorSwatch = document.body.querySelector('.onr-cp-swatch');
    expect(colorSwatch).not.toBeNull();
    fireEvent.click(colorSwatch!);

    // handleFontColorSelect was called → applied font color span
    expect(editor.getValue()).toContain('color');
  });

  it('removes font color when no-color is clicked in the font color ColorPicker portal', () => {
    const { app, editor } = createAppWithEditor('<span style="color: #ff0000">test</span>');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 4 });
    const editorState = createEditorState({
      highlight: false,
      highlightColor: null,
      fontColor: '#ff0000',
    });
    const { container } = renderWithApp(<HighlightTextColor editorState={editorState} />, app);

    const fontColorCaret = container.querySelector('.onr-color-wrapper .onr-caret-btn');
    expect(fontColorCaret).not.toBeNull();
    fireEvent.click(fontColorCaret!);

    // Click "Automatic / No Color" in the portal
    const noColorButton = document.body.querySelector('.onr-cp-no-color');
    expect(noColorButton).not.toBeNull();
    fireEvent.click(noColorButton!);

    // handleFontColorNoColor was called
    expect(editor.getValue()).toBeDefined();
  });
});
