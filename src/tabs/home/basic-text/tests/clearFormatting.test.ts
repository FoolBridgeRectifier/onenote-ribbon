import { MockEditor } from "../../../../test-utils/MockEditor";
import { stripFormatting, clearFormatting } from "../clearFormatting";

// ── §3.1 Clear Formatting (full — strips inline + headings) ────────────────

describe("stripFormatting — full (inline=false)", () => {
  it.skip("strips heading prefix", () => {
    expect(stripFormatting("## My heading", false)).toBe("My heading");
  });

  it.skip("strips bold markers", () => {
    expect(stripFormatting("**bold** text", false)).toBe("bold text");
  });

  it.skip("strips italic markers", () => {
    expect(stripFormatting("*italic*", false)).toBe("italic");
  });

  it.skip("strips strikethrough markers", () => {
    expect(stripFormatting("~~strike~~", false)).toBe("strike");
  });

  it.skip("strips highlight markers", () => {
    expect(stripFormatting("==highlight==", false)).toBe("highlight");
  });

  it.skip("strips backtick code markers", () => {
    expect(stripFormatting("`code`", false)).toBe("code");
  });

  it.skip("strips HTML tags", () => {
    expect(stripFormatting("<u>under</u>", false)).toBe("under");
  });

  it.skip("strips both heading AND bold from combined", () => {
    expect(stripFormatting("## **bold heading**", false)).toBe("bold heading");
  });

  it.skip("strips multiple inline markers on selected text", () => {
    expect(stripFormatting("**bold** and *italic*", false)).toBe(
      "bold and italic",
    );
  });

  it.skip("leaves plain text unchanged", () => {
    expect(stripFormatting("Plain text", false)).toBe("Plain text");
  });
});

// ── §3.2 Clear Inline (inline=true — preserves headings) ───────────────────

describe("stripFormatting — inline only (inline=true)", () => {
  it.skip("preserves heading prefix", () => {
    expect(stripFormatting("## My heading", true)).toBe("## My heading");
  });

  it.skip("strips bold but keeps heading", () => {
    expect(stripFormatting("## **bold heading**", true)).toBe(
      "## bold heading",
    );
  });

  it.skip("strips bold from plain line", () => {
    expect(stripFormatting("**bold**", true)).toBe("bold");
  });

  it.skip("strips multiple inline markers from selection", () => {
    expect(stripFormatting("**bold** *italic*", true)).toBe("bold italic");
  });
});

// ── clearFormatting integration (ed+line vs selection) ─────────────────────

describe("clearFormatting (editor integration)", () => {
  it.skip("clears current line when no selection (full)", () => {
    const e = new MockEditor();
    e.setValue("**bold** text");
    e.setCursor({ line: 0, ch: 0 });
    clearFormatting(e, false);
    expect(e.getValue()).toBe("bold text");
  });

  it.skip("clears selection only when selection active (full)", () => {
    const e = new MockEditor();
    e.setValue("**bold** and plain");
    e.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 8 });
    clearFormatting(e, false);
    expect(e.getValue()).toBe("bold and plain");
  });

  it.skip("clears inline from heading line (inline=true preserves ##)", () => {
    const e = new MockEditor();
    e.setValue("## **bold heading**");
    e.setCursor({ line: 0, ch: 0 });
    clearFormatting(e, true);
    expect(e.getValue()).toBe("## bold heading");
  });

  it.skip("strips heading when inline=false", () => {
    const e = new MockEditor();
    e.setValue("## **bold heading**");
    e.setCursor({ line: 0, ch: 0 });
    clearFormatting(e, false);
    expect(e.getValue()).toBe("bold heading");
  });
});
