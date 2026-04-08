import { App } from "obsidian";
import { InsertTableButton } from "./insert-table/InsertTableButton";

/** Orchestrates the Tables group: creates the group container and delegates button rendering. */
export class TablesGroup {
  render(container: HTMLElement, app: App): void {
    const group = document.createElement("div");
    group.className = "onr-group";
    group.setAttribute("data-group", "Tables");

    const buttons = document.createElement("div");
    buttons.className = "onr-group-buttons";

    new InsertTableButton().render(buttons, app);

    const name = document.createElement("div");
    name.className = "onr-group-name";
    name.textContent = "Tables";

    group.appendChild(buttons);
    group.appendChild(name);
    container.appendChild(group);
  }
}
