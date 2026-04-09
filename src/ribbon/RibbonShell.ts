import { App } from "obsidian";
import { createRoot, Root } from "react-dom/client";
import { createElement } from "react";

import { AppContext } from "../shared/context/AppContext";
import { RibbonApp } from "./RibbonApp";

export class RibbonShell {
  private element!: HTMLElement;
  private root!: Root;

  constructor(private app: App) {}

  mount(): void {
    document.getElementById("onenote-ribbon-root")?.remove();

    this.element = document.createElement("div");
    this.element.id = "onenote-ribbon-root";

    const horizontalMainContainer = document.querySelector(".horizontal-main-container");
    horizontalMainContainer?.parentElement?.insertBefore(this.element, horizontalMainContainer);

    const titlebarElement = document.querySelector(".titlebar") as HTMLElement | null;
    if (titlebarElement) {
      this.element.style.marginTop = `${titlebarElement.getBoundingClientRect().height}px`;
    }

    this.root = createRoot(this.element);
    this.root.render(
      createElement(
        AppContext.Provider,
        { value: this.app },
        createElement(RibbonApp),
      ),
    );
  }

  unmount(): void {
    this.root?.unmount();
    this.element?.remove();
  }
}
