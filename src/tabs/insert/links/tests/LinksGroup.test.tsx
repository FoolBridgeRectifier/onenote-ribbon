import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithApp } from "../../../../test-utils/renderWithApp";
import {
  createAppWithEditor,
  createMockApp,
} from "../../../../test-utils/mockApp";
import { LinksGroup } from "../LinksGroup";

describe("LinksGroup — integration", () => {
  it.skip("renders Link and Wikilink buttons", () => {
    const { app } = createAppWithEditor("");
    renderWithApp(<LinksGroup />, app);
    expect(screen.getByText("Link")).toBeInTheDocument();
    expect(screen.getByText("[[Wikilink]]")).toBeInTheDocument();
  });

  it.skip("Link with no selection inserts []() at cursor", () => {
    const { app, editor } = createAppWithEditor("");
    editor.setCursor({ line: 0, ch: 0 });
    renderWithApp(<LinksGroup />, app);
    fireEvent.click(screen.getByText("Link"));
    expect(editor.getValue()).toBe("[]()");
  });

  it.skip("Link wraps selection in [sel]()", () => {
    const { app, editor } = createAppWithEditor("hello");
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });
    renderWithApp(<LinksGroup />, app);
    fireEvent.click(screen.getByText("Link"));
    expect(editor.getValue()).toBe("[hello]()");
  });

  it.skip("Wikilink inserts [[]] at cursor", () => {
    const { app, editor } = createAppWithEditor("");
    editor.setCursor({ line: 0, ch: 0 });
    renderWithApp(<LinksGroup />, app);
    fireEvent.click(screen.getByText("[[Wikilink]]"));
    expect(editor.getValue()).toBe("[[]]");
  });

  it.skip("Link is no-op when no active editor", () => {
    const app = createMockApp();
    renderWithApp(<LinksGroup />, app);
    expect(() => fireEvent.click(screen.getByText("Link"))).not.toThrow();
  });

  it.skip("Wikilink is no-op when no active editor", () => {
    const app = createMockApp();
    renderWithApp(<LinksGroup />, app);
    expect(() =>
      fireEvent.click(screen.getByText("[[Wikilink]]")),
    ).not.toThrow();
  });
});
