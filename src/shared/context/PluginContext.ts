import { createContext, useContext } from 'react';
import { Plugin } from 'obsidian';

export const PluginContext = createContext<Plugin>(null!);
export const usePlugin = () => useContext(PluginContext);
