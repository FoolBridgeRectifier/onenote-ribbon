import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithApp } from "../../../../test-utils/renderWithApp";
import {
  createAppWithEditor,
  createMockApp,
} from "../../../../test-utils/mockApp";
import { TimestampGroup } from "../TimestampGroup";

describe("TimestampGroup — integration", () => {
  it.skip("renders Date, Time, and Date & Time buttons", () => {
    const { app } = createAppWithEditor("");
    renderWithApp(<TimestampGroup />, app);
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Time")).toBeInTheDocument();
    expect(screen.getByText("Date & Time")).toBeInTheDocument();
  });

  it.skip("Date inserts a YYYY-MM-DD formatted date", () => {
    const { app, editor } = createAppWithEditor("");
    editor.setCursor({ line: 0, ch: 0 });
    renderWithApp(<TimestampGroup />, app);
    fireEvent.click(screen.getByText("Date"));
    expect(editor.getValue()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it.skip("Time inserts a HH:mm formatted time", () => {
    const { app, editor } = createAppWithEditor("");
    editor.setCursor({ line: 0, ch: 0 });
    renderWithApp(<TimestampGroup />, app);
    fireEvent.click(screen.getByText("Time"));
    expect(editor.getValue()).toMatch(/^\d{2}:\d{2}$/);
  });

  it.skip("Date & Time inserts a combined timestamp", () => {
    const { app, editor } = createAppWithEditor("");
    editor.setCursor({ line: 0, ch: 0 });
    renderWithApp(<TimestampGroup />, app);
    fireEvent.click(screen.getByText("Date & Time"));
    expect(editor.getValue()).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  });

  it.skip("Date inserts after existing content", () => {
    const { app, editor } = createAppWithEditor("Today: ");
    editor.setCursor({ line: 0, ch: 7 });
    renderWithApp(<TimestampGroup />, app);
    fireEvent.click(screen.getByText("Date"));
    expect(editor.getValue()).toMatch(/^Today: \d{4}-\d{2}-\d{2}$/);
  });

  it.skip("Date is no-op when no active editor", () => {
    const app = createMockApp();
    renderWithApp(<TimestampGroup />, app);
    expect(() => fireEvent.click(screen.getByText("Date"))).not.toThrow();
  });

  it.skip("Time is no-op when no active editor", () => {
    const app = createMockApp();
    renderWithApp(<TimestampGroup />, app);
    expect(() => fireEvent.click(screen.getByText("Time"))).not.toThrow();
  });

  it.skip("Date & Time is no-op when no active editor", () => {
    const app = createMockApp();
    renderWithApp(<TimestampGroup />, app);
    expect(() =>
      fireEvent.click(screen.getByText("Date & Time")),
    ).not.toThrow();
  });
});
