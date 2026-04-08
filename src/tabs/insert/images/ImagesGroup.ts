import { App } from "obsidian";
import { InsertImageButton } from "./insert-image/InsertImageButton";
import { InsertVideoButton } from "./insert-video/InsertVideoButton";

/** Orchestrates the Images group: creates the group container and delegates button rendering. */
export class ImagesGroup {
  render(container: HTMLElement, app: App): void {
    const group = document.createElement("div");
    group.className = "onr-group";
    group.setAttribute("data-group", "Images");

    const buttons = document.createElement("div");
    buttons.className = "onr-group-buttons";

    new InsertImageButton().render(buttons, app);
    new InsertVideoButton().render(buttons, app);

    const name = document.createElement("div");
    name.className = "onr-group-name";
    name.textContent = "Images";

    group.appendChild(buttons);
    group.appendChild(name);
    container.appendChild(group);
  }
}
