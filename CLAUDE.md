# Claude Project Instructions — OneNote Ribbon

**MANDATORY: Read `CONVENTIONS.md` in full before executing any task in this project.**

That file defines:

- Directory structure and module layout
- Where test files must go (`tests/` subdirectory — never alongside source files)
- Naming conventions for files, components, CSS classes, data-cmd attributes
- React patterns (AppContext, RibbonButton, GroupShell, Dropdown, useEditorState)
- Test toolchain (Jest 30 + ts-jest + RTL — no vitest)
- Test utilities: `createMockApp`, `createAppWithEditor`, `renderWithApp`, `ddItem`
- Coverage thresholds and exclusions
- Code quality rules (no globals, no side effects at module load, TypeScript strict)

## Quick Reference

```
npm test                  # run all 475 Jest tests
npm run test:coverage     # with coverage report
npm run build             # esbuild production bundle
npm run test:e2e          # E2E via CDP (needs live Obsidian on port 9222)
```

## Enforce before any task completion

1. All new test files go in `tests/` subdirectory — never alongside source files
2. `npm test` must pass with 0 failures
3. No imports from `vitest` — Jest only
4. TypeScript strict mode — no unguarded `any`
5. Every editor handler guards: `const e = ed(); if (!e) return;`
