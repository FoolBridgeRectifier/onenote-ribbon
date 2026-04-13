# Draw Tab — Command & API Feasibility Report

> **Testing method:** `app.commands.listCommands()` inspect in Obsidian console; canvas API introspection with an open `.canvas` file (`Untitled 3.canvas`); plugin presence via `Object.keys(app.plugins.plugins)`.
>
> **Installed plugins:** `onenote-ribbon` only. Excalidraw and Ink Draw are NOT installed.

---

## GROUP: Launch

| Button | Command / API | Command ID | Works? | Plugin Required? | Notes |
|--------|--------------|------------|--------|-----------------|-------|
| New Canvas | `canvas:new-file` | `canvas:new-file` — "Canvas: Create new canvas" | ✅ Available | ❌ Core feature | Creates a new `.canvas` file in the vault root; opens it immediately |
| Excalidraw | `excalidraw:create-new` | Not found in `app.commands.listCommands()` | ❌ Unavailable | ✅ Excalidraw plugin | Command registered only when Excalidraw plugin is installed and enabled |
| Ink Draw | `ink:new-drawing` | Not found in `app.commands.listCommands()` | ❌ Unavailable | ✅ Ink plugin | Command registered only when Ink Draw plugin is installed and enabled |

> **Key finding:** Only New Canvas is available without a plugin. Excalidraw and Ink Draw buttons must check plugin availability at runtime and either show a "plugin not installed" prompt or hide the button entirely.

---

## GROUP: Canvas

| Button | Command / API | Method Signature | Works? | Plugin Required? | Notes |
|--------|--------------|-----------------|--------|-----------------|-------|
| Add Card | `canvas.createTextNode(...)` | `createTextNode({ pos: {x,y}, size: {width,height}, text: string, focus: boolean })` | ✅ Returns node | ❌ Core canvas | Inserts a plain text card node; `focus: true` puts cursor inside it immediately |
| Add Note | `canvas.createFileNode(...)` | `createFileNode({ pos: {x,y}, size: {width,height}, file: TFile, focus: boolean })` | ✅ Returns node | ❌ Core canvas | Links to an existing vault `TFile`; renders the file content as an embed inside the canvas |
| Group | `canvas.createGroupNode(...)` | `createGroupNode({ pos: {x,y}, size: {width,height}, label: string, focus: boolean })` | ✅ Returns node | ❌ Core canvas | Creates a labeled group rectangle; nodes dropped inside are automatically grouped |

> **Additional canvas methods confirmed available:** `canvas.undo()`, `canvas.redo()`, `canvas.zoomToFit()`, `canvas.zoomBy(delta)`, `canvas.panTo({x,y})`, `canvas.addNode(node)`, `canvas.addEdge(edge)`.
>
> **Position strategy:** Buttons should insert nodes relative to the current viewport center, obtained via `canvas.x`, `canvas.y` (pan offset) and `canvas.zoom` — or use `canvas.zoomToFit()` after insert.

---

## GROUP: Drawing Tools

| Button | Command / API | Command ID | Works? | Plugin Required? | Notes |
|--------|--------------|------------|--------|-----------------|-------|
| Select | None | Not registered | ❌ No command | ✅ Excalidraw plugin | Excalidraw-internal tool mode; no Obsidian command ID exists for any Excalidraw tool |
| Pen | None | Not registered | ❌ No command | ✅ Excalidraw plugin | Same — internal tool state within the Excalidraw canvas renderer |
| Shape | None | Not registered | ❌ No command | ✅ Excalidraw plugin | Same |
| Eraser | None | Not registered | ❌ No command | ✅ Excalidraw plugin | Same |

> **Key finding:** Select, Pen, Shape, and Eraser are all Excalidraw-internal tool modes. They have no Obsidian command IDs and cannot be invoked from outside the Excalidraw plugin. These buttons are only meaningful when an Excalidraw canvas is active with the plugin installed.

---

## GROUP: Mode

| Button | Command / API | Command ID | Works? | Plugin Required? | Notes |
|--------|--------------|------------|--------|-----------------|-------|
| Pan | None | Not registered | ❌ No command | ✅ Excalidraw plugin | Pan is an Excalidraw tool mode — no Obsidian command; Obsidian's own canvas uses scroll/drag natively |
| Ruler | None | Not registered | ❌ No command | ✅ Excalidraw plugin | Ruler tool is Excalidraw-internal only |
| Full Page | None | `app:toggle-fullscreen` not found | ❌ No command | ❌ N/A | `app.updateAutoFullScreenDisplay` exists on app prototype but is not registered as a command; no full-page toggle is available via Obsidian's command API |

> **Full Page workaround options if needed:** Electron's `getCurrentWindow().setFullScreen(true)` via `require('electron').remote` (deprecated), or `document.documentElement.requestFullscreen()` (Web Fullscreen API — works in Chromium/Electron).

---

## Summary

| Button | Works? | Mechanism | Plugin Required? | Notes |
|--------|--------|-----------|-----------------|-------|
| New Canvas | ✅ | `canvas:new-file` command | ❌ | Core Obsidian feature |
| Excalidraw | ⚠️ Plugin-gated | `excalidraw:create-new` command | ✅ Excalidraw | Show "install plugin" prompt when absent |
| Ink Draw | ⚠️ Plugin-gated | `ink:new-drawing` command | ✅ Ink Draw | Show "install plugin" prompt when absent |
| Add Card | ✅ | `canvas.createTextNode(...)` API | ❌ | Requires active canvas leaf |
| Add Note | ✅ | `canvas.createFileNode(...)` API | ❌ | Requires active canvas leaf + target TFile |
| Group | ✅ | `canvas.createGroupNode(...)` API | ❌ | Requires active canvas leaf |
| Select | ❌ | No command | ✅ Excalidraw | Tool mode — unavailable without plugin |
| Pen | ❌ | No command | ✅ Excalidraw | Tool mode — unavailable without plugin |
| Shape | ❌ | No command | ✅ Excalidraw | Tool mode — unavailable without plugin |
| Eraser | ❌ | No command | ✅ Excalidraw | Tool mode — unavailable without plugin |
| Pan | ❌ | No command | ✅ Excalidraw | Tool mode — unavailable without plugin |
| Ruler | ❌ | No command | ✅ Excalidraw | Tool mode — unavailable without plugin |
| Full Page | ❌ | No registered command | ❌ | Could use Web Fullscreen API as workaround |
