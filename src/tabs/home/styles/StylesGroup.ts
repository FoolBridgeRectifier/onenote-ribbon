import { App } from "obsidian";
import { STYLES_LIST } from "./styles-data";
import { StylesPreview } from "./styles-preview/StylesPreview";
import { StylesScroll } from "./styles-scroll/StylesScroll";
import { StylesDropdown } from "./styles-dropdown/StylesDropdown";

export class StylesGroup {
  render(
    container: HTMLElement,
    app: App,
    getOffset: () => number,
    setOffset: (v: number) => void,
  ): void {
    const group = container.createDiv("onr-group");
    group.setAttribute("data-group", "Styles");

    const inner = group.createDiv();
    inner.style.cssText = "display:flex;align-items:stretch;gap:0";

    const preview = new StylesPreview(getOffset, setOffset);
    preview.render(inner, app, group);

    const scroll = new StylesScroll(getOffset, setOffset, () =>
      preview.refresh(group),
    );
    scroll.render(inner);

    group.createDiv("onr-group-name").textContent = "Styles";
  }
}
