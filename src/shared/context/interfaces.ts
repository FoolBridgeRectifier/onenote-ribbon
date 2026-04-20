import type { App } from 'obsidian';

/** Extends Obsidian's App type to include the commands API used throughout the plugin. */
export interface AppWithCommands extends App {
  commands: {
    executeCommandById(commandId: string): void;
  };
}
