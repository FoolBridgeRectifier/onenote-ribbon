# Copilot Instructions — OneNote Ribbon Plugin

**Read `CONVENTIONS.md` at the project root before generating any code, tests, or suggestions.**

## Project Summary

Obsidian plugin rendering a Microsoft OneNote-style ribbon toolbar.
Stack: TypeScript 5 strict + React 18 + esbuild (build) + Jest 30 + RTL (tests).

## Code Quality Standards (always enforce, no exceptions)

- **Preferred stack:** React, React Testing Library, Node, Java, TypeScript — prefer these over other frameworks when a choice exists.
- **Logical blocks = subfolders + unit tests:** When writing any new code, if it introduces a new logical block (a self-contained function, hook, utility, or transformation), extract it into its own file and add a `tests/` subfolder with unit tests covering every variation of params and every return path. The logical block must be a pure exported function (or hook) called from the editing file.
- **Comments on hard-to-understand code:** Add a one-line comment above any line or block that is not immediately obvious. Do not comment trivial code.
- **Spacing:** Leave a blank line between distinct logical sections within a function or block.
- **Full variable names:** Never shorten names. `editor` not `ed`, `backgroundColor` not `bgColor`, `index` not `i` (except conventional loop counters).
- **Code quality, readability, and redundancy reduction are the highest priorities.** Always maximize these. Prefer explicit, readable code over clever or compact code.

## Critical Rules

### File location

- **Source files** (`.ts`, `.tsx`, `.css`): directly in the feature folder
- **Test files** (`.test.ts`, `.test.tsx`): **always inside a `tests/` subdirectory**
- `README.md` is the only file allowed at folder level alongside source files

```
✅  src/tabs/home/basic-text/tests/BasicTextGroup.test.tsx
```

### Test toolchain

- **Jest 30** + **ts-jest** + **@testing-library/react** — not vitest, not mocha
- Never import from `vitest`
- `createMockApp()` / `createAppWithEditor(content)` from `src/test-utils/mockApp.ts`
- `renderWithApp(<Component />, app)` from `src/test-utils/renderWithApp.tsx`

### React patterns

- Access Obsidian app via `useApp()` — never prop-drill `app`
- Use `<RibbonButton>` for all toolbar buttons
- Use `<GroupShell>` to wrap every group
- Use `<Dropdown>` for all dropdowns (React portal — never imperative DOM)
- Every editor handler: `const e = app.workspace.activeEditor?.editor; if (!e) return;`

### CSS

- All classes prefixed with `onr-`
- No Tailwind, no utility classes

### TypeScript

- Strict mode is enforced — no `any` except mock-casting in test utilities
- `npm test` must pass all 475 tests before any task is considered complete

## Plan Execution Rules

When a plan file exists in `plans/`:

1. **Follow the plan to the dot** — do not skip, reorder, or summarize steps. Execute exactly what is written, in the order written.
2. **Use agents for separate sections and tasks** — spawn a dedicated agent (subagent) per plan section or independent task to avoid losing context of the overall plan. Do not attempt to execute the entire plan in a single context window.
3. **Always complete the task** — if a plan step is ambiguous, make a reasonable decision and continue. Never stop mid-plan without finishing.
4. **Do not mark a task complete** until its specific acceptance criteria (tests passing, build clean, etc.) are verified.

---

See `CONVENTIONS.md` for the full annotated directory tree, module layout pattern,
naming tables, dropdown test helpers, coverage configuration, and E2E runner docs.
