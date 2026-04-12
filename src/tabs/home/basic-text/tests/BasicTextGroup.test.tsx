/**
 * Integration tests for BasicTextGroup (§2, §3, §4, §6, §7, §12)
 *
 * Tests component-level behavior: button rendering, clicks affecting the editor,
 * active state CSS classes, dropdowns opening, no-editor safety.
 */
import React from "react";
import { screen, fireEvent, within } from "@testing-library/react";
import { renderWithApp } from "../../../../test-utils/renderWithApp";
import {
  createMockApp,
  createAppWithEditor,
} from "../../../../test-utils/mockApp";
import { BasicTextGroup } from "../BasicTextGroup";
import { EditorState } from "../../../../shared/hooks/useEditorState";

const DEFAULT_ES: EditorState = {
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
  fontFamily: "",
  fontSize: "",
};

function renderBasic(content = "", editorState: Partial<EditorState> = {}) {
  const { app, editor } = createAppWithEditor(content);
  const es = { ...DEFAULT_ES, ...editorState };
  const result = renderWithApp(<BasicTextGroup />, app);
  return { ...result, app, editor, es };
}

// ── §2.1 Bold ────────────────────────────────────────────────────────────────

describe("BasicTextGroup — §2.1 Bold (integration)", () => {
  it.skip("§2.1.1 Bold button wraps selected text in **", () => {
    const { editor } = renderBasic("hello world");
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });
    fireEvent.click(screen.getByText("B"));
    expect(editor.getValue()).toBe("**hello** world");
  });

  it.skip("§2.1.2 Bold button unwraps **selected** text", () => {
    const { editor } = renderBasic("**hello** world");
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 9 });
    fireEvent.click(screen.getByText("B"));
    expect(editor.getValue()).toBe("hello world");
  });

  it.skip("§2.1.3 Bold button inserts ** pair at cursor with no selection", () => {
    const { editor } = renderBasic("hello");
    editor.setCursor({ line: 0, ch: 5 });
    fireEvent.click(screen.getByText("B"));
    expect(editor.getValue()).toBe("hello****");
    expect(editor.getCursor()).toEqual({ line: 0, ch: 7 });
  });

  it.skip("§2.1.4 Bold button wraps partial selection (no unwrap)", () => {
    const { editor } = renderBasic("**hello** world");
    editor.setSelection({ line: 0, ch: 2 }, { line: 0, ch: 7 }); // "hello"
    fireEvent.click(screen.getByText("B"));
    expect(editor.getValue()).toBe("****hello**** world");
  });

  it.skip("§2.1.5 Bold button is no-op when no active editor", () => {
    const app = createMockApp();
    renderWithApp(<BasicTextGroup />, app);
    expect(() => fireEvent.click(screen.getByText("B"))).not.toThrow();
  });
});

// ── §2.2 Italic ──────────────────────────────────────────────────────────────

describe("BasicTextGroup — §2.2 Italic (integration)", () => {
  it.skip("§2.2.1 Italic button wraps selected text in *", () => {
    const { editor } = renderBasic("hello");
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });
    fireEvent.click(screen.getByText("I"));
    expect(editor.getValue()).toBe("*hello*");
  });

  it.skip("§2.2.2 Italic button unwraps *text*", () => {
    const { editor } = renderBasic("*hello*");
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 7 });
    fireEvent.click(screen.getByText("I"));
    expect(editor.getValue()).toBe("hello");
  });

  it.skip("§2.2.3 Italic button inserts * pair at cursor with no selection", () => {
    const { editor } = renderBasic("");
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("I"));
    expect(editor.getValue()).toBe("**");
    expect(editor.getCursor()).toEqual({ line: 0, ch: 1 });
  });

  it.skip("§2.2.4 Italic wraps **bold** (no special detection — wraps)", () => {
    const { editor } = renderBasic("**bold**");
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 8 });
    fireEvent.click(screen.getByText("I"));
    expect(editor.getValue()).toBe("***bold***");
  });

  it.skip("§2.2.5 Italic is no-op when no active editor", () => {
    const app = createMockApp();
    renderWithApp(<BasicTextGroup />, app);
    expect(() => fireEvent.click(screen.getByText("I"))).not.toThrow();
  });
});

// ── §2.3 Underline ───────────────────────────────────────────────────────────

describe("BasicTextGroup — §2.3 Underline (integration)", () => {
  it.skip("§2.3.1 Underline wraps selection in <u>…</u>", () => {
    const { editor } = renderBasic("hello");
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });
    fireEvent.click(screen.getByText("U"));
    expect(editor.getValue()).toBe("<u>hello</u>");
  });

  it.skip("§2.3.2 Underline unwraps <u>…</u>", () => {
    const { editor } = renderBasic("<u>hello</u>");
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 12 });
    fireEvent.click(screen.getByText("U"));
    expect(editor.getValue()).toBe("hello");
  });

  it.skip("§2.3.3 Underline inserts <u></u> at cursor with no selection", () => {
    const { editor } = renderBasic("");
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("U"));
    expect(editor.getValue()).toBe("<u></u>");
    expect(editor.getCursor()).toEqual({ line: 0, ch: 3 });
  });

  it.skip("§2.3.4 Underline is no-op when no active editor", () => {
    const app = createMockApp();
    renderWithApp(<BasicTextGroup />, app);
    expect(() => fireEvent.click(screen.getByText("U"))).not.toThrow();
  });
});

// ── §2.4 Strikethrough ───────────────────────────────────────────────────────

describe("BasicTextGroup — §2.4 Strikethrough (integration)", () => {
  it.skip("§2.4.1 Strikethrough wraps selection in ~~", () => {
    const { editor } = renderBasic("hello");
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });
    fireEvent.click(screen.getByText("S̶"));
    expect(editor.getValue()).toBe("~~hello~~");
  });

  it.skip("§2.4.2 Strikethrough unwraps ~~text~~", () => {
    const { editor } = renderBasic("~~hello~~");
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 9 });
    fireEvent.click(screen.getByText("S̶"));
    expect(editor.getValue()).toBe("hello");
  });

  it.skip("§2.4.3 Strikethrough inserts ~~~~ at cursor with no selection", () => {
    const { editor } = renderBasic("");
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("S̶"));
    expect(editor.getValue()).toBe("~~~~");
    expect(editor.getCursor()).toEqual({ line: 0, ch: 2 });
  });

  it.skip("§2.4.4 Strikethrough is no-op when no active editor", () => {
    const app = createMockApp();
    renderWithApp(<BasicTextGroup />, app);
    expect(() => fireEvent.click(screen.getByText("S̶"))).not.toThrow();
  });
});

// ── §2.5 Highlight ───────────────────────────────────────────────────────────

describe("BasicTextGroup — §2.5 Highlight (integration)", () => {
  it.skip("§2.5.1 Highlight wraps selection in ==", () => {
    const { editor } = renderBasic("hello");
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });
    fireEvent.click(screen.getByText("H̲"));
    expect(editor.getValue()).toBe("==hello==");
  });

  it.skip("§2.5.2 Highlight unwraps ==text==", () => {
    const { editor } = renderBasic("==hello==");
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 9 });
    fireEvent.click(screen.getByText("H̲"));
    expect(editor.getValue()).toBe("hello");
  });

  it.skip("§2.5.3 Highlight inserts ==== at cursor with no selection", () => {
    const { editor } = renderBasic("");
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("H̲"));
    expect(editor.getValue()).toBe("====");
    expect(editor.getCursor()).toEqual({ line: 0, ch: 2 });
  });

  it.skip("§2.5.4 Highlight is no-op when no active editor", () => {
    const app = createMockApp();
    renderWithApp(<BasicTextGroup />, app);
    expect(() => fireEvent.click(screen.getByText("H̲"))).not.toThrow();
  });
});

// ── §2.6 Subscript ───────────────────────────────────────────────────────────

describe("BasicTextGroup — §2.6 Subscript (integration)", () => {
  it.skip("§2.6.1 Subscript wraps selection in <sub>…</sub>", () => {
    const { editor } = renderBasic("hello 2 world");
    editor.setSelection({ line: 0, ch: 6 }, { line: 0, ch: 7 });
    fireEvent.click(screen.getByText("x₂"));
    expect(editor.getValue()).toBe("hello <sub>2</sub> world");
  });

  it.skip("§2.6.2 Subscript inserts empty pair at cursor with no selection", () => {
    const { editor } = renderBasic("hello");
    editor.setCursor({ line: 0, ch: 5 });
    fireEvent.click(screen.getByText("x₂"));
    expect(editor.getValue()).toBe("hello<sub></sub>");
  });

  it.skip("§2.6.3 Subscript toggles off when cursor is inside <sub>…</sub>", () => {
    const { editor } = renderBasic("x<sub>2</sub>");
    editor.setCursor({ line: 0, ch: 7 }); // inside "2"
    fireEvent.click(screen.getByText("x₂"));
    expect(editor.getValue()).toBe("x2");
  });

  it.skip("§2.6.4 Subscript converts <sup> to <sub> (mutual exclusion)", () => {
    const { editor } = renderBasic("x<sup>3</sup>");
    editor.setCursor({ line: 0, ch: 7 }); // inside "3"
    fireEvent.click(screen.getByText("x₂"));
    expect(editor.getValue()).toBe("x<sub>3</sub>");
  });

  it.skip("§2.6.5 Subscript is no-op when no active editor", () => {
    const app = createMockApp();
    renderWithApp(<BasicTextGroup />, app);
    expect(() => fireEvent.click(screen.getByText("x₂"))).not.toThrow();
  });

  it.skip("§2.6.6 Subscript does NOT toggle off at tag boundary (ch = 5)", () => {
    const { editor } = renderBasic("x<sub>2</sub>");
    editor.setCursor({ line: 0, ch: 5 }); // boundary
    fireEvent.click(screen.getByText("x₂"));
    expect(editor.getValue()).not.toBe("x2");
  });
});

// ── §2.7 Superscript ─────────────────────────────────────────────────────────

describe("BasicTextGroup — §2.7 Superscript (integration)", () => {
  it.skip("§2.7.1 Superscript wraps selection in <sup>…</sup>", () => {
    const { editor } = renderBasic("hello 2 world");
    editor.setSelection({ line: 0, ch: 6 }, { line: 0, ch: 7 });
    fireEvent.click(screen.getByText("x²"));
    expect(editor.getValue()).toBe("hello <sup>2</sup> world");
  });

  it.skip("§2.7.2 Superscript inserts empty pair at cursor with no selection", () => {
    const { editor } = renderBasic("hello");
    editor.setCursor({ line: 0, ch: 5 });
    fireEvent.click(screen.getByText("x²"));
    expect(editor.getValue()).toBe("hello<sup></sup>");
  });

  it.skip("§2.7.3 Superscript toggles off when cursor is inside <sup>…</sup>", () => {
    const { editor } = renderBasic("x<sup>3</sup>");
    editor.setCursor({ line: 0, ch: 7 }); // inside "3"
    fireEvent.click(screen.getByText("x²"));
    expect(editor.getValue()).toBe("x3");
  });

  it.skip("§2.7.4 Superscript converts <sub> to <sup> (mutual exclusion)", () => {
    const { editor } = renderBasic("x<sub>2</sub>");
    editor.setCursor({ line: 0, ch: 7 }); // inside "2"
    fireEvent.click(screen.getByText("x²"));
    expect(editor.getValue()).toBe("x<sup>2</sup>");
  });

  it.skip("§2.7.5 Superscript is no-op when no active editor", () => {
    const app = createMockApp();
    renderWithApp(<BasicTextGroup />, app);
    expect(() => fireEvent.click(screen.getByText("x²"))).not.toThrow();
  });

  it.skip("§2.7.6 Superscript does NOT toggle off at tag boundary", () => {
    const { editor } = renderBasic("x<sup>2</sup>");
    editor.setCursor({ line: 0, ch: 5 }); // boundary
    fireEvent.click(screen.getByText("x²"));
    expect(editor.getValue()).not.toBe("x2");
  });
});

// ── §3 Clear Formatting ──────────────────────────────────────────────────────

describe("BasicTextGroup — §3.1 Clear Formatting (integration)", () => {
  it.skip("§3.1.1 Clear Formatting button strips heading from line", () => {
    const { editor } = renderBasic("## My heading");
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("🧹 Clear"));
    expect(editor.getValue()).toBe("My heading");
  });

  it.skip("§3.1.2 Clear Formatting strips bold markers", () => {
    const { editor } = renderBasic("**bold** text");
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("🧹 Clear"));
    expect(editor.getValue()).toBe("bold text");
  });

  it.skip("§3.1.3 Clear Formatting strips italic markers", () => {
    const { editor } = renderBasic("*italic*");
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("🧹 Clear"));
    expect(editor.getValue()).toBe("italic");
  });

  it.skip("§3.1.4 Clear Formatting strips strikethrough", () => {
    const { editor } = renderBasic("~~strike~~");
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("🧹 Clear"));
    expect(editor.getValue()).toBe("strike");
  });

  it.skip("§3.1.5 Clear Formatting strips highlight", () => {
    const { editor } = renderBasic("==highlight==");
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("🧹 Clear"));
    expect(editor.getValue()).toBe("highlight");
  });

  it.skip("§3.1.6 Clear Formatting strips backtick code", () => {
    const { editor } = renderBasic("`code`");
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("🧹 Clear"));
    expect(editor.getValue()).toBe("code");
  });

  it.skip("§3.1.7 Clear Formatting strips HTML tags", () => {
    const { editor } = renderBasic("<u>under</u>");
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("🧹 Clear"));
    expect(editor.getValue()).toBe("under");
  });

  it.skip("§3.1.8 Clear Formatting clears selection only when selection active", () => {
    const { editor } = renderBasic("**bold** and plain");
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 8 });
    fireEvent.click(screen.getByText("🧹 Clear"));
    expect(editor.getValue()).toBe("bold and plain");
  });

  it.skip("§3.1.9 Clear Formatting strips both heading and bold", () => {
    const { editor } = renderBasic("## **bold heading**");
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("🧹 Clear"));
    expect(editor.getValue()).toBe("bold heading");
  });

  it.skip("§3.1.10 Clear Formatting leaves plain text unchanged", () => {
    const { editor } = renderBasic("Plain text");
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("🧹 Clear"));
    expect(editor.getValue()).toBe("Plain text");
  });

  it.skip("§3.1.11 Clear Formatting is no-op when no active editor", () => {
    const app = createMockApp();
    renderWithApp(<BasicTextGroup />, app);
    expect(() => fireEvent.click(screen.getByText("🧹 Clear"))).not.toThrow();
  });
});

// ── §3.2 Clear Inline ────────────────────────────────────────────────────────

describe("BasicTextGroup — §3.2 Clear Inline (integration)", () => {
  it.skip("§3.2.1 Clear Inline preserves heading prefix", () => {
    const { editor } = renderBasic("## My heading");
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("A̶"));
    expect(editor.getValue()).toBe("## My heading");
  });

  it.skip("§3.2.2 Clear Inline strips bold from plain line", () => {
    const { editor } = renderBasic("**bold**");
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("A̶"));
    expect(editor.getValue()).toBe("bold");
  });

  it.skip("§3.2.3 Clear Inline strips bold from heading line but preserves ##", () => {
    const { editor } = renderBasic("## **bold heading**");
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("A̶"));
    expect(editor.getValue()).toBe("## bold heading");
  });

  it.skip("§3.2.4 Clear Inline strips multiple inline markers from selection", () => {
    const { editor } = renderBasic("**bold** *italic*");
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 17 });
    fireEvent.click(screen.getByText("A̶"));
    expect(editor.getValue()).toBe("bold italic");
  });

  it.skip("§3.2.5 Clear Inline is no-op when no active editor", () => {
    const app = createMockApp();
    renderWithApp(<BasicTextGroup />, app);
    expect(() => fireEvent.click(screen.getByText("A̶"))).not.toThrow();
  });
});

// ── §4.1 Bullet List ─────────────────────────────────────────────────────────

describe("BasicTextGroup — §4.1 Bullet List (integration)", () => {
  it.skip("§4.1.1 Bullet List adds '- ' prefix", () => {
    const { editor } = renderBasic("Hello");
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("• List"));
    expect(editor.getValue()).toBe("- Hello");
  });

  it.skip("§4.1.2 Bullet List removes '- ' prefix", () => {
    const { editor } = renderBasic("- Hello");
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("• List"));
    expect(editor.getValue()).toBe("Hello");
  });

  it.skip("§4.1.3 Bullet List removes '- [x] ' checklist variant", () => {
    const { editor } = renderBasic("- [x] Hello");
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("• List"));
    expect(editor.getValue()).toBe("Hello");
  });

  it.skip("§4.1.4 Bullet List removes '- [X] ' checklist variant", () => {
    const { editor } = renderBasic("- [X] Hello");
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("• List"));
    expect(editor.getValue()).toBe("Hello");
  });

  it.skip("§4.1.5 Bullet List strips numbered prefix then adds bullet", () => {
    const { editor } = renderBasic("1. Hello");
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("• List"));
    expect(editor.getValue()).toBe("- Hello");
  });

  it.skip("§4.1.6 Bullet List strips heading prefix then adds bullet", () => {
    const { editor } = renderBasic("## Heading");
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("• List"));
    expect(editor.getValue()).toBe("- Heading");
  });

  it.skip("§4.1.7 Bullet List removes '- [ ] task' checkbox prefix", () => {
    const { editor } = renderBasic("- [ ] task");
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("• List"));
    expect(editor.getValue()).toBe("task");
  });

  it.skip("§4.1.8 Bullet List is no-op when no active editor", () => {
    const app = createMockApp();
    renderWithApp(<BasicTextGroup />, app);
    expect(() => fireEvent.click(screen.getByText("• List"))).not.toThrow();
  });
});

// ── §4.2 Numbered List ───────────────────────────────────────────────────────

describe("BasicTextGroup — §4.2 Numbered List (integration)", () => {
  it.skip("§4.2.1 Numbered List adds '1. ' prefix", () => {
    const { editor } = renderBasic("Hello");
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("1. List"));
    expect(editor.getValue()).toBe("1. Hello");
  });

  it.skip("§4.2.2 Numbered List removes '1. ' prefix", () => {
    const { editor } = renderBasic("1. Hello");
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("1. List"));
    expect(editor.getValue()).toBe("Hello");
  });

  it.skip("§4.2.3 Numbered List — '5. Hello' strips numbered via regex, adds 1.", () => {
    const { editor } = renderBasic("5. Hello");
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("1. List"));
    expect(editor.getValue()).toBe("1. Hello");
  });

  it.skip("§4.2.4 Numbered List strips bullet then adds numbered", () => {
    const { editor } = renderBasic("- Hello");
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("1. List"));
    expect(editor.getValue()).toBe("1. Hello");
  });

  it.skip("§4.2.5 Numbered List strips heading then adds numbered", () => {
    const { editor } = renderBasic("## Heading");
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("1. List"));
    expect(editor.getValue()).toBe("1. Heading");
  });

  it.skip("§4.2.6 Numbered List is no-op when no active editor", () => {
    const app = createMockApp();
    renderWithApp(<BasicTextGroup />, app);
    expect(() => fireEvent.click(screen.getByText("1. List"))).not.toThrow();
  });
});

// ── §4.3 Indent/Outdent ──────────────────────────────────────────────────────

describe("BasicTextGroup — §4.3 Indent/Outdent (integration)", () => {
  it.skip("§4.3.1 Indent button dispatches editor:indent-list command", () => {
    const { app } = renderBasic("- item");
    fireEvent.click(screen.getByText("⇥ In"));
    expect(app.commands._called).toContain("editor:indent-list");
  });

  it.skip("§4.3.2 Outdent button dispatches editor:unindent-list command", () => {
    const { app } = renderBasic("  - item");
    fireEvent.click(screen.getByText("⇤ Out"));
    expect(app.commands._called).toContain("editor:unindent-list");
  });

  it.skip("§4.3.3 Indent with no editor still dispatches command", () => {
    const app = createMockApp();
    renderWithApp(<BasicTextGroup />, app);
    fireEvent.click(screen.getByText("⇥ In"));
    expect(app.commands._called).toContain("editor:indent-list");
  });
});

// ── §6.1 Font Family Dropdown ─────────────────────────────────────────────────

describe("BasicTextGroup — §6.1 Font Family (integration)", () => {
  it.skip("§6.1.1 Font button opens font dropdown", () => {
    renderBasic("hello");
    fireEvent.click(screen.getByText("Font"));
    expect(screen.getByText("Arial")).toBeInTheDocument();
    expect(screen.getByText("Calibri")).toBeInTheDocument();
  });

  it.skip("§6.1.2 Selecting font with selection wraps in span", () => {
    const { editor } = renderBasic("hello");
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });
    fireEvent.click(screen.getByText("Font"));
    fireEvent.click(screen.getByText("Arial"));
    expect(editor.getValue()).toBe(
      '<span style="font-family:Arial">hello</span>',
    );
  });

  it.skip("§6.1.3 Selecting font without selection sets vault config", () => {
    const { app, editor } = renderBasic("hello");
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("Font"));
    fireEvent.click(screen.getByText("Arial"));
    expect((app.vault as any)._config["fontText"]).toBe("Arial");
  });

  it.skip("§6.1.4 Font button is no-op when no active editor (dropdown still opens)", () => {
    const app = createMockApp();
    renderWithApp(<BasicTextGroup />, app);
    expect(() => {
      fireEvent.click(screen.getByText("Font"));
      // Font dropdown opens but selecting does nothing without editor
    }).not.toThrow();
  });
});

// ── §6.2 Font Size Dropdown ───────────────────────────────────────────────────

describe("BasicTextGroup — §6.2 Font Size (integration)", () => {
  it.skip("§6.2.1 Size button opens size dropdown", () => {
    renderBasic("hello");
    fireEvent.click(screen.getByText("Size"));
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("14")).toBeInTheDocument();
  });

  it.skip("§6.2.2 Selecting size with selection wraps in span", () => {
    const { editor } = renderBasic("hello");
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });
    fireEvent.click(screen.getByText("Size"));
    fireEvent.click(screen.getByText("14"));
    expect(editor.getValue()).toBe('<span style="font-size:14px">hello</span>');
  });

  it.skip("§6.2.3 Selecting size without selection sets vault config", () => {
    const { app, editor } = renderBasic("hello");
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("Size"));
    fireEvent.click(screen.getByText("14"));
    expect((app.vault as any)._config["baseFontSize"]).toBe(14);
  });
});

// ── §6.3 Font Color Dropdown ─────────────────────────────────────────────────

describe("BasicTextGroup — §6.3 Font Color (integration)", () => {
  it.skip("§6.3.1 Color button opens color dropdown", () => {
    renderBasic("hello");
    fireEvent.click(screen.getByText("A"));
    expect(screen.getByText("Red")).toBeInTheDocument();
    expect(screen.getByText("Blue")).toBeInTheDocument();
  });

  it.skip("§6.3.2 Selecting color with selection wraps in color span", () => {
    const { editor } = renderBasic("hello");
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });
    fireEvent.click(screen.getByText("A"));
    fireEvent.click(screen.getByText("Red"));
    expect(editor.getValue()).toBe('<span style="color:#FF0000">hello</span>');
  });

  it.skip("§6.3.3 Selecting color without selection is no-op (no editor set action)", () => {
    const { editor } = renderBasic("hello");
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("A"));
    fireEvent.click(screen.getByText("Red"));
    // No selection → getSelection() returns "" → no replaceSelection call
    expect(editor.getValue()).toBe("hello");
  });
});

// ── §7 Align ──────────────────────────────────────────────────────────────────

/** Find a .onr-dd-item dropdown row whose text content includes the given phrase. */
function ddItem(phrase: string) {
  return screen.getByText(
    (text, el) =>
      !!el?.classList.contains("onr-dd-item") && text.includes(phrase),
  );
}

describe("BasicTextGroup — §7 Align (integration)", () => {
  it.skip("§7.1 Align button opens dropdown with Left/Center/Right/Justify", () => {
    renderBasic("hello");
    fireEvent.click(screen.getByText("⇔"));
    expect(ddItem("Align Left")).toBeInTheDocument();
    expect(ddItem("Center")).toBeInTheDocument();
    expect(ddItem("Align Right")).toBeInTheDocument();
    expect(ddItem("Justify")).toBeInTheDocument();
  });

  it.skip("§7.2 Align Left with selection wraps in <div style='text-align:left'>", () => {
    const { editor } = renderBasic("hello");
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });
    fireEvent.click(screen.getByText("⇔"));
    fireEvent.click(ddItem("Align Left"));
    expect(editor.getValue()).toContain("text-align:left");
    expect(editor.getValue()).toContain("hello");
  });

  it.skip("§7.3 Align Center with selection wraps in <div style='text-align:center'>", () => {
    const { editor } = renderBasic("hello");
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });
    fireEvent.click(screen.getByText("⇔"));
    fireEvent.click(ddItem("Center"));
    expect(editor.getValue()).toContain("text-align:center");
  });

  it.skip("§7.4 Align Right with selection wraps in <div style='text-align:right'>", () => {
    const { editor } = renderBasic("hello");
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });
    fireEvent.click(screen.getByText("⇔"));
    fireEvent.click(ddItem("Align Right"));
    expect(editor.getValue()).toContain("text-align:right");
  });

  it.skip("§7.5 Align Justify with selection wraps in <div style='text-align:justify'>", () => {
    const { editor } = renderBasic("hello");
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });
    fireEvent.click(screen.getByText("⇔"));
    fireEvent.click(ddItem("Justify"));
    expect(editor.getValue()).toContain("text-align:justify");
  });

  it.skip("§7.6 Align Left with no selection wraps current line", () => {
    const { editor } = renderBasic("hello");
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("⇔"));
    fireEvent.click(ddItem("Align Left"));
    expect(editor.getValue()).toBe('<div style="text-align:left">hello</div>');
  });
});

// ── §12 Active State ─────────────────────────────────────────────────────────

describe("BasicTextGroup — §12 Active State (integration)", () => {
  it.skip("§12.1 Bold button has onr-active class when editorState.bold=true", () => {
    const { container } = renderBasic("**hello**", { bold: true });
    const btn = container.querySelector('[data-cmd="bold"]');
    expect(btn?.className).toContain("onr-active");
  });

  it.skip("§12.2 Bold button has no onr-active class when bold=false", () => {
    const { container } = renderBasic("hello", { bold: false });
    const btn = container.querySelector('[data-cmd="bold"]');
    expect(btn?.className).not.toContain("onr-active");
  });

  it.skip("§12.3 Italic button has onr-active class when editorState.italic=true", () => {
    const { container } = renderBasic("*hello*", { italic: true });
    const btn = container.querySelector('[data-cmd="italic"]');
    expect(btn?.className).toContain("onr-active");
  });

  it.skip("§12.4 Underline button has onr-active class when editorState.underline=true", () => {
    const { container } = renderBasic("<u>hello</u>", { underline: true });
    const btn = container.querySelector('[data-cmd="underline"]');
    expect(btn?.className).toContain("onr-active");
  });

  it.skip("§12.5 Strikethrough button has onr-active class when editorState.strikethrough=true", () => {
    const { container } = renderBasic("~~hello~~", { strikethrough: true });
    const btn = container.querySelector('[data-cmd="strikethrough"]');
    expect(btn?.className).toContain("onr-active");
  });

  it.skip("§12.6 Highlight button has onr-active class when editorState.highlight=true", () => {
    const { container } = renderBasic("==hi==", { highlight: true });
    const btn = container.querySelector('[data-cmd="highlight"]');
    expect(btn?.className).toContain("onr-active");
  });

  it.skip("§12.7 Subscript button has onr-active class when editorState.subscript=true", () => {
    const { container } = renderBasic("x<sub>2</sub>", { subscript: true });
    const btn = container.querySelector('[data-cmd="subscript"]');
    expect(btn?.className).toContain("onr-active");
  });

  it.skip("§12.8 Superscript button has onr-active class when editorState.superscript=true", () => {
    const { container } = renderBasic("x<sup>2</sup>", { superscript: true });
    const btn = container.querySelector('[data-cmd="superscript"]');
    expect(btn?.className).toContain("onr-active");
  });

  it.skip("§12.9 Bullet List button has onr-active class when editorState.bulletList=true", () => {
    const { container } = renderBasic("- item", { bulletList: true });
    const btn = container.querySelector('[data-cmd="bullet-list"]');
    expect(btn?.className).toContain("onr-active");
  });

  it.skip("§12.10 Numbered List button has onr-active when editorState.numberedList=true", () => {
    const { container } = renderBasic("1. item", { numberedList: true });
    const btn = container.querySelector('[data-cmd="numbered-list"]');
    expect(btn?.className).toContain("onr-active");
  });

  it.skip("§12.11 Font button shows fontFamily from editorState", () => {
    renderBasic("hello", { fontFamily: "Arial" });
    expect(screen.getByText("Arial")).toBeInTheDocument();
  });

  it.skip("§12.12 Size button shows fontSize from editorState", () => {
    renderBasic("hello", { fontSize: "14" });
    expect(screen.getByText("14")).toBeInTheDocument();
  });
});

// ── §13 Cross-section combinations ───────────────────────────────────────────

describe("BasicTextGroup — §13 Cross-section combinations (integration)", () => {
  it.skip("§13.1 Bold then Strikethrough on same selection: ~~**hello**~~", () => {
    const { editor } = renderBasic("hello");
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });
    fireEvent.click(screen.getByText("B")); // → **hello**
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 9 });
    fireEvent.click(screen.getByText("S̶")); // → ~~**hello**~~
    expect(editor.getValue()).toBe("~~**hello**~~");
  });

  it.skip("§13.2 Bold then Italic then Underline: ***<u>hello</u>***", () => {
    const { editor } = renderBasic("hello");
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });
    fireEvent.click(screen.getByText("B")); // **hello**
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 9 });
    fireEvent.click(screen.getByText("I")); // ***hello***
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 11 });
    fireEvent.click(screen.getByText("U")); // <u>***hello***</u>
    expect(editor.getValue()).toBe("<u>***hello***</u>");
  });

  it.skip("§13.3 Heading then Clear All: strips heading too", () => {
    const { editor } = renderBasic("## **heading**");
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("🧹 Clear"));
    expect(editor.getValue()).toBe("heading");
  });

  it.skip("§13.4 Bullet List then Numbered List: replaces prefix", () => {
    const { editor } = renderBasic("Hello");
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("• List")); // - Hello
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("1. List")); // 1. Hello
    expect(editor.getValue()).toBe("1. Hello");
  });

  it.skip("§13.5 Align then Bold: both apply independently", () => {
    const { editor } = renderBasic("hello");
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("⇔")); // align dropdown
    fireEvent.click(ddItem("Align Left"));
    // Line is now <div style="text-align:left">hello</div>
    editor.setCursor({ line: 0, ch: 0 });
    editor.setSelection({ line: 0, ch: 29 }, { line: 0, ch: 34 }); // select "hello" inside <div style="text-align:left">...</div>
    fireEvent.click(screen.getByText("B"));
    expect(editor.getValue()).toContain("**hello**");
    expect(editor.getValue()).toContain("text-align:left");
  });

  it.skip("§13.6 Font + Size dropdowns open and close independently", () => {
    renderBasic("text");
    // Open font dropdown
    fireEvent.click(screen.getByText("Font"));
    expect(screen.getByText("Arial")).toBeInTheDocument();
    // Close by pressing Escape would require userEvent; verify both open without crash
    expect(() => fireEvent.click(screen.getByText("Arial"))).not.toThrow();
  });

  it.skip("§13.7 Clear Inline preserves heading, then Bold reapplied", () => {
    const { editor } = renderBasic("## **bold**");
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("A̶")); // ## bold
    editor.setSelection({ line: 0, ch: 3 }, { line: 0, ch: 7 });
    fireEvent.click(screen.getByText("B")); // ## **bold**
    expect(editor.getValue()).toBe("## **bold**");
  });

  it.skip("§13.8 Numbered list then Outdent dispatches command", () => {
    const { app, editor } = renderBasic("1. item");
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("⇤ Out"));
    expect(app.commands._called).toContain("editor:unindent-list");
  });

  it.skip("§13.9 Bold + Highlight: wraps in both markers", () => {
    const { editor } = renderBasic("text");
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 4 });
    fireEvent.click(screen.getByText("B")); // **text**
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 8 });
    fireEvent.click(screen.getByText("H̲")); // ==**text**==
    expect(editor.getValue()).toBe("==**text**==");
  });

  it.skip("§13.10 Subscript then Superscript: converts sub → sup", () => {
    const { editor } = renderBasic("x<sub>2</sub>");
    editor.setCursor({ line: 0, ch: 7 }); // inside
    fireEvent.click(screen.getByText("x²")); // convert to sup
    expect(editor.getValue()).toBe("x<sup>2</sup>");
  });

  it.skip("§13.11 Underline then Clear All: stripped completely", () => {
    const { editor } = renderBasic("<u>text</u>");
    editor.setCursor({ line: 0, ch: 0 });
    fireEvent.click(screen.getByText("🧹 Clear"));
    expect(editor.getValue()).toBe("text");
  });

  it.skip("§13.12 Bullet + Bold active states both shown simultaneously", () => {
    const { container } = renderBasic("- **text**", {
      bold: true,
      bulletList: true,
    });
    expect(container.querySelector('[data-cmd="bold"]')?.className).toContain(
      "onr-active",
    );
    expect(
      container.querySelector('[data-cmd="bullet-list"]')?.className,
    ).toContain("onr-active");
  });
});
