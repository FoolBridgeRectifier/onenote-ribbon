# Plan: 5 Visual Bug Fixes — OneNote Ribbon

**Date:** 2026-04-10

---

## Context

Five visual/functional regressions identified in the live plugin and confirmed via Obsidian DevTools (port 9222). The root causes span three component files plus a CSS bundling gap.

**Pre-existing test failures (out of scope):** 212 tests failing across 23 suites from an incomplete prior refactoring — missing `toggleInline.ts`, `toggleLinePrefix.ts`, `toggleSubSup.ts`, and all Insert-tab source files. These predate this task.

---

## Confirmed Bugs (DevTools evidence)

| # | Bug | Root cause |
|---|-----|------------|
| 1 | Emoji in Navigate/Email button labels | Literal emoji in `onr-btn-label` spans |
| 2 | Email and Navigate buttons stack vertically | Inner div has `flexDirection: 'column'` |
| 3 | Dropdown has no background/CSS | `home.css` bundled into `main.css` (esbuild output) but Obsidian only auto-loads `styles.css`; DevTools confirmed **zero rules** for `.onr-overlay-dropdown` |
| 4 | Styles expand button does nothing | `onClick={() => {}}` no-op; missing `styles-data.ts`, props, and `Dropdown` wiring |
| 5 | Cannot drag Obsidian window | Only `drag` region is `.workspace-tab-header-container` at y=175 (pushed below ribbon); ribbon has no drag surface |

---

## Step 1 — Remove emoji from labels + update tests

**Files:**
- `src/tabs/home/navigate/NavigateGroup.tsx`
- `src/tabs/home/email/EmailGroup.tsx`
- `src/tabs/home/navigate/tests/NavigateGroup.test.tsx`
- `src/tabs/home/email/tests/EmailGroup.test.tsx`

**`NavigateGroup.tsx`** — strip emoji from the three `onr-btn-label` spans:
- `"📋 Outline"` → `"Outline"`
- `"⊟ Fold All"` → `"Fold All"`
- `"⊞ Unfold All"` → `"Unfold All"`

**`EmailGroup.tsx`** — strip emoji from the two `onr-btn-label` spans:
- `"📧 Email Page"` → `"Email Page"`
- `"📋 Meeting Details"` → `"Meeting Details"`

Also fix `EmailGroup.tsx` §9.1 no-editor behaviour: current guard `if (!editor) return` prevents the clipboard call, but the test expects `writeText("")`. Change `handleEmailPage` to:
```ts
const handleEmailPage = () => {
  const content = app.workspace.activeEditor?.editor?.getValue() ?? '';
  const plainText = content
    .replace(/#+\s/g, '')
    .replace(/[*_]/g, '')
    .replace(/~~([^~]+)~~/g, '$1');
  navigator.clipboard.writeText(plainText);
};
```

**`NavigateGroup.test.tsx`** — update four `getByText` calls:
- `"📋 Outline"` → `"Outline"` (×2)
- `"⊟ Fold All"` → `"Fold All"`
- `"⊞ Unfold All"` → `"Unfold All"`

**`EmailGroup.test.tsx`** — update six `getByText` calls:
- `"📧 Email Page"` → `"Email Page"` (×3)
- `"📋 Meeting Details"` → `"Meeting Details"` (×3)

---

## Step 2 — Horizontal layout for Email and Navigate

**Files:** same two component files as Step 1.

Both groups currently have `style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}` on the inner button container. Replace the inline style with `className="onr-group-buttons"` — this class is already defined in `styles.css` as `flex-direction: row; align-items: flex-start; gap: 1px; flex: 1`.

No test changes needed (layout is visual only).

---

## Step 3 — Fix CSS loading (merge home.css → styles.css)

**Files:**
- `styles.css` (root-level, loaded by Obsidian automatically)
- `src/main.ts`

**`src/main.ts`** — remove the two CSS import lines:
```ts
import '../styles.css';        // ← remove
import './tabs/home/home.css'; // ← remove
```
esbuild bundles these into `main.css` but Obsidian never loads that file.

**`styles.css`** — append all content from `src/tabs/home/home.css` that is NOT already present. Classes missing from `styles.css`:

- `.onr-row`, `.onr-row-col`
- `.onr-divider`
- `.onr-clipboard-paste`, `.onr-paste-main`, `.onr-paste-dropdown`, `.onr-clipboard-stack`, `.onr-clipboard-item`
- `.onr-basic-text-row1`, `.onr-basic-text-row2`, `.onr-font-picker`, `.onr-size-picker`
- `.onr-highlight-btn`, `.onr-highlight-swatch`, `.onr-color-btn`, `.onr-color-swatch`, `.onr-align-btn`, `.onr-clear-inline-btn`
- `.onr-styles-group`, `.onr-styles-previews`, `.onr-style-preview`, `.onr-style-h1`, `.onr-style-h2`, `.onr-styles-scroll`, `.onr-scroll-arrow`, `.onr-scroll-expand`
- `.onr-tags-group`, `.onr-tags-stack`, `.onr-tag-row`, `.onr-tag-icon`, `.onr-tag-label`, `.onr-tag-swatch`, `.onr-tags-more`, `.onr-more-arrow`, `.onr-tag-big-buttons`, `.onr-tag-btn`
- `.onr-email-btn`, `.onr-navigate-btn`
- **Critical:** `.onr-overlay-dropdown`, `.onr-dd-item`, `.onr-dd-item:hover`, `.onr-dd-icon`, `.onr-dd-content`, `.onr-dd-label`, `.onr-dd-sublabel`
- Update `@media (prefers-reduced-motion)` block to include `.onr-dd-item`

Do **not** duplicate rules already in `styles.css` (`.onr-group`, `.onr-btn`, `.onr-btn-sm`, `.onr-btn-label`, `.onr-icon`, `.onr-icon-sm`).

---

## Step 4 — Implement StylesGroup dropdown

**Files:**
- NEW: `src/tabs/home/styles/styles-data.ts`
- `src/tabs/home/styles/StylesGroup.tsx` (rewrite)
- `src/tabs/home/HomeTabPanel.tsx` — no changes needed (already passes all three props)

### 4a. Create `styles-data.ts`

Export `STYLES_LIST` with exactly **11 items** (test §5.1 asserts `STYLES_LIST.length - 2 === 9`, i.e. length = 11):

```ts
export interface StyleItem {
  label: string;
  level: number;   // 1–6 for headings, 0 for non-heading styles
  prefix: string;  // markdown prefix toggled on the cursor line
}

export const STYLES_LIST: StyleItem[] = [
  { label: 'Heading 1',  level: 1, prefix: '# '     },  // 0
  { label: 'Heading 2',  level: 2, prefix: '## '    },  // 1
  { label: 'Heading 3',  level: 3, prefix: '### '   },  // 2
  { label: 'Heading 4',  level: 4, prefix: '#### '  },  // 3
  { label: 'Heading 5',  level: 5, prefix: '##### ' },  // 4
  { label: 'Heading 6',  level: 6, prefix: '###### ' }, // 5
  { label: 'Quote',      level: 0, prefix: '> '     },  // 6
  { label: 'Citation',   level: 0, prefix: '> [!cite]\n> ' }, // 7
  { label: 'Preformat',  level: 0, prefix: '    '   },  // 8
  { label: 'Code',       level: 0, prefix: '```\n'  },  // 9
  { label: 'Normal',     level: 0, prefix: ''       },  // 10
];
```

### 4b. Rewrite `StylesGroup.tsx`

Accept props:
```ts
interface Props {
  editorState: EditorState;
  stylesOffset: number;
  setStylesOffset: (offset: number) => void;
}
```

**Data-cmds** (must match test selectors exactly):
- Scroll up button: `data-cmd="styles-scroll-up"`
- Scroll down button: `data-cmd="styles-scroll-down"`
- Expand/dropdown button: `data-cmd="styles-dropdown"`
- First visible card: `data-cmd="styles-preview-0"`
- Second visible card: `data-cmd="styles-preview-1"`

**Visible cards**: `STYLES_LIST.slice(stylesOffset, stylesOffset + 2)`.

**Active state**: card gets `onr-active` class when:
- `style.level > 0 && style.level === editorState.headLevel`, OR
- `style.label === 'Normal' && editorState.headLevel === 0`

**`applyStyleToLine` named function**:
```ts
const applyStyleToLine = (style: StyleItem) => {
  const editor = getEditor();
  if (!editor) return;
  const cursor = editor.getCursor();
  const currentLine = editor.getLine(cursor.line);
  const stripped = currentLine.replace(/^#{1,6}\s/, '');
  if (style.prefix === '') {
    editor.setLine(cursor.line, stripped);
  } else if (currentLine.startsWith(style.prefix)) {
    editor.setLine(cursor.line, stripped);
  } else {
    editor.setLine(cursor.line, style.prefix + stripped);
  }
};
```

**Dropdown**: `useState<HTMLElement | null>(null)` for `dropdownAnchor`. The `styles-dropdown` button sets anchor on click. `<Dropdown>` receives all 11 `STYLES_LIST` items plus a "Clear Formatting" item. On item click: call `applyStyleToLine(item)` or `clearFormatting(editor)`, then close. Import `clearFormatting` from `../basic-text/clearFormatting`.

**Scroll handlers**: clamp with `Math.max(0, ...)` and `Math.min(STYLES_LIST.length - 2, ...)`.

---

## Step 5 — Restore window drag

**File:** `styles.css`

Add `-webkit-app-region: drag` to `.onr-spacer` so the empty area between tabs and the pin button becomes a drag handle. Add `no-drag` to interactive elements inside the tab bar:

```css
.onr-spacer {
  flex: 1;
  -webkit-app-region: drag;
}

.onr-tab,
.onr-pin-btn {
  -webkit-app-region: no-drag;
}
```

---

## Critical Files Summary

| File | Change |
|------|--------|
| `src/tabs/home/navigate/NavigateGroup.tsx` | Remove emoji; `onr-group-buttons` row class |
| `src/tabs/home/email/EmailGroup.tsx` | Remove emoji; fix no-editor clipboard; `onr-group-buttons` row class |
| `src/tabs/home/navigate/tests/NavigateGroup.test.tsx` | Update 4 `getByText` selectors |
| `src/tabs/home/email/tests/EmailGroup.test.tsx` | Update 6 `getByText` selectors |
| `styles.css` | Append missing CSS from `home.css`; add drag rules |
| `src/main.ts` | Remove 2 CSS import lines |
| `src/tabs/home/styles/styles-data.ts` | **NEW** — `STYLES_LIST` (11 items) |
| `src/tabs/home/styles/StylesGroup.tsx` | Rewrite with props, active state, dropdown |

---

## Verification

1. `npm run build` — clean `main.js`, no TypeScript errors
2. `npm test -- --testPathPatterns="Navigate|Email|StylesGroup"` — 0 failures
3. E2E via Obsidian DevTools:
   - Reload plugin after build
   - Screenshot confirms: no emoji in labels, Email/Navigate are horizontal rows
   - Tags ▾ dropdown opens with white background and hover styles
   - Styles ▾ button opens dropdown listing all 11 styles + Clear Formatting
   - Window can be dragged from the purple spacer in the tab bar
