/** Minimal Obsidian API stub for unit tests. */

export interface EditorPosition {
  line: number;
  ch: number;
}

export abstract class Editor {
  abstract getValue(): string;
  abstract setValue(content: string): void;
  abstract getLine(n: number): string;
  abstract setLine(n: number, text: string): void;
  abstract getCursor(): EditorPosition;
  abstract setCursor(pos: EditorPosition): void;
  abstract getSelection(): string;
  abstract setSelection(anchor: EditorPosition, head: EditorPosition): void;
  abstract replaceSelection(replacement: string): void;
  abstract replaceRange(
    replacement: string,
    from: EditorPosition,
    to?: EditorPosition,
  ): void;
}

export class Notice {
  constructor(_msg: string) {}
}

export class Plugin {}

export class App {}

export class Component {
  load() {}
  unload() {}
}

export class TFile {
  path = '';
}

export const MarkdownRenderer = {
  render: jest.fn().mockResolvedValue(undefined),
};
