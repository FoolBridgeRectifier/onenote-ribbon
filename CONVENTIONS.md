# OneNote Ribbon Plugin — Project Guide

> **Read this entire document before writing, editing, or reviewing any code in this project.**
> This is the single source of truth for structure, naming, testing, and quality rules.

### Global Instruction File (Strict)

These rules are strict and mandatory.

- Preferred stack: React, React Testing Library, Node, Java, TypeScript.
- Extract new logical blocks into dedicated files and add full path-coverage tests.
- Add one-line comments above non-obvious logic only.
- Leave blank lines between logical sections.
- Use full descriptive variable names (no abbreviations).
- Prioritize readability, maintainability, and reduced redundancy.
- If blocked, add debug instrumentation, rerun, and continue with evidence-based fixes.

---

## 3. Directory Structure

```
onenote-ribbon/
├── src/
│   ├── main.ts
│   ├── __mocks__/
│   ├── assets/
│   ├── e2e/
│   ├── ribbon/
│   ├── shared/
│   │   ├── components/
│   │   │   ├── color-picker/
│   │   │   ├── dropdown/
│   │   │   ├── group-shell/
│   │   │   └── ribbon-button/
│   │   ├── context/
│   │   ├── editor/
│   │   └── hooks/
│   ├── tabs/
│   │   ├── home/
│   │   │   ├── basic-text/
│   │   │   ├── clipboard/
│   │   │   ├── email/
│   │   │   ├── navigate/
│   │   │   ├── styles/
│   │   │   ├── tags/
│   │   │   ├── tests/
│   │   └── insert/
│   ├── test-utils/
│   └── types/
├── scripts/
│   ├── e2e/
│   ├── esbuild/
│   ├── hooks/
│   └── jest/
├── docs/
├── plans/
├── coverage/
├── dist/
├── main.js
├── styles.css
├── package.json
└── tsconfig.json
```

---

## 4. Module Layout And File Limits (Strict)

Every feature folder must follow this limit-first structure:

```
<feature>/
├── <Feature>.tsx or <feature>.ts   ← one primary implementation file only
├── constants.ts                    ← one constants file only. All constants should only be here.
├── interfaces.ts                   ← one interfaces file only. All types, interfaces should only be here.
└── helpers.ts                      ← one helper file only. Any function that can be separated should be separated to helpers
```

**Required limits (no exceptions):**

- Each folder may contain only one primary implementation file, one `constants.ts`, one `interfaces.ts`, and one `helpers.ts`.
- Each source file must stay at or below 150 lines, excluding import lines.
- If any file would exceed 150 lines, split the logic into a subfolder and apply the exact same limits there.
- If `helpers.ts` would exceed 150 lines, create a `helpers/` folder and split helper logic into helper subfolders; each helper subfolder must follow the same one-file + `constants.ts` + `interfaces.ts` + `helpers.ts` rule and the same 150-line limit.
- Keep naming consistent: folder names in kebab-case, component files in PascalCase, and logic/helper files in camelCase.
- Avoid duplicate logic across sibling folders; move shared logic into a shared subfolder with the same limits.

---

## 5. React Patterns

### Context

Two distinct format-painter hooks — do not confuse them:

```ts
// useFormatPainter  — CREATES state. Used only in HomeTabPanel as the context provider.
import { useFormatPainter } from 'src/shared/hooks/useFormatPainter';

// useFormatPainterContext — CONSUMES context. Used inside group components.
import { useFormatPainterContext } from 'src/shared/context/FormatPainterContext';
```

```ts
// Access Obsidian app anywhere in the tree:
const app = useApp(); // from src/shared/context/AppContext.ts
```

### Component structure

```tsx
export function MyGroup({ editorState }: Props) {
  const app = useApp();

  const getEditor = () => app.workspace.activeEditor?.editor;

  const doSomething = () => {
    const editor = getEditor();
    if (!editor) return;
    // use editor
  };
}
```

- Declare `const getEditor = () => app.workspace.activeEditor?.editor;` at the top of every group component.
- Every handler calls `const editor = getEditor(); if (!editor) return;` before using the editor.
- Extract all multi-line `onClick` / `onMouseDown` logic to named functions — do not use anonymous inline arrow functions for non-trivial logic.

### Buttons And Groups

- Use the shared `RibbonButton` component for ribbon buttons (large and small), which applies the `onr-btn` / `onr-btn-sm` classes and shared interaction behavior.
- Groups use `onr-group` wrappers with a `onr-group-name` label element.
- Use `data-cmd` attributes on interactive controls for test and automation targeting.

### Dropdown

- Use the shared `<Dropdown>` React component (portal) for all dropdowns — never imperative DOM.
- Pass `anchor` (HTMLElement | null) to control open/close.
- Items use `className="onr-dd-item"` and `data-cmd` for test selection.

### Active state

- Active/toggled UI state is managed locally per group and via shared contexts (for example, format painter context).

---

## 6. Naming Conventions

### File and attribute names

| Thing                       | Convention        | Example                                      |
| --------------------------- | ----------------- | -------------------------------------------- |
| React component file        | PascalCase `.tsx` | `BasicTextGroup.tsx`                         |
| Non-React logic file        | camelCase `.ts`   | `clearFormatting.ts`                         |
| CSS file                    | kebab-case        | `basic-text.css`                             |
| Test file (unit)            | `<name>.test.ts`  | `clearFormatting.test.ts`                    |
| Test file (RTL integration) | `<Name>.test.tsx` | `BasicTextGroup.test.tsx`                    |
| Data file                   | `<scope>-data.ts` | `styles-data.ts`, `tags-data.ts`             |
| CSS class prefix            | `onr-`            | `onr-btn-sm`, `onr-active`, `onr-disabled`   |
| `data-cmd` attribute        | kebab-case        | `data-cmd="bold"`, `data-cmd="insert-table"` |
| `data-group` attribute      | kebab-case        | `data-group="basic-text"`                    |
| `data-panel` attribute      | Tab name          | `data-panel="Home"`, `data-panel="Insert"`   |

### Variable and identifier names — no abbreviations

All identifiers (variables, parameters, constants, type aliases, hook names) must be fully descriptive. The following abbreviations are **banned**:

| Banned           | Use instead                                  | Where                            |
| ---------------- | -------------------------------------------- | -------------------------------- |
| `ed`, `e`        | `editor`, `getEditor`                        | Editor accessor + handler locals |
| `fp`             | `formatPainter`                              | Format painter context value     |
| `FPFormat`       | `FormatPainterFormat`                        | Interface name                   |
| `FPContextValue` | `FormatPainterContextValue`                  | Interface name                   |
| `useFP`          | `useFormatPainterContext`                    | Hook name (consumer hook)        |
| `exec`           | `executeCommand`                             | Editor command helper            |
| `ws`             | `workspaceElement`                           | DOM element variable             |
| `hmc`            | `horizontalMainContainer`                    | DOM element variable             |
| `fmt`            | `newFormat` (param) / `format` (state)       | Format painter parameter         |
| `sel`            | `selection`                                  | Editor selection string          |
| `src`            | `sourceText`                                 | Text being inspected             |
| `tmpl`           | `template`                                   | Template string                  |
| `t`              | `clipboardText`, `text`, etc.                | Single-letter callback params    |
| `f`, `s`, `c`    | `fontName`, `pointSize`, `colorItem`         | Single-letter loop variables     |
| `i`              | `index`, `rowIndex`                          | Loop / map index                 |
| `k`, `v`         | `key`, `value`                               | Object / map iteration           |
| `mh`             | `estimatedMaxHeight`                         | Computed layout value            |
| `ref1`, `ref2`   | `leafChangeEventRef`, `editorChangeEventRef` | Event ref names                  |
| `fmtDate`        | `formatCurrentDate`                          | Function name                    |
| `fmtTime`        | `formatCurrentTime`                          | Function name                    |
| `now`            | `currentDate`                                | Date variable                    |
| `el`             | `element`                                    | DOM element                      |
| `titlebar`       | `titlebarElement`                            | DOM element                      |

**Single-letter names are never acceptable** outside `for`-loop counters in tight numeric loops. Even there, prefer `index`.

### `parseCssString` — single source of truth

`parseCssString` is defined and **exported exclusively from `src/shared/components/dropdown/Dropdown.tsx`**. Do not duplicate it in any other file. Import it where needed:

```ts
import { parseCssString } from '../../../shared/components/dropdown/Dropdown';
```

---

## 7. CSS Conventions

- **Design gate**: before adding any new component or style, read `design.md`. Every visual choice (color, spacing, shadow, icon, transition) must trace back to a named principle in that document. If the choice is not covered, update `design.md` first, then add the code.
- **Scoped CSS**: each feature may have a `<feature>.css` with `onr-` prefixed class names.
- **No inline styles** in components except for dynamic values (e.g., dropdown position).
- **Class naming**: BEM-inspired with `onr-` prefix. Block = `onr-<component>`, modifier = `onr-<state>`.
  - States: `onr-active`, `onr-disabled`, `onr-open`
  - Buttons: `onr-btn-sm` (small toolbar button)
  - Dropdown: `onr-overlay-dropdown`, `onr-dd-item`, `onr-callout-picker`
  - Groups: `onr-group`, individual groups add `data-group="<name>"`

---

## 8. Test Conventions (CRITICAL)

**All test files must be colocated in the same folder as the module they test.**

### Test file naming

- Unit tests for pure logic: `<fileName>.test.ts`
- RTL integration tests for components: `<ComponentName>.test.tsx`

### Test utilities (src/test-utils/)

```ts
// Factories
createMockApp(editor?)               // app with no active editor (pass MockEditor to attach one)
createAppWithEditor(content)         // { app, editor } with content pre-loaded
```

### RTL test patterns

```tsx
// Standard structure for integration tests:
describe('FeatureGroup — description (integration)', () => {
  it('renders expected buttons', () => {
    const { app } = createAppWithEditor('');
    renderWithApp(<FeatureGroup />, app);
    expect(screen.getByText('Button Label')).toBeInTheDocument();
  });

  it('click applies expected editor change', () => {
    const { app, editor } = createAppWithEditor('initial content');
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 7 });
    renderWithApp(<FeatureGroup />, app);
    fireEvent.click(screen.getByText('Button Label'));
    expect(editor.getValue()).toBe('expected result');
  });

  it('is no-op when no active editor', () => {
    const app = createMockApp();
    renderWithApp(<FeatureGroup />, app);
    expect(() => fireEvent.click(screen.getByText('Button Label'))).not.toThrow();
  });
});
```

### Dropdown testing

```tsx
// Dropdowns (async — use act for clicking items):
fireEvent.click(screen.getByText('Dropdown Button'));
act(() => {
  fireEvent.click(dropdownItem);
});

// StylesGroup dropdown specifically needs:
await act(async () => {
  fireEvent.click(container.querySelector('[data-cmd="styles-dropdown"]')!);
});
```

### Dropdown and modal visual-state testing

- Any new or modified dropdown or modal must include at least one snapshot assertion for its open state (and closed state when applicable).
- The same test file must also assert computed CSS using `window.getComputedStyle(...)` for critical visual properties (for example: `display`, `visibility`, `opacity`, `position`, `zIndex`, and placement offsets).
- Do not rely on class-name assertions alone for overlays; include computed-style checks that prove the rendered result.

### Mock setup

- `obsidian` module is mocked via `moduleNameMapper` → `src/__mocks__/obsidian.ts`
- `jest-dom` matchers (`.toBeInTheDocument()`, `.toHaveClass()`, etc.) loaded in `src/test-utils/setup.ts` via `setupFilesAfterEnv`
- `window.moment` is not available in jsdom — timestamp tests use regex patterns (`/^\d{4}-\d{2}-\d{2}$/`)

---

## 10. Code Quality Rules

> **Code quality, readability, and redundancy reduction are the highest priorities.** Always maximise these. Prefer explicit, readable code over clever or compact code.

1. **No globals** — never use `window._onrFP*` or any global state. Use React context.
2. **No side effects at module load** — all effects inside hooks/components.
3. **No vitest** — vitest is not installed. Use Jest + RTL only. Do not import from `vitest`.
4. **TypeScript strict** — all code must pass `tsc --noEmit`. No `any` except in test utils casting mock.
5. **Editor guard** — every button handler must declare `const editor = getEditor(); if (!editor) return;` before using the editor. The accessor itself is `const getEditor = () => app.workspace.activeEditor?.editor;` at component top-level.
6. **No component-level polling** — do not use `requestAnimationFrame` or `setInterval` loops to synchronize editor UI state. Prefer explicit event-driven updates and direct handler execution paths.
7. **CSS prefix** — all classes must use `onr-` prefix. No Tailwind, no utility classes.
8. **Colocated tests only** — `.test.ts` / `.test.tsx` files should be in the same folder as the module they cover.
9. **Avoid test-only folder sprawl** — do not create dedicated `tests/` folders for feature modules.
10. **No `console.log`** left in production code. Debug logs are acceptable in test files only.
11. **No abbreviations** — all identifiers must be fully descriptive. See §6 for the full banned-abbreviations table. Single-letter names are never acceptable outside tight numeric `for`-loop counters.
12. **Extract inline handlers** — do not write multi-line logic inside `onClick`/`onMouseDown` JSX props. Extract to named functions declared above the `return`.
13. **Blank-line spacing** — separate distinct logical groups of statements with a blank line. Import blocks: one blank line between third-party and local imports. Component body: blank line between `const getEditor`, context hooks, handler functions, and the `return`.
14. **Comments on hard-to-understand code** — add a one-line comment above any line or block that is not immediately obvious. Do not comment trivial code.
15. **Full variable names** — never shorten variable names. `editor` not `ed`, `index` not `i` (except conventional loop counters), `backgroundColor` not `bgColor`.
16. **File length limit** — source files must not exceed 150 lines, excluding import statements.

---

## 13. Enforce before any task completion

4. Strict Lint. And TypeScript strict mode — no unguarded `any`
5. Dropdown and modal tests include both snapshot assertions and computed CSS assertions
6. Any new component or CSS addition traces back to a principle in `design.md` — if the design choice is not covered, update `design.md` first
7. Every new feature folder contains both `constants.ts` and `interfaces.ts` — no constants or type definitions inlined in component files

---

## 14. Obsidian Plugin Development Workflow

Before any task, verify Obsidian is running in debug mode on port 9222 (CDP); if not, kill any running `Obsidian.exe` and relaunch via MCP — never proceed until MCP is confirmed. After every code change, run `npm test` first (must pass with 0 failures), then test live in Obsidian via `npm run test:e2e` or manual MCP verification (`npm run dev` watch build running, plugin reloaded via `disablePlugin → enablePlugin`). Do not claim work is complete until changes are confirmed in the actual Obsidian environment. When stuck, do not give up — add debug logging or instrumentation, re-run with the added output, and continue with evidence-based fixes. If still unable to proceed, ask the user to run the code and share the debug output. Never declare defeat without first exhausting debug-driven investigation.

---
