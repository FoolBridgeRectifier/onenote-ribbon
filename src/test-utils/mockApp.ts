import { MockEditor } from './MockEditor';

/**
 * A comprehensive mock of the Obsidian App, Workspace, Vault, and Commands
 * used in integration tests. Mirrors the real API surface used by components.
 */
export interface MockWorkspace {
  activeEditor: { editor: MockEditor } | null;
  _handlers: Record<string, Array<() => void>>;
  on(event: string, handler: () => void): object;
  offref(ref: object): void;
  trigger(event: string): void;
}

export interface MockVault {
  _config: Record<string, unknown>;
  getConfig(key: string): unknown;
  setConfig(key: string, value: unknown): void;
}

export interface MockCommands {
  _called: string[];
  executeCommandById(id: string): void;
}

export interface MockApp {
  workspace: MockWorkspace;
  vault: MockVault;
  commands: MockCommands;
}

/**
 * Creates a fully-functional mock Obsidian App.
 *
 * @param editor  An optional pre-built MockEditor to attach as the active editor.
 *                If omitted, no active editor is set (simulates "no editor open").
 */
export function createMockApp(editor?: MockEditor): MockApp {
  const workspace: MockWorkspace = {
    activeEditor: editor ? { editor } : null,
    _handlers: {},
    on(event: string, handler: () => void) {
      if (!this._handlers[event]) this._handlers[event] = [];
      this._handlers[event].push(handler);
      return { event, handler }; // ref object for offref
    },
    offref(_reference: object) {
      // no-op; real cleanup is handled per-event in tests
    },
    trigger(event: string) {
      this._handlers[event]?.forEach((handlerCallback) => handlerCallback());
    },
  };

  const vault: MockVault = {
    _config: {},
    getConfig(key: string) {
      return this._config[key] ?? null;
    },
    setConfig(key: string, value: unknown) {
      this._config[key] = value;
    },
  };

  const commands: MockCommands = {
    _called: [],
    executeCommandById(id: string) {
      this._called.push(id);
    },
  };

  return { workspace, vault, commands } as unknown as MockApp;
}

/**
 * Creates a MockApp with an active editor pre-loaded with the given content.
 * The cursor is placed at the start of the first line by default.
 */
export function createAppWithEditor(content = ''): {
  app: MockApp;
  editor: MockEditor;
} {
  const editor = new MockEditor();
  editor.setValue(content);
  editor.setCursor({ line: 0, ch: 0 });
  const app = createMockApp(editor);
  return { app, editor };
}
