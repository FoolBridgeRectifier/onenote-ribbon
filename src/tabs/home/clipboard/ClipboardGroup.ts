import { App } from "obsidian";
import { PasteButton } from "./paste/PasteButton";
import { PasteDropdown } from "./paste-dropdown/PasteDropdown";
import { CutButton } from "./cut/CutButton";
import { CopyButton } from "./copy/CopyButton";
import { FormatPainterButton } from "./format-painter/FormatPainterButton";

export class ClipboardGroup {
  render(container: HTMLElement, app: App): void {
    const group = container.createDiv("onr-group");
    group.setAttribute("data-group", "Clipboard");

    const buttons = group.createDiv("onr-group-buttons");
    buttons.style.cssText = "align-items:flex-start;gap:2px";

    // Big Paste column (Paste button + dropdown arrow)
    const pasteCol = buttons.createDiv();
    pasteCol.style.cssText =
      "display:flex;flex-direction:column;align-items:center;gap:0";
    new PasteButton().render(pasteCol, app);
    new PasteDropdown().render(pasteCol, app);

    // Small stacked column (Cut, Copy, Format Painter)
    const smallCol = buttons.createDiv();
    smallCol.style.cssText =
      "display:flex;flex-direction:column;gap:1px;padding-top:2px";
    new CutButton().render(smallCol, app);
    new CopyButton().render(smallCol, app);
    new FormatPainterButton().render(smallCol, app);

    group.createDiv("onr-group-name").textContent = "Clipboard";
  }
}
