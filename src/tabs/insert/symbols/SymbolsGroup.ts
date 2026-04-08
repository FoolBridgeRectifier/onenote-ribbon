import { App } from "obsidian";
import { InsertMathButton } from "./insert-math/InsertMathButton";
import { InsertHrButton } from "./insert-hr/InsertHrButton";
import { InsertFootnoteButton } from "./insert-footnote/InsertFootnoteButton";
import { InsertTagButton } from "./insert-tag/InsertTagButton";

/** Orchestrates the Symbols group: creates the group container and delegates button rendering. */
export class SymbolsGroup {
  render(container: HTMLElement, app: App): void {
    const group = document.createElement("div");
    group.className = "onr-group";
    group.setAttribute("data-group", "Symbols");

    const buttons = document.createElement("div");
    buttons.className = "onr-group-buttons";

    new InsertMathButton().render(buttons, app);
    new InsertHrButton().render(buttons, app);
    new InsertFootnoteButton().render(buttons, app);
    new InsertTagButton().render(buttons, app);

    const name = document.createElement("div");
    name.className = "onr-group-name";
    name.textContent = "Symbols";

    group.appendChild(buttons);
    group.appendChild(name);
    container.appendChild(group);
  }
}
