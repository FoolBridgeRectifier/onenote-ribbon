import { renderHook, act } from "@testing-library/react";
import { useEditorState } from "../useEditorState";
import { createAppWithEditor } from "../../../test-utils/mockApp";

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

/**
 * Render useEditorState with a single-line editor, advance past the
 * 300 ms initial read timeout, and return the resulting EditorState.
 */
function readState(line: string, ch = 0) {
  const { app, editor } = createAppWithEditor(line);
  editor.setCursor({ line: 0, ch });
  const { result } = renderHook(() => useEditorState(app as any));
  act(() => { jest.advanceTimersByTime(350); });
  return result.current;
}

// ── §14.1 Bold detection (/\*\*(.*?)\*\*/ on mdContent) ──────────────────────

describe("useEditorState — §14.1 Bold detection", () => {
  it("1 `**hello**` → bold: true", () => expect(readState("**hello**").bold).toBe(true));
  it("2 `hello` → bold: false", () => expect(readState("hello").bold).toBe(false));
  it("3 `**hello** world` → bold: true (partial bold on line)", () =>
    expect(readState("**hello** world").bold).toBe(true));
  it("4 `world **hello**` → bold: true (bold anywhere on line)", () =>
    expect(readState("world **hello**").bold).toBe(true));
  it("5 `*hello*` → bold: false (single-star italic, not bold)", () =>
    expect(readState("*hello*").bold).toBe(false));
  it("6 `***hello***` → bold: true (triple-star contains ** markers)", () =>
    expect(readState("***hello***").bold).toBe(true));
  it("7 `**` (just two stars) → bold: false (needs two separate pairs)", () =>
    expect(readState("**").bold).toBe(false));
  it("8 `<span style='font-weight:bold'>**hi**</span>` → bold: true (HTML stripped first)", () =>
    expect(readState('<span style="font-weight:bold">**hi**</span>').bold).toBe(true));
  it("9 `~~**bold+strike**~~` → bold: true (bold inside strikethrough)", () =>
    expect(readState("~~**bold+strike**~~").bold).toBe(true));
  it("10 `## **heading bold**` → bold: true (heading prefix doesn't interfere)", () =>
    expect(readState("## **heading bold**").bold).toBe(true));
});

// ── §14.2 Italic detection (/(?<!\*)\*((?!\*).+?)\*(?!\*)/ on mdContent) ─────

describe("useEditorState — §14.2 Italic detection", () => {
  it("1 `*hello*` → italic: true", () => expect(readState("*hello*").italic).toBe(true));
  it("2 `hello` → italic: false", () => expect(readState("hello").italic).toBe(false));
  it("3 `**hello**` → italic: false (lookbehind prevents match)", () =>
    expect(readState("**hello**").italic).toBe(false));
  it("4 `***hello***` → italic: true (triple-star also triggers italic regex)", () =>
    expect(readState("***hello***").italic).toBe(true));
  it("5 `*hello* world` → italic: true", () => expect(readState("*hello* world").italic).toBe(true));
  it("6 `world *hello*` → italic: true (italic anywhere on line)", () =>
    expect(readState("world *hello*").italic).toBe(true));
  it("7 `_italic_` → italic: false (underscore syntax not detected)", () =>
    expect(readState("_italic_").italic).toBe(false));
  it("8 `**bold** *italic*` → italic: true (italic anywhere on line)", () =>
    expect(readState("**bold** *italic*").italic).toBe(true));
  it("9 `*a*b*c*` → italic: true (matches first *a*)", () =>
    expect(readState("*a*b*c*").italic).toBe(true));
  it("10 `## *italic heading*` → italic: true", () =>
    expect(readState("## *italic heading*").italic).toBe(true));
  it("bold is false when only italic present", () =>
    expect(readState("*hello*").bold).toBe(false));
});

// ── §14.3 Underline detection (/<u>/ on raw line) ─────────────────────────────

describe("useEditorState — §14.3 Underline detection", () => {
  it("1 `<u>hello</u>` → underline: true", () =>
    expect(readState("<u>hello</u>").underline).toBe(true));
  it("2 `hello` → underline: false", () => expect(readState("hello").underline).toBe(false));
  it("3 `<u>` (no close) → underline: true (open tag alone matches)", () =>
    expect(readState("<u>").underline).toBe(true));
  it("4 `**<u>bold under</u>**` → underline: true", () =>
    expect(readState("**<u>bold under</u>**").underline).toBe(true));
  it("5 `&lt;u&gt;hello&lt;/u&gt;` → underline: false (escaped, not raw HTML)", () =>
    expect(readState("&lt;u&gt;hello&lt;/u&gt;").underline).toBe(false));
  it("6 `<U>hello</U>` → underline: false (regex is case-sensitive)", () =>
    expect(readState("<U>hello</U>").underline).toBe(false));
});

// ── §14.4 Strikethrough detection (/~~(.*?)~~/ on mdContent) ─────────────────

describe("useEditorState — §14.4 Strikethrough detection", () => {
  it("1 `~~hello~~` → strikethrough: true", () =>
    expect(readState("~~hello~~").strikethrough).toBe(true));
  it("2 `hello` → strikethrough: false", () =>
    expect(readState("hello").strikethrough).toBe(false));
  it("3 `~~hello~~ world` → strikethrough: true", () =>
    expect(readState("~~hello~~ world").strikethrough).toBe(true));
  it("4 `**~~bold+strike~~**` → strikethrough: true", () =>
    expect(readState("**~~bold+strike~~**").strikethrough).toBe(true));
  it("5 `~hello~` → strikethrough: false (single tilde not matched)", () =>
    expect(readState("~hello~").strikethrough).toBe(false));
  it("6 `~~~~` (empty) → strikethrough: true ((.*?) matches empty string)", () =>
    expect(readState("~~~~").strikethrough).toBe(true));
});

// ── §14.5 Highlight detection (/==(.*?)==/ on mdContent) ─────────────────────

describe("useEditorState — §14.5 Highlight detection", () => {
  it("1 `==hello==` → highlight: true", () =>
    expect(readState("==hello==").highlight).toBe(true));
  it("2 `hello` → highlight: false", () => expect(readState("hello").highlight).toBe(false));
  it("3 `==hello== world` → highlight: true", () =>
    expect(readState("==hello== world").highlight).toBe(true));
  it("4 `**==bold+highlight==**` → highlight: true", () =>
    expect(readState("**==bold+highlight==**").highlight).toBe(true));
  it("5 `=hello=` → highlight: false (single = not matched)", () =>
    expect(readState("=hello=").highlight).toBe(false));
  it("6 `====` (empty) → highlight: true (empty match)", () =>
    expect(readState("====").highlight).toBe(true));
});

// ── §14.6 Subscript — cursor-position-aware detection ────────────────────────
//
// Line: `x<sub>2</sub>` (0-indexed positions)
//   x=0, <sub>=1-5 (open.length=5), 2=6, </sub>=7-12 (close.length=6)
//   Active when: ch > 5 AND ch < 13  → ch ∈ [6..12] inclusive

const SUB_LINE = "x<sub>2</sub>";

describe("useEditorState — §14.6 Subscript cursor-aware detection", () => {
  it("1 ch=0 (before opening tag) → subscript: false", () =>
    expect(readState(SUB_LINE, 0).subscript).toBe(false));
  it("2 ch=1 (at `<` of <sub>) → subscript: false", () =>
    expect(readState(SUB_LINE, 1).subscript).toBe(false));
  it("3 ch=5 (at `>` of <sub> — still inside opening tag) → subscript: false", () =>
    expect(readState(SUB_LINE, 5).subscript).toBe(false));
  it("4 ch=6 (first char of content) → subscript: true", () =>
    expect(readState(SUB_LINE, 6).subscript).toBe(true));
  it("5 ch=7 (inside content) → subscript: true", () =>
    expect(readState(SUB_LINE, 7).subscript).toBe(true));
  it("6 ch=12 (last char of </sub>) → subscript: true", () =>
    expect(readState(SUB_LINE, 12).subscript).toBe(true));
  it("7 ch=13 (past closing tag) → subscript: false", () =>
    expect(readState(SUB_LINE, 13).subscript).toBe(false));
  it("8 `x2` with any ch → subscript: false (no tag present)", () =>
    expect(readState("x2", 1).subscript).toBe(false));
  it("9 multiple spans: cursor inside first (ch=5, content position) → subscript: true", () =>
    expect(readState("<sub>2</sub><sub>3</sub>", 5).subscript).toBe(true));
  it("10 multiple spans: cursor between spans (ch=12, start of second <sub>) → subscript: false", () =>
    expect(readState("<sub>2</sub><sub>3</sub>", 12).subscript).toBe(false));
  it("11 `<SUB>2</SUB>` inside → subscript: false (case-sensitive)", () =>
    expect(readState("<SUB>2</SUB>", 6).subscript).toBe(false));
});

// ── §14.7 Superscript — cursor-position-aware detection ──────────────────────
//
// Line: `x<sup>2</sup>`  — same offsets as subscript (open=`<sup>`, close=`</sup>`)

const SUP_LINE = "x<sup>2</sup>";

describe("useEditorState — §14.7 Superscript cursor-aware detection", () => {
  it("1 ch=0 (before tag) → superscript: false", () =>
    expect(readState(SUP_LINE, 0).superscript).toBe(false));
  it("2 ch=5 (at `>` of <sup>) → superscript: false", () =>
    expect(readState(SUP_LINE, 5).superscript).toBe(false));
  it("3 ch=6 (content start) → superscript: true", () =>
    expect(readState(SUP_LINE, 6).superscript).toBe(true));
  it("4 ch=12 (last char of </sup>) → superscript: true", () =>
    expect(readState(SUP_LINE, 12).superscript).toBe(true));
  it("5 ch=13 (past closing tag) → superscript: false", () =>
    expect(readState(SUP_LINE, 13).superscript).toBe(false));
  it("6 `x2` → superscript: false (no tag)", () =>
    expect(readState("x2", 1).superscript).toBe(false));
  it("7 `<SUP>` inside → superscript: false (case-sensitive)", () =>
    expect(readState("<SUP>2</SUP>", 6).superscript).toBe(false));
});

// ── §14.8 Bullet List (/^(\s*)- / on raw line) ───────────────────────────────

describe("useEditorState — §14.8 Bullet List detection", () => {
  it("1 `- item` → bulletList: true", () => expect(readState("- item").bulletList).toBe(true));
  it("2 `item` → bulletList: false", () => expect(readState("item").bulletList).toBe(false));
  it("3 `  - indented` → bulletList: true (leading spaces allowed)", () =>
    expect(readState("  - indented").bulletList).toBe(true));
  it("4 `- [ ] checkbox` → bulletList: true (starts with `- `)", () =>
    expect(readState("- [ ] checkbox").bulletList).toBe(true));
  it("5 `- [x] done` → bulletList: true", () =>
    expect(readState("- [x] done").bulletList).toBe(true));
  it("6 `1. numbered` → bulletList: false", () =>
    expect(readState("1. numbered").bulletList).toBe(false));
  it("7 `-item` (no space) → bulletList: false (requires `- ` with space)", () =>
    expect(readState("-item").bulletList).toBe(false));
  it("8 `## - heading` → bulletList: false (`^` anchors to line start; `#` comes first)", () =>
    expect(readState("## - heading").bulletList).toBe(false));
});

// ── §14.9 Numbered List (/^(\s*)\d+\. / on raw line) ─────────────────────────

describe("useEditorState — §14.9 Numbered List detection", () => {
  it("1 `1. item` → numberedList: true", () =>
    expect(readState("1. item").numberedList).toBe(true));
  it("2 `42. item` → numberedList: true (any digit count)", () =>
    expect(readState("42. item").numberedList).toBe(true));
  it("3 `  1. indented` → numberedList: true (leading spaces)", () =>
    expect(readState("  1. indented").numberedList).toBe(true));
  it("4 `- item` → numberedList: false", () =>
    expect(readState("- item").numberedList).toBe(false));
  it("5 `1.item` (no space) → numberedList: false", () =>
    expect(readState("1.item").numberedList).toBe(false));
  it("6 `## 1. heading` → numberedList: false (`^` anchors; `#` comes first)", () =>
    expect(readState("## 1. heading").numberedList).toBe(false));
});

// ── §14.10 Heading level detection (/^(#{1,6})\s/) ───────────────────────────

describe("useEditorState — §14.10 Heading level detection", () => {
  it("1 `# Heading` → headLevel: 1", () => expect(readState("# Heading").headLevel).toBe(1));
  it("2 `## Heading` → headLevel: 2", () => expect(readState("## Heading").headLevel).toBe(2));
  it("3 `### Heading` → headLevel: 3", () => expect(readState("### Heading").headLevel).toBe(3));
  it("4 `#### Heading` → headLevel: 4", () => expect(readState("#### Heading").headLevel).toBe(4));
  it("5 `##### Heading` → headLevel: 5", () =>
    expect(readState("##### Heading").headLevel).toBe(5));
  it("6 `###### Heading` → headLevel: 6", () =>
    expect(readState("###### Heading").headLevel).toBe(6));
  it("7 `Plain text` → headLevel: 0", () => expect(readState("Plain text").headLevel).toBe(0));
  it("8 `- item` → headLevel: 0", () => expect(readState("- item").headLevel).toBe(0));
  it("9 `#not-heading` (no space after #) → headLevel: 0", () =>
    expect(readState("#not-heading").headLevel).toBe(0));
});

// ── §14.11 Combinations — multiple buttons active simultaneously ──────────────

describe("useEditorState — §14.11 Combination detections", () => {
  it("1 `**bold**` → only bold", () => {
    const s = readState("**bold**");
    expect(s.bold).toBe(true);
    expect(s.italic).toBe(false);
    expect(s.underline).toBe(false);
  });
  it("2 `*italic*` → only italic", () => {
    const s = readState("*italic*");
    expect(s.bold).toBe(false);
    expect(s.italic).toBe(true);
  });
  it("3 `**bold** and *italic*` → bold + italic both true", () => {
    const s = readState("**bold** and *italic*");
    expect(s.bold).toBe(true);
    expect(s.italic).toBe(true);
  });
  it("4 `**bold** ==highlight==` → bold + highlight", () => {
    const s = readState("**bold** ==highlight==");
    expect(s.bold).toBe(true);
    expect(s.highlight).toBe(true);
  });
  it("5 `*italic* ~~strike~~` → italic + strikethrough", () => {
    const s = readState("*italic* ~~strike~~");
    expect(s.italic).toBe(true);
    expect(s.strikethrough).toBe(true);
  });
  it("6 `**bold** *italic* ~~strike~~ ==hi==` → bold + italic + strike + highlight", () => {
    const s = readState("**bold** *italic* ~~strike~~ ==hi==");
    expect(s.bold).toBe(true);
    expect(s.italic).toBe(true);
    expect(s.strikethrough).toBe(true);
    expect(s.highlight).toBe(true);
  });
  it("7 `<u>under</u> **bold**` → underline + bold", () => {
    const s = readState("<u>under</u> **bold**");
    expect(s.underline).toBe(true);
    expect(s.bold).toBe(true);
  });
  it("8 `x<sub>2</sub> x<sup>3</sup>` cursor inside sub → sub=true, sup=false", () => {
    const s = readState("x<sub>2</sub> x<sup>3</sup>", 6);
    expect(s.subscript).toBe(true);
    expect(s.superscript).toBe(false);
  });
  it("9 `- **bold item**` → bulletList + bold", () => {
    const s = readState("- **bold item**");
    expect(s.bulletList).toBe(true);
    expect(s.bold).toBe(true);
  });
  it("10 `1. *italic item*` → numberedList + italic", () => {
    const s = readState("1. *italic item*");
    expect(s.numberedList).toBe(true);
    expect(s.italic).toBe(true);
  });
  it("11 `## **bold heading**` → headLevel=2 + bold", () => {
    const s = readState("## **bold heading**");
    expect(s.headLevel).toBe(2);
    expect(s.bold).toBe(true);
  });
  it("12 `- [ ] **bold task**` → bulletList + bold", () => {
    const s = readState("- [ ] **bold task**");
    expect(s.bulletList).toBe(true);
    expect(s.bold).toBe(true);
  });
  it("13 all five inline markers on one line → all active", () => {
    const s = readState("**bold** *italic* <u>under</u> ~~strike~~ ==hi==");
    expect(s.bold).toBe(true);
    expect(s.italic).toBe(true);
    expect(s.underline).toBe(true);
    expect(s.strikethrough).toBe(true);
    expect(s.highlight).toBe(true);
  });
  it("14 `- <u>**bold under list**</u>` → bulletList + bold + underline", () => {
    const s = readState("- <u>**bold under list**</u>");
    expect(s.bulletList).toBe(true);
    expect(s.bold).toBe(true);
    expect(s.underline).toBe(true);
  });
  it("15 `1. ~~**bold strike numbered**~~` → numberedList + bold + strikethrough", () => {
    const s = readState("1. ~~**bold strike numbered**~~");
    expect(s.numberedList).toBe(true);
    expect(s.bold).toBe(true);
    expect(s.strikethrough).toBe(true);
  });
});

// ── §14.12 False-positive / false-negative edge cases ────────────────────────

describe("useEditorState — §14.12 False-positive / false-negative edge cases", () => {
  it("1 `**` (just two stars) → bold: false (no closing pair)", () =>
    expect(readState("**").bold).toBe(false));
  it("2 `* item` (unordered list with star) → italic: false (no closing *)", () =>
    expect(readState("* item").italic).toBe(false));
  it("3 `_italic_` → italic: false (underscore syntax not detected)", () =>
    expect(readState("_italic_").italic).toBe(false));
  it("4 `***text***` → bold: true AND italic: true (both match)", () => {
    const s = readState("***text***");
    expect(s.bold).toBe(true);
    expect(s.italic).toBe(true);
  });
  it("5 `==` (just two equals, no close) → highlight: false", () =>
    expect(readState("==").highlight).toBe(false));
  it("6 `<u>text` (no closing tag) → underline: true (only checks open tag)", () =>
    expect(readState("<u>text").underline).toBe(true));
  it("7 `~~` (just two tildes) → strikethrough: false", () =>
    expect(readState("~~").strikethrough).toBe(false));
  it("8 ` - item` (leading space) → bulletList: true (^(\\s*)- allows whitespace)", () =>
    expect(readState(" - item").bulletList).toBe(true));
  it("9 `text - note` (dash mid-line) → bulletList: false (^ anchors to start)", () =>
    expect(readState("text - note").bulletList).toBe(false));
  it("10 `100. item` → numberedList: true (\\d+ matches multiple digits)", () =>
    expect(readState("100. item").numberedList).toBe(true));
});

// ── §14 — no active editor guard ─────────────────────────────────────────────

describe("useEditorState — no active editor returns all-false state", () => {
  it("returns DEFAULT state when no editor is open", () => {
    const { app } = createAppWithEditor(); // has editor
    // Remove the editor so it looks like no editor open
    (app.workspace as any).activeEditor = null;
    const { result } = renderHook(() => useEditorState(app as any));
    act(() => { jest.advanceTimersByTime(350); });
    const s = result.current;
    expect(s.bold).toBe(false);
    expect(s.italic).toBe(false);
    expect(s.underline).toBe(false);
    expect(s.strikethrough).toBe(false);
    expect(s.highlight).toBe(false);
    expect(s.subscript).toBe(false);
    expect(s.superscript).toBe(false);
    expect(s.bulletList).toBe(false);
    expect(s.numberedList).toBe(false);
    expect(s.headLevel).toBe(0);
  });
});
