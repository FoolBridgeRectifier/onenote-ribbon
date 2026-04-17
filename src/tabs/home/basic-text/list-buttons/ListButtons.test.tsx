import React from 'react';
import { screen, fireEvent, act } from '@testing-library/react';
import { ListButtons } from './ListButtons';
import { createMockApp, createMockPlugin } from '../../../../test-utils/mockApp';
import { renderWithApp } from '../../../../test-utils/renderWithApp';
import { MockEditor } from '../../../../test-utils/MockEditor';
import {
  LIST_BTN_CMD_BULLET_TOGGLE,
  LIST_BTN_CMD_BULLET_CARET,
  LIST_BTN_CMD_NUMBER_TOGGLE,
  LIST_BTN_CMD_NUMBER_CARET,
  LIST_BTN_CMD_OUTDENT,
  LIST_BTN_CMD_INDENT,
  OBSIDIAN_CMD_TOGGLE_BULLET_LIST,
  OBSIDIAN_CMD_TOGGLE_NUMBER_LIST,
  OBSIDIAN_CMD_UNINDENT_LIST,
  OBSIDIAN_CMD_INDENT_LIST,
} from './constants';

// app.commands._called is a plain array, not a jest.fn().
// Use .toContain() for command assertions.

function renderListButtons(editorState = {}) {
  const editor = new MockEditor('');
  const app = createMockApp(editor);
  const mockPlugin = createMockPlugin({});

  renderWithApp(
    <ListButtons editorState={{ bulletList: false, numberedList: false, ...editorState } as any} />,
    app,
    { plugin: mockPlugin },
  );

  return { app, editor, mockPlugin };
}

describe('ListButtons', () => {
  it('renders bullet-list toggle button', () => {
    renderListButtons();
    expect(document.querySelector(`[data-cmd="${LIST_BTN_CMD_BULLET_TOGGLE}"]`)).toBeInTheDocument();
  });

  it('renders bullet-list caret button', () => {
    renderListButtons();
    expect(document.querySelector(`[data-cmd="${LIST_BTN_CMD_BULLET_CARET}"]`)).toBeInTheDocument();
  });

  it('renders number-list toggle button', () => {
    renderListButtons();
    expect(document.querySelector(`[data-cmd="${LIST_BTN_CMD_NUMBER_TOGGLE}"]`)).toBeInTheDocument();
  });

  it('renders number-list caret button', () => {
    renderListButtons();
    expect(document.querySelector(`[data-cmd="${LIST_BTN_CMD_NUMBER_CARET}"]`)).toBeInTheDocument();
  });

  it('renders outdent button', () => {
    renderListButtons();
    expect(document.querySelector(`[data-cmd="${LIST_BTN_CMD_OUTDENT}"]`)).toBeInTheDocument();
  });

  it('renders indent button', () => {
    renderListButtons();
    expect(document.querySelector(`[data-cmd="${LIST_BTN_CMD_INDENT}"]`)).toBeInTheDocument();
  });

  it('toggle bullet-list calls editor:toggle-bullet-list command', () => {
    const { app } = renderListButtons();
    fireEvent.click(document.querySelector(`[data-cmd="${LIST_BTN_CMD_BULLET_TOGGLE}"]`)!);
    expect(app.commands._called).toContain(OBSIDIAN_CMD_TOGGLE_BULLET_LIST);
  });

  it('toggle number-list calls editor:toggle-numbered-list command', () => {
    const { app } = renderListButtons();
    fireEvent.click(document.querySelector(`[data-cmd="${LIST_BTN_CMD_NUMBER_TOGGLE}"]`)!);
    expect(app.commands._called).toContain(OBSIDIAN_CMD_TOGGLE_NUMBER_LIST);
  });

  it('outdent calls editor:unindent-list command', () => {
    const { app } = renderListButtons();
    fireEvent.click(document.querySelector(`[data-cmd="${LIST_BTN_CMD_OUTDENT}"]`)!);
    expect(app.commands._called).toContain(OBSIDIAN_CMD_UNINDENT_LIST);
  });

  it('indent calls editor:indent-list command', () => {
    const { app } = renderListButtons();
    fireEvent.click(document.querySelector(`[data-cmd="${LIST_BTN_CMD_INDENT}"]`)!);
    expect(app.commands._called).toContain(OBSIDIAN_CMD_INDENT_LIST);
  });

  it('bullet-list toggle button has onr-active class when bulletList is true', () => {
    renderListButtons({ bulletList: true });
    const toggleButton = document.querySelector(`[data-cmd="${LIST_BTN_CMD_BULLET_TOGGLE}"]`)!;
    expect(toggleButton).toHaveClass('onr-active');
  });

  it('number-list toggle button has onr-active class when numberedList is true', () => {
    renderListButtons({ numberedList: true });
    const toggleButton = document.querySelector(`[data-cmd="${LIST_BTN_CMD_NUMBER_TOGGLE}"]`)!;
    expect(toggleButton).toHaveClass('onr-active');
  });

  it('bullet caret click opens BulletLibrary', async () => {
    renderListButtons();
    await act(async () => {
      fireEvent.click(document.querySelector(`[data-cmd="${LIST_BTN_CMD_BULLET_CARET}"]`)!);
    });
    expect(screen.getByText('Bullet Library')).toBeInTheDocument();
  });

  it('number caret click opens NumberLibrary', async () => {
    renderListButtons();
    await act(async () => {
      fireEvent.click(document.querySelector(`[data-cmd="${LIST_BTN_CMD_NUMBER_CARET}"]`)!);
    });
    expect(screen.getByText('Numbering Library')).toBeInTheDocument();
  });

  it('BulletLibrary closes when a preset is selected', async () => {
    renderListButtons();

    await act(async () => {
      fireEvent.click(document.querySelector(`[data-cmd="${LIST_BTN_CMD_BULLET_CARET}"]`)!);
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Classic'));
    });

    expect(screen.queryByText('Bullet Library')).toBeNull();
  });

  it('NumberLibrary closes when a preset is selected', async () => {
    renderListButtons();

    await act(async () => {
      fireEvent.click(document.querySelector(`[data-cmd="${LIST_BTN_CMD_NUMBER_CARET}"]`)!);
    });

    await act(async () => {
      fireEvent.click(screen.getByText('1. 2. 3.'));
    });

    expect(screen.queryByText('Numbering Library')).toBeNull();
  });

  it('does not throw when bullet toggle is clicked with no active editor', () => {
    const app = createMockApp();
    const mockPlugin = createMockPlugin({});
    renderWithApp(
      <ListButtons editorState={{ bulletList: false, numberedList: false } as any} />,
      app,
      { plugin: mockPlugin },
    );

    expect(() =>
      fireEvent.click(document.querySelector(`[data-cmd="${LIST_BTN_CMD_BULLET_TOGGLE}"]`)!),
    ).not.toThrow();
  });
});
