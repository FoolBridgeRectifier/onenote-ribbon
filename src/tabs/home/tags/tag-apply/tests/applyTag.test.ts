import { MockEditor } from "../../../../../test-utils/MockEditor";
import { applyTag } from "../applyTag";

function ed(content: string, cursorCh?: number): MockEditor {
  const e = new MockEditor();
  e.setValue(content);
  e.setCursor({ line: 0, ch: cursorCh ?? content.length });
  return e;
}

// ── §8.1.1 To Do tag (tag-todo) ────────────────────────────────────────────

describe("applyTag — tag-todo (- [ ] )", () => {
  it('prepends "- [ ] " to plain line', () => {
    const e = ed("Hello", 0);
    applyTag("tag-todo", e);
    expect(e.getValue()).toBe("- [ ] Hello");
  });

  it('toggles off "- [ ] " prefix', () => {
    const e = ed("- [ ] Hello", 0);
    applyTag("tag-todo", e);
    expect(e.getValue()).toBe("Hello");
  });

  it('toggles off "- [x] " (completed variant) when using tag-todo', () => {
    const e = ed("- [x] Hello", 0);
    applyTag("tag-todo", e);
    expect(e.getValue()).toBe("Hello");
  });

  it('toggles off "- [X] " variant', () => {
    const e = ed("- [X] Hello", 0);
    applyTag("tag-todo", e);
    expect(e.getValue()).toBe("Hello");
  });

  it('toggles off "- [✔] " variant', () => {
    const e = ed("- [✔] Hello", 0);
    applyTag("tag-todo", e);
    expect(e.getValue()).toBe("Hello");
  });

  it("strips heading and adds todo prefix", () => {
    const e = ed("## Heading", 0);
    applyTag("tag-todo", e);
    expect(e.getValue()).toBe("- [ ] Heading");
  });
});

// ── §8.1.2/8.1.3 Callout tags ──────────────────────────────────────────────

describe("applyTag — callout tags (tag-important)", () => {
  it("inserts callout notation at cursor", () => {
    const e = new MockEditor();
    e.setValue("Hello");
    e.setCursor({ line: 0, ch: 0 });
    applyTag("tag-important", e);
    // replaceRange inserts at cursor position 0:0
    expect(e.getValue()).toContain("> [!important]");
  });

  it("toggles off callout header (line starts with first part)", () => {
    // Two-line doc: header + content
    const e = new MockEditor();
    e.setValue("> [!important]\n> Hello");
    e.setCursor({ line: 0, ch: 0 });
    applyTag("tag-important", e);
    // Should delete header line and strip "> " from next line
    expect(e.getValue()).toBe("Hello");
  });

  it("inserts tag-question callout at cursor", () => {
    const e = new MockEditor();
    e.setValue("");
    e.setCursor({ line: 0, ch: 0 });
    applyTag("tag-question", e);
    expect(e.getValue()).toContain("> [!question]");
  });
});

// ── §8.2 Highlight tag (tag-highlight uses toggleInline ==) ────────────────

describe("applyTag — tag-highlight (==)", () => {
  it("wraps selection in ==…==", () => {
    const e = new MockEditor();
    e.setValue("word");
    e.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 4 });
    applyTag("tag-highlight", e);
    expect(e.getValue()).toBe("==word==");
  });

  it("unwraps ==…== selection", () => {
    const e = new MockEditor();
    e.setValue("==word==");
    e.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 8 });
    applyTag("tag-highlight", e);
    expect(e.getValue()).toBe("word");
  });

  it("inserts ==== at cursor with no selection", () => {
    const e = new MockEditor();
    e.setValue("");
    e.setCursor({ line: 0, ch: 0 });
    applyTag("tag-highlight", e);
    expect(e.getValue()).toBe("====");
    expect(e.getCursor()).toEqual({ line: 0, ch: 2 });
  });
});

// ── Priority todo tags ──────────────────────────────────────────────────────

describe("applyTag — tag-todo-p1 / tag-todo-p2", () => {
  it('adds "- [ ] 🔴 " for tag-todo-p1', () => {
    const e = ed("Hello", 0);
    applyTag("tag-todo-p1", e);
    expect(e.getValue()).toBe("- [ ] 🔴 Hello");
  });

  it('adds "- [ ] 🟡 " for tag-todo-p2', () => {
    const e = ed("Hello", 0);
    applyTag("tag-todo-p2", e);
    expect(e.getValue()).toBe("- [ ] 🟡 Hello");
  });

  it('removes p1 completed "- [x] 🔴 " variant', () => {
    const e = ed("- [x] 🔴 Hello", 0);
    applyTag("tag-todo-p1", e);
    expect(e.getValue()).toBe("Hello");
  });
});

// ── Unknown tag ─────────────────────────────────────────────────────────────

describe("applyTag — unknown cmd", () => {
  it("does nothing for unknown tag", () => {
    const e = ed("Hello");
    applyTag("tag-unknown", e);
    expect(e.getValue()).toBe("Hello");
  });
});
