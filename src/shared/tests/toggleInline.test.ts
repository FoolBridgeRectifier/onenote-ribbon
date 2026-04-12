import { MockEditor } from "../../test-utils/MockEditor";
import { toggleInline } from "../toggleInline";

function ed(content: string, selFrom?: number, selTo?: number): MockEditor {
  const e = new MockEditor();
  e.setValue(content);
  if (selFrom !== undefined && selTo !== undefined) {
    e.setSelection({ line: 0, ch: selFrom }, { line: 0, ch: selTo });
  } else {
    e.setCursor({ line: 0, ch: content.length });
  }
  return e;
}

// ── §2.1 Bold (**) ─────────────────────────────────────────────────────────

describe("toggleInline — Bold (**)", () => {
  it.skip("wraps selection in **", () => {
    const e = ed("hello world", 0, 5);
    toggleInline(e, "**");
    expect(e.getValue()).toBe("**hello** world");
  });

  it.skip("unwraps exactly-wrapped ** selection", () => {
    const e = ed("**hello** world", 0, 9);
    toggleInline(e, "**");
    expect(e.getValue()).toBe("hello world");
  });

  it.skip("does not unwrap partial — wraps again", () => {
    // Select "hello" inside "**hello** world"
    const e = ed("**hello** world", 2, 7);
    toggleInline(e, "**");
    expect(e.getValue()).toBe("****hello**** world");
  });

  it.skip("inserts ** pair at cursor with no selection", () => {
    const e = new MockEditor();
    e.setValue("hello");
    e.setCursor({ line: 0, ch: 5 });
    toggleInline(e, "**");
    expect(e.getValue()).toBe("hello****");
    expect(e.getCursor()).toEqual({ line: 0, ch: 7 });
  });
});

// ── §2.2 Italic (*) ────────────────────────────────────────────────────────

describe("toggleInline — Italic (*)", () => {
  it.skip("wraps selection in *", () => {
    const e = ed("hello", 0, 5);
    toggleInline(e, "*");
    expect(e.getValue()).toBe("*hello*");
  });

  it.skip("unwraps exactly-wrapped * selection", () => {
    const e = ed("*hello*", 0, 7);
    toggleInline(e, "*");
    expect(e.getValue()).toBe("hello");
  });

  it.skip("does NOT treat **bold** as italic — wraps without stripping", () => {
    // Select "**bold**" and apply italic — should wrap, not unwrap
    const e = ed("**bold**", 0, 8);
    toggleInline(e, "*");
    expect(e.getValue()).toBe("***bold***");
  });

  it.skip("inserts * pair at cursor with no selection", () => {
    const e = new MockEditor();
    e.setValue("");
    e.setCursor({ line: 0, ch: 0 });
    toggleInline(e, "*");
    expect(e.getValue()).toBe("**");
    expect(e.getCursor()).toEqual({ line: 0, ch: 1 });
  });
});

// ── §2.3 Underline (<u>…</u>) ──────────────────────────────────────────────

describe("toggleInline — Underline (<u>…</u>)", () => {
  it.skip("wraps selection in <u>…</u>", () => {
    const e = ed("hello", 0, 5);
    toggleInline(e, "<u>", "</u>");
    expect(e.getValue()).toBe("<u>hello</u>");
  });

  it.skip("unwraps exactly-wrapped <u>…</u>", () => {
    const e = ed("<u>hello</u>", 0, 12);
    toggleInline(e, "<u>", "</u>");
    expect(e.getValue()).toBe("hello");
  });

  it.skip("inserts <u></u> at cursor with no selection", () => {
    const e = new MockEditor();
    e.setValue("");
    e.setCursor({ line: 0, ch: 0 });
    toggleInline(e, "<u>", "</u>");
    expect(e.getValue()).toBe("<u></u>");
    expect(e.getCursor()).toEqual({ line: 0, ch: 3 });
  });
});

// ── §2.4 Strikethrough (~~) ────────────────────────────────────────────────

describe("toggleInline — Strikethrough (~~)", () => {
  it.skip("wraps selection in ~~", () => {
    const e = ed("hello", 0, 5);
    toggleInline(e, "~~");
    expect(e.getValue()).toBe("~~hello~~");
  });

  it.skip("unwraps exactly-wrapped ~~ selection", () => {
    const e = ed("~~hello~~", 0, 9);
    toggleInline(e, "~~");
    expect(e.getValue()).toBe("hello");
  });

  it.skip("inserts ~~~~ pair at cursor with no selection", () => {
    const e = new MockEditor();
    e.setValue("");
    e.setCursor({ line: 0, ch: 0 });
    toggleInline(e, "~~");
    expect(e.getValue()).toBe("~~~~");
    expect(e.getCursor()).toEqual({ line: 0, ch: 2 });
  });
});

// ── §2.5 Highlight (==) ────────────────────────────────────────────────────

describe("toggleInline — Highlight (==)", () => {
  it.skip("wraps selection in ==", () => {
    const e = ed("hello", 0, 5);
    toggleInline(e, "==");
    expect(e.getValue()).toBe("==hello==");
  });

  it.skip("unwraps exactly-wrapped == selection", () => {
    const e = ed("==hello==", 0, 9);
    toggleInline(e, "==");
    expect(e.getValue()).toBe("hello");
  });

  it.skip("inserts ==== pair at cursor with no selection", () => {
    const e = new MockEditor();
    e.setValue("");
    e.setCursor({ line: 0, ch: 0 });
    toggleInline(e, "==");
    expect(e.getValue()).toBe("====");
    expect(e.getCursor()).toEqual({ line: 0, ch: 2 });
  });
});

// ── §2.8 Multi-format combinations ─────────────────────────────────────────

describe("toggleInline — Multi-format combinations (§2.8)", () => {
  it.skip("bold then strikethrough wraps outermost ~~", () => {
    // Apply bold
    const e = ed("hello", 0, 5);
    toggleInline(e, "**");
    expect(e.getValue()).toBe("**hello**");
    // Select full bold text and apply strikethrough
    e.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 9 });
    toggleInline(e, "~~");
    expect(e.getValue()).toBe("~~**hello**~~");
  });

  it.skip("bold then italic then underline", () => {
    const e = ed("hello", 0, 5);
    toggleInline(e, "**");
    e.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 9 });
    toggleInline(e, "*");
    e.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 11 });
    toggleInline(e, "<u>", "</u>");
    expect(e.getValue()).toBe("<u>***hello***</u>");
  });

  it.skip("unwrapping outer marker removes only that layer", () => {
    // "~~**hello**~~" — select all, apply ~~ to unwrap
    const e = ed("~~**hello**~~", 0, 13);
    toggleInline(e, "~~");
    expect(e.getValue()).toBe("**hello**");
  });
});
