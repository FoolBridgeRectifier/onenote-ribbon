import { MockEditor } from "../../../../../test-utils/MockEditor";
import { applyFontFamily } from "../applyFontFamily";

describe("applyFontFamily", () => {
  let editor: MockEditor;

  beforeEach(() => {
    editor = new MockEditor();
  });

  it("wraps the selection in a span with the given font-family", () => {
    editor.setValue("Hello world");
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });

    applyFontFamily(editor as never, "Arial");

    expect(editor.getValue()).toBe(
      `<span style="font-family: 'Arial'">Hello</span> world`,
    );
  });

  it("preserves font names with spaces", () => {
    editor.setValue("Some text");
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 4 });

    applyFontFamily(editor as never, "Times New Roman");

    expect(editor.getValue()).toBe(
      `<span style="font-family: 'Times New Roman'">Some</span> text`,
    );
  });

  it("does nothing when there is no selection", () => {
    editor.setValue("No selection");
    editor.setCursor({ line: 0, ch: 5 });

    applyFontFamily(editor as never, "Verdana");

    expect(editor.getValue()).toBe("No selection");
  });
});
