import { MockEditor } from "../../../../../test-utils/MockEditor";
import { applyFormatPainter } from "../applyFormatPainter";

interface FormatPainterFormat {
  headPrefix: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
}

function makeFormat(overrides: Partial<FormatPainterFormat> = {}): FormatPainterFormat {
  return {
    headPrefix: "",
    isBold: false,
    isItalic: false,
    isUnderline: false,
    ...overrides,
  };
}

function editorWithSelection(content: string, from: number, to: number): MockEditor {
  const editor = new MockEditor();
  editor.setValue(content);
  editor.setSelection({ line: 0, ch: from }, { line: 0, ch: to });
  return editor;
}

// Application order: underline first → italic → bold (innermost to outermost)
// Example: bold+italic+underline on "hello":
//   <u>hello</u> → *<u>hello</u>* → **...**  → ***<u>hello</u>***

describe("applyFormatPainter", () => {
  it("applies bold only", () => {
    const editor = editorWithSelection("hello", 0, 5);
    applyFormatPainter(editor as any, "hello", makeFormat({ isBold: true }));
    expect(editor.getValue()).toBe("**hello**");
  });

  it("applies italic only", () => {
    const editor = editorWithSelection("hello", 0, 5);
    applyFormatPainter(editor as any, "hello", makeFormat({ isItalic: true }));
    expect(editor.getValue()).toBe("*hello*");
  });

  it("applies underline only", () => {
    const editor = editorWithSelection("hello", 0, 5);
    applyFormatPainter(editor as any, "hello", makeFormat({ isUnderline: true }));
    expect(editor.getValue()).toBe("<u>hello</u>");
  });

  it("applies bold + italic → ***hello***", () => {
    const editor = editorWithSelection("hello", 0, 5);
    applyFormatPainter(
      editor as any,
      "hello",
      makeFormat({ isBold: true, isItalic: true }),
    );
    // italic: *hello* → bold: **..** wraps → ***hello***
    expect(editor.getValue()).toBe("***hello***");
  });

  it("applies bold + italic + underline → ***<u>hello</u>***", () => {
    const editor = editorWithSelection("hello", 0, 5);
    applyFormatPainter(
      editor as any,
      "hello",
      makeFormat({ isBold: true, isItalic: true, isUnderline: true }),
    );
    // underline: <u>hello</u> → italic: *<u>hello</u>* → bold: ***<u>hello</u>***
    expect(editor.getValue()).toBe("***<u>hello</u>***");
  });

  it("applies heading prefix when headPrefix is set", () => {
    const editor = editorWithSelection("Hello", 0, 5);
    applyFormatPainter(editor as any, "Hello", makeFormat({ headPrefix: "## " }));
    expect(editor.getValue()).toBe("## Hello");
  });

  it("applies bold + heading", () => {
    const editor = editorWithSelection("Hello", 0, 5);
    applyFormatPainter(
      editor as any,
      "Hello",
      makeFormat({ isBold: true, headPrefix: "## " }),
    );
    // replaceSelection('**Hello**'), then sets line to '## **Hello**'
    expect(editor.getValue()).toBe("## **Hello**");
  });

  it("does not double-add heading if line already starts with prefix", () => {
    const editor = new MockEditor();
    editor.setValue("## Hello");
    editor.setSelection({ line: 0, ch: 3 }, { line: 0, ch: 8 });
    // replaceSelection('Hello') → line = '## Hello', already starts with '## ' → no-op
    applyFormatPainter(editor as any, "Hello", makeFormat({ headPrefix: "## " }));
    expect(editor.getValue()).toBe("## Hello");
  });

  it("replaces a different heading level with the stored one", () => {
    const editor = new MockEditor();
    editor.setValue("# Hello");
    editor.setSelection({ line: 0, ch: 2 }, { line: 0, ch: 7 });
    // replaceSelection('Hello') → line = '# Hello', does not start with '## '
    // → setLine strips '# ' → prepends '## '
    applyFormatPainter(editor as any, "Hello", makeFormat({ headPrefix: "## " }));
    expect(editor.getValue()).toBe("## Hello");
  });
});
