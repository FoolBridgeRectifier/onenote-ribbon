# Project-Specific Instructions for OneNote Ribbon Plugin

## CSS Organization Rule

**Always place CSS in dedicated `.css` files.** Inline styles should only be used as a last resort when:

- CSS selectors cannot reach the target element (e.g., dynamically generated content)
- The style is temporary/experimental and hasn't been validated yet
- There is a genuine technical blocker to using a stylesheet

**Why:** Keeps styles maintainable, searchable, and testable. CSS files are the source of truth for styling.

**How to apply:**

- When adding styles to a component, add a `.css` file in the same directory (e.g., `ComponentName.tsx` → `ComponentName.css`)
- Import the CSS file: `import './ComponentName.css'`
- Only resort to inline `style={}` props if you encounter a legitimate blocker and document why

## File Length Rule

Source files must not be longer than 150 lines, excluding import statements.

---

## Design Context

### Users

Personal use — a single developer who knows OneNote deeply and is migrating their note-taking workflow into Obsidian. There is no onboarding concern: the ribbon should reward familiarity with OneNote's structure, while feeling native inside Obsidian. Optimize for speed and comfort, not discoverability.

### Brand Personality

Familiar structure, Obsidian soul. Three-word summary: **Structured. Refined. At-Home.** The ribbon should feel like a natural part of Obsidian that happens to borrow OneNote's layout — not a foreign UI grafted on.

### Aesthetic Direction

A deliberate blend of both reference UIs: **OneNote's structural conventions inside Obsidian's aesthetic sensibility.**

**From OneNote — keep:**

- Ribbon layout: tab bar → groups → large + small stacked buttons
- Purple `#6b2ca6` tab bar (the strongest OneNote signal)
- Warm-gray hover/active states (never pure gray or cool gray)
- Icon style: SVG stroke linework at 20px (large) / 14px (small)
- Group labels in small uppercase

**From Obsidian — adopt:**

- Respect Obsidian's active theme for the ribbon body background and text colors where possible — use CSS tokens that can defer to Obsidian's `--background-primary`, `--text-normal`, etc.
- Border-radius, shadow depth, and transition timing that feel consistent with Obsidian's own panels
- Dark mode must work automatically — the ribbon body (not the purple tab bar) should follow Obsidian's theme

**The balance:** If you walked into Obsidian and saw this ribbon, it should feel intentional and native — not like a teleported Windows app. The purple tab bar is the deliberate OneNote anchor; everything below it adapts to its Obsidian environment.

- **Colors:** Purple `#6b2ca6` tab bar is fixed. Ribbon body, text, and interactive states use design tokens in `styles.css`. Tokens should bridge toward Obsidian's own CSS variables for theme compatibility — never hardcode `#ffffff` or `#201f1e` in component CSS.
- **Font:** System UI stack (`system-ui, -apple-system, sans-serif`) — Segoe UI on Windows, SF Pro on Mac, matching the host OS like Obsidian itself does.
- **Dark mode:** Must auto-adapt via tokens. The ribbon body, button hover states, and dropdowns follow Obsidian's active theme. The purple tab bar stays purple in all themes.
- **Icons:** SVG stroke icons. Stroke-width 1.8 (large), 1.2 (small).

### Design Principles

1. **OneNote structure, Obsidian skin** — layout, grouping, and button hierarchy from OneNote; color, typography, and depth from Obsidian's active theme.
2. **Token-only colors** — no hex literals in component CSS. All values via `var(--...)` from `styles.css`. Tokens are the seam where Obsidian theme compatibility is added.
3. **Warm, never cool** — hover states and borders use warm-tinted grays (`#f0eeec`, `#e1dfdd`). Neither flat-white nor slate-gray.
4. **Dark mode via tokens** — ribbon body adapts to Obsidian's theme; purple tab bar is always purple.
5. **Accessibility as a floor** — WCAG AA contrast required. Focus rings (`var(--btn-focus-ring)`) and `prefers-reduced-motion` always respected.
