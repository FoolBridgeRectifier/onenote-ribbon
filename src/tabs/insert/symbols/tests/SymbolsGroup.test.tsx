import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithApp } from "../../../../test-utils/renderWithApp";
import { createAppWithEditor, createMockApp } from "../../../../test-utils/mockApp";
import { SymbolsGroup } from "../SymbolsGroup";

describe("SymbolsGroup — integration", () => {
  it("renders all four symbol buttons", () => {
    const { app } = createAppWithEditor("");
    renderWithApp(<SymbolsGroup />, app);
    expect(screen.getByText("Math $$")).toBeInTheDocument();
    expect(screen.getByText("Horizontal Rule")).toBeInTheDocument();
    expect(screen.getByText("Footnote")).toBeInTheDocument();
    expect(screen.getByText("#Tag")).toBeInTheDocument();
  });

  it("Math inserts $$\\n\\n$$ at cursor", () => {
    const { app, editor } = createAppWithEditor("");
    editor.setCursor({ line: 0, ch: 0 });
    renderWithApp(<SymbolsGroup />, app);
    fireEvent.click(screen.getByText("Math $$"));
    expect(editor.getValue()).toBe("$$\n\n$$");
  });

  it("Horizontal Rule inserts \\n---\\n at cursor", () => {
    const { app, editor } = createAppWithEditor("");
    editor.setCursor({ line: 0, ch: 0 });
    renderWithApp(<SymbolsGroup />, app);
    fireEvent.click(screen.getByText("Horizontal Rule"));
    expect(editor.getValue()).toBe("\n---\n");
  });

  it("Footnote inserts [^1] at cursor and [^1]: at end of file", () => {
    const { app, editor } = createAppWithEditor("text");
    editor.setCursor({ line: 0, ch: 4 });
    renderWithApp(<SymbolsGroup />, app);
    fireEvent.click(screen.getByText("Footnote"));
    const val = editor.getValue();
    expect(val).toContain("[^1]");
    expect(val).toContain("[^1]: ");
  });

  it("#Tag inserts # at cursor", () => {
    const { app, editor } = createAppWithEditor("");
    editor.setCursor({ line: 0, ch: 0 });
    renderWithApp(<SymbolsGroup />, app);
    fireEvent.click(screen.getByText("#Tag"));
    expect(editor.getValue()).toBe("#");
  });

  it("Math is no-op when no active editor", () => {
    const app = createMockApp();
    renderWithApp(<SymbolsGroup />, app);
    expect(() => fireEvent.click(screen.getByText("Math $$"))).not.toThrow();
  });

  it("Horizontal Rule is no-op when no active editor", () => {
    const app = createMockApp();
    renderWithApp(<SymbolsGroup />, app);
    expect(() => fireEvent.click(screen.getByText("Horizontal Rule"))).not.toThrow();
  });

  it("Footnote is no-op when no active editor", () => {
    const app = createMockApp();
    renderWithApp(<SymbolsGroup />, app);
    expect(() => fireEvent.click(screen.getByText("Footnote"))).not.toThrow();
  });

  it("#Tag is no-op when no active editor", () => {
    const app = createMockApp();
    renderWithApp(<SymbolsGroup />, app);
    expect(() => fireEvent.click(screen.getByText("#Tag"))).not.toThrow();
  });
});
