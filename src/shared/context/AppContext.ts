import { createContext, useContext } from 'react';
import type { App } from 'obsidian';

// Extend Obsidian's App type to include commands API used throughout the plugin
export interface AppWithCommands extends App {
  commands: {
    executeCommandById(commandId: string): void;
  };
}

export const AppContext = createContext<AppWithCommands>(null!);
export const useApp = () => useContext(AppContext);
