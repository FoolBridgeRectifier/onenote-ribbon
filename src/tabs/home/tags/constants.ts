/** Obsidian command ID for toggling a checklist item on the current line. */
export const EDITOR_COMMAND_TOGGLE_CHECKLIST = 'editor:toggle-checklist-status' as const;

/** Obsidian command ID for opening the global search panel. */
export const EDITOR_COMMAND_OPEN_GLOBAL_SEARCH = 'global-search:open' as const;

// ── Tag icon fill colors ──────────────────────────────────────────────────────
// Each color is the background fill of the 16×16 tag icon SVG.

export const TAG_FILL_TODO_BLUE = '#4472C4' as const;
export const TAG_FILL_IMPORTANT_ORANGE = '#F5A623' as const;
export const TAG_FILL_QUESTION_PURPLE = '#7030A0' as const;
export const TAG_FILL_DARK = '#404040' as const;
export const TAG_FILL_MEDIUM_GRAY = '#808080' as const;
export const TAG_FILL_DEFINITION_GREEN = '#70AD47' as const;
export const TAG_FILL_HIGHLIGHT_YELLOW = '#E6B800' as const;
export const TAG_FILL_CRITICAL_RED = '#C0392B' as const;
export const TAG_FILL_PROJECT_A_CORAL = '#E36C09' as const;
export const TAG_FILL_PROJECT_B_GOLD = '#FFC000' as const;
export const TAG_FILL_PRIORITY_1_RED = '#C0392B' as const;
export const TAG_FILL_PRIORITY_2_BLUE = '#2E86AB' as const;

// ── Tag swatch colors ─────────────────────────────────────────────────────────
// The small color box shown on the right of each tag row, indicating category color.

export const TAG_SWATCH_TODO = '#4472C4' as const;
export const TAG_SWATCH_IMPORTANT = '#F5A623' as const;
export const TAG_SWATCH_QUESTION = '#7030A0' as const;
export const TAG_SWATCH_REMEMBER = '#202020' as const;
export const TAG_SWATCH_DEFINITION = '#70AD47' as const;
export const TAG_SWATCH_HIGHLIGHT = '#FFD700' as const;
export const TAG_SWATCH_NEUTRAL = '#808080' as const;
export const TAG_SWATCH_CRITICAL = '#C0392B' as const;
export const TAG_SWATCH_PROJECT_A = '#E36C09' as const;
export const TAG_SWATCH_PROJECT_B = '#FFC000' as const;
export const TAG_SWATCH_PRIORITY_1 = '#C0392B' as const;
export const TAG_SWATCH_PRIORITY_2 = '#2E86AB' as const;
