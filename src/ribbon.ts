import { App } from "obsidian";
import { RibbonState, TabId, DEFAULT_STATE } from "./types";

const TAB_IDS: TabId[] = [
  "home",
  "insert",
  "draw",
  "history",
  "review",
  "view",
  "help",
];
const TAB_LABELS: Record<TabId, string> = {
  file: "File",
  home: "Home",
  insert: "Insert",
  draw: "Draw",
  history: "History",
  review: "Review",
  view: "View",
  help: "Help",
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
    this.syncDOM(); // called after this.el is set
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
    const fileBtn = this.tabRowEl.createDiv({
      cls: "or-tab-file",
      text: "File",
    });
    fileBtn.addEventListener("click", () => this.handleFileClick());

    // Regular tabs
    for (const id of TAB_IDS) {
      const tab = this.tabRowEl.createDiv({
        cls: "or-tab",
        text: TAB_LABELS[id],
      });
      tab.dataset.tabId = id;
      tab.addEventListener("click", () => this.selectTab(id));
      tab.addEventListener("dblclick", () => this.togglePin());
    }

    // Ribbon body (empty for now — tabs will populate this)
    this.bodyEl = root.createDiv({ cls: "or-body" });

    return root;  // syncDOM() is called by constructor after this.el is set
  }

  private syncDOM() {
    // Active tab highlight
    this.tabRowEl.querySelectorAll(".or-tab").forEach((el) => {
      const tabEl = el as HTMLElement;
      tabEl.classList.toggle(
        "is-active",
        tabEl.dataset.tabId === this.state.activeTab,
      );
    });

    // Pin indicator
    this.tabRowEl.classList.toggle("is-pinned", this.state.pinned);

    // Collapsed vs visible
    if (this.state.pinned) {
      this.el.classList.remove("is-collapsed");
      this.bodyEl.classList.add("is-visible");
    } else if (!this.bodyEl.classList.contains("is-visible")) {
      // Default to collapsed when body is not already open
      this.el.classList.add("is-collapsed");
    }
  }

  private selectTab(id: TabId) {
    const wasActive = this.state.activeTab === id;
    const isCollapsed = this.el.classList.contains("is-collapsed") ||
      !this.bodyEl.classList.contains("is-visible");
    this.state.activeTab = id;

    if (wasActive && !this.state.pinned && !isCollapsed) {
      // Clicking the active tab while expanded collapses the ribbon
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
    // .workspace-split.mod-root is the vertical flex column that holds the
    // editor tab headers and leaf content. Prepending here places the ribbon
    // above the editor without disturbing the left/right sidebars.
    const modRoot = document.querySelector(".workspace-split.mod-root") as HTMLElement;
    if (!modRoot) {
      console.error("OneNote Ribbon: .workspace-split.mod-root not found");
      return;
    }
    modRoot.prepend(this.el);
  }

  /** Remove ribbon from DOM and clean up listeners */
  unmount() {
    this.el.remove();
    document.removeEventListener("click", this.clickAwayHandler, true);
    document.removeEventListener("keydown", this.keyHandler, true);
  }

  getEl(): HTMLElement {
    return this.el;
  }
  getBodyEl(): HTMLElement {
    return this.bodyEl;
  }
  getState(): RibbonState {
    return { ...this.state };
  }
}
