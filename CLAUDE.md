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
