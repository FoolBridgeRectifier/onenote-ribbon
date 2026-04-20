import type { App } from 'obsidian';

// Obsidian exposes `app` as a global variable at runtime in the plugin context.
declare global {
  const app: App;
}
