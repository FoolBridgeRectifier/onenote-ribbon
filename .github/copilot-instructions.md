# Copilot Instructions — OneNote Ribbon Plugin

**Read `CONVENTIONS.md` at the project root before generating any code, tests, or suggestions.**

## Project Summary

Obsidian plugin rendering a Microsoft OneNote-style ribbon toolbar.
Stack: TypeScript 5 strict + React 18 + esbuild (build) + Jest 30 + RTL (tests).

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

---

See `CONVENTIONS.md` for the full annotated directory tree, module layout pattern,
naming tables, dropdown test helpers, coverage configuration, and E2E runner docs.
