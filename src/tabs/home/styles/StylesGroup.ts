import { App } from "obsidian";
import { StylesPreview } from "./styles-preview/StylesPreview";
import { StylesScroll } from "./styles-scroll/StylesScroll";
import { StylesDropdown } from "./styles-dropdown/StylesDropdown";

export class StylesGroup {
  private preview: StylesPreview | null = null;
  private groupEl: HTMLElement | null = null;

  render(
    container: HTMLElement,
    app: App,
    getOffset: () => number,
    setOffset: (v: number) => void,
  ): void {
    const group = container.createDiv("onr-group");
    group.setAttribute("data-group", "Styles");
    this.groupEl = group;

    const inner = group.createDiv();
    inner.style.cssText = "display:flex;align-items:stretch;gap:0";

    this.preview = new StylesPreview(getOffset, setOffset);
    this.preview.render(inner, app, group);

    const scroll = new StylesScroll(getOffset, setOffset, () =>
      this.preview!.refresh(group),
    );
    scroll.render(inner, app);

    group.createDiv("onr-group-name").textContent = "Styles";
  }

  refresh(_panel: HTMLElement): void {
    if (this.preview && this.groupEl) {
      this.preview.refresh(this.groupEl);
    }
  }
}
