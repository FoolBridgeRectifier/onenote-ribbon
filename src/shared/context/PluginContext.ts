import { createContext, useContext } from 'react';
import type { Plugin } from 'obsidian';

export const PluginContext = createContext<Plugin>(null!);

export const usePlugin = (): Plugin => {
  const plugin = useContext(PluginContext);

  // Fail fast if the hook is called outside a PluginContext.Provider.
  if (!plugin) throw new Error('usePlugin must be used within PluginContext.Provider');

  return plugin;
};
