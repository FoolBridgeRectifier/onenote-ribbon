import { App } from "obsidian";
import { InsertLinkButton } from "./insert-link/InsertLinkButton";
import { InsertWikilinkButton } from "./insert-wikilink/InsertWikilinkButton";

/** Orchestrates the Links group: creates the group container and delegates button rendering. */
export class LinksGroup {
  render(container: HTMLElement, app: App): void {
    const group = document.createElement("div");
    group.className = "onr-group";
    group.setAttribute("data-group", "Links");

    const buttons = document.createElement("div");
    buttons.className = "onr-group-buttons";

    new InsertLinkButton().render(buttons, app);
    new InsertWikilinkButton().render(buttons, app);

    const name = document.createElement("div");
    name.className = "onr-group-name";
    name.textContent = "Links";

    group.appendChild(buttons);
    group.appendChild(name);
    container.appendChild(group);
  }
}
