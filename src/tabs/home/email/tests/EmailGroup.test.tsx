/**
 * Integration tests for EmailGroup (§9)
 *
 * §9.1 Email Page — copies full page content to clipboard
 * §9.2 Meeting Details — inserts YAML frontmatter template at cursor
 */
import React from "react";
import { screen, fireEvent, act } from "@testing-library/react";
import { renderWithApp } from "../../../../test-utils/renderWithApp";
import {
  createAppWithEditor,
  createMockApp,
} from "../../../../test-utils/mockApp";
import { EmailGroup } from "../EmailGroup";
import { MockEditor } from "../../../../test-utils/MockEditor";

// Mock navigator.clipboard
const clipboardMock = {
  written: "",
  writeText: jest.fn((text: string) => {
    clipboardMock.written = text;
    return Promise.resolve();
  }),
  readText: jest.fn(() => Promise.resolve("")),
};

Object.defineProperty(navigator, "clipboard", {
  value: clipboardMock,
  configurable: true,
});

describe("EmailGroup — §9 Email (integration)", () => {
  beforeEach(() => {
    clipboardMock.written = "";
    clipboardMock.writeText.mockClear();
  });

  // §9.1 Email Page — copies entire page content to clipboard
  it.skip("§9.1 Email Page button copies full page content to clipboard", async () => {
    const { app, editor } = createAppWithEditor("Hello World\nLine 2");
    renderWithApp(<EmailGroup />, app);
    await act(async () => {
      fireEvent.click(screen.getByText("📧 Email Page"));
      await Promise.resolve();
    });
    expect(clipboardMock.writeText).toHaveBeenCalledWith("Hello World\nLine 2");
  });

  // §9.1 — No editor open: no crash
  it.skip("§9.1 Email Page is a no-op when no active editor (no crash)", async () => {
    const app = createMockApp(); // no editor
    renderWithApp(<EmailGroup />, app);
    await act(async () => {
      fireEvent.click(screen.getByText("📧 Email Page"));
      await Promise.resolve();
    });
    // clipboard gets empty string from null getValue() ?? ''
    expect(clipboardMock.writeText).toHaveBeenCalledWith("");
  });

  // §9.2 Meeting Details — inserts YAML frontmatter template
  it.skip("§9.2 Meeting Details inserts YAML frontmatter at cursor", () => {
    const { app, editor } = createAppWithEditor("");
    editor.setCursor({ line: 0, ch: 0 });
    renderWithApp(<EmailGroup />, app);
    fireEvent.click(screen.getByText("📋 Meeting Details"));
    const val = editor.getValue();
    expect(val).toMatch(/^---\nDate:/);
    expect(val).toContain("Attendees:");
    expect(val).toContain("Agenda:");
    expect(val).toContain("---");
  });

  // §9.2 — Meeting details has Date, Time, Attendees, Agenda fields
  it.skip("§9.2 Meeting Details template contains required fields", () => {
    const { app, editor } = createAppWithEditor("");
    renderWithApp(<EmailGroup />, app);
    fireEvent.click(screen.getByText("📋 Meeting Details"));
    const val = editor.getValue();
    expect(val).toContain("Date:");
    expect(val).toContain("Time:");
    expect(val).toContain("Attendees:");
    expect(val).toContain("Agenda:");
  });

  // §9.2 — No editor: no crash
  it.skip("§9.2 Meeting Details is no-op when no active editor", () => {
    const app = createMockApp();
    renderWithApp(<EmailGroup />, app);
    expect(() =>
      fireEvent.click(screen.getByText("📋 Meeting Details")),
    ).not.toThrow();
  });

  // §9.1 — Email Page copies content of a multi-line note
  it.skip("§9.1 Email Page copies multi-line content verbatim", async () => {
    const { app } = createAppWithEditor("Line 1\nLine 2\nLine 3");
    renderWithApp(<EmailGroup />, app);
    await act(async () => {
      fireEvent.click(screen.getByText("📧 Email Page"));
      await Promise.resolve();
    });
    expect(clipboardMock.writeText).toHaveBeenCalledWith(
      "Line 1\nLine 2\nLine 3",
    );
  });
});
