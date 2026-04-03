import { Plugin } from "obsidian";
import { RibbonView } from "./ribbon";
import { DEFAULT_STATE, RibbonState } from "./types";

export default class OneNoteRibbonPlugin extends Plugin {
  private ribbonView: RibbonView;
  private state: RibbonState = { ...DEFAULT_STATE };

  async onload() {
    const saved = await this.loadData();
    if (saved) {
      this.state = { ...DEFAULT_STATE, ...saved };
    }

    this.ribbonView = new RibbonView(
      this.app,
      this.state,
      (newState) => {
        this.state = newState;
        this.saveData(this.state);
      },
    );

    // Mount after workspace is ready
    this.app.workspace.onLayoutReady(() => {
      this.ribbonView.mount();
    });
  }

  onunload() {
    this.ribbonView?.unmount();
  }
}
