import { App } from "obsidian";
import { RibbonState, TabId, TabDefinition, ButtonDef, ButtonRow, DEFAULT_STATE } from "./types";
import { makeSvg } from "./icons";
import { commandAvailable, runCommand, insertText, insertDate, insertTime } from "./commands";
import { HOME_TAB }    from "./tabs/home";
import { INSERT_TAB }  from "./tabs/insert";
import { DRAW_TAB }    from "./tabs/draw";
import { HISTORY_TAB } from "./tabs/history";
import { REVIEW_TAB }  from "./tabs/review";
import { VIEW_TAB }    from "./tabs/view";
import { HELP_TAB }    from "./tabs/help";

const TAB_IDS: TabId[] = ["home", "insert", "draw", "history", "review", "view", "help"];
const TAB_LABELS: Record<TabId, string> = {
  file: "File", home: "Home", insert: "Insert", draw: "Draw",
  history: "History", review: "Review", view: "View", help: "Help",
};
const TAB_DEFS: Record<string, TabDefinition> = {
  home: HOME_TAB, insert: INSERT_TAB, draw: DRAW_TAB,
  history: HISTORY_TAB, review: REVIEW_TAB, view: VIEW_TAB, help: HELP_TAB,
};

export class RibbonView {
  private el: HTMLElement;
  private tabRowEl: HTMLElement;
  private bodyEl: HTMLElement;
  private state: RibbonState;
  private onStateChange: (state: RibbonState) => void;
  private clickAwayHandler: (e: MouseEvent) => void;
  private keyHandler: (e: KeyboardEvent) => void;
  /** Callback set by PanelManager for panel buttons (plan 04) */
  onPanelButtonClick?: (buttonId: string, def: ButtonDef) => void;

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

    this.tabRowEl = root.createDiv({ cls: "or-tab-row" });

    const fileBtn = this.tabRowEl.createDiv({ cls: "or-tab-file", text: "File" });
    fileBtn.addEventListener("click", () => this.handleFileClick());

    for (const id of TAB_IDS) {
      const tab = this.tabRowEl.createDiv({ cls: "or-tab", text: TAB_LABELS[id] });
      tab.dataset.tabId = id;
      tab.addEventListener("click", () => this.selectTab(id));
      tab.addEventListener("dblclick", () => this.togglePin());
    }

    this.bodyEl = root.createDiv({ cls: "or-body" });
    this.syncDOM();
    return root;
  }

  private renderTab(id: TabId) {
    this.bodyEl.empty();
    const def = TAB_DEFS[id];
    if (!def) return;

    for (const grp of def.groups) {
      const grpEl = this.bodyEl.createDiv({ cls: "or-grp" });
      const inner = grpEl.createDiv({ cls: "or-grp-inner" });

      for (const item of grp.items) {
        if ("buttons" in item) {
          // ButtonRow
          const row = inner.createDiv({ cls: "or-row" });
          for (const btn of (item as ButtonRow).buttons) {
            this.renderButton(row, btn);
          }
        } else {
          this.renderButton(inner, item as ButtonDef);
        }
      }

      grpEl.createDiv({ cls: "or-grp-label", text: grp.label });
    }

    // Spacer
    this.bodyEl.createDiv({ cls: "or-spacer" });
  }

  private renderButton(parent: HTMLElement, def: ButtonDef) {
    const available = def.nativeClipboard ? true : (def.commandId ? commandAvailable(this.app, def.commandId) : true);
    const disabled = !available;

    const btn = parent.createDiv({ cls: `or-btn or-btn-${def.size}` });
    if (def.isPanel) btn.dataset.panelId = def.id;
    if (disabled) {
      btn.setAttribute("aria-disabled", "true");
      btn.setAttribute("title", `Requires ${def.requiresPlugin ?? def.commandId}`);
    } else {
      btn.setAttribute("title", def.label);
    }

    if (def.size === "fmt") {
      // Text format buttons (B/I/U/S) — label is the visual
      btn.setText(def.label);
    } else {
      btn.innerHTML = makeSvg(def.icon, def.iconColor ?? "currentColor");
      if (def.size === "lg" || def.size === "md") {
        btn.createDiv({ cls: "or-btn-label", text: def.label });
      }
    }

    if (!disabled) {
      btn.addEventListener("click", () => this.handleButtonClick(def));
    }
  }

  private handleButtonClick(def: ButtonDef) {
    if (def.isPanel) {
      this.onPanelButtonClick?.(def.id, def);
      return;
    }
    if (def.nativeClipboard) { document.execCommand(def.nativeClipboard); return; }
    if (def.insertText === "__DATE__") { insertDate(this.app); return; }
    if (def.insertText === "__TIME__") { insertTime(this.app); return; }
    if (def.insertText) { insertText(this.app, def.insertText); return; }
    if (def.commandId) { runCommand(this.app, def.commandId); }
  }

  private syncDOM() {
    this.tabRowEl.querySelectorAll(".or-tab").forEach((el) => {
      const tabEl = el as HTMLElement;
      tabEl.classList.toggle("is-active", tabEl.dataset.tabId === this.state.activeTab);
    });
    this.tabRowEl.classList.toggle("is-pinned", this.state.pinned);
    if (this.state.pinned || this.bodyEl.classList.contains("is-visible")) {
      this.renderTab(this.state.activeTab);
    }
  }

  private selectTab(id: TabId) {
    const wasActive = this.state.activeTab === id && this.bodyEl.classList.contains("is-visible");
    this.state.activeTab = id;

    if (wasActive && !this.state.pinned) {
      this.collapse();
    } else {
      this.el.classList.remove("is-collapsed");
      this.bodyEl.classList.add("is-visible");
      this.renderTab(id);
    }

    this.syncDOM();
    this.onStateChange({ ...this.state });
  }

  private togglePin() {
    this.state.pinned = !this.state.pinned;
    if (this.state.pinned) {
      this.el.classList.remove("is-collapsed");
      this.bodyEl.classList.add("is-visible");
      this.renderTab(this.state.activeTab);
    }
    this.syncDOM();
    this.onStateChange({ ...this.state });
  }

  collapse() {
    this.el.classList.add("is-collapsed");
    this.bodyEl.classList.remove("is-visible");
  }

  private handleFileClick() { /* plan 05 */ }

  private handleClickAway(e: MouseEvent) {
    if (this.state.pinned) return;
    if (!this.el.contains(e.target as Node)) this.collapse();
  }

  private handleKey(e: KeyboardEvent) {
    if (e.key === "Escape" && !this.state.pinned) this.collapse();
  }

  /** Mount the ribbon full-width above the entire workspace (both sidebars + editor) */
  mount() {
    const workspace = document.querySelector(".workspace") as HTMLElement;
    if (!workspace) {
      console.error("OneNote Ribbon: .workspace not found");
      return;
    }
    workspace.insertAdjacentElement("beforebegin", this.el);
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

  /** Mark a panel button as active/inactive (called by PanelManager) */
  setPanelButtonActive(buttonId: string, active: boolean) {
    const btn = this.bodyEl.querySelector(`[data-panel-id="${buttonId}"]`);
    btn?.classList.toggle("is-panel-active", active);
  }
}
