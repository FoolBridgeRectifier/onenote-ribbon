# paste/

Big Paste button module. Renders a tall `onr-btn` with a clipboard-down SVG icon and "Paste" label.

Reads from `navigator.clipboard.readText()` and falls back to `document.execCommand('paste')` if clipboard API is unavailable.
