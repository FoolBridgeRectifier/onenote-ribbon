import { Plugin } from 'obsidian';
import '../styles.css';
import './tabs/home/home.css';
import { RibbonShell } from './ribbon/RibbonShell';

export default class OneNoteRibbonPlugin extends Plugin {
  private shell!: RibbonShell;

  async onload() {
    this.shell = new RibbonShell(this.app);
    this.shell.mount();
  }

  onunload() {
    this.shell.unmount();
  }
}
