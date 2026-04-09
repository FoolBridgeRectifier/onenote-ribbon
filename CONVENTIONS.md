# OneNote Ribbon — Project Conventions

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

| Tool                      | Version | Purpose                                                            |
| ------------------------- | ------- | ------------------------------------------------------------------ |
| TypeScript                | ^5.3    | Strict mode: `strict: true`, `noImplicitAny: true`                 |
| React                     | ^18.3   | UI components                                                      |
| esbuild                   | ^0.20   | Production bundle (`npm run build`, `npm run dev`)                 |
| Jest                      | ^30     | Unit + integration test runner                                     |
| ts-jest                   | ^29     | TypeScript transform for Jest (CommonJS, `moduleResolution: node`) |
| jest-environment-jsdom    | ^30     | Browser environment simulation                                     |
| @testing-library/react      | ^16     | RTL for component rendering                                        |
| @testing-library/jest-dom   | ^6      | Custom DOM matchers                                                |
| @testing-library/user-event | ^14     | Higher-level user interaction simulation (available, use sparingly)|

**Commands:**

```
npm run build                 # production bundle
npm run dev                   # watch mode
npm test                      # all Jest tests
npm run test:watch            # jest --watch
npm run test:coverage         # jest --coverage
npm run test:e2e              # E2E via CDP (requires running Obsidian on port 9222)
npm run test:e2e:launch       # kill Obsidian, create fresh .e2e-vault/, relaunch
npm run test:e2e:home         # E2E home tab suites only
npm run test:e2e:insert       # E2E insert tab suites only
```

---

## 3. Directory Structure

```
onenote-ribbon/
├── CONVENTIONS.md          ← you are here; read before any task
├── CLAUDE.md               ← Claude project instructions (references this file)
├── .github/
│   └── copilot-instructions.md  ← Copilot Chat instructions (references this file)
├── src/
│   ├── main.ts             ← plugin entry; registers RibbonShell only
│   ├── __mocks__/
│   │   └── obsidian.ts     ← Jest mock for 'obsidian' module
│   ├── test-utils/         ← shared test helpers (NOT in coverage, NOT in tests/)
│   │   ├── MockEditor.ts
│   │   ├── mockApp.ts
│   │   ├── renderWithApp.tsx
│   │   └── setup.ts
│   ├── styles/             ← global CSS (tokens + shell layout)
│   │   ├── tokens.css
│   │   └── shell.css
│   ├── ribbon/             ← top-level ribbon wiring
│   │   ├── RibbonShell.ts  ← createRoot mount (excluded from coverage)
│   │   ├── RibbonApp.tsx
│   │   ├── TabBar.tsx
│   │   ├── tabs.ts
│   │   ├── useRibbonState.ts
│   │   └── tests/
│   │       └── ribbon.test.tsx
│   ├── shared/             ← reusable logic, components, hooks
│   │   ├── README.md
│   │   ├── components/     ← RibbonButton, GroupShell, Dropdown (React)
│   │   │   ├── RibbonButton.tsx
│   │   │   ├── GroupShell.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   └── tests/
│   │   │       └── components.test.tsx
│   │   ├── context/        ← AppContext, FormatPainterContext
│   │   │   ├── AppContext.ts
│   │   │   └── FormatPainterContext.ts
│   │   ├── dropdown/       ← Dropdown types + CSS (non-React)
│   │   │   ├── Dropdown.ts
│   │   │   ├── dropdown.css
│   │   │   └── README.md
│   │   ├── hooks/          ← useEditorState, useFormatPainter
│   │   │   ├── useEditorState.ts
│   │   │   ├── useFormatPainter.ts
│   │   │   └── tests/
│   │   │       └── useEditorState.test.ts
│   │   ├── tests/          ← pure-logic unit tests (toggleInline etc.)
│   │   │   ├── README.md
│   │   │   ├── toggleInline.test.ts
│   │   │   ├── toggleLinePrefix.test.ts
│   │   │   └── toggleSubSup.test.ts
│   │   ├── toggleInline.ts
│   │   ├── toggleLinePrefix.ts
│   │   └── toggleSubSup.ts
│   └── tabs/
│       ├── home/
│       │   ├── README.md
│       │   ├── HomeTabPanel.tsx
│       │   ├── home.css
│       │   ├── clipboard/
│       │   │   ├── README.md
│       │   │   ├── ClipboardGroup.tsx
│       │   │   ├── clipboard.css
│       │   │   ├── format-painter/
│       │   │   │   ├── README.md
│       │   │   │   ├── applyFormatPainter.ts
│       │   │   │   └── tests/
│       │   │   │       ├── README.md
│       │   │   │       └── applyFormatPainter.test.ts
│       │   │   └── tests/
│       │   │       └── ClipboardGroup.test.tsx
│       │   ├── basic-text/
│       │   │   ├── README.md
│       │   │   ├── BasicTextGroup.tsx
│       │   │   ├── basic-text.css
│       │   │   ├── clearFormatting.ts
│       │   │   └── tests/
│       │   │       ├── README.md
│       │   │       ├── BasicTextGroup.test.tsx
│       │   │       └── clearFormatting.test.ts
│       │   ├── styles/
│       │   │   ├── README.md
│       │   │   ├── StylesGroup.tsx
│       │   │   ├── styles.css
│       │   │   ├── styles-data.ts
│       │   │   └── tests/
│       │   │       └── StylesGroup.test.tsx
│       │   ├── tags/
│       │   │   ├── README.md
│       │   │   ├── TagsGroup.tsx
│       │   │   ├── tags.css
│       │   │   ├── tags-data.ts
│       │   │   ├── tag-apply/
│       │   │   │   ├── README.md
│       │   │   │   ├── applyTag.ts
│       │   │   │   └── tests/
│       │   │   │       ├── README.md
│       │   │   │       └── applyTag.test.ts
│       │   │   └── tests/
│       │   │       └── TagsGroup.test.tsx
│       │   ├── email/
│       │   │   ├── README.md
│       │   │   ├── EmailGroup.tsx
│       │   │   └── tests/
│       │   │       └── EmailGroup.test.tsx
│       │   └── navigate/
│       │       ├── README.md
│       │       ├── NavigateGroup.tsx
│       │       └── tests/
│       │           └── NavigateGroup.test.tsx
│       ├── insert/
│       │   ├── README.md
│       │   ├── InsertTabPanel.tsx
│       │   ├── insert.css
│       │   ├── tests/
│       │   │   └── InsertTabPanel.test.tsx
│       │   ├── blank-line/
│       │   │   ├── README.md
│       │   │   ├── BlankLineButton.tsx
│       │   │   └── tests/
│       │   │       └── BlankLineButton.test.tsx
│       │   ├── blocks/
│       │   │   ├── README.md
│       │   │   ├── BlocksGroup.tsx
│       │   │   └── tests/
│       │   │       └── BlocksGroup.test.tsx
│       │   ├── files/
│       │   │   ├── README.md
│       │   │   ├── FilesGroup.tsx
│       │   │   └── tests/
│       │   │       └── FilesGroup.test.tsx
│       │   ├── images/
│       │   │   ├── README.md
│       │   │   ├── ImagesGroup.tsx
│       │   │   └── tests/
│       │   │       └── ImagesGroup.test.tsx
│       │   ├── links/
│       │   │   ├── README.md
│       │   │   ├── LinksGroup.tsx
│       │   │   └── tests/
│       │   │       └── LinksGroup.test.tsx
│       │   ├── symbols/
│       │   │   ├── README.md
│       │   │   ├── SymbolsGroup.tsx
│       │   │   └── tests/
│       │   │       └── SymbolsGroup.test.tsx
│       │   ├── tables/
│       │   │   ├── README.md
│       │   │   ├── TablesGroup.tsx
│       │   │   └── tests/
│       │   │       └── TablesGroup.test.tsx
│       │   └── timestamp/
│       │       ├── README.md
│       │       ├── TimestampGroup.tsx
│       │       └── tests/
│       │           └── TimestampGroup.test.tsx
│       └── draw/ history/ review/ view/ help/   ← stub tabs (no tests required)
├── scripts/
│   └── e2e/
│       └── run-e2e.mjs    ← CDP E2E runner (Node 24, zero deps)
├── plans/                 ← implementation plan markdown files
├── jest.config.js
├── tsconfig.json
├── esbuild.config.mjs
└── package.json
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
└── tests/
    ├── README.md            ← what this test file covers
    └── <Feature>.test.tsx   ← RTL integration tests
```

**Rules:**

- Source files (`.ts`, `.tsx`, `.css`) live **directly** in the feature folder.
- Test files (`.test.ts`, `.test.tsx`) live **exclusively** inside `tests/` subdirectories.
- `README.md` files are allowed at folder level — not test files.
- Do not put test files at the same level as source files.

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

### RibbonButton

- Always use `<RibbonButton>` for toolbar buttons — it handles `onMouseDown` + `preventDefault()` automatically.
- Use `data-cmd` prop for identifying buttons in tests.
- Use `active` prop (boolean) for toggled state — renders `onr-active` class.
- Use `disabled` prop — renders `onr-disabled` class.

### GroupShell

- Wraps every group. Takes `name` (label below group) and `dataGroup` (for `data-group` attribute).

### Dropdown

- Use `<Dropdown>` React component (portal) for all dropdowns — never imperative DOM.
- Pass `anchor` (HTMLElement | null) to control open/close.
- Items use `className="onr-dd-item"` and `data-cmd` for test selection.

### Active state

- Driven by `EditorState` from `useEditorState(app)` hook.
- Components receive `editorState` as a prop — do not call `useEditorState` inside groups.
- `HomeTabPanel` calls `useEditorState` once and fans out via props.

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

| Banned          | Use instead                         | Where                              |
| --------------- | ----------------------------------- | ---------------------------------- |
| `ed`, `e`       | `editor`, `getEditor`               | Editor accessor + handler locals   |
| `fp`            | `formatPainter`                     | Format painter context value       |
| `FPFormat`      | `FormatPainterFormat`               | Interface name                     |
| `FPContextValue`| `FormatPainterContextValue`         | Interface name                     |
| `useFP`         | `useFormatPainterContext`           | Hook name (consumer hook)          |
| `exec`          | `executeCommand`                    | Editor command helper              |
| `ws`            | `workspaceElement`                  | DOM element variable               |
| `hmc`           | `horizontalMainContainer`           | DOM element variable               |
| `fmt`           | `newFormat` (param) / `format` (state) | Format painter parameter       |
| `sel`           | `selection`                         | Editor selection string            |
| `src`           | `sourceText`                        | Text being inspected               |
| `tmpl`          | `template`                          | Template string                    |
| `t`             | `clipboardText`, `text`, etc.       | Single-letter callback params      |
| `f`, `s`, `c`   | `fontName`, `pointSize`, `colorItem`| Single-letter loop variables       |
| `i`             | `index`, `rowIndex`                 | Loop / map index                   |
| `k`, `v`        | `key`, `value`                      | Object / map iteration             |
| `mh`            | `estimatedMaxHeight`                | Computed layout value              |
| `ref1`, `ref2`  | `leafChangeEventRef`, `editorChangeEventRef` | Event ref names          |
| `fmtDate`       | `formatCurrentDate`                 | Function name                      |
| `fmtTime`       | `formatCurrentTime`                 | Function name                      |
| `now`           | `currentDate`                       | Date variable                      |
| `el`            | `element`                           | DOM element                        |
| `titlebar`      | `titlebarElement`                   | DOM element                        |

**Single-letter names are never acceptable** outside `for`-loop counters in tight numeric loops. Even there, prefer `index`.

### `parseCssString` — single source of truth

`parseCssString` is defined and **exported exclusively from `src/shared/components/Dropdown.tsx`**. Do not duplicate it in any other file. Import it where needed:

```ts
import { parseCssString } from '../../../shared/components/Dropdown';
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

| Layer           | Files                 | Tool          | What it tests                                                                        |
| --------------- | --------------------- | ------------- | ------------------------------------------------------------------------------------ |
| **Unit**        | `*.test.ts`           | Jest (no DOM) | Pure logic functions (toggleInline, clearFormatting, applyTag, etc.)                 |
| **Integration** | `*.test.tsx`          | Jest + RTL    | React components: render, click → editor mutation, dropdown open/close, active state |
| **E2E**         | `scripts/e2e/` runner | CDP (Node)    | Live Obsidian with real vault; see `npm run test:e2e`                                |

### File location rule

```
✅ src/tabs/home/basic-text/tests/BasicTextGroup.test.tsx
✅ src/shared/hooks/tests/useEditorState.test.ts
❌ src/tabs/home/basic-text/BasicTextGroup.test.tsx  ← NEVER at same level as source
❌ src/shared/hooks/useEditorState.test.ts            ← NEVER at same level as source
```

**All test files must live inside a `tests/` subdirectory** relative to the module they test.

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
describe("FeatureGroup — description (integration)", () => {
  it("renders expected buttons", () => {
    const { app } = createAppWithEditor("");
    renderWithApp(<FeatureGroup />, app);
    expect(screen.getByText("Button Label")).toBeInTheDocument();
  });

  it("click applies expected editor change", () => {
    const { app, editor } = createAppWithEditor("initial content");
    editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 7 });
    renderWithApp(<FeatureGroup />, app);
    fireEvent.click(screen.getByText("Button Label"));
    expect(editor.getValue()).toBe("expected result");
  });

  it("is no-op when no active editor", () => {
    const app = createMockApp();
    renderWithApp(<FeatureGroup />, app);
    expect(() =>
      fireEvent.click(screen.getByText("Button Label")),
    ).not.toThrow();
  });
});
```

### Dropdown testing

```tsx
// Dropdowns (async — use act for clicking items):
fireEvent.click(screen.getByText("Dropdown Button"));
act(() => {
  fireEvent.click(dropdownItem);
});

// StylesGroup dropdown specifically needs:
await act(async () => {
  fireEvent.click(container.querySelector('[data-cmd="styles-dropdown"]')!);
});
```

### Mock setup

- `obsidian` module is mocked via `moduleNameMapper` → `src/__mocks__/obsidian.ts`
- `jest-dom` matchers (`.toBeInTheDocument()`, `.toHaveClass()`, etc.) loaded in `src/test-utils/setup.ts` via `setupFilesAfterEnv`
- `window.moment` is not available in jsdom — timestamp tests use regex patterns (`/^\d{4}-\d{2}-\d{2}$/`)

### Coverage

- `npm run test:coverage` must pass threshold: **80% lines** (currently ~97%)
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

1. **No globals** — never use `window._onrFP*` or any global state. Use React context.
2. **No side effects at module load** — all effects inside hooks/components.
3. **No vitest** — vitest is not installed. Use Jest + RTL only. Do not import from `vitest`.
4. **TypeScript strict** — all code must pass `tsc --noEmit`. No `any` except in test utils casting mock.
5. **Editor guard** — every button handler must declare `const editor = getEditor(); if (!editor) return;` before using the editor. The accessor itself is `const getEditor = () => app.workspace.activeEditor?.editor;` at component top-level.
6. **No component-level polling** — `useEditorState` uses `workspace.on("active-leaf-change")`, `workspace.on("editor-change")`, and DOM `click`/`keyup` capture listeners. No manual RAF polling loops.
7. **CSS prefix** — all classes must use `onr-` prefix. No Tailwind, no utility classes.
8. **No test files at source level** — all `.test.ts` / `.test.tsx` files must be in a `tests/` subdirectory.
9. **No README.md in tests/** folders unless documenting test scope — keep them short.
10. **No `console.log`** left in production code. Debug logs are acceptable in test files only.
11. **No abbreviations** — all identifiers must be fully descriptive. See §6 for the full banned-abbreviations table. Single-letter names are never acceptable outside tight numeric `for`-loop counters.
12. **Extract inline handlers** — do not write multi-line logic inside `onClick`/`onMouseDown` JSX props. Extract to named functions declared above the `return`.
13. **Blank-line spacing** — separate distinct logical groups of statements with a blank line. Import blocks: one blank line between third-party and local imports. Component body: blank line between `const getEditor`, context hooks, handler functions, and the `return`.

---

## 11. E2E Test Runner

The CDP runner (`scripts/e2e/run-e2e.mjs`) is a zero-dependency Node 24 script:

- Connects to Obsidian at `localhost:9222` via Chrome DevTools Protocol (WebSocket + fetch)
- Use `npm run test:e2e:launch` to kill existing `Obsidian.exe`, create `.e2e-vault/`, and relaunch
- `--suite <names>` flag: comma-separated suite filter (also available as `test:e2e:home` / `test:e2e:insert`)
- E2E test files live in `scripts/e2e/` — they are **not** under `src/` and are excluded from Jest/coverage
- Legacy `src/**/*.integration.ts` and `src/**/*.combinations.ts` patterns are excluded from coverage for historical reasons; no new files should use those patterns

> **Do not confuse E2E with RTL integration tests.** RTL tests run in jsdom with mock Obsidian — they are the primary test layer. E2E only runs against a live Obsidian instance.
