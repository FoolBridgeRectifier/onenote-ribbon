import { App } from "obsidian";
import { AttachFileButton } from "./attach-file/AttachFileButton";
import { EmbedNoteButton } from "./embed-note/EmbedNoteButton";

/** Orchestrates the Files group: creates the group container and delegates button rendering. */
export class FilesGroup {
  render(container: HTMLElement, app: App): void {
    const group = document.createElement("div");
    group.className = "onr-group";
    group.setAttribute("data-group", "Files");

    const buttons = document.createElement("div");
    buttons.className = "onr-group-buttons";

    new AttachFileButton().render(buttons, app);
    new EmbedNoteButton().render(buttons, app);

    const name = document.createElement("div");
    name.className = "onr-group-name";
    name.textContent = "Files";

    group.appendChild(buttons);
    group.appendChild(name);
    container.appendChild(group);
  }
}
