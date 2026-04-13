import { Editor } from 'obsidian';
import {
  createEnclosingHtmlTagFinder,
  CursorOrSelectionLocation,
  TextPosition,
} from '../../../../shared/editor/enclosing-html-tags/enclosingHtmlTags';
import { FormatPainterFormat } from './interfaces';

interface SelectionAwareEditor extends Editor {
  getCursor(position?: 'from' | 'to'): TextPosition;
}

function isBeforeOrAt(
  firstPosition: TextPosition,
  secondPosition: TextPosition,
): boolean {
  if (firstPosition.line < secondPosition.line) {
    return true;
  }

  if (firstPosition.line > secondPosition.line) {
    return false;
  }

  return firstPosition.ch <= secondPosition.ch;
}

function normalizeSelectionBounds(
  firstPosition: TextPosition,
  secondPosition: TextPosition,
): { leftPosition: TextPosition; rightPosition: TextPosition } {
  if (isBeforeOrAt(firstPosition, secondPosition)) {
    return {
      leftPosition: firstPosition,
      rightPosition: secondPosition,
    };
  }

  return {
    leftPosition: secondPosition,
    rightPosition: firstPosition,
  };
}

export function getCurrentLocation(editor: Editor): CursorOrSelectionLocation {
  const selectionAwareEditor = editor as unknown as SelectionAwareEditor;
  const selectedText = editor.getSelection();

  if (!selectedText) {
    return {
      cursorPosition: selectionAwareEditor.getCursor(),
    };
  }

  const selectionStartPosition = selectionAwareEditor.getCursor('from');
  const selectionEndPosition = selectionAwareEditor.getCursor('to');
  const { leftPosition, rightPosition } = normalizeSelectionBounds(
    selectionStartPosition,
    selectionEndPosition,
  );

  return {
    leftPosition,
    rightPosition,
  };
}

export function getCurrentLocationSignature(editor: Editor): string {
  const location = getCurrentLocation(editor);

  if ('cursorPosition' in location) {
    return `cursor:${location.cursorPosition.line}:${location.cursorPosition.ch}`;
  }

  return `selection:${location.leftPosition.line}:${location.leftPosition.ch}-${location.rightPosition.line}:${location.rightPosition.ch}`;
}

export function getEnclosingTagNamesAtCurrentLocation(
  editor: Editor,
): string[] {
  const sourceText = editor.getValue();
  const location = getCurrentLocation(editor);
  const enclosingTagFinder = createEnclosingHtmlTagFinder(sourceText);

  return enclosingTagFinder.getEnclosingTagNames(location);
}

export function getMissingTagNames(
  sourceTagNames: string[],
  targetTagNames: string[],
): string[] {
  const normalizedTargetTagNameSet = new Set(
    targetTagNames.map((targetTagName) => targetTagName.toLowerCase()),
  );
  const missingTagNames: string[] = [];
  const includedTagNameSet = new Set<string>();

  for (
    let sourceTagNameIndex = 0;
    sourceTagNameIndex < sourceTagNames.length;
    sourceTagNameIndex += 1
  ) {
    const sourceTagName = sourceTagNames[sourceTagNameIndex];
    const normalizedSourceTagName = sourceTagName.toLowerCase();

    if (normalizedTargetTagNameSet.has(normalizedSourceTagName)) {
      continue;
    }

    if (includedTagNameSet.has(normalizedSourceTagName)) {
      continue;
    }

    missingTagNames.push(sourceTagName);
    includedTagNameSet.add(normalizedSourceTagName);
  }

  return missingTagNames;
}

function wrapSelectionWithTags(
  selectedText: string,
  tagNames: string[],
): string {
  return tagNames.reduce(
    (wrappedText, tagName) => `<${tagName}>${wrappedText}</${tagName}>`,
    selectedText,
  );
}

export function applyMissingTagsToSelection(
  editor: Editor,
  missingTagNames: string[],
): boolean {
  if (missingTagNames.length === 0) {
    return false;
  }

  const selectedText = editor.getSelection();
  if (!selectedText) {
    return false;
  }

  editor.replaceSelection(wrapSelectionWithTags(selectedText, missingTagNames));
  return true;
}

export function applyFormatPainter(
  editor: Editor,
  selection: string,
  format: FormatPainterFormat,
): void {
  if (!selection) {
    return;
  }

  editor.replaceSelection(`${format.prefix}${selection}${format.suffix}`);
}
