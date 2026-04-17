# Gemini CLI Configuration for OneNote Ribbon Plugin

This project uses Gemini CLI to assist with development.

## Instructional Context

**Read and follow `CONVENTIONS.md` and `DESIGN.md` rigorously before every task.** These documents are the single source of truth for the project's structure, naming, testing, styling, and quality rules.

It also includes an `AfterAgent` hook that presents a completion checklist.

### Core Mandates

- **Read and follow `CONVENTIONS.md` and `DESIGN.md` as your foundational mandates.**
- **CSS Rule:** Always use dedicated `.css` files, no inline styles.
- **Naming Rule:** No abbreviations. Use full descriptive names (e.g., `editor` instead of `ed`).
- **Testing Rule:** All new features must have colocated tests in a `tests/` subfolder (or as siblings per conventions).
- **Obsidian MCP:** Ensure Obsidian is running in debug mode (port 9222) before testing.

## Hooks

The following hook is configured in `.gemini/settings.json`:

- `AfterAgent`: Runs `scripts/hooks/stopObsidianMcpCheck.cjs` to enforce quality checks.
