/**
 * In-memory editor mock for unit tests.
 * Fully implements the Obsidian Editor interface needed by formatting helpers.
 */
export class MockEditor {
  private lines: string[] = [''];
  private cursor: { line: number; ch: number } = { line: 0, ch: 0 };
  private selFrom: { line: number; ch: number } | null = null;
  private selTo: { line: number; ch: number } | null = null;

  // ── State helpers ──────────────────────────────────────────────────────────

  getValue(): string {
    return this.lines.join('\n');
  }

  setValue(content: string): void {
    this.lines = content.split('\n');
    this.cursor = { line: 0, ch: 0 };
    this.selFrom = null;
    this.selTo = null;
  }

  getLine(n: number): string {
    return this.lines[n] ?? '';
  }

  lastLine(): number {
    return this.lines.length - 1;
  }

  setLine(n: number, text: string): void {
    this.lines[n] = text;
  }

  getCursor(): { line: number; ch: number } {
    return { ...this.cursor };
  }

  setCursor(pos: { line: number; ch: number }): void {
    this.cursor = { ...pos };
    this.selFrom = null;
    this.selTo = null;
  }

  getSelection(): string {
    if (!this.selFrom || !this.selTo) return '';
    const from = this.selFrom;
    const to = this.selTo;
    if (from.line === to.line) {
      return this.lines[from.line].slice(from.ch, to.ch);
    }
    // Multi-line selection
    let result = this.lines[from.line].slice(from.ch);
    for (let lineIndex = from.line + 1; lineIndex < to.line; lineIndex++) {
      result += '\n' + this.lines[lineIndex];
    }
    result += '\n' + this.lines[to.line].slice(0, to.ch);
    return result;
  }

  setSelection(from: { line: number; ch: number }, to: { line: number; ch: number }): void {
    this.selFrom = { ...from };
    this.selTo = { ...to };
    this.cursor = { ...to };
  }

  replaceSelection(text: string): void {
    if (!this.selFrom || !this.selTo) {
      // No selection — insert at cursor
      const { line, ch } = this.cursor;
      this.lines[line] = this.lines[line].slice(0, ch) + text + this.lines[line].slice(ch);
      this.cursor = { line, ch: ch + text.length };
      return;
    }
    const from = this.selFrom;
    const to = this.selTo;
    if (from.line === to.line) {
      const before = this.lines[from.line].slice(0, from.ch);
      const after = this.lines[from.line].slice(to.ch);
      this.lines[from.line] = before + text + after;
      this.cursor = { line: from.line, ch: from.ch + text.length };
    } else {
      const before = this.lines[from.line].slice(0, from.ch);
      const after = this.lines[to.line].slice(to.ch);
      const joined = before + text + after;
      const newLines = joined.split('\n');
      this.lines.splice(from.line, to.line - from.line + 1, ...newLines);
      this.cursor = {
        line: from.line + newLines.length - 1,
        ch: newLines[newLines.length - 1].length - after.length,
      };
    }
    this.selFrom = null;
    this.selTo = null;
  }

  replaceRange(
    text: string,
    from: { line: number; ch: number },
    to?: { line: number; ch: number }
  ): void {
    if (to && (to.line !== from.line || to.ch !== from.ch)) {
      // Delete range then insert
      const savedFrom = this.selFrom;
      const savedTo = this.selTo;
      this.selFrom = from;
      this.selTo = to;
      this.replaceSelection(text);
      if (!text) {
        this.selFrom = savedFrom;
        this.selTo = savedTo;
      }
    } else {
      // Pure insert at position
      const { line, ch } = from;
      this.lines[line] = this.lines[line].slice(0, ch) + text + this.lines[line].slice(ch);
    }
  }

  /**
   * Applies multiple changes atomically (simulates Obsidian's transaction API).
   * For the mock, we simply apply changes in sequence.
   */
  transaction({
    changes,
  }: {
    changes: Array<{
      from: { line: number; ch: number };
      to?: { line: number; ch: number };
      text: string;
    }>;
  }): void {
    // Apply changes in reverse order to maintain correct positions
    for (let index = changes.length - 1; index >= 0; index--) {
      const change = changes[index];
      if (change) {
        this.replaceRange(change.text, change.from, change.to);
      }
    }
  }
}
