import { Plugin } from "obsidian";
import { RibbonShell } from "./ribbon/RibbonShell";

export default class OneNoteRibbonPlugin extends Plugin {
  private shell: RibbonShell;

  async onload() {
    this.shell = new RibbonShell(this.app);
    this.app.workspace.onLayoutReady(() => this.shell.mount());
  }

  onunload() {
    this.shell.unmount();
  }
}
