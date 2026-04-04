import { App, Editor, MarkdownView } from "obsidian";

/** Returns true if the command ID exists in Obsidian's registry */
export function commandAvailable(app: App, commandId: string): boolean {
  return commandId in (app.commands as any).commands;
}

/** Execute an Obsidian command by ID. Returns false if not found. */
export function runCommand(app: App, commandId: string): boolean {
  if (!commandAvailable(app, commandId)) return false;
  (app as any).commands.executeCommandById(commandId);
  return true;
}

/** Insert a text snippet at the cursor in the active editor */
export function insertText(app: App, text: string) {
  const view = app.workspace.getActiveViewOfType(MarkdownView);
  if (!view) return;
  const editor: Editor = view.editor;
  editor.replaceSelection(text);
}

/** Insert current date string at cursor */
export function insertDate(app: App) {
  const d = new Date();
  const str = d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  insertText(app, str);
}

/** Insert current time string at cursor */
export function insertTime(app: App) {
  const t = new Date();
  const str = t.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  insertText(app, str);
}

/** Check if a community plugin is loaded */
export function pluginLoaded(app: App, pluginId: string): boolean {
  return pluginId in (app.plugins as any).plugins;
}
