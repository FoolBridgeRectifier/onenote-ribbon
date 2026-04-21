/** Obsidian command ID for toggling a checklist item on the current line. */
export const EDITOR_COMMAND_TOGGLE_CHECKLIST = 'editor:toggle-checklist-status' as const;

/**
 * Matches a callout header line that has a non-empty title after the bracket.
 * Used to detect when clicking todo on a callout title line should call applyTask
 * directly rather than delegating to Obsidian's native toggle-checklist command.
 */
export const CALLOUT_TITLE_WITH_CONTENT_PATTERN = /^(?:>\s*)+\[![^\]]+\]\s+\S/;
