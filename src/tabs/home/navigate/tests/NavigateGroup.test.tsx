/**
 * Integration tests for NavigateGroup (§10)
 *
 * Tests that clicking each navigate button fires the correct Obsidian command
 * via app.commands.executeCommandById.
 */
import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithApp } from "../../../../test-utils/renderWithApp";
import { createMockApp } from "../../../../test-utils/mockApp";
import { NavigateGroup } from "../NavigateGroup";

describe("NavigateGroup — §10 Navigate (integration)", () => {
  let app: ReturnType<typeof createMockApp>;

  beforeEach(() => {
    app = createMockApp();
  });

  // §10.1 — Outline button
  it("§10.1 dispatches outline:open on Outline button click", () => {
    renderWithApp(<NavigateGroup />, app);
    fireEvent.click(screen.getByText("📋 Outline"));
    expect(app.commands._called).toContain("outline:open");
  });

  // §10.2 — Fold All button
  it("§10.2 dispatches editor:fold-all on Fold All click", () => {
    renderWithApp(<NavigateGroup />, app);
    fireEvent.click(screen.getByText("⊟ Fold All"));
    expect(app.commands._called).toContain("editor:fold-all");
  });

  // §10.3 — Unfold All button
  it("§10.3 dispatches editor:unfold-all on Unfold All click", () => {
    renderWithApp(<NavigateGroup />, app);
    fireEvent.click(screen.getByText("⊞ Unfold All"));
    expect(app.commands._called).toContain("editor:unfold-all");
  });

  // §10 — No editor open: buttons dispatch commands regardless (commands guard is Obsidian-side)
  it("§10 no-editor: commands still dispatched even with no active editor", () => {
    const noEdApp = createMockApp(); // no editor
    renderWithApp(<NavigateGroup />, noEdApp);
    fireEvent.click(screen.getByText("📋 Outline"));
    expect(noEdApp.commands._called).toContain("outline:open");
  });
});
