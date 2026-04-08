import { App } from "obsidian";
import { OutlineButton } from "./outline/OutlineButton";
import { FoldAllButton } from "./fold-all/FoldAllButton";
import { UnfoldAllButton } from "./unfold-all/UnfoldAllButton";

export class NavigateGroup {
  render(container: HTMLElement, app: App): void {
    const group = container.createDiv("onr-group");
    group.setAttribute("data-group", "Navigate");
    const buttons = group.createDiv("onr-group-buttons");
    new OutlineButton().render(buttons, app);
    new FoldAllButton().render(buttons, app);
    new UnfoldAllButton().render(buttons, app);
    group.createDiv("onr-group-name").textContent = "Navigate";
  }
}
