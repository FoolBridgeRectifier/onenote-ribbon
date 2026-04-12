import { MockEditor } from "../../test-utils/MockEditor";
import { toggleLinePrefix } from "../toggleLinePrefix";

function ed(content: string, ch?: number): MockEditor {
  const e = new MockEditor();
  e.setValue(content);
  e.setCursor({ line: 0, ch: ch ?? 0 });
  return e;
}

// ── §4.1 Bullet List (- ) ──────────────────────────────────────────────────

describe("toggleLinePrefix — Bullet List (- )", () => {
  it.skip('adds "- " to plain line', () => {
    const e = ed("Hello");
    toggleLinePrefix(e, "- ");
    expect(e.getValue()).toBe("- Hello");
  });

  it.skip('removes "- " from prefixed line', () => {
    const e = ed("- Hello");
    toggleLinePrefix(e, "- ");
    expect(e.getValue()).toBe("Hello");
  });

  it.skip('removes "- [x] " checklist variant', () => {
    const e = ed("- [x] Hello");
    toggleLinePrefix(e, "- ");
    expect(e.getValue()).toBe("Hello");
  });

  it.skip('removes "- [X] " checklist variant', () => {
    const e = ed("- [X] Hello");
    toggleLinePrefix(e, "- ");
    expect(e.getValue()).toBe("Hello");
  });

  it.skip('removes "- [ ] " unchecked checklist', () => {
    const e = ed("- [ ] task");
    toggleLinePrefix(e, "- ");
    expect(e.getValue()).toBe("task");
  });

  it.skip("strips numbered prefix then adds bullet", () => {
    const e = ed("1. Hello");
    toggleLinePrefix(e, "- ");
    // "1. Hello" → stripped by regex to "Hello" → "- Hello"
    expect(e.getValue()).toBe("- Hello");
  });

  it.skip("strips heading prefix then adds bullet", () => {
    const e = ed("## Heading");
    toggleLinePrefix(e, "- ");
    expect(e.getValue()).toBe("- Heading");
  });
});

// ── §4.2 Numbered List (1. ) ───────────────────────────────────────────────

describe("toggleLinePrefix — Numbered List (1. )", () => {
  it.skip('adds "1. " to plain line', () => {
    const e = ed("Hello");
    toggleLinePrefix(e, "1. ");
    expect(e.getValue()).toBe("1. Hello");
  });

  it.skip('removes "1. " from prefixed line', () => {
    const e = ed("1. Hello");
    toggleLinePrefix(e, "1. ");
    expect(e.getValue()).toBe("Hello");
  });

  it.skip('does NOT remove "5. " — only "1. " is exact match for hasPrefix', () => {
    const e = ed("5. Hello");
    toggleLinePrefix(e, "1. ");
    // "5. " is not stripped by prefix match; regex strips "5. " from stripped → "1. Hello"
    // Actually the regex is /^(#{1,6} |- \[[ x✔]\] (?:🔴 |🟡 )?|- |\d+\. |> \[![^\]]+\]\n> )/ which matches \d+\.
    // So "5. Hello" → stripped = "Hello" → "1. Hello"
    expect(e.getValue()).toBe("1. Hello");
  });

  it.skip("strips bullet then adds numbered", () => {
    const e = ed("- Hello");
    toggleLinePrefix(e, "1. ");
    expect(e.getValue()).toBe("1. Hello");
  });

  it.skip("strips heading then adds numbered", () => {
    const e = ed("## Heading");
    toggleLinePrefix(e, "1. ");
    expect(e.getValue()).toBe("1. Heading");
  });
});

// ── §8.4 To Do tag (toggleLinePrefix with "- [ ] ") ………………………………………

describe("toggleLinePrefix — Checkbox (- [ ] )", () => {
  it.skip('adds "- [ ] " to plain line', () => {
    const e = ed("Hello");
    toggleLinePrefix(e, "- [ ] ");
    expect(e.getValue()).toBe("- [ ] Hello");
  });

  it.skip('removes "- [ ] " from prefixed line', () => {
    const e = ed("- [ ] Hello");
    toggleLinePrefix(e, "- [ ] ");
    expect(e.getValue()).toBe("Hello");
  });

  it.skip('treats "- [x] " as completed variant and removes', () => {
    const e = ed("- [x] Hello");
    toggleLinePrefix(e, "- [ ] ");
    expect(e.getValue()).toBe("Hello");
  });

  it.skip('treats "- [X] " as completed variant and removes', () => {
    const e = ed("- [X] Hello");
    toggleLinePrefix(e, "- [ ] ");
    expect(e.getValue()).toBe("Hello");
  });

  it.skip('treats "- [✔] " as completed variant and removes', () => {
    const e = ed("- [✔] Hello");
    toggleLinePrefix(e, "- [ ] ");
    expect(e.getValue()).toBe("Hello");
  });

  it.skip("strips heading and adds todo", () => {
    const e = ed("## Heading");
    toggleLinePrefix(e, "- [ ] ");
    expect(e.getValue()).toBe("- [ ] Heading");
  });
});

// ── Priority todo tags ──────────────────────────────────────────────────────

describe("toggleLinePrefix — Priority To Do (🔴 / 🟡)", () => {
  it.skip('adds "- [ ] 🔴 " prefix', () => {
    const e = ed("Hello");
    toggleLinePrefix(e, "- [ ] 🔴 ");
    expect(e.getValue()).toBe("- [ ] 🔴 Hello");
  });

  it.skip('removes "- [ ] 🔴 " prefix', () => {
    const e = ed("- [ ] 🔴 Hello");
    toggleLinePrefix(e, "- [ ] 🔴 ");
    expect(e.getValue()).toBe("Hello");
  });

  it.skip('treats "- [x] 🔴 " as completed variant and removes', () => {
    const e = ed("- [x] 🔴 Hello");
    toggleLinePrefix(e, "- [ ] 🔴 ");
    expect(e.getValue()).toBe("Hello");
  });
});

// ── §15 cross-toggle cases ───────────────────────────────────────────────────

describe("toggleLinePrefix — §15 cross-prefix toggles (§15.6.9 / §15.7.6 / §15.8)", () => {
  it.skip("§15.6.9 / §15.8.6 bullet line → To Do: strips '- ', adds '- [ ] '", () => {
    const e = ed("- Hello");
    toggleLinePrefix(e, "- [ ] ");
    expect(e.getValue()).toBe("- [ ] Hello");
  });

  it.skip("§15.8.7 numbered line → To Do: strips '1. ', adds '- [ ] '", () => {
    const e = ed("1. Hello");
    toggleLinePrefix(e, "- [ ] ");
    expect(e.getValue()).toBe("- [ ] Hello");
  });

  it.skip("§15.7.6 checkbox line → Numbered List: strips '- [ ] ', adds '1. '", () => {
    const e = ed("- [ ] Hello");
    toggleLinePrefix(e, "1. ");
    expect(e.getValue()).toBe("1. Hello");
  });

  it.skip("§15.6 alternate Bullet x3: add → remove → add", () => {
    const e = ed("Hello");
    toggleLinePrefix(e, "- ");
    expect(e.getValue()).toBe("- Hello");
    toggleLinePrefix(e, "- ");
    expect(e.getValue()).toBe("Hello");
    toggleLinePrefix(e, "- ");
    expect(e.getValue()).toBe("- Hello");
  });

  it.skip("§15.8.9 checkbox x2: add → remove → add", () => {
    const e = ed("Hello");
    toggleLinePrefix(e, "- [ ] ");
    expect(e.getValue()).toBe("- [ ] Hello");
    toggleLinePrefix(e, "- [ ] ");
    expect(e.getValue()).toBe("Hello");
    toggleLinePrefix(e, "- [ ] ");
    expect(e.getValue()).toBe("- [ ] Hello");
  });
});
