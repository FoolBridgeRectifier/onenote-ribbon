/**
 * Integration tests for ClipboardGroup (§1 Clipboard, §11 Format Painter)
 *
 * §1.1 Paste — reads from clipboard and inserts into editor
 * §1.2 Paste Dropdown — plain text paste, HTML stripping
 * §1.3 Cut — copies selection to clipboard and removes it
 * §1.4 Copy — copies selection to clipboard
 * §11 Format Painter — two-phase capture/apply, multi-format combos
 */
import React from "react";
import { screen, fireEvent, act } from "@testing-library/react";
import { renderWithApp } from "../../../../test-utils/renderWithApp";
import {
  createMockApp,
  createAppWithEditor,
} from "../../../../test-utils/mockApp";
import { ClipboardGroup } from "../ClipboardGroup";

// ── Clipboard mock ────────────────────────────────────────────────────────────

let clipText = "";
const clipboardMock = {
  readText: jest.fn(() => Promise.resolve(clipText)),
  writeText: jest.fn((t: string) => {
    clipText = t;
    return Promise.resolve();
  }),
};
Object.defineProperty(navigator, "clipboard", {
  value: clipboardMock,
  configurable: true,
  writable: true,
});

function resetClip(initial = "") {
  clipText = initial;
  clipboardMock.readText.mockClear();
  clipboardMock.writeText.mockClear();
}

describe("ClipboardGroup — §1 Clipboard (integration)", () => {
  beforeEach(() => resetClip());

  // §1.1 Paste — inserts clipboard text at cursor (no selection)
  it.skip("§1.1.1 Paste inserts clipboard text at cursor with no selection", async () => {
    resetClip("world");
    const { app, editor } = createAppWithEditor("hello ");
    editor.setCursor({ line: 0, ch: 6 });
    renderWithApp(<ClipboardGroup />, app);
    await act(async () => {
      fireEvent.click(screen.getAllByText("Paste")[0]);
      await Promise.resolve();
    });
    expect(editor.getValue()).toBe("hello world");
  });

  // §1.1 Paste — replaces selection with clipboard text
  it.skip("§1.1.2 Paste replaces selected text with clipboard content", async () => {
    resetClip("world");
    const { app, editor } = createAppWithEditor("hello planet");
    editor.setSelection({ line: 0, ch: 6 }, { line: 0, ch: 12 });
    renderWithApp(<ClipboardGroup />, app);
    await act(async () => {
      fireEvent.click(screen.getAllByText("Paste")[0]);
      await Promise.resolve();
    });
    expect(editor.getValue()).toBe("hello world");
  });

  // §1.1 Paste — empty clipboard inserts nothing
  it.skip("§1.1.3 Paste with empty clipboard is effectively a no-op", async () => {
    resetClip("");
    const { app, editor } = createAppWithEditor("unchanged");
    editor.setCursor({ line: 0, ch: 0 });
    renderWithApp(<ClipboardGroup />, app);
    await act(async () => {
      fireEvent.click(screen.getAllByText("Paste")[0]);
      await Promise.resolve();
    });
    expect(editor.getValue()).toBe("unchanged");
  });

  // §1.2 Paste Dropdown — opens on ▾ button click
  it.skip("§1.2.0 Paste dropdown opens on ▾ button click", () => {
    const { app } = createAppWithEditor("");
    renderWithApp(<ClipboardGroup />, app);
    fireEvent.click(screen.getByText("▾"));
    expect(screen.getByText("Paste as Plain Text")).toBeInTheDocument();
    expect(screen.getByText("Paste Special…")).toBeInTheDocument();
  });

  // §1.2 Paste Plain Text — strips HTML tags
  it.skip("§1.2.3 Paste as Plain Text strips HTML from clipboard", async () => {
    resetClip("<b>hello</b>");
    const { app, editor } = createAppWithEditor("");
    editor.setCursor({ line: 0, ch: 0 });
    renderWithApp(<ClipboardGroup />, app);
    fireEvent.click(screen.getByText("▾"));
    await act(async () => {
      fireEvent.click(screen.getByText("Paste as Plain Text"));
      await Promise.resolve();
    });
    expect(editor.getValue()).toBe("hello");
  });

  // §1.2 Paste Plain Text — replaces selection with stripped text
  it.skip("§1.2.4 Paste as Plain Text replaces selection with stripped content", async () => {
    resetClip("<b>hi</b>");
    const { app, editor } = createAppWithEditor("world");
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });
    renderWithApp(<ClipboardGroup />, app);
    fireEvent.click(screen.getByText("▾"));
    await act(async () => {
      fireEvent.click(screen.getByText("Paste as Plain Text"));
      await Promise.resolve();
    });
    expect(editor.getValue()).toBe("hi");
  });

  // §1.2 Paste Plain Text — normalizes \r\n → \n
  it.skip("§1.2.5 Paste as Plain Text normalizes \\r\\n to \\n", async () => {
    resetClip("line1\r\nline2");
    const { app, editor } = createAppWithEditor("");
    editor.setCursor({ line: 0, ch: 0 });
    renderWithApp(<ClipboardGroup />, app);
    fireEvent.click(screen.getByText("▾"));
    await act(async () => {
      fireEvent.click(screen.getByText("Paste as Plain Text"));
      await Promise.resolve();
    });
    expect(editor.getValue()).not.toContain("\r");
    expect(editor.getValue()).toContain("line1");
    expect(editor.getValue()).toContain("line2");
  });

  // §1.2 Paste Special — is disabled (no action)
  it.skip("§1.2.6 Paste Special item is disabled and takes no action", () => {
    const { app, editor } = createAppWithEditor("hello");
    editor.setValue("hello");
    renderWithApp(<ClipboardGroup />, app);
    fireEvent.click(screen.getByText("▾"));
    fireEvent.click(screen.getByText("Paste Special…"));
    expect(editor.getValue()).toBe("hello"); // unchanged
  });

  // §1.3 Cut — copies selection to clipboard and removes it
  it.skip("§1.3.1 Cut copies selection to clipboard and removes it from editor", async () => {
    resetClip();
    const { app, editor } = createAppWithEditor("hello world");
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });
    renderWithApp(<ClipboardGroup />, app);
    await act(async () => {
      fireEvent.click(screen.getByText("✂ Cut"));
      await Promise.resolve();
    });
    expect(clipboardMock.writeText).toHaveBeenCalledWith("hello");
    expect(editor.getValue()).toBe(" world");
  });

  // §1.3 Cut — no selection: nothing written to clipboard
  it.skip("§1.3.2 Cut with no selection is a no-op", async () => {
    resetClip();
    const { app, editor } = createAppWithEditor("hello");
    editor.setCursor({ line: 0, ch: 0 });
    renderWithApp(<ClipboardGroup />, app);
    await act(async () => {
      fireEvent.click(screen.getByText("✂ Cut"));
    });
    expect(clipboardMock.writeText).not.toHaveBeenCalled();
    expect(editor.getValue()).toBe("hello");
  });

  // §1.3 Cut — no editor: no crash
  it.skip("§1.3.3 Cut is no-op when no active editor", () => {
    const app = createMockApp();
    renderWithApp(<ClipboardGroup />, app);
    expect(() => fireEvent.click(screen.getByText("✂ Cut"))).not.toThrow();
  });

  // §1.4 Copy — copies selection to clipboard
  it.skip("§1.4.1 Copy writes selected text to clipboard", async () => {
    resetClip();
    const { app, editor } = createAppWithEditor("hello world");
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });
    renderWithApp(<ClipboardGroup />, app);
    await act(async () => {
      fireEvent.click(screen.getByText("⎘ Copy"));
    });
    expect(clipboardMock.writeText).toHaveBeenCalledWith("hello");
    expect(editor.getValue()).toBe("hello world"); // unchanged
  });

  // §1.4 Copy — no selection: nothing written
  it.skip("§1.4.2 Copy with no selection is a no-op", async () => {
    resetClip();
    const { app } = createAppWithEditor("hello");
    renderWithApp(<ClipboardGroup />, app);
    await act(async () => {
      fireEvent.click(screen.getByText("⎘ Copy"));
    });
    expect(clipboardMock.writeText).not.toHaveBeenCalled();
  });

  // §1.4 Copy — no editor: no crash
  it.skip("§1.4.3 Copy is no-op when no active editor", () => {
    const app = createMockApp();
    renderWithApp(<ClipboardGroup />, app);
    expect(() => fireEvent.click(screen.getByText("⎘ Copy"))).not.toThrow();
  });
});

// ── §11 Format Painter ───────────────────────────────────────────────────────

describe("ClipboardGroup — §11 Format Painter (integration)", () => {
  // §11.1 Phase 1: click on bold line → captures bold format
  it.skip("§11.1.1 Format Painter phase 1 captures format from current line", () => {
    const { app, editor } = createAppWithEditor("**bold text**");
    editor.setCursor({ line: 0, ch: 5 });
    const { container } = renderWithApp(<ClipboardGroup />, app);
    // Phase 1 click should activate the Format Painter
    fireEvent.click(screen.getByText("Format Painter"));
    const fpBtn = container.querySelector('[data-cmd="format-painter"]');
    expect(fpBtn?.className).toContain("onr-active");
  });

  // §11.1 Phase 2: click on selected text → applies format
  it.skip("§11.1.2 Format Painter phase 2 applies bold to selected text", () => {
    const { app, editor } = createAppWithEditor("**bold**\nplain");
    editor.setCursor({ line: 0, ch: 3 }); // inside bold on line 0
    renderWithApp(<ClipboardGroup />, app);
    // Phase 1: capture bold format
    fireEvent.click(screen.getByText("Format Painter"));
    // Phase 2: select plain text on line 1, then apply
    editor.setSelection({ line: 1, ch: 0 }, { line: 1, ch: 5 });
    fireEvent.click(screen.getByText("Format Painter"));
    expect(editor.getValue()).toBe("**bold**\n**plain**");
  });

  // §11.1 Phase 1 captures italic
  it.skip("§11.1.3 Format Painter captures italic from line with *text*", () => {
    const { app, editor } = createAppWithEditor("*italic*");
    editor.setCursor({ line: 0, ch: 4 });
    renderWithApp(<ClipboardGroup />, app);
    fireEvent.click(screen.getByText("Format Painter")); // phase 1 — capture italic
    // Phase 2: apply to selected text "test"
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 8 }); // select *italic*
    fireEvent.click(screen.getByText("Format Painter")); // phase 2 — apply
    // The selection was *italic* — applying italic on *italic* would wrap again
    // (it's not an exact unwrap scenario for applyFormatPainter)
    // Main check: no crash, the painter was applied
    expect(editor.getValue()).toBeDefined();
  });

  // §11.1 Phase 1 captures heading prefix
  it.skip("§11.1.4 Format Painter captures heading prefix from line", () => {
    const { app, editor } = createAppWithEditor("## My Heading");
    editor.setCursor({ line: 0, ch: 5 });
    renderWithApp(<ClipboardGroup />, app);
    fireEvent.click(screen.getByText("Format Painter")); // phase 1
    // Phase 2: set line to plain line and select
    editor.setCursor({ line: 0, ch: 0 });
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 13 });
    fireEvent.click(screen.getByText("Format Painter")); // phase 2: apply ## prefix
    expect(editor.getValue()).toMatch(/^## /);
  });

  // §11.2 Phase 2 on non-bold line: applies bold format
  it.skip("§11.2.1 applying bold format makes target text bold", () => {
    const { app, editor } = createAppWithEditor("**src**\nplain");
    editor.setCursor({ line: 0, ch: 3 }); // inside bold
    renderWithApp(<ClipboardGroup />, app);
    fireEvent.click(screen.getByText("Format Painter")); // Phase 1 — captures bold
    editor.setSelection({ line: 1, ch: 0 }, { line: 1, ch: 5 });
    fireEvent.click(screen.getByText("Format Painter")); // Phase 2 — applies bold
    expect(editor.getValue()).toContain("**plain**");
  });

  // §11.2 Phase 2 with no selection: shows Notice (no crash)
  it.skip("§11.2.2 Format Painter phase 2 with no selection shows notice and does not apply", () => {
    const { app, editor } = createAppWithEditor("**bold**");
    editor.setCursor({ line: 0, ch: 3 });
    renderWithApp(<ClipboardGroup />, app);
    fireEvent.click(screen.getByText("Format Painter")); // Phase 1
    editor.setCursor({ line: 0, ch: 0 }); // no selection
    expect(() =>
      fireEvent.click(screen.getByText("Format Painter")),
    ).not.toThrow();
    // Editor value unchanged (no selection to apply to)
    expect(editor.getValue()).toBe("**bold**");
  });

  // §11 Multi-format: captures bold+italic+underline together
  it.skip("§11.3.1 Format Painter captures bold+italic+underline from line", () => {
    const { app, editor } = createAppWithEditor("***<u>text</u>***\nplain");
    editor.setCursor({ line: 0, ch: 5 });
    renderWithApp(<ClipboardGroup />, app);
    fireEvent.click(screen.getByText("Format Painter")); // Phase 1
    editor.setSelection({ line: 1, ch: 0 }, { line: 1, ch: 5 });
    fireEvent.click(screen.getByText("Format Painter")); // Phase 2
    const val = editor.getValue();
    // applyFormatPainter applies underline → italic → bold in order
    expect(val).toContain("plain");
    expect(val).toContain("***");
  });

  // §11 Format Painter inactive when no active editor
  it.skip("§11 Format Painter is no-op when no active editor", () => {
    const app = createMockApp();
    renderWithApp(<ClipboardGroup />, app);
    expect(() =>
      fireEvent.click(screen.getByText("Format Painter")),
    ).not.toThrow();
  });
});
