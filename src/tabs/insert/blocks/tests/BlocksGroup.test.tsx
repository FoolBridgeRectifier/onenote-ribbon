import React from "react";
import { screen, fireEvent, act } from "@testing-library/react";
import { renderWithApp } from "../../../../test-utils/renderWithApp";
import { createAppWithEditor, createMockApp } from "../../../../test-utils/mockApp";
import { BlocksGroup } from "../BlocksGroup";

describe("BlocksGroup — integration", () => {
  it("renders Template, Callout, and Code Block buttons", () => {
    const { app } = createAppWithEditor("");
    renderWithApp(<BlocksGroup />, app);
    expect(screen.getByText("Template")).toBeInTheDocument();
    expect(screen.getByText("Callout")).toBeInTheDocument();
    expect(screen.getByText("Code Block")).toBeInTheDocument();
  });

  it("Template calls executeCommandById('insert-template')", () => {
    const { app } = createAppWithEditor("");
    renderWithApp(<BlocksGroup />, app);
    fireEvent.click(screen.getByText("Template"));
    expect((app.commands as any)._called).toContain("insert-template");
  });

  it("Code Block inserts ```\\n\\n``` at cursor", () => {
    const { app, editor } = createAppWithEditor("");
    editor.setCursor({ line: 0, ch: 0 });
    renderWithApp(<BlocksGroup />, app);
    fireEvent.click(screen.getByText("Code Block"));
    expect(editor.getValue()).toBe("```\n\n```");
  });

  it("Code Block is no-op when no active editor", () => {
    const app = createMockApp();
    renderWithApp(<BlocksGroup />, app);
    expect(() => fireEvent.click(screen.getByText("Code Block"))).not.toThrow();
  });

  it("Callout button opens dropdown with callout types", () => {
    const { app } = createAppWithEditor("");
    renderWithApp(<BlocksGroup />, app);
    fireEvent.click(screen.getByText("Callout"));
    expect(screen.getByText("note")).toBeInTheDocument();
    expect(screen.getByText("info")).toBeInTheDocument();
    expect(screen.getByText("warning")).toBeInTheDocument();
  });

  it("Callout dropdown item inserts callout markdown", () => {
    const { app, editor } = createAppWithEditor("");
    editor.setCursor({ line: 0, ch: 0 });
    renderWithApp(<BlocksGroup />, app);
    fireEvent.click(screen.getByText("Callout"));
    act(() => {
      fireEvent.click(screen.getByText("note"));
    });
    expect(editor.getValue()).toContain("> [!note]");
  });

  it("Template is no-op when no active editor (no crash)", () => {
    const app = createMockApp();
    renderWithApp(<BlocksGroup />, app);
    expect(() => fireEvent.click(screen.getByText("Template"))).not.toThrow();
  });
});

describe("BlocksGroup — Callout all 12 types", () => {
  const CALLOUT_TYPES = [
    "note", "abstract", "info", "tip", "success",
    "question", "warning", "failure", "danger", "bug", "example", "quote",
  ];

  for (const type of CALLOUT_TYPES) {
    it(`Callout "${type}" inserts > [!${type}] markdown`, () => {
      const { app, editor } = createAppWithEditor("");
      editor.setCursor({ line: 0, ch: 0 });
      renderWithApp(<BlocksGroup />, app);
      fireEvent.click(screen.getByText("Callout"));
      act(() => {
        fireEvent.click(screen.getByText(type));
      });
      expect(editor.getValue()).toContain(`[!${type}]`);
    });
  }
});
