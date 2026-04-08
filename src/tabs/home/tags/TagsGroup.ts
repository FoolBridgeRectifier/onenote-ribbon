import { App } from "obsidian";
import { ALL_TAGS } from "./tags-data";
import { TagRow } from "./tag-row/TagRow";
import { TagsDropdown } from "./tags-dropdown/TagsDropdown";
import { TodoTagButton } from "./todo-tag/TodoTagButton";
import { FindTagsButton } from "./find-tags/FindTagsButton";

export class TagsGroup {
  private tagRowInstances: TagRow[] = [];

  render(container: HTMLElement, app: App): void {
    const group = container.createDiv("onr-group");
    group.setAttribute("data-group", "Tags");

    const inner = group.createDiv();
    inner.style.cssText = "display:flex;gap:4px;align-items:flex-start";

    // Tag rows column
    const rowsCol = inner.createDiv();
    rowsCol.style.cssText =
      "display:flex;flex-direction:column;gap:1px;width:150px";

    const top3 = ALL_TAGS.slice(0, 3);
    this.tagRowInstances = top3.map((tag) => {
      const tr = new TagRow(tag);
      tr.render(rowsCol, app);
      return tr;
    });

    // Dropdown arrow
    const dropCol = inner.createDiv();
    dropCol.style.cssText =
      "display:flex;flex-direction:column;justify-content:center;height:64px";
    const dropBtn = dropCol.createDiv("onr-btn-sm");
    dropBtn.setAttribute("data-cmd", "tags-dropdown");
    dropBtn.style.cssText =
      "width:14px;min-height:64px;padding:0;font-size:9px;justify-content:center";
    dropBtn.textContent = "▾";
    dropBtn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    dropBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      TagsDropdown.show(dropBtn, app);
    });

    // Big buttons
    new TodoTagButton().render(inner, app);
    new FindTagsButton().render(inner, app);

    group.createDiv("onr-group-name").textContent = "Tags";
  }

  refreshChecks(panel: HTMLElement, editor: any): void {
    this.tagRowInstances.forEach((tr) => {
      const cmd = (tr as any).tag?.cmd;
      if (!cmd) return;
      const row = panel.querySelector(
        `[data-group="Tags"] [data-cmd="${cmd}"]`,
      ) as HTMLElement | null;
      if (row) tr.updateCheck(row, editor);
    });
  }
}
