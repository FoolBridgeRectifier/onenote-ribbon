import { MockEditor } from "../../../../../test-utils/MockEditor";
import { applyFontSize } from "../applyFontSize";

describe("applyFontSize", () => {
  let editor: MockEditor;

  beforeEach(() => {
    editor = new MockEditor();
  });

  it("wraps the selection in a span with the given font-size in pt", () => {
    editor.setValue("Hello world");
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });

    applyFontSize(editor as never, 11);

    expect(editor.getValue()).toBe(
      `<span style="font-size: 11pt">Hello</span> world`,
    );
  });

  it("applies large point sizes correctly", () => {
    editor.setValue("Big text");
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 3 });

    applyFontSize(editor as never, 36);

    expect(editor.getValue()).toBe(
      `<span style="font-size: 36pt">Big</span> text`,
    );
  });

  it("does nothing when there is no selection", () => {
    editor.setValue("No selection");
    editor.setCursor({ line: 0, ch: 5 });

    applyFontSize(editor as never, 12);

    expect(editor.getValue()).toBe("No selection");
  });
});
