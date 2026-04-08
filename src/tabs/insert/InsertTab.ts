import { App } from "obsidian";
import { BlankLineButton } from "./blank-line/BlankLineButton";
import { TablesGroup } from "./tables/TablesGroup";
import { FilesGroup } from "./files/FilesGroup";
import { ImagesGroup } from "./images/ImagesGroup";
import { LinksGroup } from "./links/LinksGroup";
import { TimestampGroup } from "./timestamp/TimestampGroup";
import { BlocksGroup } from "./blocks/BlocksGroup";
import { SymbolsGroup } from "./symbols/SymbolsGroup";

export class InsertTab {
  render(container: HTMLElement, app: App): void {
    const panel = container.createDiv();
    panel.addClass("onr-tab-panel");
    panel.setAttribute("data-panel", "Insert");
    panel.style.display = "none";

    const insertGroup = panel.createDiv("onr-group");
    insertGroup.setAttribute("data-group", "Insert");
    const insertButtons = insertGroup.createDiv("onr-group-buttons");
    new BlankLineButton().render(insertButtons, app);
    insertGroup.createDiv("onr-group-name").textContent = "Insert";

    new TablesGroup().render(panel, app);
    new FilesGroup().render(panel, app);
    new ImagesGroup().render(panel, app);
    new LinksGroup().render(panel, app);
    new TimestampGroup().render(panel, app);
    new BlocksGroup().render(panel, app);
    new SymbolsGroup().render(panel, app);

    container.appendChild(panel);
  }
}
