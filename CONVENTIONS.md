# OneNote Ribbon Plugin — Project Guide

> **Read this entire document before writing, editing, or reviewing any code in this project.**
> This is the single source of truth for structure, naming, testing, and quality rules.

---

## 1. Project Overview

An Obsidian plugin that renders a Microsoft OneNote-style ribbon toolbar.

- **Runtime**: Obsidian desktop (Electron + Chromium). No Node.js runtime inside tests.
- **UI**: React 18 (JSX, hooks, context). All components use the React model — no imperative DOM manipulation.
- **Language**: TypeScript strict mode throughout.
- **Build**: esbuild (ESM output → `main.js`). Tests use ts-jest (CommonJS transform only during tests).

---

## 2. Toolchain

| Tool                        | Version | Purpose                                                             |
| --------------------------- | ------- | ------------------------------------------------------------------- |
| TypeScript                  | ^5.3    | Strict mode: `strict: true`, `noImplicitAny: true`                  |
| React                       | ^18.3   | UI components                                                       |
| esbuild                     | ^0.20   | Production bundle (`npm run build`, `npm run dev`)                  |
| Jest                        | ^30     | Unit + integration test runner                                      |
| ts-jest                     | ^29     | TypeScript transform for Jest (CommonJS, `moduleResolution: node`)  |
| jest-environment-jsdom      | ^30     | Browser environment simulation                                      |
| @testing-library/react      | ^16     | RTL for component rendering                                         |
| @testing-library/jest-dom   | ^6      | Custom DOM matchers                                                 |
| @testing-library/user-event | ^14     | Higher-level user interaction simulation (available, use sparingly) |

### Commands

```
npm run build                 # production bundle
npm run dev                   # watch mode
npm test                      # all Jest tests
npm run test:watch            # jest --watch
npm run test:coverage         # jest --coverage (threshold: 80% lines)
npm run test:e2e              # E2E via CDP (requires running Obsidian on port 9222)
npm run test:e2e:launch       # kill Obsidian, create fresh .e2e-vault/, relaunch
npm run test:e2e:home         # E2E home tab suites only
npm run test:e2e:insert       # E2E insert tab suites only
```

---

## 3. Directory Structure

```
onenote-ribbon/
├── src/
│   ├── main.ts              ← plugin entry; registers RibbonShell only
│   ├── __mocks__/
│   │   └── obsidian.ts      ← Jest mock for 'obsidian' module
│   ├── test-utils/          ← shared test helpers (excluded from coverage)
│   │   ├── MockEditor.ts
│   │   ├── mockApp.ts
│   │   ├── renderWithApp.tsx
│   │   └── setup.ts
│   ├── ribbon/              ← top-level ribbon wiring
│   │   ├── ribbon-app.css
│   │   ├── RibbonApp.tsx
│   │   ├── RibbonShell.ts
│   │   ├── tabs.ts
│   │   └── tab-bar/
│   │       ├── tab-bar.css
│   │       └── TabBar.tsx
│   ├── shared/
│   │   ├── components/
│   │   │   └── dropdown/
│   │   │       ├── dropdown.css
│   │   │       └── Dropdown.tsx
│   │   ├── context/         ← AppContext, FormatPainterContext
│   │   │   ├── AppContext.ts
│   │   │   └── FormatPainterContext.ts
│   │   ├── dropdown/
│   │   │   ├── Dropdown.ts
│   │   └── hooks/
│   │   │   ├── useFormatPainter.ts
│   │   │   └── useRibbonState.ts
│   └── tabs/
│       ├── home/
│       │   ├── home-tab-panel.css
│       │   ├── HomeTabPanel.test.tsx
│       │   ├── HomeTabPanel.tsx
│       │   ├── __snapshots__/
│       │   │   └── HomeTabPanel.test.tsx.snap
│       │   ├── clipboard/
│       │   │   ├── clipboard-group.css
│       │   │   ├── ClipboardGroup.tsx
│       │   │   ├── format-painter/
│       │   │   │   └── helpers.ts
│       │   │   └── paste-options/
│       │   │       ├── paste-options-dropdown.css
│       │   │       └── PasteOptionsDropdown.tsx
│       │   ├── basic-text/
│       │   │   ├── basic-text-group.css
│       │   │   ├── BasicTextGroup.tsx
│       │   │   ├── helpers.ts
│       │   │   ├── align-button/
│       │   │   │   ├── align-button.css
│       │   │   │   └── AlignButton.tsx
│       │   │   ├── font-picker/
│       │   │   │   ├── font-picker.css
│       │   │   │   ├── FontPicker.tsx
│       │   │   │   └── helpers.ts
│       │   │   ├── highlight-text-color/
│       │   │   │   ├── highlight-text-color.css
│       │   │   │   └── HighlightTextColor.tsx
│       │   │   └── script-buttons/
│       │   │       ├── script-buttons.css
│       │   │       └── ScriptButtons.tsx
│       │   ├── styles/
│       │   │   ├── styles-group.css
│       │   │   ├── StylesGroup.tsx
│       │   │   ├── styles-data.ts
│       │   ├── tags/
│       │   │   ├── tags-group.css
│       │   │   ├── TagsGroup.tsx
│       │   ├── email/
│       │   │   ├── EmailGroup.tsx
│       │   └── navigate/
│       │       ├── NavigateGroup.tsx
│       ├── insert/
│       │   ├── InsertTabPanel.tsx
│       │   └── (sub-groups planned, not scaffolded yet)
│       └── draw/ history/ review/ view/ help/   ← stub tabs (no src files yet)
```

---

## 4. Module Layout (Per-Feature Pattern)

Every feature module (group, button, helper) follows this layout:

```
<feature>/
├── README.md                ← purpose, props, behavior summary
├── <Feature>.tsx            ← React component (PascalCase)
├── <feature>.css            ← scoped CSS (if any)
├── <helper>.ts              ← pure logic extracted from component (if any)
├── <Feature>.test.tsx       ← colocated RTL test (same folder as component)
└── __snapshots__/           ← optional Jest snapshots
```

**Rules:**

- Source files (`.ts`, `.tsx`, `.css`) live **directly** in the feature folder.
- Test files (`.test.ts`, `.test.tsx`) live **in the same folder** as the source they test.
- Snapshot files live in `__snapshots__/` next to the colocated test file when Jest creates them.
- `README.md` files are allowed at folder level — not test files.
- Every new logical block (pure function, hook, utility, transformation) must be extracted into its own file, exported from that file, and called from the editing file. Its unit tests must be colocated in the same folder and cover every variation of parameters and every return path.

### Folder Organization Rules

- **One index file per folder:** Each feature folder may have **at most one main component** (e.g., `BasicTextGroup.tsx`) and **at most one helper file** (e.g., `clearFormatting.ts`).
- **Separate constants and interfaces:** Define constants in a dedicated `constants.ts` file and types/interfaces in a dedicated `interfaces.ts` file. These files are exceptions to the "one helper" rule.
- **Subfolder pattern for overflow:** If a folder needs more than one component or helper, create a subfolder with its own index and helper, following the same pattern.
- **No sibling files at the same level:** Related utilities, helpers, and data files must be organized into their own subfolders (e.g., `format-painter/`, `tag-apply/`) with their own index files.
- **Always check for redundancy:** Before adding a new file, verify that similar logic does not already exist elsewhere in the codebase. Consolidate duplicated logic into a shared utility (e.g., `src/shared/`).
- **Naming consistency:** The folder name (kebab-case) must match the file purpose. Example: `format-painter/` contains `helpers.ts` (and optional colocated `helpers.test.ts`).

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

- Button markup uses `onr-btn` (large) and `onr-btn-sm` (small) classes.
- Groups use `onr-group` wrappers with a `onr-group-name` label element.
- Use `data-cmd` attributes on interactive controls for test and automation targeting.

### Dropdown

- Use `<Dropdown>` React component (portal) for all dropdowns — never imperative DOM.
- Pass `anchor` (HTMLElement | null) to control open/close.
- Items use `className="onr-dd-item"` and `data-cmd` for test selection.

### Active state

- Active/toggled UI state is managed locally per group and via shared contexts (for example, format painter context).
- There is no shared `useEditorState` hook in the current structure.

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

- **Tokens**: global design tokens live in `src/styles/tokens.css` (CSS custom properties).
- **Scoped CSS**: each feature may have a `<feature>.css` with `onr-` prefixed class names.
- **No inline styles** in components except for dynamic values (e.g., dropdown position).
- **Class naming**: BEM-inspired with `onr-` prefix. Block = `onr-<component>`, modifier = `onr-<state>`.
  - States: `onr-active`, `onr-disabled`, `onr-open`
  - Buttons: `onr-btn-sm` (small toolbar button)
  - Dropdown: `onr-overlay-dropdown`, `onr-dd-item`, `onr-callout-picker`
  - Groups: `onr-group`, individual groups add `data-group="<name>"`

---

## 8. Test Conventions (CRITICAL)

### Three test layers

| Layer           | Files                 | Tool          | What it tests                                                                                     |
| --------------- | --------------------- | ------------- | ------------------------------------------------------------------------------------------------- |
| **Unit**        | `*.test.ts`           | Jest (no DOM) | Pure logic functions (clearFormatting, stripFormatting, applyFormatPainter, parseCssString, etc.) |
| **Integration** | `*.test.tsx`          | Jest + RTL    | React components: render, click → editor mutation, dropdown open/close, active state              |
| **E2E**         | `scripts/e2e/` runner | CDP (Node)    | Live Obsidian with real vault; see `npm run test:e2e`                                             |

### File location rule

```
✅ src/tabs/home/basic-text/BasicTextGroup.test.tsx
✅ src/shared/hooks/useRibbonState.test.ts
❌ src/tabs/home/basic-text/tests/BasicTextGroup.test.tsx
❌ src/shared/hooks/tests/useRibbonState.test.ts
```

**All test files must be colocated in the same folder as the module they test.**

### Test file naming

- Unit tests for pure logic: `<fileName>.test.ts`
- RTL integration tests for components: `<ComponentName>.test.tsx`
- Panel-level smoke tests: `<PanelName>TabPanel.test.tsx`

### Test utilities (src/test-utils/)

```ts
// Factories
createMockApp(editor?)               // app with no active editor (pass MockEditor to attach one)
createAppWithEditor(content)         // { app, editor } with content pre-loaded

// Render wrapper (provides AppContext + FormatPainterContext)
renderWithApp(<Component />, app)

// Finding dropdown items (sublabels — do not use getByText directly)
const ddItem = (phrase) =>
  screen.getByText((t, el) => !!el?.classList.contains('onr-dd-item') && t.includes(phrase));
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
    expect(() =>
      fireEvent.click(screen.getByText('Button Label')),
    ).not.toThrow();
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

### Coverage

- `npm run test:coverage` must pass threshold: **80% lines** (currently ~97%)
- Each test file must cover **every variation of parameters and every return path** of the logic it tests.
- Excluded from coverage:
  - `src/__mocks__/**` — mocks
  - `src/test-utils/**` — test helpers
  - `src/main.ts` — plugin entry
  - `src/ribbon/RibbonShell.ts` — DOM mount (untestable in jsdom)
  - `src/tabs/draw/**` `src/tabs/history/**` `src/tabs/review/**` `src/tabs/view/**` `src/tabs/help/**` — stub tabs
  - `src/**/*.integration.ts` `src/**/*.combinations.ts` — E2E eval strings (if any remain)

---

## 9. Build Configuration

### tsconfig.json (production)

- `module: ESNext`, `moduleResolution: bundler` — for esbuild
- `jsx: react-jsx`, `jsxImportSource: react`
- `strict: true`, `noImplicitAny: true`

### ts-jest override (tests only, in jest.config.js)

- `module: commonjs`, `moduleResolution: node` — Jest requires CJS
- `diagnostics: false` — type errors are caught by `tsc`; ts-jest is transpile-only in tests

### esbuild.config.mjs

- Output: `main.js` at project root
- External: `obsidian`, `electron`, NodeJS builtins
- Source maps: off in production

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

---

## 11. E2E Test Runner

The CDP runner (`scripts/e2e/run-e2e.mjs`) is a zero-dependency Node 24 script:

- Connects to Obsidian at `localhost:9222` via Chrome DevTools Protocol (WebSocket + fetch)
- Use `npm run test:e2e:launch` to kill existing `Obsidian.exe`, create `.e2e-vault/`, and relaunch
- `--suite <names>` flag: comma-separated suite filter (also available as `test:e2e:home` / `test:e2e:insert`)
- E2E test files live in `scripts/e2e/` — they are **not** under `src/` and are excluded from Jest/coverage
- Legacy `src/**/*.integration.ts` and `src/**/*.combinations.ts` patterns are excluded from coverage for historical reasons; no new files should use those patterns

> **Do not confuse E2E with RTL integration tests.** RTL tests run in jsdom with mock Obsidian — they are the primary test layer. E2E only runs against a live Obsidian instance.

---

## 12. Plan File Location

Every new plan must be created in its own dated subfolder:

```
plans/YYYY-MM-DD-<short-name>/plan.md
```

Examples:

- `plans/2026-04-09-css-refactor/plan.md`
- `plans/2026-04-09-insert-tab-icons/plan.md`

Use today's date (ISO 8601) and a short kebab-case name derived from the task. The folder must contain only `plan.md` unless the plan explicitly calls for additional files (e.g. mockups, screenshots).

---

## 13. Enforce before any task completion

1. All new test files are colocated with source files
2. `npm test` must pass with 0 failures
3. No imports from `vitest` — Jest only
4. TypeScript strict mode — no unguarded `any`
5. Every editor handler guards: `const editor = getEditor(); if (!editor) return;`
6. Dropdown and modal tests include both snapshot assertions and computed CSS assertions

---

## 14. Obsidian Plugin Development Workflow

### Before any task: Verify Obsidian MCP is Running

1. **Check if Obsidian is running in debug mode** on port 9222 (Chrome DevTools Protocol)
2. If Obsidian is not running or MCP is unavailable:
   - Kill any running Obsidian process: `taskkill /IM Obsidian.exe /F`
   - Relaunch Obsidian in debug mode via MCP
3. **Never proceed with development tasks until MCP is verified running** — it is required for E2E testing and live plugin verification

### After completing any code change: Test in Obsidian

1. **Run Jest unit tests first**: `npm test` must pass with 0 failures
2. **Test the change live in Obsidian** via E2E tests or manual verification using MCP:
   - Use `npm run test:e2e` to run E2E test suite (requires Obsidian running on port 9222)
   - Or manually verify in the live Obsidian instance connected via MCP
3. **Do not claim work is complete** until changes are tested in the actual Obsidian environment
4. If live testing reveals issues not caught by unit tests, investigate and fix before completion

### Obsidian MCP Connection Checklist

- [ ] Obsidian.exe is running in debug mode (port 9222)
- [ ] MCP is connected and responding
- [ ] `npm run dev` watch build is running
- [ ] Plugin is reloaded in Obsidian (`app.plugins.disablePlugin → enablePlugin`)
- [ ] Changes are visible in the ribbon UI
- [ ] E2E tests pass or manual testing confirms behavior

---

## 15. Debugging Behavior

When stuck or unable to find a solution:

1. Do **not** give up or ask the user to figure it out.
2. Add debug logging or instrumentation to the code to gather more information.
3. Re-run or re-analyse with the added debug output.
4. If still unable to proceed, ask the user to run the code and share the debug output.

Never declare defeat without first exhausting debug-driven investigation. If analysis is taking too long without a clear answer, stop reasoning and add debug logging to gather concrete evidence instead.

---

## 16. Non-obvious Behaviors

- `clearFormatting` repeatedly strips `<span ...>...</span>` wrappers until stable, so nested font wrappers are fully removed.
- `stripFormatting(sourceText, stripInline)` treats `stripInline = true` as preserve headings and strip only inline markup; default behavior strips headings too.
- `applyFormatPainter` is a no-op for empty selections and only wraps non-empty selection text.
- **Plugin reload for dev**: `app.plugins.disablePlugin('onenote-ribbon')` then `enablePlugin` — NOT `plugin.shell.mount()` (doesn't reload JS)
