import { Plugin } from 'obsidian';
import { RibbonShell } from './ribbon/Ribbon';

export default class OneNoteRibbonPlugin extends Plugin {
  private shell!: RibbonShell;

  async onload() {
    this.shell = new RibbonShell(this.app, this);
    this.shell.mount();
  }

  onunload() {
    this.shell.unmount();
  }
}
