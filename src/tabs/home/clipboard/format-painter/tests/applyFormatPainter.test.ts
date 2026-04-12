import { MockEditor } from "../../../../../test-utils/MockEditor";
import { applyFormatPainter } from "../applyFormatPainter";
import { FormatPainterFormat } from "../../../../../shared/context/FormatPainterContext";

function makeFormat(
  overrides: Partial<FormatPainterFormat> = {},
): FormatPainterFormat {
  return {
    prefix: "",
    suffix: "",
    ...overrides,
  };
}

function editorWithSelection(
  content: string,
  from: number,
  to: number,
): MockEditor {
  const editor = new MockEditor();
  editor.setValue(content);
  editor.setSelection({ line: 0, ch: from }, { line: 0, ch: to });
  return editor;
}

// Application order: underline first → italic → bold (innermost to outermost)
// Example: bold+italic+underline on "hello":
//   <u>hello</u> → *<u>hello</u>* → **...**  → ***<u>hello</u>***

describe("applyFormatPainter", () => {
  it.skip("applies bold only", () => {
    const editor = editorWithSelection("hello", 0, 5);
    applyFormatPainter(
      editor as any,
      "hello",
      makeFormat({ prefix: "**", suffix: "**" }),
    );
    expect(editor.getValue()).toBe("**hello**");
  });

  it.skip("applies italic only", () => {
    const editor = editorWithSelection("hello", 0, 5);
    applyFormatPainter(
      editor as any,
      "hello",
      makeFormat({ prefix: "*", suffix: "*" }),
    );
    expect(editor.getValue()).toBe("*hello*");
  });

  it.skip("applies underline only", () => {
    const editor = editorWithSelection("hello", 0, 5);
    applyFormatPainter(
      editor as any,
      "hello",
      makeFormat({ prefix: "<u>", suffix: "</u>" }),
    );
    expect(editor.getValue()).toBe("<u>hello</u>");
  });

  it.skip("applies bold + italic → ***hello***", () => {
    const editor = editorWithSelection("hello", 0, 5);
    applyFormatPainter(
      editor as any,
      "hello",
      makeFormat({ prefix: "***", suffix: "***" }),
    );
    expect(editor.getValue()).toBe("***hello***");
  });

  it.skip("applies bold + italic + underline → ***<u>hello</u>***", () => {
    const editor = editorWithSelection("hello", 0, 5);
    applyFormatPainter(
      editor as any,
      "hello",
      makeFormat({ prefix: "***<u>", suffix: "</u>***" }),
    );
    expect(editor.getValue()).toBe("***<u>hello</u>***");
  });

  it.skip("applies heading prefix when prefix is set", () => {
    const editor = editorWithSelection("Hello", 0, 5);
    applyFormatPainter(
      editor as any,
      "Hello",
      makeFormat({ prefix: "## ", suffix: "" }),
    );
    expect(editor.getValue()).toBe("## Hello");
  });

  it.skip("applies bold + heading", () => {
    const editor = editorWithSelection("Hello", 0, 5);
    applyFormatPainter(
      editor as any,
      "Hello",
      makeFormat({ prefix: "## **", suffix: "**" }),
    );
    expect(editor.getValue()).toBe("## **Hello**");
  });

  it.skip("applies heading prefix with selection", () => {
    const editor = new MockEditor();
    editor.setValue("## Hello");
    editor.setSelection({ line: 0, ch: 3 }, { line: 0, ch: 8 });
    applyFormatPainter(
      editor as any,
      "Hello",
      makeFormat({ prefix: "## ", suffix: "" }),
    );
    expect(editor.getValue()).toBe("## ## Hello");
  });

  it.skip("applies custom prefix and suffix together", () => {
    const editor = new MockEditor();
    editor.setValue("# Hello");
    editor.setSelection({ line: 0, ch: 2 }, { line: 0, ch: 7 });
    applyFormatPainter(
      editor as any,
      "Hello",
      makeFormat({ prefix: "## ", suffix: "" }),
    );
    expect(editor.getValue()).toBe("# ## Hello");
  });
});
