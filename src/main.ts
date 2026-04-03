import { Plugin } from "obsidian";

export default class OneNoteRibbonPlugin extends Plugin {
  async onload() {
    console.log("OneNote Ribbon: loaded");
  }

  onunload() {
    console.log("OneNote Ribbon: unloaded");
  }
}
