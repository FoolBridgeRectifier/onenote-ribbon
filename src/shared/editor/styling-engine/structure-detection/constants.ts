import type { LinePrefixType } from '../interfaces';

// ============================================================
// Line Prefix Patterns
// ============================================================

// Priority order: todo -> bullet -> numbered -> heading -> footnoteDefinition -> indent
// Each pattern captures the full prefix (including whitespace) in group 1.
export const LINE_PREFIX_PATTERNS: Array<{ type: LinePrefixType; pattern: RegExp }> = [
  { type: 'todo', pattern: /^(\s*-\s\[[x ]\]\s)/i },
  { type: 'bullet', pattern: /^(\s*[-*+]\s)/ },
  { type: 'numbered', pattern: /^(\s*\d+\.\s)/ },
  { type: 'heading', pattern: /^(#{1,6}\s)/ },
  { type: 'footnoteDefinition', pattern: /^(\[\^[^\]]+\]:\s)/ },
  { type: 'indent', pattern: /^(\s{2,})/ }, // only matches if no list marker follows
];

// Callout prefix — checked separately for composite prefix detection
// (e.g. "> - [ ] " is callout + todo)
export const CALLOUT_PREFIX_PATTERN = /^(>\s)/;

// ============================================================
// Atomic Token Patterns (Protected Ranges)
// ============================================================

// Scanned within selection text. Order matters for overlap deduplication:
// embed must come before wikilink because embed starts with !,
// and the wikilink regex would otherwise match the inner [[ ]] of an embed.
export const ATOMIC_TOKEN_PATTERNS: Array<{ tokenType: string; pattern: RegExp }> = [
  { tokenType: 'embed', pattern: /!\[\[[^\]]+\]\]/g },
  { tokenType: 'wikilink', pattern: /\[\[[^\]]+\]\]/g },
  { tokenType: 'mdLink', pattern: /\[[^\]]+\]\([^)]+\)/g },
  { tokenType: 'footnoteRef', pattern: /\[\^[^\]]+\]/g },
  { tokenType: 'hashtag', pattern: /#[a-zA-Z0-9_/-]+/g },
];

// ============================================================
// Inert Zone Detection Patterns
// ============================================================

// Fenced code blocks (``` delimiters)
export const CODE_FENCE_PATTERN = /^```/gm;

// Math blocks ($$ delimiters)
export const MATH_FENCE_PATTERN = /^\$\$/gm;

// Table lines (pipe-delimited rows)
export const TABLE_LINE_PATTERN = /^\|.+\|$/gm;

// Horizontal rules (three or more dashes, underscores, or asterisks)
export const HORIZONTAL_RULE_PATTERN = /^(---+|___+|\*\*\*+)$/gm;

// Inline math (single $ delimiters, no nesting or newlines)
export const INLINE_MATH_PATTERN = /\$[^$\n]+\$/g;

// Inline code (backtick delimiters, no nesting or newlines)
export const INLINE_CODE_PATTERN = /`[^`\n]+`/g;
