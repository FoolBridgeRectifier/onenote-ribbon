import { Plugin } from 'obsidian';
import { RibbonShell } from './ribbon/Ribbon';
import { registerCommands } from './shared/commands/commands';

export default class OneNoteRibbonPlugin extends Plugin {
  private shell!: RibbonShell;

  async onload() {
    this.shell = new RibbonShell(this.app, this);
    this.shell.mount();
    registerCommands(this, this.app);
  }

  onunload() {
    this.shell.unmount();
  }
}
