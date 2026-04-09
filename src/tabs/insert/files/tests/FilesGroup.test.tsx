import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithApp } from "../../../../test-utils/renderWithApp";
import { createAppWithEditor, createMockApp } from "../../../../test-utils/mockApp";
import { FilesGroup } from "../FilesGroup";

describe("FilesGroup — integration", () => {
  it("renders Attach File and Embed Note buttons", () => {
    const { app } = createAppWithEditor("");
    renderWithApp(<FilesGroup />, app);
    expect(screen.getByText("Attach File")).toBeInTheDocument();
    expect(screen.getByText("Embed Note")).toBeInTheDocument();
  });

  it("Attach File inserts ![[]] at cursor", () => {
    const { app, editor } = createAppWithEditor("");
    editor.setCursor({ line: 0, ch: 0 });
    renderWithApp(<FilesGroup />, app);
    fireEvent.click(screen.getByText("Attach File"));
    expect(editor.getValue()).toBe("![[]]");
  });

  it("Embed Note inserts ![[]] at cursor", () => {
    const { app, editor } = createAppWithEditor("");
    editor.setCursor({ line: 0, ch: 0 });
    renderWithApp(<FilesGroup />, app);
    fireEvent.click(screen.getByText("Embed Note"));
    expect(editor.getValue()).toBe("![[]]");
  });

  it("Attach File appends at non-zero cursor", () => {
    const { app, editor } = createAppWithEditor("text");
    editor.setCursor({ line: 0, ch: 4 });
    renderWithApp(<FilesGroup />, app);
    fireEvent.click(screen.getByText("Attach File"));
    expect(editor.getValue()).toBe("text![[]]");
  });

  it("Attach File is no-op when no active editor", () => {
    const app = createMockApp();
    renderWithApp(<FilesGroup />, app);
    expect(() => fireEvent.click(screen.getByText("Attach File"))).not.toThrow();
  });

  it("Embed Note is no-op when no active editor", () => {
    const app = createMockApp();
    renderWithApp(<FilesGroup />, app);
    expect(() => fireEvent.click(screen.getByText("Embed Note"))).not.toThrow();
  });
});
