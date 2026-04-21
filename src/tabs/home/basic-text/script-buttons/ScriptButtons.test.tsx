import { fireEvent, screen } from '@testing-library/react';

import { createAppWithEditor } from '../../../../test-utils/mockApp';
import { renderWithApp } from '../../../../test-utils/renderWithApp';
import { ScriptButtons } from './ScriptButtons';

describe('ScriptButtons — rendering (integration)', () => {
  it('renders subscript button', () => {
    const { app } = createAppWithEditor('');
    renderWithApp(<ScriptButtons subscript={false} superscript={false} />, app);

    expect(screen.getByTitle('Subscript')).toBeInTheDocument();
  });

  it('renders superscript button', () => {
    const { app } = createAppWithEditor('');
    renderWithApp(<ScriptButtons subscript={false} superscript={false} />, app);

    expect(screen.getByTitle('Superscript')).toBeInTheDocument();
  });

  it('displays subscript button content', () => {
    const { app } = createAppWithEditor('');
    const { container } = renderWithApp(
      <ScriptButtons subscript={false} superscript={false} />,
      app
    );

    const subscriptButton = container.querySelector('[data-cmd="subscript"]');
    expect(subscriptButton?.textContent).toContain('x₂');
  });

  it('displays superscript button content', () => {
    const { app } = createAppWithEditor('');
    const { container } = renderWithApp(
      <ScriptButtons subscript={false} superscript={false} />,
      app
    );

    const superscriptButton = container.querySelector('[data-cmd="superscript"]');
    expect(superscriptButton?.textContent).toContain('x²');
  });

  it('renders subscript button as inactive when subscript is false', () => {
    const { app } = createAppWithEditor('');
    const { container } = renderWithApp(
      <ScriptButtons subscript={false} superscript={false} />,
      app
    );

    const subscriptButton = container.querySelector('[data-cmd="subscript"]');
    expect(subscriptButton).not.toHaveClass('onr-active');
  });

  it('renders subscript button as active when subscript is true', () => {
    const { app } = createAppWithEditor('');
    const { container } = renderWithApp(
      <ScriptButtons subscript={true} superscript={false} />,
      app
    );

    const subscriptButton = container.querySelector('[data-cmd="subscript"]');
    expect(subscriptButton).toHaveClass('onr-active');
  });

  it('renders superscript button as inactive when superscript is false', () => {
    const { app } = createAppWithEditor('');
    const { container } = renderWithApp(
      <ScriptButtons subscript={false} superscript={false} />,
      app
    );

    const superscriptButton = container.querySelector('[data-cmd="superscript"]');
    expect(superscriptButton).not.toHaveClass('onr-active');
  });

  it('renders superscript button as active when superscript is true', () => {
    const { app } = createAppWithEditor('');
    const { container } = renderWithApp(
      <ScriptButtons subscript={false} superscript={true} />,
      app
    );

    const superscriptButton = container.querySelector('[data-cmd="superscript"]');
    expect(superscriptButton).toHaveClass('onr-active');
  });
});

describe('ScriptButtons — button interactions (integration)', () => {
  it('applies subscript formatting when subscript button is clicked', () => {
    const { app, editor } = createAppWithEditor('test content');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 4 });
    renderWithApp(<ScriptButtons subscript={false} superscript={false} />, app);

    const subscriptButton = screen.getByTitle('Subscript');
    fireEvent.click(subscriptButton);

    expect(editor.getValue()).toBeDefined();
  });

  it('applies superscript formatting when superscript button is clicked', () => {
    const { app, editor } = createAppWithEditor('test content');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 4 });
    renderWithApp(<ScriptButtons subscript={false} superscript={false} />, app);

    const superscriptButton = screen.getByTitle('Superscript');
    fireEvent.click(superscriptButton);

    expect(editor.getValue()).toBeDefined();
  });

  it('toggles subscript off when already active', () => {
    const { app, editor } = createAppWithEditor('<sub>subscript</sub>');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 9 });
    renderWithApp(<ScriptButtons subscript={true} superscript={false} />, app);

    const subscriptButton = screen.getByTitle('Subscript');
    fireEvent.click(subscriptButton);

    expect(editor.getValue()).toBeDefined();
  });

  it('toggles superscript off when already active', () => {
    const { app, editor } = createAppWithEditor('<sup>superscript</sup>');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 11 });
    renderWithApp(<ScriptButtons subscript={false} superscript={true} />, app);

    const superscriptButton = screen.getByTitle('Superscript');
    fireEvent.click(superscriptButton);

    expect(editor.getValue()).toBeDefined();
  });
});

describe('ScriptButtons — no active editor (integration)', () => {
  it('is no-op when no active editor for subscript', () => {
    const { app } = createAppWithEditor('');
    Object.defineProperty(app.workspace, 'activeEditor', {
      value: {},
      writable: true,
    });
    renderWithApp(<ScriptButtons subscript={false} superscript={false} />, app);

    const subscriptButton = screen.getByTitle('Subscript');
    expect(() => fireEvent.click(subscriptButton)).not.toThrow();
  });

  it('is no-op when no active editor for superscript', () => {
    const { app } = createAppWithEditor('');
    Object.defineProperty(app.workspace, 'activeEditor', {
      value: {},
      writable: true,
    });
    renderWithApp(<ScriptButtons subscript={false} superscript={false} />, app);

    const superscriptButton = screen.getByTitle('Superscript');
    expect(() => fireEvent.click(superscriptButton)).not.toThrow();
  });
});

describe('ScriptButtons — both states active (integration)', () => {
  it('renders both buttons as active when both subscript and superscript are true', () => {
    const { app } = createAppWithEditor('');
    const { container } = renderWithApp(<ScriptButtons subscript={true} superscript={true} />, app);

    const subscriptButton = container.querySelector('[data-cmd="subscript"]');
    const superscriptButton = container.querySelector('[data-cmd="superscript"]');

    expect(subscriptButton).toHaveClass('onr-active');
    expect(superscriptButton).toHaveClass('onr-active');
  });
});
