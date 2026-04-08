# format-painter/

Format Painter button module. Renders a small `onr-btn-sm` with a paint-roller SVG and "Format Painter" label.

First click: captures the format (heading level, bold, italic, underline) from the current cursor line and sets `window._onrFPActive = true`.
Second click: deactivates (clears state and removes `onr-active` class).
