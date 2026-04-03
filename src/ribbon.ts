import { App } from "obsidian";
import { RibbonState, TabId, DEFAULT_STATE } from "./types";

const TAB_IDS: TabId[] = ["home", "insert", "draw", "history", "review", "view", "help"];
const TAB_LABELS: Record<TabId, string> = {
  file: "File", home: "Home", insert: "Insert", draw: "Draw",
  history: "History", review: "Review", view: "View", help: "Help",
};

export class RibbonView {
  private el: HTMLElement;
  private tabRowEl: HTMLElement;
  private bodyEl: HTMLElement;
  private state: RibbonState;
  private onStateChange: (state: RibbonState) => void;
  private clickAwayHandler: (e: MouseEvent) => void;
  private keyHandler: (e: KeyboardEvent) => void;

  constructor(
    private app: App,
    initialState: RibbonState,
    onStateChange: (state: RibbonState) => void,
  ) {
    this.state = { ...initialState };
    this.onStateChange = onStateChange;
    this.el = this.build();
    this.clickAwayHandler = this.handleClickAway.bind(this);
    this.keyHandler = this.handleKey.bind(this);
    document.addEventListener("click", this.clickAwayHandler, true);
    document.addEventListener("keydown", this.keyHandler, true);
  }

  private build(): HTMLElement {
    const root = document.createElement("div");
    root.id = "onenote-ribbon";

    // Tab row
    this.tabRowEl = root.createDiv({ cls: "or-tab-row" });

    // File button
    const fileBtn = this.tabRowEl.createDiv({ cls: "or-tab-file", text: "File" });
    fileBtn.addEventListener("click", () => this.handleFileClick());

    // Regular tabs
    for (const id of TAB_IDS) {
      const tab = this.tabRowEl.createDiv({ cls: "or-tab", text: TAB_LABELS[id] });
      tab.dataset.tabId = id;
      tab.addEventListener("click", () => this.selectTab(id));
      tab.addEventListener("dblclick", () => this.togglePin());
    }

    // Ribbon body (empty for now — tabs will populate this)
    this.bodyEl = root.createDiv({ cls: "or-body" });

    this.syncDOM();
    return root;
  }

  private syncDOM() {
    // Active tab highlight
    this.tabRowEl.querySelectorAll(".or-tab").forEach((el) => {
      const tabEl = el as HTMLElement;
      tabEl.classList.toggle("is-active", tabEl.dataset.tabId === this.state.activeTab);
    });

    // Pin indicator
    this.tabRowEl.classList.toggle("is-pinned", this.state.pinned);

    // Collapsed vs visible
    if (this.state.pinned) {
      this.el.classList.remove("is-collapsed");
      this.bodyEl.classList.add("is-visible");
    } else {
      // Will be set by selectTab / collapse logic
    }
  }

  private selectTab(id: TabId) {
    const wasActive = this.state.activeTab === id;
    this.state.activeTab = id;

    if (wasActive && !this.state.pinned) {
      // Clicking active tab again collapses
      this.collapse();
    } else {
      this.el.classList.remove("is-collapsed");
      this.bodyEl.classList.add("is-visible");
    }

    this.syncDOM();
    this.onStateChange({ ...this.state });
  }

  private togglePin() {
    this.state.pinned = !this.state.pinned;
    if (this.state.pinned) {
      this.el.classList.remove("is-collapsed");
      this.bodyEl.classList.add("is-visible");
    }
    this.syncDOM();
    this.onStateChange({ ...this.state });
  }

  private collapse() {
    this.el.classList.add("is-collapsed");
    this.bodyEl.classList.remove("is-visible");
  }

  private handleFileClick() {
    // Backstage handled in plan 05 — no-op for now
  }

  private handleClickAway(e: MouseEvent) {
    if (this.state.pinned) return;
    if (!this.el.contains(e.target as Node)) {
      this.collapse();
    }
  }

  private handleKey(e: KeyboardEvent) {
    if (e.key === "Escape" && !this.state.pinned) {
      this.collapse();
    }
  }

  /** Mount the ribbon above the workspace content area */
  mount() {
    const target = document.querySelector(".mod-root") as HTMLElement;
    if (!target) {
      console.error("OneNote Ribbon: .mod-root not found");
      return;
    }
    target.prepend(this.el);
  }

  /** Remove ribbon from DOM and clean up listeners */
  unmount() {
    this.el.remove();
    document.removeEventListener("click", this.clickAwayHandler, true);
    document.removeEventListener("keydown", this.keyHandler, true);
  }

  getEl(): HTMLElement { return this.el; }
  getBodyEl(): HTMLElement { return this.bodyEl; }
  getState(): RibbonState { return { ...this.state }; }
}
