import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithApp } from "../../../../test-utils/renderWithApp";
import { createAppWithEditor, createMockApp } from "../../../../test-utils/mockApp";
import { BlankLineButton } from "../BlankLineButton";

describe("BlankLineButton — integration", () => {
  it("inserts \\n at cursor position", () => {
    const { app, editor } = createAppWithEditor("hello");
    editor.setCursor({ line: 0, ch: 5 });
    renderWithApp(<BlankLineButton />, app);
    fireEvent.click(screen.getByText("Blank Line"));
    expect(editor.getValue()).toBe("hello\n");
  });

  it("inserts at beginning of line", () => {
    const { app, editor } = createAppWithEditor("world");
    editor.setCursor({ line: 0, ch: 0 });
    renderWithApp(<BlankLineButton />, app);
    fireEvent.click(screen.getByText("Blank Line"));
    expect(editor.getValue()).toBe("\nworld");
  });

  it("inserts between lines", () => {
    const { app, editor } = createAppWithEditor("line1\nline2");
    editor.setCursor({ line: 0, ch: 5 });
    renderWithApp(<BlankLineButton />, app);
    fireEvent.click(screen.getByText("Blank Line"));
    expect(editor.getValue()).toContain("line1\n\nline2");
  });

  it("is no-op when no active editor", () => {
    const app = createMockApp();
    renderWithApp(<BlankLineButton />, app);
    expect(() => fireEvent.click(screen.getByText("Blank Line"))).not.toThrow();
  });
});
