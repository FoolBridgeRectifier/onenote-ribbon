import { MockEditor } from "../../test-utils/MockEditor";
import { toggleSubSup } from "../toggleSubSup";

// ── §2.6 Subscript (<sub>…</sub>) ──────────────────────────────────────────

describe("toggleSubSup — Subscript (<sub>)", () => {
  it.skip("wraps selection in <sub>…</sub>", () => {
    const e = new MockEditor();
    e.setValue("hello 2 world");
    e.setSelection({ line: 0, ch: 6 }, { line: 0, ch: 7 });
    toggleSubSup(e, "sub");
    expect(e.getValue()).toBe("hello <sub>2</sub> world");
  });

  it.skip("inserts empty <sub></sub> pair at cursor when no selection", () => {
    const e = new MockEditor();
    e.setValue("hello");
    e.setCursor({ line: 0, ch: 5 });
    toggleSubSup(e, "sub");
    expect(e.getValue()).toBe("hello<sub></sub>");
    expect(e.getCursor()).toEqual({ line: 0, ch: 10 }); // inside <sub>
  });

  it.skip("toggles off when cursor is inside <sub>…</sub>", () => {
    const e = new MockEditor();
    e.setValue("x<sub>2</sub>");
    e.setCursor({ line: 0, ch: 7 }); // inside "2"
    toggleSubSup(e, "sub");
    expect(e.getValue()).toBe("x2");
  });

  it.skip("converts <sup> to <sub> (mutual exclusion)", () => {
    const e = new MockEditor();
    e.setValue("x<sup>3</sup>");
    e.setCursor({ line: 0, ch: 7 }); // inside "3"
    toggleSubSup(e, "sub");
    expect(e.getValue()).toBe("x<sub>3</sub>");
  });

  it.skip("does NOT toggle off when cursor is at tag boundary (ch at `>` of opening tag)", () => {
    // `x<sub>2</sub>` — boundary is ch:5 (the `>` of `<sub>`)
    // findSpan condition: ch > o+oLen-1 → ch > 1+5-1=5 → 5>5 = false → NOT inside
    // → inserts new pair at cursor instead of toggling off
    const e = new MockEditor();
    e.setValue("x<sub>2</sub>");
    e.setCursor({ line: 0, ch: 5 }); // at `>` of <sub> — boundary
    toggleSubSup(e, "sub");
    // Does NOT strip the existing sub tags (no toggle off)
    expect(e.getValue()).not.toBe("x2");
  });

  it.skip("does not affect a sub span when cursor is outside it", () => {
    const e = new MockEditor();
    e.setValue("x<sub>1</sub>y");
    e.setCursor({ line: 0, ch: 14 }); // after "y", outside any span
    toggleSubSup(e, "sub");
    // Inserts a new pair at cursor
    expect(e.getValue()).toBe("x<sub>1</sub>y<sub></sub>");
  });
});

// ── §2.7 Superscript (<sup>…</sup>) ────────────────────────────────────────

describe("toggleSubSup — Superscript (<sup>)", () => {
  it.skip("wraps selection in <sup>…</sup>", () => {
    const e = new MockEditor();
    e.setValue("hello 2 world");
    e.setSelection({ line: 0, ch: 6 }, { line: 0, ch: 7 });
    toggleSubSup(e, "sup");
    expect(e.getValue()).toBe("hello <sup>2</sup> world");
  });

  it.skip("inserts empty <sup></sup> pair at cursor when no selection", () => {
    const e = new MockEditor();
    e.setValue("hello");
    e.setCursor({ line: 0, ch: 5 });
    toggleSubSup(e, "sup");
    expect(e.getValue()).toBe("hello<sup></sup>");
    expect(e.getCursor()).toEqual({ line: 0, ch: 10 });
  });

  it.skip("toggles off when cursor is inside <sup>…</sup>", () => {
    const e = new MockEditor();
    e.setValue("x<sup>3</sup>");
    e.setCursor({ line: 0, ch: 7 }); // inside "3"
    toggleSubSup(e, "sup");
    expect(e.getValue()).toBe("x3");
  });

  it.skip("converts <sub> to <sup> (mutual exclusion)", () => {
    const e = new MockEditor();
    e.setValue("x<sub>2</sub>");
    e.setCursor({ line: 0, ch: 7 }); // inside "2"
    toggleSubSup(e, "sup");
    expect(e.getValue()).toBe("x<sup>2</sup>");
  });

  it.skip("does not affect a sup span when cursor is outside it", () => {
    const e = new MockEditor();
    e.setValue("x<sup>1</sup>y");
    e.setCursor({ line: 0, ch: 14 }); // after "y"
    toggleSubSup(e, "sup");
    expect(e.getValue()).toBe("x<sup>1</sup>y<sup></sup>");
  });
});
