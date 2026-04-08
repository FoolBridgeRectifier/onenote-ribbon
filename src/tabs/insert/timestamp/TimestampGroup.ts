import { App } from "obsidian";
import { InsertDateButton } from "./insert-date/InsertDateButton";
import { InsertTimeButton } from "./insert-time/InsertTimeButton";
import { InsertDatetimeButton } from "./insert-datetime/InsertDatetimeButton";

/** Orchestrates the Time Stamp group: creates the group container and delegates button rendering. */
export class TimestampGroup {
  render(container: HTMLElement, app: App): void {
    const group = document.createElement("div");
    group.className = "onr-group";
    group.setAttribute("data-group", "Time Stamp");

    const buttons = document.createElement("div");
    buttons.className = "onr-group-buttons";

    new InsertDateButton().render(buttons, app);
    new InsertTimeButton().render(buttons, app);
    new InsertDatetimeButton().render(buttons, app);

    const name = document.createElement("div");
    name.className = "onr-group-name";
    name.textContent = "Time Stamp";

    group.appendChild(buttons);
    group.appendChild(name);
    container.appendChild(group);
  }
}
