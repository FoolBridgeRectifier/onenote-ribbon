# OneNote Ribbon — Design Reference

> Authoritative guide to design intent, principles, and how CSS implements each one.
> Keep this in sync with `CLAUDE.md` and `styles.css`. Do not add styles that contradict anything written here.

---

## Design Context

### Users

Personal use by a single developer deeply familiar with OneNote, migrating their workflow into Obsidian. No onboarding concern. The ribbon should reward muscle memory, not teach new patterns. Optimize for speed and comfort — every interaction should feel immediately familiar.

### Brand Personality

**Structured. Refined. At-Home.**

The ribbon should feel like a natural part of Obsidian that borrows OneNote's layout — not a foreign UI grafted on.

### Aesthetic Direction

A deliberate blend of both reference UIs: **OneNote's structural conventions inside Obsidian's aesthetic sensibility.**

- **From OneNote:** Tab bar → groups → large + small stacked buttons. Purple `#6b2ca6` tab bar. Warm-gray hover states. SVG stroke icons. Group labels in small uppercase.
- **From Obsidian:** Ribbon body, text, and interactive states defer to Obsidian's CSS tokens where possible. Border-radius, shadow depth, and transition timing match Obsidian's own panels. Dark mode works automatically.

---

## Design Principles

### 1. OneNote Structure, Obsidian Skin

Layout, grouping, and button hierarchy come from OneNote. Color, typography, and depth come from Obsidian's active theme.

**How it is achieved in CSS:**

- `ribbon-app.css` — `.onr-ribbon` uses `background: var(--ribbon-bg)` not a hardcoded color. The ribbon body follows the Obsidian theme automatically.
- `tab-bar.css` — `.onr-tab-bar` uses `background: var(--ribbon-purple)` (fixed). The active tab flips to `background: var(--ribbon-bg)` so it visually "lifts" from the purple bar into the ribbon body — a direct OneNote convention.
- `home-tab-panel.css` — `.onr-tab-panel` uses `display: flex; flex-wrap: wrap` to replicate OneNote's group-row ribbon layout.
- Button hierarchy mirrors OneNote: large buttons (`min-height: 46px+`) for primary actions like Paste; small stacked buttons (`min-height: 22px`) for secondary actions like Cut/Copy; inline formatting buttons at `22×22`.

---

### 2. Token-Only Colors

No hex literals in component CSS. All color values flow through `var(--...)` tokens defined in `styles.css`. Tokens are the seam where Obsidian theme compatibility is added — changing a token here propagates everywhere.

**Tokens defined in `styles.css`:**

| Token | Value | Role |
|---|---|---|
| `--ribbon-purple` | `#6b2ca6` | Fixed tab bar color — the OneNote anchor |
| `--ribbon-purple-mid` | `#7b3cb6` | Tab bar hover state |
| `--ribbon-bg` | `#ffffff` | Ribbon body background (override for dark mode) |
| `--ribbon-border` | `#e1dfdd` | Group dividers, button borders |
| `--btn-hover-bg` | `#f0eeec` | Button hover fill — warm, not cool |
| `--btn-hover-border` | `#c8c6c4` | Button hover border |
| `--btn-active-bg` | `#c7e0f4` | Button pressed/active fill (blue tint) |
| `--btn-active-border` | `#90c2e8` | Button pressed/active border |
| `--btn-focus-ring` | `#0078d4` | Keyboard focus outline |
| `--text-primary` | `#201f1e` | Body text |
| `--text-secondary` | `#484644` | Secondary/sub-label text |
| `--text-muted` | `#605e5c` | Muted labels, group headers |
| `--text-disabled` | `#a19f9d` | Disabled button text |
| `--shadow-ribbon` | purple-tinted + black | Ribbon drop shadow |
| `--transition-fast` | `150ms ease-out` | Button hover transitions |
| `--transition-mid` | `200ms ease-out` | Dropdown open/close transitions |
| `--radius-sm` | `3px` | Consistent border-radius across all elements |
| `--icon-color` | `#3b3a39` | Default icon stroke |
| `--icon-purple` | `#6b2ca6` | Accent icons |
| `--icon-blue` | `#0078d4` | Informational icons |
| `--icon-green` | `#107c10` | Success/positive icons |
| `--icon-orange` | `#c45911` | Warning icons |
| `--icon-red` | `#a80000` | Destructive/alert icons |
| `--icon-teal` | `#006b6b` | Secondary accent icons |

**How it is achieved in CSS:**

- `dropdown.css` — `.onr-overlay-dropdown` uses `background: var(--ribbon-bg)`, `border: 1px solid var(--ribbon-border)`, `border-radius: var(--radius-sm)`, `box-shadow: var(--shadow-ribbon)`. Zero hex literals.
- `ribbon-app.css` — `.onr-body` uses `background: var(--ribbon-bg)` and `border-top: 1px solid var(--ribbon-border)`.
- `basic-text-group.css` — `.onr-divider` uses `background: var(--ribbon-border)` for vertical separators between button clusters.

**Current gaps (known token violations to fix):**

- `styles-group.css` — `.onr-style-preview` hardcodes `background: #1a1a2e`, `border-color: #555`, `color: #5b9bd5`.
- `tags-group.css` — `.onr-tag-label` uses `color: #222`, `.onr-tag-swatch` uses `border: #999`.
- `clipboard-group.css` — `.onr-paste-dropdown` uses `border-top: 1px solid #d0d0d0`.
- `highlight-text-color.css` — swatch colors (`#ffff00`, `#ff0000`) are functional/intentional; `#222` and `#666` in label/caret colors should use tokens.

---

### 3. Warm, Never Cool

Hover states, borders, and backgrounds use warm-tinted grays derived from OneNote's palette. No flat white, no slate gray, no blue-gray.

**How it is achieved in CSS:**

- `--btn-hover-bg: #f0eeec` — warm off-white (OneNote warm gray), used in `dropdown.css` `.onr-dd-item:hover`.
- `--ribbon-border: #e1dfdd` — warm, slightly beige border tone used as group dividers and button outlines.
- `--btn-hover-border: #c8c6c4` — warm mid-gray for interactive border states.
- The tab bar hover uses `--ribbon-purple-mid: #7b3cb6` — a warmer, lighter purple rather than a bright or cool accent.

---

### 4. Dark Mode via Tokens

The ribbon body adapts to Obsidian's active theme. The purple tab bar is always purple, in every theme.

**How it is achieved in CSS:**

- `--ribbon-bg` is `#ffffff` by default but is the only property that needs a theme override. Future dark mode support means adding a `.theme-dark` or `[data-theme="dark"]` override block in `styles.css` that redefines `--ribbon-bg`, `--ribbon-border`, `--text-primary`, and `--btn-hover-bg`. No component CSS changes are needed.
- `#onenote-ribbon-root` in `styles.css` scopes all plugin styles, so overrides cannot leak to Obsidian's own UI.
- `tab-bar.css` keeps `background: var(--ribbon-purple)` on `.onr-tab-bar` unconditionally — it never participates in theme switching.
- The active tab `background: var(--ribbon-bg)` means it will automatically match the ribbon body in any theme.

---

### 5. Accessibility as a Floor

WCAG AA contrast required everywhere. Focus rings and reduced-motion support are non-negotiable.

**How it is achieved in CSS:**

- `tab-bar.css` — `.onr-tab:focus-visible` uses `outline: 2px solid rgba(255, 255, 255, 0.8); outline-offset: -3px`. Inset outline (negative offset) keeps focus visible against the purple background without layout shift.
- `tab-bar.css` — `@media (prefers-reduced-motion: reduce)` sets `transition: none` on `.onr-tab` and `.onr-pin-btn`.
- `dropdown.css` — same `@media (prefers-reduced-motion: reduce)` block removes transitions from `.onr-dd-item`.
- `--btn-focus-ring: #0078d4` — the blue focus ring token is WCAG AA compliant against the warm-gray ribbon body background.
- All icon colors (`--icon-color: #3b3a39`, `--text-primary: #201f1e`) satisfy AA contrast against `--ribbon-bg: #ffffff` and `--btn-hover-bg: #f0eeec`.

---

## Icon System

All icons are SVG stroke linework — no filled icons, no raster images.

**Global SVG rule in `styles.css`:**

```css
#onenote-ribbon-root svg {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}
```

- Large icons (20px): `stroke-width: 1.8` — default rule applies.
- Small icons (14px): `.onr-icon-sm` overrides to `stroke-width: 1.2` — thinner to avoid ink-filling at small sizes.
- Tag icons: `.onr-tag-icon` sets `stroke: none` so SVG `fill` presentation attributes (colored tag swatches) render correctly without a dark outline from `currentColor`.
- Never set `fill` or `stroke` directly on icon components — always inherit via `currentColor` so color changes flow from the parent button.

---

## Typography

**Font stack:** `"Segoe UI", system-ui, -apple-system, sans-serif`

Applied to `#onenote-ribbon-root` in `styles.css`. Segoe UI on Windows, SF Pro on Mac — matches the host OS the same way Obsidian itself does.

**Type scale in use:**

| Context | Size | Weight |
|---|---|---|
| Tab bar tabs | 11px | 500 / 600 (active) |
| Group labels | 9–10px | uppercase |
| Dropdown items | 11px | 400 |
| Dropdown sub-labels | 9px | 400 |
| Inline format buttons (B, I, U) | 12–13px | per-button |
| Button labels below icons | 10px | 400 |

---

## Layout System

**Ribbon shell (`ribbon-app.css`):**

- `.onr-ribbon` — `display: flex; flex-direction: column` stacks the tab bar on top of the ribbon body.
- `.onr-body` — `min-height: 92px; padding: 4px 4px 0` creates the fixed-height content zone. `flex-wrap: wrap` allows groups to reflow at narrow widths.

**Groups (`home-tab-panel.css`):**

- `.onr-tab-panel` — `display: flex; flex-wrap: wrap; align-items: stretch` lays groups in a horizontal row that wraps.
- Groups use `display: flex; flex-direction: row; gap: 2px` internally.
- Group dividers are rendered as `width: 1px; height: 18px; background: var(--ribbon-border)` elements inline in the button row (`basic-text-group.css`).

**Button hierarchy:**

- Large primary button: `width: 46px; min-height: 46px` (e.g., Paste in `clipboard-group.css`).
- Wide secondary button: `width: 68px; flex-direction: row` with icon + label side by side (e.g., Cut/Copy in `clipboard-group.css`).
- Inline format button: `width: 22px; min-height: 22px` (e.g., Bold/Italic in `basic-text-group.css`).
- Dropdown caret stub: `min-height: 14px` below primary button, visually joined via matching border-radius and `border-top: 1px solid`.

**Dropdown overlay (`dropdown.css`):**

- `position: fixed; z-index: 50` — always above the ribbon (`z-index: 49`) and Obsidian's sidebar.
- Items use `padding: 6px 12px` — comfortable touch target with compact visual density.

---

## z-index Budget

| Layer | Value | Element |
|---|---|---|
| Ribbon root | 49 | `#onenote-ribbon-root` |
| Dropdown overlays | 50 | `.onr-overlay-dropdown` |
