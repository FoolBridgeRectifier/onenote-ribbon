import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithApp } from "../../../../test-utils/renderWithApp";
import { createAppWithEditor, createMockApp } from "../../../../test-utils/mockApp";
import { ImagesGroup } from "../ImagesGroup";

describe("ImagesGroup — integration", () => {
  it("renders Image and Video buttons", () => {
    const { app } = createAppWithEditor("");
    renderWithApp(<ImagesGroup />, app);
    expect(screen.getByText("Image")).toBeInTheDocument();
    expect(screen.getByText("Video")).toBeInTheDocument();
  });

  it("Image inserts ![[]] at cursor", () => {
    const { app, editor } = createAppWithEditor("");
    editor.setCursor({ line: 0, ch: 0 });
    renderWithApp(<ImagesGroup />, app);
    fireEvent.click(screen.getByText("Image"));
    expect(editor.getValue()).toBe("![[]]");
  });

  it("Video inserts iframe template at cursor", () => {
    const { app, editor } = createAppWithEditor("");
    editor.setCursor({ line: 0, ch: 0 });
    renderWithApp(<ImagesGroup />, app);
    fireEvent.click(screen.getByText("Video"));
    const val = editor.getValue();
    expect(val).toContain("<iframe");
    expect(val).toContain("allowfullscreen");
  });

  it("Image is no-op when no active editor", () => {
    const app = createMockApp();
    renderWithApp(<ImagesGroup />, app);
    expect(() => fireEvent.click(screen.getByText("Image"))).not.toThrow();
  });

  it("Video is no-op when no active editor", () => {
    const app = createMockApp();
    renderWithApp(<ImagesGroup />, app);
    expect(() => fireEvent.click(screen.getByText("Video"))).not.toThrow();
  });
});
