import type { App } from 'obsidian';
import type { AppWithCommands } from '../../../shared/context/interfaces';
import type { StyleEntry } from './interfaces';
import { STYLES_LIST } from './constants';

/** Returns the CSS class that drives the visual appearance of a style preview button. */
export function resolveStyleLevelClass(style: StyleEntry): string {
  if (style.level === 0 && !style.type) return 'onr-style-normal';
  if (style.level === 1) return 'onr-style-h1';
  if (style.level === 2) return 'onr-style-h2';
  if (style.level === 3) return 'onr-style-h3';
  if (style.level === 4) return 'onr-style-h4';
  if (style.level === 5) return 'onr-style-h5';
  if (style.level === 6) return 'onr-style-h6';
  if (style.type === 'quote') return 'onr-style-quote';
  if (style.type === 'code') return 'onr-style-code';
  return '';
}

/**
 * Executes the appropriate editor command for the given style entry.
 * Handles block-quote, code-block, normal paragraph, and heading levels 1-6.
 */
export function applyStyle(app: App, style: StyleEntry): void {
  const commandApp = app as unknown as AppWithCommands;

  if (style.type === 'quote') {
    commandApp.commands.executeCommandById('editor:toggle-blockquote');
    return;
  }

  if (style.type === 'code') {
    commandApp.commands.executeCommandById('editor:toggle-code');
    return;
  }

  if (style.level === 0) {
    // Normal paragraph — strip any heading prefix from the current line
    const editor = app.workspace.activeEditor?.editor;
    if (!editor) return;
    const cursor = editor.getCursor();
    const line = editor.getLine(cursor.line);
    editor.setLine(cursor.line, line.replace(/^#+\s/, ''));
    return;
  }

  commandApp.commands.executeCommandById(`editor:set-heading-${style.level}`);
}

/** Clears heading formatting from the current line and closes the dropdown. */
export function clearStyleFormatting(app: App, onClose: () => void): void {
  const editor = app.workspace.activeEditor?.editor;
  if (!editor) return;

  const cursor = editor.getCursor();
  const line = editor.getLine(cursor.line);
  editor.setLine(cursor.line, line.replace(/^#+\s/, ''));

  onClose();
}

/**
 * Computes the new scroll offset so the active style stays visible.
 * Returns the unchanged offset if no adjustment is needed.
 */
export function computeScrollOffset(headLevel: number, currentOffset: number): number {
  const activeIndex = STYLES_LIST.findIndex((style) => {
    if (style.level > 0) return headLevel === style.level;
    if (style.level === 0 && !style.type) return headLevel === 0;
    return false;
  });

  if (activeIndex === -1) return currentOffset;
  if (activeIndex < currentOffset) return activeIndex;
  if (activeIndex > currentOffset + 1) return Math.min(activeIndex, STYLES_LIST.length - 2);
  return currentOffset;
}
