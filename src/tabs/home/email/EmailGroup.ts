import { App } from "obsidian";
import { EmailPageButton } from "./email-page/EmailPageButton";
import { MeetingDetailsButton } from "./meeting-details/MeetingDetailsButton";

export class EmailGroup {
  render(container: HTMLElement, app: App): void {
    const group = container.createDiv("onr-group");
    group.setAttribute("data-group", "Email & Meetings");
    const buttons = group.createDiv("onr-group-buttons");
    new EmailPageButton().render(buttons, app);
    new MeetingDetailsButton().render(buttons, app);
    group.createDiv("onr-group-name").textContent = "Email & Meetings";
  }
}
