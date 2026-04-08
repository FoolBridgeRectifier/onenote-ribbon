import { App } from "obsidian";
import { InsertTemplateButton } from "./insert-template/InsertTemplateButton";
import { InsertCalloutButton } from "./insert-callout/InsertCalloutButton";
import { InsertCodeBlockButton } from "./insert-code-block/InsertCodeBlockButton";

/** Orchestrates the Blocks group: creates the group container and delegates button rendering. */
export class BlocksGroup {
  render(container: HTMLElement, app: App): void {
    const group = document.createElement("div");
    group.className = "onr-group";
    group.setAttribute("data-group", "Blocks");

    const buttons = document.createElement("div");
    buttons.className = "onr-group-buttons";

    new InsertTemplateButton().render(buttons, app);
    new InsertCalloutButton().render(buttons, app);
    new InsertCodeBlockButton().render(buttons, app);

    const name = document.createElement("div");
    name.className = "onr-group-name";
    name.textContent = "Blocks";

    group.appendChild(buttons);
    group.appendChild(name);
    container.appendChild(group);
  }
}
