import { App } from "obsidian";
import { HomeTab } from "../tabs/HomeTab";
import { InsertTab } from "../tabs/InsertTab";

export const TABS = [
  "Home",
  "Insert",
  "Draw",
  "History",
  "Review",
  "View",
  "Help",
] as const;
export type TabName = (typeof TABS)[number];

export class RibbonShell {
  private el: HTMLElement;
  private activeTab: TabName = "Home";
  private collapsed = false;
  private pinned = true;

  constructor(private app: App) {}

  mount(): HTMLElement {
    // Remove any existing ribbon
    document.getElementById("onenote-ribbon-root")?.remove();

    this.el = document.createElement("div");
    this.el.id = "onenote-ribbon-root";
    this.el.setAttribute("data-active-tab", this.activeTab);

    this.el.innerHTML = this.buildHTML();
    this.attachEvents();

    // Render all tab panels into the body
    const body = this.el.querySelector(".onr-body") as HTMLElement;
    new HomeTab().render(body, this.app);
    new InsertTab().render(body, this.app);

    // Show only the active tab panel
    this.syncPanelVisibility(body);

    // Insert above the main workspace row (before .horizontal-main-container inside .app-container)
    const hmc = document.querySelector(".horizontal-main-container");
    hmc?.parentElement?.insertBefore(this.el, hmc);

    // Offset below the fixed titlebar so the tab bar isn't hidden under it
    const titlebar = document.querySelector(".titlebar") as HTMLElement | null;
    if (titlebar) {
      const tbHeight = titlebar.getBoundingClientRect().height;
      this.el.style.marginTop = `${tbHeight}px`;
    }

    return this.el;
  }

  unmount() {
    this.el?.remove();
  }

  private syncPanelVisibility(body?: HTMLElement) {
    const container = body ?? (this.el.querySelector(".onr-body") as HTMLElement);
    container.querySelectorAll(".onr-tab-panel").forEach((p) => {
      (p as HTMLElement).style.display =
        p.getAttribute("data-panel") === this.activeTab ? "" : "none";
    });
  }

  private buildHTML(): string {
    const tabs = TABS.map(
      (t) =>
        `<div class="onr-tab ${t === this.activeTab ? "active" : ""}" data-tab="${t}">${t}</div>`,
    ).join("");

    return `
      <div class="onr-tab-bar">
        ${tabs}
        <div class="onr-spacer"></div>
        <div class="onr-pin-btn">${this.pinned ? "📌" : ""} ${this.collapsed ? "▼ Expand" : "▲ Collapse"}</div>
      </div>
      <div class="onr-body" data-tab-content="Home">
        <!-- tab content injected by each tab module -->
      </div>
    `;
  }

  private attachEvents() {
    this.el.querySelectorAll(".onr-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        this.activeTab = tab.getAttribute("data-tab") as TabName;
        this.el.setAttribute("data-active-tab", this.activeTab);
        this.el
          .querySelectorAll(".onr-tab")
          .forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        this.syncPanelVisibility();
      });
    });

    this.el.querySelector(".onr-pin-btn")?.addEventListener("click", () => {
      this.collapsed = !this.collapsed;
      const body = this.el.querySelector(".onr-body") as HTMLElement;
      body.style.display = this.collapsed ? "none" : "";
      (this.el.querySelector(".onr-pin-btn") as HTMLElement).textContent = this
        .collapsed
        ? "▼ Expand"
        : "▲ Collapse";
    });
  }
}
