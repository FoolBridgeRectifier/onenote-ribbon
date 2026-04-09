import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithApp } from "../../../../test-utils/renderWithApp";
import { createAppWithEditor, createMockApp } from "../../../../test-utils/mockApp";
import { TablesGroup } from "../TablesGroup";

describe("TablesGroup — integration", () => {
  it("renders the Table button", () => {
    const { app } = createAppWithEditor("");
    renderWithApp(<TablesGroup />, app);
    expect(screen.getByText("Table")).toBeInTheDocument();
  });

  it("inserts table markdown at cursor", () => {
    const { app, editor } = createAppWithEditor("");
    editor.setCursor({ line: 0, ch: 0 });
    renderWithApp(<TablesGroup />, app);
    fireEvent.click(screen.getByText("Table"));
    const val = editor.getValue();
    expect(val).toContain("| col | col | col |");
    expect(val).toContain("|---|---|---|");
  });

  it("inserts table after existing content", () => {
    const { app, editor } = createAppWithEditor("intro");
    editor.setCursor({ line: 0, ch: 5 });
    renderWithApp(<TablesGroup />, app);
    fireEvent.click(screen.getByText("Table"));
    expect(editor.getValue()).toContain("intro");
    expect(editor.getValue()).toContain("| col |");
  });

  it("is no-op when no active editor", () => {
    const app = createMockApp();
    renderWithApp(<TablesGroup />, app);
    expect(() => fireEvent.click(screen.getByText("Table"))).not.toThrow();
  });
});
