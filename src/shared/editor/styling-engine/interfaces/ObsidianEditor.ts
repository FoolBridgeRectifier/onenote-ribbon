// === Editor Integration ===

/** Minimal Obsidian Editor interface for styling operations. Satisfies the full Editor via structural typing. */
export interface ObsidianEditor {
  getValue(): string;
  getCursor(which?: 'from' | 'to' | 'head' | 'anchor'): { line: number; ch: number };
  setCursor(position: { line: number; ch: number }): void;
  setSelection(anchor: { line: number; ch: number }, head: { line: number; ch: number }): void;
  transaction(spec: {
    changes?: Array<{
      from: { line: number; ch: number };
      to: { line: number; ch: number };
      text: string;
    }>;
    selection?: { from: { line: number; ch: number }; to?: { line: number; ch: number } };
  }): void;
  getLine(lineNumber: number): string;
  setLine(lineNumber: number, text: string): void;
  getSelection(): string;
  replaceSelection(replacement: string): void;
  lastLine(): number;
}
