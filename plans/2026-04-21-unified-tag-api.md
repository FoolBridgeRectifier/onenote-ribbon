# Unified Tag API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Route all callout/task/checkbox operations through `addTag`, `removeTag`, and `toggleTag` so that `stylingEngine.ts` exports exactly five functions — no direct callout exports.

**Architecture:** `TagDefinition` becomes a discriminated union (`HtmlTagDefinition | CalloutTagDefinition | TaskTagDefinition | CheckboxTagDefinition | InlineTodoTagDefinition`). `addTag`, `removeTag`, and `toggleTag` each gain a TypeScript overload that accepts an `ObsidianEditor` as the first argument and dispatches to the appropriate callout implementation internally. Callers in `UseTagHandlers.ts` and `helpers.ts` swap their direct callout imports for `addTag`/`removeTag`/`toggleTag` imports.

**Tech Stack:** TypeScript, Jest, Obsidian Editor API

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `src/shared/editor/styling-engine/interfaces.ts` | Extend `TagDefinition` to discriminated union |
| Modify | `src/shared/editor/styling-engine/public-api/tag-add/TagAdd.ts` | Add editor overload, dispatch to callout ops |
| Modify | `src/shared/editor/styling-engine/public-api/tag-add/TagAdd.test.ts` | Tests for new editor overload |
| Modify | `src/shared/editor/styling-engine/public-api/tag-remove/TagRemove.ts` | Add editor overload, dispatch to callout ops |
| Modify | `src/shared/editor/styling-engine/public-api/tag-remove/TagRemove.test.ts` | Tests for new editor overload |
| Modify | `src/shared/editor/styling-engine/public-api/tag-toggle/TagToggle.ts` | Add editor overload, dispatch to inline-todo |
| Modify | `src/shared/editor/styling-engine/public-api/tag-toggle/TagToggle.test.ts` | Tests for new editor overload |
| Modify | `src/shared/editor/styling-engine/public-api/PublicApi.ts` | Remove 6 callout re-exports |
| Modify | `src/shared/editor/styling-engine/editor-integration/helpers.ts` | Simplify to delegate to new overloads |
| Modify | `src/tabs/home/tags/use-tag-handlers/UseTagHandlers.ts` | Replace callout imports with addTag/removeTag/toggleTag |
| Modify | `src/tabs/home/tags/use-tag-handlers/UseTagHandlers.test.ts` | Update mocks |
| Modify | `src/tabs/home/tags/use-tag-handlers/helpers.ts` | Replace callout imports with addTag/removeTag |
| Modify | `src/tabs/home/tags/use-tag-handlers/helpers.test.ts` | Update mocks |

---

## Task 1: Extend `TagDefinition` to a discriminated union

**Files:**
- Modify: `src/shared/editor/styling-engine/interfaces.ts`

- [ ] **Step 1: Write the failing type tests (compile-time check)**

Add these imports to a temporary block at the bottom of `interfaces.ts` to verify the union works. Remove them after the task is committed.

```typescript
// Temporary type-level test — remove after Task 1 commit
const _calloutTag: TagDefinition = { kind: 'callout', calloutType: 'important', calloutTitle: 'Important' };
const _taskTag: TagDefinition = { kind: 'task', taskPrefix: 'Todo:' };
const _htmlTag: TagDefinition = { tagName: 'b', domain: 'html', openingMarkup: '<b>', closingMarkup: '</b>' };
```

Run `cmd /c "node_modules\.bin\tsc --noEmit 2>&1"` — expect TYPE ERRORS (type not yet defined).

- [ ] **Step 2: Replace `TagDefinition` in `interfaces.ts`**

Find the existing interface:
```typescript
export interface TagDefinition {
  tagName: string;
  domain: FormattingDomain;
  openingMarkup: string;
  closingMarkup: string;
  attributes?: Record<string, string>;
}
```

Replace it with the discriminated union (keep all other types in the file unchanged):

```typescript
// === Tag Definition — discriminated union ===

/**
 * Describes an HTML inline tag operation (bold, italic, span, etc.).
 * The `kind` field is optional and defaults to 'html' for backwards compatibility.
 */
export interface HtmlTagDefinition {
  kind?: 'html';
  tagName: string;
  domain: FormattingDomain;
  openingMarkup: string;
  closingMarkup: string;
  attributes?: Record<string, string>;
}

/** Describes a callout block operation (apply, remove by title, or remove innermost). */
export interface CalloutTagDefinition {
  kind: 'callout';
  /** Required when adding a callout. Omit when removing the innermost callout. */
  calloutType?: string;
  /** Callout title text. When supplied to removeTag, removes that specific callout by key. */
  calloutTitle?: string;
}

/** Describes a task list item operation. */
export interface TaskTagDefinition {
  kind: 'task';
  /** Optional prefix placed before the task body (e.g. "Todo:", "Discuss:"). */
  taskPrefix?: string;
}

/** Describes a checkbox removal operation. */
export interface CheckboxTagDefinition {
  kind: 'checkbox';
}

/** Describes an inline #todo tag toggle operation. */
export interface InlineTodoTagDefinition {
  kind: 'inline-todo';
}

/**
 * Union of all tag operation kinds accepted by the unified styling engine API.
 * All HTML tag callers continue to work without changes — `kind` defaults to 'html'.
 */
export type TagDefinition =
  | HtmlTagDefinition
  | CalloutTagDefinition
  | TaskTagDefinition
  | CheckboxTagDefinition
  | InlineTodoTagDefinition;
```

- [ ] **Step 3: Run type check**

```
cmd /c "node_modules\.bin\tsc --noEmit 2>&1"
```

Expected: 0 errors. If existing callers of `TagDefinition` (which use the html fields) now get errors, they need `HtmlTagDefinition` imported instead of `TagDefinition` for their local variable annotations.

- [ ] **Step 4: Remove the temporary type-test block from `interfaces.ts`**

- [ ] **Step 5: Run full Jest suite to confirm no breakage**

```
cmd /c "node_modules\.bin\jest --no-coverage 2>&1"
```

Expected: all suites pass.

- [ ] **Step 6: Commit**

```
git add src/shared/editor/styling-engine/interfaces.ts
git commit -m "refactor: extend TagDefinition to discriminated union for callout/task/checkbox/inline-todo kinds"
```

---

## Task 2: Add editor overload to `addTag`

**Files:**
- Modify: `src/shared/editor/styling-engine/public-api/tag-add/TagAdd.ts`
- Modify: `src/shared/editor/styling-engine/public-api/tag-add/TagAdd.test.ts`

> **File size note:** `TagAdd.ts` must stay under 150 lines. If the editor overload block pushes it over, extract the original HTML implementation into a `helpers.ts` alongside `TagAdd.ts` and call it from both the StylingContext path and the editor path.

- [ ] **Step 1: Write failing tests first**

Add a new `describe` block at the bottom of `TagAdd.test.ts`:

```typescript
// At top of TagAdd.test.ts — add these imports if not already present:
// import { applyCallout, applyTask } from '../../callout-apply/calloutApply';
// jest.mock('../../callout-apply/calloutApply');
//
// The mock MUST be declared before the import — Jest hoists jest.mock() calls.

jest.mock('../../callout-apply/calloutApply', () => ({
  applyCallout: jest.fn(),
  applyTask: jest.fn(),
}));

// Add at bottom of file:
describe('addTag — editor overload', () => {
  const mockApplyCallout = applyCallout as jest.Mock;
  const mockApplyTask = applyTask as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function buildMockEditor() {
    return {
      getCursor: jest.fn().mockReturnValue({ line: 0, ch: 0 }),
      getLine: jest.fn().mockReturnValue(''),
      setLine: jest.fn(),
      setCursor: jest.fn(),
      getValue: jest.fn().mockReturnValue(''),
      transaction: jest.fn(),
    };
  }

  it('calls applyCallout with calloutType and calloutTitle when kind is callout', () => {
    const editor = buildMockEditor();
    addTag(editor as any, { kind: 'callout', calloutType: 'important', calloutTitle: 'Important' });
    expect(mockApplyCallout).toHaveBeenCalledWith(editor, 'important', 'Important');
  });

  it('calls applyCallout with undefined title when calloutTitle is omitted', () => {
    const editor = buildMockEditor();
    addTag(editor as any, { kind: 'callout', calloutType: 'note' });
    expect(mockApplyCallout).toHaveBeenCalledWith(editor, 'note', undefined);
  });

  it('calls applyTask with taskPrefix when kind is task', () => {
    const editor = buildMockEditor();
    addTag(editor as any, { kind: 'task', taskPrefix: 'Todo:' });
    expect(mockApplyTask).toHaveBeenCalledWith(editor, 'Todo:');
  });

  it('calls applyTask with empty string when taskPrefix is omitted', () => {
    const editor = buildMockEditor();
    addTag(editor as any, { kind: 'task' });
    expect(mockApplyTask).toHaveBeenCalledWith(editor, '');
  });
});
```

Run: `cmd /c "node_modules\.bin\jest TagAdd --no-coverage 2>&1"`
Expected: new tests FAIL (function overload not yet implemented).

- [ ] **Step 2: Add the editor overload to `TagAdd.ts`**

At the top of `TagAdd.ts`, add these imports:

```typescript
import { applyCallout, applyTask } from '../../callout-apply/calloutApply';
import type { ObsidianEditor } from '../../interfaces';
import type { CalloutTagDefinition, TaskTagDefinition, HtmlTagDefinition } from '../../interfaces';
import { buildStylingContextFromEditor, applyStylingResult } from '../../editor-integration/EditorIntegration';
```

Then replace the current `export function addTag(...)` signature with the overloaded version. **The existing function body becomes the `HtmlTagDefinition` path.** Rename the internal implementation to `addHtmlTag` and call it from both paths:

```typescript
/** Guards whether the first argument is an Obsidian editor (has getCursor method). */
function isObsidianEditor(input: unknown): input is ObsidianEditor {
  return typeof (input as ObsidianEditor).getCursor === 'function';
}

// TypeScript overloads — callers get the correct return type based on argument kind.
export function addTag(context: StylingContext, tagDefinition: HtmlTagDefinition): StylingResult;
export function addTag(editor: ObsidianEditor, tagDefinition: CalloutTagDefinition | TaskTagDefinition): void;
export function addTag(
  input: StylingContext | ObsidianEditor,
  tagDefinition: TagDefinition
): StylingResult | void {
  // Editor path: dispatch to block-level implementations
  if (isObsidianEditor(input)) {
    if (tagDefinition.kind === 'callout') {
      applyCallout(input, tagDefinition.calloutType!, tagDefinition.calloutTitle);
      return;
    }
    if (tagDefinition.kind === 'task') {
      applyTask(input, tagDefinition.taskPrefix ?? '');
      return;
    }
    // HTML kind via editor: build context and apply result to editor
    const context = buildStylingContextFromEditor(input);
    if (!context) return;
    applyStylingResult(input, context.sourceText, addHtmlTag(context, tagDefinition as HtmlTagDefinition));
    return;
  }
  // StylingContext path: pure HTML tag operation
  return addHtmlTag(input, tagDefinition as HtmlTagDefinition);
}

/**
 * Pure HTML tag addition — operates on text offsets, does not touch the editor directly.
 * Extracted so both the StylingContext overload and the HTML-via-editor path can share it.
 */
function addHtmlTag(context: StylingContext, tagDefinition: HtmlTagDefinition): StylingResult {
  // [paste the full existing addTag body here unchanged]
}
```

- [ ] **Step 3: Run the tests**

```
cmd /c "node_modules\.bin\jest TagAdd --no-coverage 2>&1"
```

Expected: all tests pass (both existing HTML tests and new editor overload tests).

- [ ] **Step 4: Commit**

```
git add src/shared/editor/styling-engine/public-api/tag-add/TagAdd.ts
git add src/shared/editor/styling-engine/public-api/tag-add/TagAdd.test.ts
git commit -m "feat: add editor overload to addTag for callout and task dispatch"
```

---

## Task 3: Add editor overload to `removeTag`

**Files:**
- Modify: `src/shared/editor/styling-engine/public-api/tag-remove/TagRemove.ts`
- Modify: `src/shared/editor/styling-engine/public-api/tag-remove/TagRemove.test.ts`

- [ ] **Step 1: Write failing tests**

Add at bottom of `TagRemove.test.ts`:

```typescript
jest.mock('../../callout-apply/helpers/remove-active-callout/RemoveActiveCallout', () => ({
  removeActiveCallout: jest.fn(),
}));
jest.mock('../../callout-apply/helpers/remove-callout-by-key/RemoveCalloutByKey', () => ({
  removeCalloutByKey: jest.fn(),
}));
jest.mock('../../callout-apply/helpers/remove-active-checkbox/RemoveActiveCheckbox', () => ({
  removeActiveCheckbox: jest.fn(),
}));

// Add at bottom of file:
describe('removeTag — editor overload', () => {
  const mockRemoveActiveCallout = removeActiveCallout as jest.Mock;
  const mockRemoveCalloutByKey = removeCalloutByKey as jest.Mock;
  const mockRemoveActiveCheckbox = removeActiveCheckbox as jest.Mock;

  beforeEach(() => jest.clearAllMocks());

  function buildMockEditor() {
    return {
      getCursor: jest.fn().mockReturnValue({ line: 0, ch: 0 }),
      getLine: jest.fn().mockReturnValue('> [!important] Important'),
      setLine: jest.fn(),
      lastLine: jest.fn().mockReturnValue(0),
    };
  }

  it('calls removeActiveCallout when kind is callout with no calloutTitle', () => {
    const editor = buildMockEditor();
    removeTag(editor as any, { kind: 'callout' });
    expect(mockRemoveActiveCallout).toHaveBeenCalledWith(editor);
    expect(mockRemoveCalloutByKey).not.toHaveBeenCalled();
  });

  it('calls removeCalloutByKey when kind is callout with calloutTitle', () => {
    const editor = buildMockEditor();
    removeTag(editor as any, { kind: 'callout', calloutTitle: 'Important' });
    expect(mockRemoveCalloutByKey).toHaveBeenCalledWith(editor, 'Important');
    expect(mockRemoveActiveCallout).not.toHaveBeenCalled();
  });

  it('calls removeActiveCheckbox when kind is checkbox', () => {
    const editor = buildMockEditor();
    removeTag(editor as any, { kind: 'checkbox' });
    expect(mockRemoveActiveCheckbox).toHaveBeenCalledWith(editor);
  });
});
```

Run: `cmd /c "node_modules\.bin\jest TagRemove --no-coverage 2>&1"` — expected: new tests FAIL.

- [ ] **Step 2: Add the editor overload to `TagRemove.ts`**

Add imports at top of `TagRemove.ts`:

```typescript
import { removeActiveCallout } from '../../callout-apply/helpers/remove-active-callout/RemoveActiveCallout';
import { removeCalloutByKey } from '../../callout-apply/helpers/remove-callout-by-key/RemoveCalloutByKey';
import { removeActiveCheckbox } from '../../callout-apply/helpers/remove-active-checkbox/RemoveActiveCheckbox';
import type { ObsidianEditor, CalloutTagDefinition, CheckboxTagDefinition, HtmlTagDefinition } from '../../interfaces';
```

Rename the existing `removeTag` body to `removeHtmlTag`, then add overloads:

```typescript
function isObsidianEditor(input: unknown): input is ObsidianEditor {
  return typeof (input as ObsidianEditor).getCursor === 'function';
}

export function removeTag(context: StylingContext, tagDefinition: HtmlTagDefinition): StylingResult;
export function removeTag(editor: ObsidianEditor, tagDefinition: CalloutTagDefinition | CheckboxTagDefinition): void;
export function removeTag(
  input: StylingContext | ObsidianEditor,
  tagDefinition: TagDefinition
): StylingResult | void {
  if (isObsidianEditor(input)) {
    if (tagDefinition.kind === 'callout') {
      // When calloutTitle is provided, remove that specific named callout.
      // When omitted, remove whichever callout is innermost at the cursor.
      if (tagDefinition.calloutTitle) {
        removeCalloutByKey(input, tagDefinition.calloutTitle);
      } else {
        removeActiveCallout(input);
      }
      return;
    }
    if (tagDefinition.kind === 'checkbox') {
      removeActiveCheckbox(input);
      return;
    }
    return;
  }
  return removeHtmlTag(input, tagDefinition as HtmlTagDefinition);
}

function removeHtmlTag(context: StylingContext, tagDefinition: HtmlTagDefinition): StylingResult {
  // [paste the full existing removeTag body here unchanged]
}
```

Note: `removeAllTags` does not need an editor overload — it removes HTML formatting tags only; there is no block-level equivalent.

- [ ] **Step 3: Run the tests**

```
cmd /c "node_modules\.bin\jest TagRemove --no-coverage 2>&1"
```

Expected: all pass.

- [ ] **Step 4: Commit**

```
git add src/shared/editor/styling-engine/public-api/tag-remove/TagRemove.ts
git add src/shared/editor/styling-engine/public-api/tag-remove/TagRemove.test.ts
git commit -m "feat: add editor overload to removeTag for callout and checkbox dispatch"
```

---

## Task 4: Add editor overload to `toggleTag`

**Files:**
- Modify: `src/shared/editor/styling-engine/public-api/tag-toggle/TagToggle.ts`
- Modify: `src/shared/editor/styling-engine/public-api/tag-toggle/TagToggle.test.ts`

- [ ] **Step 1: Write failing tests**

Add at bottom of `TagToggle.test.ts`:

```typescript
jest.mock('../../callout-apply/helpers/toggle-inline-todo-tag/ToggleInlineTodoTag', () => ({
  toggleInlineTodoTag: jest.fn(),
}));

describe('toggleTag — editor overload', () => {
  const mockToggleInlineTodoTag = toggleInlineTodoTag as jest.Mock;

  beforeEach(() => jest.clearAllMocks());

  function buildMockEditor() {
    return {
      getCursor: jest.fn().mockReturnValue({ line: 0, ch: 0 }),
      getLine: jest.fn().mockReturnValue(''),
      setLine: jest.fn(),
      getSelection: jest.fn().mockReturnValue(''),
      replaceSelection: jest.fn(),
    };
  }

  it('calls toggleInlineTodoTag when kind is inline-todo', () => {
    const editor = buildMockEditor();
    toggleTag(editor as any, { kind: 'inline-todo' });
    expect(mockToggleInlineTodoTag).toHaveBeenCalledWith(editor);
  });
});
```

Run: `cmd /c "node_modules\.bin\jest TagToggle --no-coverage 2>&1"` — expected: new test FAILS.

- [ ] **Step 2: Add the editor overload to `TagToggle.ts`**

Add import at top of `TagToggle.ts`:

```typescript
import { toggleInlineTodoTag } from '../../callout-apply/helpers/toggle-inline-todo-tag/ToggleInlineTodoTag';
import type { ObsidianEditor, InlineTodoTagDefinition, HtmlTagDefinition } from '../../interfaces';
```

Rename the existing body to `toggleHtmlTag`, add overloads:

```typescript
function isObsidianEditor(input: unknown): input is ObsidianEditor {
  return typeof (input as ObsidianEditor).getCursor === 'function';
}

export function toggleTag(context: StylingContext, tagDefinition: HtmlTagDefinition): StylingResult;
export function toggleTag(editor: ObsidianEditor, tagDefinition: InlineTodoTagDefinition): void;
export function toggleTag(
  input: StylingContext | ObsidianEditor,
  tagDefinition: TagDefinition
): StylingResult | void {
  if (isObsidianEditor(input)) {
    if (tagDefinition.kind === 'inline-todo') {
      toggleInlineTodoTag(input);
      return;
    }
    return;
  }
  return toggleHtmlTag(input, tagDefinition as HtmlTagDefinition);
}

function toggleHtmlTag(context: StylingContext, tagDefinition: HtmlTagDefinition): StylingResult {
  // [paste the full existing toggleTag body here unchanged]
}
```

- [ ] **Step 3: Run the tests**

```
cmd /c "node_modules\.bin\jest TagToggle --no-coverage 2>&1"
```

Expected: all pass.

- [ ] **Step 4: Commit**

```
git add src/shared/editor/styling-engine/public-api/tag-toggle/TagToggle.ts
git add src/shared/editor/styling-engine/public-api/tag-toggle/TagToggle.test.ts
git commit -m "feat: add editor overload to toggleTag for inline-todo dispatch"
```

---

## Task 5: Remove callout re-exports from `PublicApi.ts`

**Files:**
- Modify: `src/shared/editor/styling-engine/public-api/PublicApi.ts`

- [ ] **Step 1: Remove the six callout lines**

Current file:
```typescript
export { toggleTag } from './tag-toggle/TagToggle';
export { addTag } from './tag-add/TagAdd';
export { removeTag, removeAllTags } from './tag-remove/TagRemove';
export { copyFormat } from './copy-format/CopyFormat';
export { applyCallout, applyTask } from '../callout-apply/calloutApply';
export { removeActiveCallout as removeInnermostCallout } from '../callout-apply/helpers/remove-active-callout/RemoveActiveCallout';
export { removeCalloutByKey } from '../callout-apply/helpers/remove-callout-by-key/RemoveCalloutByKey';
export { removeActiveCheckbox as removeCheckbox } from '../callout-apply/helpers/remove-active-checkbox/RemoveActiveCheckbox';
export { toggleInlineTodoTag as toggleInlineTodo } from '../callout-apply/helpers/toggle-inline-todo-tag/ToggleInlineTodoTag';
```

Replace with:
```typescript
export { toggleTag } from './tag-toggle/TagToggle';
export { addTag } from './tag-add/TagAdd';
export { removeTag, removeAllTags } from './tag-remove/TagRemove';
export { copyFormat } from './copy-format/CopyFormat';
```

- [ ] **Step 2: Type check to see which consumers break**

```
cmd /c "node_modules\.bin\tsc --noEmit 2>&1"
```

Expected: errors in `UseTagHandlers.ts` and `helpers.ts` (they import the now-removed callout functions). These are fixed in Tasks 6 and 7. Note the exact error lines — do NOT fix them yet.

- [ ] **Step 3: Commit just this file**

```
git add src/shared/editor/styling-engine/public-api/PublicApi.ts
git commit -m "refactor: remove callout re-exports from PublicApi — now dispatched through addTag/removeTag/toggleTag"
```

---

## Task 6: Update `UseTagHandlers.ts`

**Files:**
- Modify: `src/tabs/home/tags/use-tag-handlers/UseTagHandlers.ts`
- Modify: `src/tabs/home/tags/use-tag-handlers/UseTagHandlers.test.ts`

- [ ] **Step 1: Update `UseTagHandlers.ts` imports and call sites**

Replace the import block:
```typescript
import {
  applyCallout,
  applyTask,
  removeCalloutByKey,
  toggleInlineTodo,
} from '../../../../shared/editor/styling-engine/stylingEngine';
```

With:
```typescript
import {
  addTag,
  removeTag,
  toggleTag,
} from '../../../../shared/editor/styling-engine/stylingEngine';
```

Replace each call site:

| Old call | New call |
|----------|----------|
| `applyCallout(editor, 'important', 'Important')` | `addTag(editor, { kind: 'callout', calloutType: 'important', calloutTitle: 'Important' })` |
| `removeCalloutByKey(editor, 'Important')` | `removeTag(editor, { kind: 'callout', calloutTitle: 'Important' })` |
| `applyCallout(editor, 'question', 'Question')` | `addTag(editor, { kind: 'callout', calloutType: 'question', calloutTitle: 'Question' })` |
| `removeCalloutByKey(editor, 'Question')` | `removeTag(editor, { kind: 'callout', calloutTitle: 'Question' })` |
| `applyTask(editor, '')` | `addTag(editor, { kind: 'task', taskPrefix: '' })` |
| `toggleInlineTodo(editor)` | `toggleTag(editor, { kind: 'inline-todo' })` |

- [ ] **Step 2: Update `UseTagHandlers.test.ts` mocks**

Find the current mock:
```typescript
jest.mock('../../../../shared/editor/styling-engine/stylingEngine', () => ({
  applyCallout: (...args: unknown[]) => applyCalloutMock(...args),
  applyTask: (...args: unknown[]) => applyTaskMock(...args),
  removeCalloutByKey: (...args: unknown[]) => removeCalloutByKeyMock(...args),
  removeCheckbox: (...args: unknown[]) => removeCheckboxMock(...args),
  toggleInlineTodo: (...args: unknown[]) => toggleInlineTodoMock(...args),
}));
```

Replace the mock variables and mock block:
```typescript
const addTagMock = jest.fn();
const removeTagMock = jest.fn();
const toggleTagMock = jest.fn();

jest.mock('../../../../shared/editor/styling-engine/stylingEngine', () => ({
  addTag: (...args: unknown[]) => addTagMock(...args),
  removeTag: (...args: unknown[]) => removeTagMock(...args),
  toggleTag: (...args: unknown[]) => toggleTagMock(...args),
}));
```

Update any `expect(applyCalloutMock)...` assertions to `expect(addTagMock).toHaveBeenCalledWith(editor, { kind: 'callout', calloutType: 'important', calloutTitle: 'Important' })` etc.

- [ ] **Step 3: Run the tests**

```
cmd /c "node_modules\.bin\jest UseTagHandlers --no-coverage 2>&1"
```

Expected: all pass.

- [ ] **Step 4: Commit**

```
git add src/tabs/home/tags/use-tag-handlers/UseTagHandlers.ts
git add src/tabs/home/tags/use-tag-handlers/UseTagHandlers.test.ts
git commit -m "refactor: replace direct callout imports in UseTagHandlers with addTag/removeTag/toggleTag"
```

---

## Task 7: Update `helpers.ts` (selectTagFromDropdown)

**Files:**
- Modify: `src/tabs/home/tags/use-tag-handlers/helpers.ts`
- Modify: `src/tabs/home/tags/use-tag-handlers/helpers.test.ts`

- [ ] **Step 1: Update `helpers.ts` imports and call sites**

Replace the import block:
```typescript
import {
  applyCallout,
  applyTask,
  removeInnermostCallout,
  removeCalloutByKey,
} from '../../../../shared/editor/styling-engine/stylingEngine';
```

With:
```typescript
import {
  addTag,
  removeTag,
} from '../../../../shared/editor/styling-engine/stylingEngine';
```

Update each call site in `selectTagFromDropdown`:

| Old call | New call |
|----------|----------|
| `removeInnermostCallout(editor)` | `removeTag(editor, { kind: 'callout' })` |
| `removeCalloutByKey(editor, calloutKey)` | `removeTag(editor, { kind: 'callout', calloutTitle: calloutKey })` |
| `applyCallout(editor, calloutType, calloutTitle)` | `addTag(editor, { kind: 'callout', calloutType, calloutTitle })` |
| `applyTask(editor, taskPrefix)` | `addTag(editor, { kind: 'task', taskPrefix })` |
| `applyTask(editor, taskPrefix)` (second occurrence in re-apply branch) | `addTag(editor, { kind: 'task', taskPrefix })` |

- [ ] **Step 2: Update `helpers.test.ts` mocks**

Find:
```typescript
jest.mock('../../../../shared/editor/styling-engine/stylingEngine', () => ({
  applyCallout: (...args: unknown[]) => applyCalloutMock(...args),
  applyTask: (...args: unknown[]) => applyTaskMock(...args),
  removeInnermostCallout: (...args: unknown[]) => removeInnermostCalloutMock(...args),
  removeCalloutByKey: (...args: unknown[]) => removeCalloutByKeyMock(...args),
  removeCheckbox: (...args: unknown[]) => removeCheckboxMock(...args),
}));
```

Replace with:
```typescript
const addTagMock = jest.fn();
const removeTagMock = jest.fn();

jest.mock('../../../../shared/editor/styling-engine/stylingEngine', () => ({
  addTag: (...args: unknown[]) => addTagMock(...args),
  removeTag: (...args: unknown[]) => removeTagMock(...args),
}));
```

Update all `expect(applyCalloutMock)...`, `expect(removeCalloutByKeyMock)...` etc. assertions to use `addTagMock`/`removeTagMock` with the correct tag definition shape.

Example assertion updates:
```typescript
// Old:
expect(applyCalloutMock).toHaveBeenCalledWith(editor, 'important', 'Important');
// New:
expect(addTagMock).toHaveBeenCalledWith(editor, { kind: 'callout', calloutType: 'important', calloutTitle: 'Important' });

// Old:
expect(removeInnermostCalloutMock).toHaveBeenCalledWith(editor);
// New:
expect(removeTagMock).toHaveBeenCalledWith(editor, { kind: 'callout' });

// Old:
expect(removeCalloutByKeyMock).toHaveBeenCalledWith(editor, 'Important');
// New:
expect(removeTagMock).toHaveBeenCalledWith(editor, { kind: 'callout', calloutTitle: 'Important' });

// Old:
expect(applyTaskMock).toHaveBeenCalledWith(editor, 'Todo:');
// New:
expect(addTagMock).toHaveBeenCalledWith(editor, { kind: 'task', taskPrefix: 'Todo:' });
```

- [ ] **Step 3: Run the tests**

```
cmd /c "node_modules\.bin\jest helpers --no-coverage 2>&1"
```

Expected: all pass.

- [ ] **Step 4: Commit**

```
git add src/tabs/home/tags/use-tag-handlers/helpers.ts
git add src/tabs/home/tags/use-tag-handlers/helpers.test.ts
git commit -m "refactor: replace direct callout imports in selectTagFromDropdown with addTag/removeTag"
```

---

## Task 8: Simplify `editor-integration/helpers.ts`

**Files:**
- Modify: `src/shared/editor/styling-engine/editor-integration/helpers.ts`

Now that `addTag(editor, tagDef)` handles everything, `addTagInEditor` etc. can delegate directly instead of building context themselves.

- [ ] **Step 1: Update `addTagInEditor`, `removeTagInEditor`, `toggleTagInEditor`**

Replace each function body:

```typescript
export function addTagInEditor(editor: ObsidianEditor, tagDefinition: HtmlTagDefinition): void {
  // Delegates to the unified addTag overload; context is built internally for HTML kinds.
  addTag(editor, tagDefinition);
}

export function removeTagInEditor(editor: ObsidianEditor, tagDefinition: HtmlTagDefinition): void {
  removeTag(editor, tagDefinition);
}

export function toggleTagInEditor(editor: ObsidianEditor, tagDefinition: HtmlTagDefinition): void {
  toggleTag(editor, tagDefinition);
}
```

`removeAllTagsInEditor` and `copyFormatInEditor` remain unchanged (no block-level equivalents).

- [ ] **Step 2: Run the full test suite**

```
cmd /c "node_modules\.bin\jest --no-coverage 2>&1"
```

Expected: all suites pass.

- [ ] **Step 3: Type check**

```
cmd /c "node_modules\.bin\tsc --noEmit 2>&1"
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```
git add src/shared/editor/styling-engine/editor-integration/helpers.ts
git commit -m "refactor: simplify editor-integration helpers to delegate to unified addTag/removeTag/toggleTag overloads"
```

---

## Task 9: Final verification

- [ ] **Step 1: Run full Jest suite**

```
cmd /c "node_modules\.bin\jest --no-coverage 2>&1"
```

Expected: all suites pass, ≥1588 tests.

- [ ] **Step 2: Build**

```
cmd /c "node esbuild.config.mjs 2>&1 && echo BUILD_OK"
```

Expected: `BUILD_OK`.

- [ ] **Step 3: Verify in Obsidian MCP**

Open Obsidian. Set editor content:
```
> [!important] Important
>> [!question] Question
>> - [ ] 
```
Place cursor on line 2. Confirm Important and Question buttons show active (checked indicator).

Click the Important button. Confirm the `> [!important] Important` wrapper is removed.

- [ ] **Step 4: Lint**

```
cmd /c "node_modules\.bin\eslint src/shared/editor/styling-engine/public-api/tag-add/TagAdd.ts src/shared/editor/styling-engine/public-api/tag-remove/TagRemove.ts src/shared/editor/styling-engine/public-api/tag-toggle/TagToggle.ts src/tabs/home/tags/use-tag-handlers/UseTagHandlers.ts src/tabs/home/tags/use-tag-handlers/helpers.ts 2>&1"
```

Expected: no output (no errors).

- [ ] **Step 5: Final commit**

```
git add -A
git commit -m "refactor: unify callout/task/checkbox API through addTag/removeTag/toggleTag — stylingEngine exports 5 functions only"
```

---

## Self-Review

**Spec coverage:**
- ✅ `stylingEngine.ts` exports only 5 functions after Task 5
- ✅ Callout operations (`applyCallout`, `applyTask`) route through `addTag`
- ✅ Callout removal (`removeInnermostCallout`, `removeCalloutByKey`, `removeCheckbox`) routes through `removeTag`
- ✅ Inline todo toggle routes through `toggleTag`
- ✅ Existing HTML tag callers are unaffected (no breaking API changes)
- ✅ All new dispatch paths have unit tests

**Placeholder scan:** All steps have exact code. No TBDs.

**Type consistency:**
- `HtmlTagDefinition` used consistently in `addHtmlTag`, `removeHtmlTag`, `toggleHtmlTag` internal helpers
- `CalloutTagDefinition`, `TaskTagDefinition`, `CheckboxTagDefinition`, `InlineTodoTagDefinition` used in overload signatures
- `TagDefinition` (the union) used in the implementation signatures
