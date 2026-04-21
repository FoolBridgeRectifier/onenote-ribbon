# Callout Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix nested callout detection (all parent callouts show checked), add `removeCalloutByKey`, rename `tag-apply/` → `callout-apply/`, expose callout ops through `stylingEngine`, and move `useTagHandlers` to the tags UI layer.

**Architecture:** Internal callout operations (`applyCallout`, `applyTask`, `removeInnermostCallout`, `removeCalloutByKey`, `removeCheckbox`, `toggleInlineTodo`) are implemented inside `styling-engine/callout-apply/`, exported through `public-api/PublicApi.ts` and the single `stylingEngine.ts` entry point. `useTagHandlers` is relocated from `shared/editor/enclosing-html-tags/` to `tabs/home/tags/` and imports exclusively from `stylingEngine`. The HTML tag styling engine (`removeTag`, `toggleTag`, etc.) is unaffected.

**Tech Stack:** TypeScript, React hooks, Jest + RTL, Obsidian Editor API.

---

## File Map

| Action | Path |
|---|---|
| Modify | `src/shared/editor/styling-engine/tag-apply/helpers/detect-active-tag-keys/DetectActiveTagKeys.ts` |
| Modify | `src/shared/editor/styling-engine/tag-apply/detectActiveCallout.test.ts` |
| Create | `src/shared/editor/styling-engine/tag-apply/helpers/remove-callout-by-key/RemoveCalloutByKey.ts` |
| Create | `src/shared/editor/styling-engine/tag-apply/helpers/remove-callout-by-key/RemoveCalloutByKey.test.ts` |
| Modify | `src/shared/editor/styling-engine/tag-apply/helpers.ts` |
| Rename folder | `tag-apply/` → `callout-apply/` |
| Rename file | `TagApply.ts` → `calloutApply.ts` (split into `applyCallout` + `applyTask`) |
| Rename file | `applyTag.test.ts` → `calloutApply.test.ts` |
| Modify | `src/shared/editor/styling-engine/callout-apply/interfaces.ts` (remove `highlight`) |
| Modify | `src/shared/editor/styling-engine/public-api/PublicApi.ts` |
| Modify | `src/shared/editor/styling-engine/stylingEngine.ts` |
| Create | `src/tabs/home/tags/use-tag-handlers/UseTagHandlers.ts` |
| Create | `src/tabs/home/tags/use-tag-handlers/helpers.ts` |
| Create | `src/tabs/home/tags/use-tag-handlers/interfaces.ts` |
| Create | `src/tabs/home/tags/use-tag-handlers/constants.ts` |
| Create | `src/tabs/home/tags/use-tag-handlers/UseTagHandlers.test.ts` |
| Create | `src/tabs/home/tags/use-tag-handlers/helpers.test.ts` |
| Modify | `src/tabs/home/tags/Tags.tsx` |
| Modify | `src/tabs/home/tags/interfaces.ts` (remove `highlight` from `TagAction`) |
| Modify | `src/shared/editor/enclosing-html-tags/use-active-tag-keys/useActiveTagKeys.ts` |
| Modify | `src/shared/hooks/editorStateHelpers.ts` |
| Delete | `src/shared/editor/enclosing-html-tags/use-tag-handlers/` (all files) |

---

## Task 1: Fix nested callout detection — all parent callouts tick

**Files:**
- Modify: `src/shared/editor/styling-engine/tag-apply/helpers/detect-active-tag-keys/DetectActiveTagKeys.ts`
- Modify: `src/shared/editor/styling-engine/tag-apply/detectActiveCallout.test.ts`

- [ ] **Step 1: Write failing tests for nested parent detection**

Add at the end of `detectActiveCallout.test.ts` (after existing tests):

```ts
describe('detectActiveTagKeys — nested callout detection (all parents)', () => {
  it('detects both inner and outer callout when cursor is in nested block', () => {
    const editor = new MockEditor();
    // Outer: > [!important] Important, inner: >> [!question] Question
    editor.setValue('> [!important] Important\n>> [!question] Question\n>> body');
    editor.setCursor({ line: 2, ch: 0 });

    const result = detectActiveTagKeys(editor as any);

    expect(result.has('Question')).toBe(true);
    expect(result.has('Important')).toBe(true);
  });

  it('detects only one callout when cursor is in single-level callout', () => {
    const editor = new MockEditor();
    editor.setValue('> [!important] Important\n> body');
    editor.setCursor({ line: 1, ch: 0 });

    const result = detectActiveTagKeys(editor as any);

    expect(result.has('Important')).toBe(true);
    expect(result.size).toBe(1);
  });

  it('detects three levels of nesting', () => {
    const editor = new MockEditor();
    editor.setValue(
      '> [!important] Important\n' +
      '>> [!question] Question\n' +
      '>>> [!note] Note\n' +
      '>>> deepest body'
    );
    editor.setCursor({ line: 3, ch: 0 });

    const result = detectActiveTagKeys(editor as any);

    expect(result.has('Note')).toBe(true);
    expect(result.has('Question')).toBe(true);
    expect(result.has('Important')).toBe(true);
  });

  it('does NOT add sibling callout at the same depth', () => {
    const editor = new MockEditor();
    // Two sibling callouts — cursor in second one
    editor.setValue('> [!important] Important\n> body\n> [!question] Question\n> q-body');
    editor.setCursor({ line: 3, ch: 0 });

    const result = detectActiveTagKeys(editor as any);

    expect(result.has('Question')).toBe(true);
    expect(result.has('Important')).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to confirm failure**

```
npm test -- --testPathPattern="detectActiveCallout" --no-coverage
```

Expected: FAIL — "Expected 'Important' to be true" (only innermost is detected).

- [ ] **Step 3: Fix `DetectActiveTagKeys.ts`**

Replace the entire file content:

```ts
import type { Editor } from 'obsidian';

import {
  ACTIVE_TAG_KEY_HIGHLIGHT,
  ACTIVE_TAG_KEY_TASK,
  TASK_LINE_PATTERN,
  HIGHLIGHT_PATTERN,
  CALLOUT_HEADER_WITH_TITLE_PATTERN,
  TASK_PREFIX_PATTERN,
  LEADING_BLOCKQUOTE_SEGMENTS_PATTERN,
} from '../../constants';

function countBlockquoteDepth(lineText: string): number {
  const prefixMatch = lineText.match(LEADING_BLOCKQUOTE_SEGMENTS_PATTERN);
  if (!prefixMatch) return 0;
  return prefixMatch[0].split('>').length - 1;
}

/**
 * Detects which OneNote-style tag types are currently active at the editor cursor.
 * Returns a Set of active tag keys (task, highlight, and ALL enclosing callout titles/types).
 */
export function detectActiveTagKeys(editor: Editor | null): Set<string> {
  const activeKeys = new Set<string>();

  if (!editor) return activeKeys;

  const cursor = editor.getCursor();
  const currentLine = editor.getLine(cursor.line);

  // Strip one leading "> " so task and highlight patterns work inside callout blocks
  const lineContent = currentLine.replace(/^>\s?/, '');

  if (TASK_LINE_PATTERN.test(lineContent)) {
    activeKeys.add(ACTIVE_TAG_KEY_TASK);
    const prefixMatch = lineContent.match(TASK_PREFIX_PATTERN);
    if (prefixMatch) {
      activeKeys.add(`task-prefix:${prefixMatch[1].trim()}`);
    }
  }

  if (HIGHLIGHT_PATTERN.test(lineContent)) {
    activeKeys.add(ACTIVE_TAG_KEY_HIGHLIGHT);
  }

  if (!currentLine.startsWith('>')) return activeKeys;

  // Scan upward from cursor, collecting every enclosing callout header at decreasing depths.
  // Each time a shallower header is found, it is an outer parent callout — add it too.
  let previouslyFoundDepth = Infinity;

  for (let lineIndex = cursor.line; lineIndex >= 0; lineIndex -= 1) {
    const lineText = editor.getLine(lineIndex);

    if (!lineText.startsWith('>')) break;

    const calloutHeaderMatch = lineText.match(CALLOUT_HEADER_WITH_TITLE_PATTERN);
    if (!calloutHeaderMatch) continue;

    const headerDepth = countBlockquoteDepth(lineText);

    // Skip headers at the same depth or deeper — they are siblings or inner children
    if (headerDepth >= previouslyFoundDepth) continue;

    const calloutType = calloutHeaderMatch[2].toLowerCase();
    const calloutTitle = calloutHeaderMatch[3]?.trim();

    activeKeys.add(calloutTitle ?? calloutType);
    previouslyFoundDepth = headerDepth;
  }

  return activeKeys;
}
```

- [ ] **Step 4: Run test to confirm pass**

```
npm test -- --testPathPattern="detectActiveCallout" --no-coverage
```

Expected: PASS all.

- [ ] **Step 5: Commit**

```
git add src/shared/editor/styling-engine/tag-apply/helpers/detect-active-tag-keys/DetectActiveTagKeys.ts
git add src/shared/editor/styling-engine/tag-apply/detectActiveCallout.test.ts
git commit -m "fix: detect all parent callout levels in detectActiveTagKeys"
```

---

## Task 2: Add `removeCalloutByKey`

**Files:**
- Create: `src/shared/editor/styling-engine/tag-apply/helpers/remove-callout-by-key/RemoveCalloutByKey.ts`
- Create: `src/shared/editor/styling-engine/tag-apply/helpers/remove-callout-by-key/RemoveCalloutByKey.test.ts`
- Modify: `src/shared/editor/styling-engine/tag-apply/helpers.ts`

- [ ] **Step 1: Write failing test**

Create `src/shared/editor/styling-engine/tag-apply/helpers/remove-callout-by-key/RemoveCalloutByKey.test.ts`:

```ts
import { removeCalloutByKey } from './RemoveCalloutByKey';
import { MockEditor } from '../../../../../../test-utils/MockEditor';

describe('removeCalloutByKey — no-op cases', () => {
  it('does nothing when cursor is not inside a callout', () => {
    const editor = new MockEditor();
    editor.setValue('Normal paragraph');
    editor.setCursor({ line: 0, ch: 0 });

    removeCalloutByKey(editor as any, 'Important');

    expect(editor.getValue()).toBe('Normal paragraph');
  });

  it('does nothing when the named callout is not found', () => {
    const editor = new MockEditor();
    editor.setValue('> [!question] Question\n> body');
    editor.setCursor({ line: 1, ch: 0 });

    removeCalloutByKey(editor as any, 'Important');

    expect(editor.getValue()).toBe('> [!question] Question\n> body');
  });
});

describe('removeCalloutByKey — single level', () => {
  it('removes the named callout and unwraps its content', () => {
    const editor = new MockEditor();
    editor.setValue('> [!important] Important\n> body text');
    editor.setCursor({ line: 1, ch: 0 });

    removeCalloutByKey(editor as any, 'Important');

    expect(editor.getValue()).toBe('body text');
  });

  it('matches by callout title (case-sensitive)', () => {
    const editor = new MockEditor();
    editor.setValue('> [!note] Remember for later\n> content');
    editor.setCursor({ line: 1, ch: 0 });

    removeCalloutByKey(editor as any, 'Remember for later');

    expect(editor.getValue()).toBe('content');
  });
});

describe('removeCalloutByKey — nested callouts', () => {
  it('removes the outer callout by key, leaving inner intact (stripped one level)', () => {
    const editor = new MockEditor();
    editor.setValue(
      '> [!important] Important\n' +
      '>> [!question] Question\n' +
      '>> question body'
    );
    editor.setCursor({ line: 2, ch: 0 });

    removeCalloutByKey(editor as any, 'Important');

    // Outer callout header removed; inner lines stripped one ">"
    expect(editor.getValue()).toBe('> [!question] Question\n> question body');
  });

  it('removes the inner callout by key, leaving outer intact', () => {
    const editor = new MockEditor();
    editor.setValue(
      '> [!important] Important\n' +
      '>> [!question] Question\n' +
      '>> question body'
    );
    editor.setCursor({ line: 2, ch: 0 });

    removeCalloutByKey(editor as any, 'Question');

    // Inner callout header removed; body stripped one ">" (still inside outer)
    expect(editor.getValue()).toBe('> [!important] Important\n> question body');
  });
});
```

- [ ] **Step 2: Run test to confirm failure**

```
npm test -- --testPathPattern="RemoveCalloutByKey" --no-coverage
```

Expected: FAIL — "Cannot find module".

- [ ] **Step 3: Implement `RemoveCalloutByKey.ts`**

Create `src/shared/editor/styling-engine/tag-apply/helpers/remove-callout-by-key/RemoveCalloutByKey.ts`:

```ts
import type { Editor } from 'obsidian';

import {
  CALLOUT_HEADER_LINE_PATTERN,
  CALLOUT_HEADER_WITH_TITLE_PATTERN,
  BLOCKQUOTE_PREFIX_PATTERN,
  LEADING_BLOCKQUOTE_SEGMENTS_PATTERN,
} from '../../constants';

function countBlockquoteDepth(lineText: string): number {
  const prefixMatch = lineText.match(LEADING_BLOCKQUOTE_SEGMENTS_PATTERN);
  if (!prefixMatch) return 0;
  return prefixMatch[0].split('>').length - 1;
}

/**
 * Removes the specific callout block whose title or type matches `calloutKey`.
 * Unlike removeInnermostCallout, this targets a named callout regardless of nesting depth.
 * Body lines are unwrapped one level (one ">" prefix stripped) so nested content is preserved.
 */
export function removeCalloutByKey(editor: Editor, calloutKey: string): void {
  const cursor = editor.getCursor();
  const currentLine = editor.getLine(cursor.line);

  if (!currentLine.startsWith('>')) return;

  // Walk upward from cursor to find the callout header matching calloutKey
  let headerLineIndex = -1;
  let headerDepth = 0;

  for (let lineIndex = cursor.line; lineIndex >= 0; lineIndex -= 1) {
    const lineText = editor.getLine(lineIndex);

    if (!lineText.startsWith('>')) break;

    const headerMatch = lineText.match(CALLOUT_HEADER_WITH_TITLE_PATTERN);
    if (!headerMatch) continue;

    const calloutType = headerMatch[2].toLowerCase();
    const calloutTitle = headerMatch[3]?.trim();
    // Accept match on title (preferred) or on lowercased type
    const matchedKey = calloutTitle ?? calloutType;
    const matchesKey = matchedKey === calloutKey || calloutType === calloutKey.toLowerCase();

    if (matchesKey) {
      headerLineIndex = lineIndex;
      headerDepth = countBlockquoteDepth(lineText);
      break;
    }
  }

  if (headerLineIndex === -1) return;

  // Walk forward from the matched header to find the full extent of this callout block
  let endLine = headerLineIndex;
  while (endLine < editor.lastLine()) {
    const nextLine = editor.getLine(endLine + 1);
    if (!nextLine.startsWith('>')) break;
    const nextDepth = countBlockquoteDepth(nextLine);
    // Stop at a shallower line (we have left the block) or a sibling header at same depth
    if (nextDepth < headerDepth) break;
    if (CALLOUT_HEADER_LINE_PATTERN.test(nextLine) && nextDepth === headerDepth) break;
    endLine += 1;
  }

  // Build replacement: drop the header, strip one ">" level from body lines
  const strippedLines: string[] = [];
  for (let lineIndex = headerLineIndex; lineIndex <= endLine; lineIndex += 1) {
    const lineText = editor.getLine(lineIndex);
    // Skip only the matched callout header line
    if (lineIndex === headerLineIndex && CALLOUT_HEADER_LINE_PATTERN.test(lineText)) continue;
    strippedLines.push(lineText.replace(BLOCKQUOTE_PREFIX_PATTERN, ''));
  }

  editor.replaceRange(
    strippedLines.join('\n'),
    { line: headerLineIndex, ch: 0 },
    { line: endLine, ch: editor.getLine(endLine).length }
  );
}
```

- [ ] **Step 4: Export from `helpers.ts`**

In `src/shared/editor/styling-engine/tag-apply/helpers.ts`, add the new export:

```ts
export { detectActiveTagKeys } from './helpers/detect-active-tag-keys/DetectActiveTagKeys';
export { removeActiveCallout } from './helpers/remove-active-callout/RemoveActiveCallout';
export { removeActiveCheckbox } from './helpers/remove-active-checkbox/RemoveActiveCheckbox';
export { toggleInlineTodoTag } from './helpers/toggle-inline-todo-tag/ToggleInlineTodoTag';
export { removeCalloutByKey } from './helpers/remove-callout-by-key/RemoveCalloutByKey';
```

- [ ] **Step 5: Run tests to confirm pass**

```
npm test -- --testPathPattern="RemoveCalloutByKey" --no-coverage
```

Expected: PASS all.

- [ ] **Step 6: Commit**

```
git add src/shared/editor/styling-engine/tag-apply/helpers/remove-callout-by-key/
git add src/shared/editor/styling-engine/tag-apply/helpers.ts
git commit -m "feat: add removeCalloutByKey for targeted nested callout removal"
```

---

## Task 3: Rename `tag-apply/` → `callout-apply/`, split `applyTag` into `applyCallout` + `applyTask`

**Files:**
- Rename (via git mv): `tag-apply/` → `callout-apply/`
- Create (rename): `callout-apply/calloutApply.ts` (was `TagApply.ts`)
- Delete (rename): `callout-apply/TagApply.ts`
- Create (rename): `callout-apply/calloutApply.test.ts` (was `applyTag.test.ts`)
- Delete (rename): `callout-apply/applyTag.test.ts`
- Modify: `callout-apply/interfaces.ts`

- [ ] **Step 1: Rename folder and primary files**

```
cd "c:\Users\Dragus\Documents\Obsidian Vault\.obsidian\plugins\onenote-ribbon"
git mv src/shared/editor/styling-engine/tag-apply src/shared/editor/styling-engine/callout-apply
git mv src/shared/editor/styling-engine/callout-apply/TagApply.ts src/shared/editor/styling-engine/callout-apply/calloutApply.ts
git mv src/shared/editor/styling-engine/callout-apply/applyTag.test.ts src/shared/editor/styling-engine/callout-apply/calloutApply.test.ts
```

- [ ] **Step 2: Remove `highlight` from `TagAction` in `callout-apply/interfaces.ts`**

Replace file content:

```ts
/**
 * Describes how a callout tag transforms the current editor line.
 * `highlight` has been removed — use the HTML styling engine's toggleTag for ==text==.
 */
export type TagAction =
  | { type: 'command'; commandId: string }
  | {
      type: 'callout';
      calloutType: string;
      /** Optional title text written after [!type] and used for cursor detection. */
      calloutTitle?: string;
    }
  | { type: 'task'; taskPrefix: string };

/** Match result for a #todo tag at cursor position within a line. */
export interface TodoTagMatch {
  startIndex: number;
  endIndex: number;
}
```

- [ ] **Step 3: Replace `calloutApply.ts` with split functions**

Replace the entire content of `src/shared/editor/styling-engine/callout-apply/calloutApply.ts`:

```ts
import type { Editor } from 'obsidian';

import {
  CALLOUT_HEADER_WITH_TITLE_PATTERN,
  LEADING_BLOCKQUOTE_SEGMENTS_PATTERN,
  TASK_LINE_WITH_CONTENT_PATTERN,
  TASK_CONTENT_PREFIX_PATTERN,
} from './constants';

function getBlockquoteDepth(lineText: string): number {
  const prefixMatch = lineText.match(LEADING_BLOCKQUOTE_SEGMENTS_PATTERN);
  if (!prefixMatch) return 0;
  return prefixMatch[0].split('>').length - 1;
}

function stripLeadingBlockquoteSegments(lineText: string): string {
  return lineText.replace(LEADING_BLOCKQUOTE_SEGMENTS_PATTERN, '').trimStart();
}

function stripTaskPrefix(taskContent: string): string {
  const prefixMatch = taskContent.match(TASK_CONTENT_PREFIX_PATTERN);
  if (!prefixMatch) return taskContent;
  return prefixMatch[2];
}

/**
 * Wraps the cursor line in an Obsidian callout block.
 * If the line is already inside a callout, nests the new callout one level deeper.
 */
export function applyCallout(editor: Editor, calloutType: string, calloutTitle?: string): void {
  const cursor = editor.getCursor();
  const lineContent = editor.getLine(cursor.line);

  const currentDepth = getBlockquoteDepth(lineContent);
  const nestedDepth = currentDepth > 0 ? currentDepth + 1 : 1;
  const nestedPrefix = '>'.repeat(nestedDepth);

  const bodyContent =
    currentDepth > 0 ? stripLeadingBlockquoteSegments(lineContent) : lineContent;

  const titleSegment = calloutTitle ? ` ${calloutTitle}` : '';
  editor.setLine(
    cursor.line,
    `${nestedPrefix} [!${calloutType}]${titleSegment}\n${nestedPrefix} ${bodyContent}`
  );
}

/**
 * Converts the cursor line into a Markdown task list item with the given prefix.
 * Handles cursor-in-callout-title extraction and re-stamping of existing task lines.
 */
export function applyTask(editor: Editor, taskPrefix: string): void {
  const cursor = editor.getCursor();
  const lineContent = editor.getLine(cursor.line);
  const prefixSegment = taskPrefix ? `${taskPrefix} ` : '';

  const calloutHeaderMatch = lineContent.match(CALLOUT_HEADER_WITH_TITLE_PATTERN);
  if (calloutHeaderMatch) {
    const headerWithoutTitle = calloutHeaderMatch[1];
    const calloutTitle = calloutHeaderMatch[3]?.trim() ?? '';
    const titleStartIndex = lineContent.indexOf(calloutTitle);
    const cursorIsInCalloutTitle =
      calloutTitle.length > 0 &&
      titleStartIndex >= 0 &&
      cursor.ch >= titleStartIndex &&
      cursor.ch <= lineContent.length;

    if (cursorIsInCalloutTitle) {
      editor.setLine(cursor.line, `- [ ] ${prefixSegment}${calloutTitle}\n${headerWithoutTitle}`);
      return;
    }
  }

  const existingTaskMatch = lineContent.match(TASK_LINE_WITH_CONTENT_PATTERN);
  if (existingTaskMatch) {
    const blockquotePrefix = existingTaskMatch[1];
    const indentation = existingTaskMatch[2];
    const existingTaskContent = existingTaskMatch[3];
    const contentWithoutTaskPrefix = stripTaskPrefix(existingTaskContent);

    editor.setLine(
      cursor.line,
      `${blockquotePrefix}${indentation}- [ ] ${prefixSegment}${contentWithoutTaskPrefix}`
    );
    return;
  }

  editor.setLine(cursor.line, `- [ ] ${prefixSegment}${lineContent}`);
}
```

- [ ] **Step 4: Update `calloutApply.test.ts` — replace `applyTag` with `applyCallout`/`applyTask`, remove highlight tests**

Replace the import line at top of `calloutApply.test.ts`:

```ts
// was: import { applyTag } from './TagApply';
import { applyCallout, applyTask } from './calloutApply';
import { MockEditor } from '../../../../test-utils/MockEditor';
```

Replace all `applyTag(editor as any, { type: 'callout', calloutType: 'X' }, mockExecuteCommand)` calls with `applyCallout(editor as any, 'X')`.

Replace all `applyTag(editor as any, { type: 'callout', calloutType: 'X', calloutTitle: 'Y' }, mockExecuteCommand)` with `applyCallout(editor as any, 'X', 'Y')`.

Replace all `applyTag(editor as any, { type: 'task', taskPrefix: 'X' }, mockExecuteCommand)` with `applyTask(editor as any, 'X')`.

Remove the `describe('applyTag — command action', ...)` block entirely (command dispatch is now handled by the hook directly, not by `applyCallout`/`applyTask`).

Remove the entire `describe('applyTag — highlight action', ...)` block.

Remove `const mockExecuteCommand = jest.fn();` declarations where they are no longer needed.

- [ ] **Step 5: Run tests to confirm no regressions**

```
npm test -- --testPathPattern="calloutApply" --no-coverage
```

Expected: PASS all remaining tests.

- [ ] **Step 6: Commit**

```
git add src/shared/editor/styling-engine/callout-apply/
git commit -m "refactor: rename tag-apply to callout-apply, split applyTag into applyCallout + applyTask"
```

---

## Task 4: Update `PublicApi.ts` and `stylingEngine.ts`

**Files:**
- Modify: `src/shared/editor/styling-engine/public-api/PublicApi.ts`
- Modify: `src/shared/editor/styling-engine/stylingEngine.ts`

- [ ] **Step 1: Update `PublicApi.ts`**

Replace the entire file:

```ts
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

- [ ] **Step 2: Update `stylingEngine.ts`**

Replace the entire file:

```ts
export {
  toggleTag,
  addTag,
  removeTag,
  removeAllTags,
  copyFormat,
  applyCallout,
  applyTask,
  removeInnermostCallout,
  removeCalloutByKey,
  removeCheckbox,
  toggleInlineTodo,
} from './public-api/PublicApi';
```

- [ ] **Step 3: Verify TypeScript compiles**

```
npx tsc --noEmit
```

Expected: 0 errors (may have errors from unchanged consumers still pointing to old paths — address in Task 6).

- [ ] **Step 4: Commit**

```
git add src/shared/editor/styling-engine/public-api/PublicApi.ts
git add src/shared/editor/styling-engine/stylingEngine.ts
git commit -m "feat: expose applyCallout, applyTask, removeInnermostCallout, removeCalloutByKey, removeCheckbox, toggleInlineTodo through stylingEngine"
```

---

## Task 5: Move `useTagHandlers` to `tabs/home/tags/use-tag-handlers/`

**Files:**
- Create: `src/tabs/home/tags/use-tag-handlers/interfaces.ts`
- Create: `src/tabs/home/tags/use-tag-handlers/constants.ts`
- Create: `src/tabs/home/tags/use-tag-handlers/helpers.ts`
- Create: `src/tabs/home/tags/use-tag-handlers/helpers.test.ts`
- Create: `src/tabs/home/tags/use-tag-handlers/UseTagHandlers.ts`
- Create: `src/tabs/home/tags/use-tag-handlers/UseTagHandlers.test.ts`

- [ ] **Step 1: Create `interfaces.ts`**

```ts
import type { App, Editor } from 'obsidian';
import type { CustomTag } from '../customize-modal/interfaces';
import type { TagDefinition } from '../interfaces';

/** Options passed to the useTagHandlers hook. */
export interface TagHandlersOptions {
  app: App;
  activeTagKeys: Set<string>;
  canRemoveTag: boolean;
  setMoreMenuOpen: (open: boolean) => void;
  setCustomizeModalOpen: (open: boolean) => void;
  setCustomTags: (tags: CustomTag[]) => void;
}

/** Return type of the useTagHandlers hook. */
export interface TagHandlers {
  handleTodo: () => void;
  handleImportant: () => void;
  handleQuestion: () => void;
  handleFindTags: () => void;
  handleToDoTag: () => void;
  handleCustomTagsChange: (updatedTags: CustomTag[]) => void;
  handleTagDropdownSelect: (tagDefinition: TagDefinition) => void;
}

/** Context passed to selectTagFromDropdown with all required state and callbacks. */
export interface TagDropdownSelectContext {
  getEditor: () => Editor | undefined;
  activeTagKeys: Set<string>;
  canRemoveTag: boolean;
  executeCommand: (commandId: string) => void;
  setMoreMenuOpen: (open: boolean) => void;
  setCustomizeModalOpen: (open: boolean) => void;
}
```

- [ ] **Step 2: Create `constants.ts`**

```ts
/** Obsidian command ID for toggling a checklist item on the current line. */
export const EDITOR_COMMAND_TOGGLE_CHECKLIST = 'editor:toggle-checklist-status' as const;
```

- [ ] **Step 3: Create `helpers.ts`**

```ts
import {
  applyCallout,
  applyTask,
  removeInnermostCallout,
  removeCalloutByKey,
  removeCheckbox,
} from '../../../../shared/editor/styling-engine/stylingEngine';
import { ACTIVE_TAG_KEY_TASK } from '../constants';
import type { TagDefinition } from '../interfaces';
import type { TagDropdownSelectContext } from './interfaces';

/**
 * Applies the appropriate callout action when a dropdown item is selected,
 * handling toggle-off (by key), callout apply, task apply, and command execution.
 */
export function selectTagFromDropdown(
  tagDefinition: TagDefinition,
  context: TagDropdownSelectContext
): void {
  const {
    getEditor,
    activeTagKeys,
    canRemoveTag,
    executeCommand,
    setMoreMenuOpen,
    setCustomizeModalOpen,
  } = context;

  if (tagDefinition.isCustomizeTags) {
    setCustomizeModalOpen(true);
    setMoreMenuOpen(false);
    return;
  }

  if (tagDefinition.isRemoveTag) {
    if (!canRemoveTag) return;
    const editor = getEditor();
    if (editor) removeInnermostCallout(editor);
    setMoreMenuOpen(false);
    return;
  }

  if (tagDefinition.isDisabled) return;

  const calloutKey = tagDefinition.calloutKey;
  const isCurrentlyActive =
    calloutKey !== null && calloutKey !== undefined && activeTagKeys.has(calloutKey);

  if (isCurrentlyActive && tagDefinition.action.type === 'callout') {
    const editor = getEditor();
    // Remove the specific named callout, not necessarily the innermost
    if (editor && calloutKey) removeCalloutByKey(editor, calloutKey);
    setMoreMenuOpen(false);
    return;
  }

  if (
    isCurrentlyActive &&
    (tagDefinition.action.type === 'task' ||
      (tagDefinition.action.type === 'command' && calloutKey === ACTIVE_TAG_KEY_TASK))
  ) {
    const editor = getEditor();
    if (editor) removeCheckbox(editor);
    setMoreMenuOpen(false);
    return;
  }

  // Apply the action: callout, task, or editor command
  if (tagDefinition.action.type === 'callout') {
    const editor = getEditor();
    if (editor) applyCallout(editor, tagDefinition.action.calloutType, tagDefinition.action.calloutTitle);
  } else if (tagDefinition.action.type === 'task') {
    const editor = getEditor();
    if (editor) applyTask(editor, tagDefinition.action.taskPrefix);
  } else if (tagDefinition.action.type === 'command') {
    executeCommand(tagDefinition.action.commandId);
  }

  setMoreMenuOpen(false);
}
```

- [ ] **Step 4: Create `helpers.test.ts`**

```ts
import { selectTagFromDropdown } from './helpers';
import type { TagDefinition } from '../interfaces';
import type { TagDropdownSelectContext } from './interfaces';
import { ACTIVE_TAG_KEY_TASK } from '../constants';

const applyCalloutMock = jest.fn();
const applyTaskMock = jest.fn();
const removeInnermostCalloutMock = jest.fn();
const removeCalloutByKeyMock = jest.fn();
const removeCheckboxMock = jest.fn();

jest.mock('../../../../shared/editor/styling-engine/stylingEngine', () => ({
  applyCallout: (...args: unknown[]) => applyCalloutMock(...args),
  applyTask: (...args: unknown[]) => applyTaskMock(...args),
  removeInnermostCallout: (...args: unknown[]) => removeInnermostCalloutMock(...args),
  removeCalloutByKey: (...args: unknown[]) => removeCalloutByKeyMock(...args),
  removeCheckbox: (...args: unknown[]) => removeCheckboxMock(...args),
}));

function buildTagDefinition(overrides: Partial<TagDefinition>): TagDefinition {
  return {
    label: 'Test Tag',
    swatchColor: '#000',
    icon: null,
    action: { type: 'callout', calloutType: 'note' },
    ...overrides,
  };
}

function buildContext(overrides: Partial<TagDropdownSelectContext>): TagDropdownSelectContext {
  return {
    getEditor: () => undefined,
    activeTagKeys: new Set(),
    canRemoveTag: false,
    executeCommand: jest.fn(),
    setMoreMenuOpen: jest.fn(),
    setCustomizeModalOpen: jest.fn(),
    ...overrides,
  };
}

beforeEach(() => jest.clearAllMocks());

describe('selectTagFromDropdown — isCustomizeTags path', () => {
  it('opens the customize modal and closes the menu', () => {
    const setCustomizeModalOpen = jest.fn();
    const setMoreMenuOpen = jest.fn();
    selectTagFromDropdown(
      buildTagDefinition({ isCustomizeTags: true }),
      buildContext({ setCustomizeModalOpen, setMoreMenuOpen })
    );
    expect(setCustomizeModalOpen).toHaveBeenCalledWith(true);
    expect(setMoreMenuOpen).toHaveBeenCalledWith(false);
    expect(applyCalloutMock).not.toHaveBeenCalled();
  });
});

describe('selectTagFromDropdown — isRemoveTag path', () => {
  it('does nothing when canRemoveTag is false', () => {
    const setMoreMenuOpen = jest.fn();
    selectTagFromDropdown(
      buildTagDefinition({ isRemoveTag: true }),
      buildContext({ canRemoveTag: false, setMoreMenuOpen })
    );
    expect(setMoreMenuOpen).not.toHaveBeenCalled();
    expect(removeInnermostCalloutMock).not.toHaveBeenCalled();
  });

  it('calls removeInnermostCallout and closes menu when canRemoveTag is true', () => {
    const fakeEditor = {};
    const setMoreMenuOpen = jest.fn();
    selectTagFromDropdown(
      buildTagDefinition({ isRemoveTag: true }),
      buildContext({ canRemoveTag: true, getEditor: () => fakeEditor as never, setMoreMenuOpen })
    );
    expect(removeInnermostCalloutMock).toHaveBeenCalledWith(fakeEditor);
    expect(setMoreMenuOpen).toHaveBeenCalledWith(false);
  });
});

describe('selectTagFromDropdown — active callout toggle-off', () => {
  it('calls removeCalloutByKey with the calloutKey when callout is active', () => {
    const fakeEditor = {};
    const setMoreMenuOpen = jest.fn();
    selectTagFromDropdown(
      buildTagDefinition({ action: { type: 'callout', calloutType: 'important', calloutTitle: 'Important' }, calloutKey: 'Important' }),
      buildContext({ activeTagKeys: new Set(['Important']), getEditor: () => fakeEditor as never, setMoreMenuOpen })
    );
    expect(removeCalloutByKeyMock).toHaveBeenCalledWith(fakeEditor, 'Important');
    expect(setMoreMenuOpen).toHaveBeenCalledWith(false);
  });
});

describe('selectTagFromDropdown — active task toggle-off', () => {
  it('calls removeCheckbox when task is active', () => {
    const fakeEditor = {};
    const setMoreMenuOpen = jest.fn();
    selectTagFromDropdown(
      buildTagDefinition({ action: { type: 'command', commandId: 'editor:toggle-checklist-status' }, calloutKey: ACTIVE_TAG_KEY_TASK }),
      buildContext({ activeTagKeys: new Set([ACTIVE_TAG_KEY_TASK]), getEditor: () => fakeEditor as never, setMoreMenuOpen })
    );
    expect(removeCheckboxMock).toHaveBeenCalledWith(fakeEditor);
    expect(setMoreMenuOpen).toHaveBeenCalledWith(false);
  });
});

describe('selectTagFromDropdown — apply new callout', () => {
  it('calls applyCallout with type and title and closes menu', () => {
    const fakeEditor = {};
    const setMoreMenuOpen = jest.fn();
    selectTagFromDropdown(
      buildTagDefinition({ action: { type: 'callout', calloutType: 'tip', calloutTitle: 'Idea' }, calloutKey: 'Idea' }),
      buildContext({ activeTagKeys: new Set(), getEditor: () => fakeEditor as never, setMoreMenuOpen })
    );
    expect(applyCalloutMock).toHaveBeenCalledWith(fakeEditor, 'tip', 'Idea');
    expect(setMoreMenuOpen).toHaveBeenCalledWith(false);
  });

  it('calls applyTask with taskPrefix for task actions', () => {
    const fakeEditor = {};
    const setMoreMenuOpen = jest.fn();
    selectTagFromDropdown(
      buildTagDefinition({ action: { type: 'task', taskPrefix: 'Discuss:' }, calloutKey: 'task-prefix:Discuss:' }),
      buildContext({ activeTagKeys: new Set(), getEditor: () => fakeEditor as never, setMoreMenuOpen })
    );
    expect(applyTaskMock).toHaveBeenCalledWith(fakeEditor, 'Discuss:');
    expect(setMoreMenuOpen).toHaveBeenCalledWith(false);
  });

  it('calls executeCommand for command actions', () => {
    const executeCommand = jest.fn();
    const setMoreMenuOpen = jest.fn();
    selectTagFromDropdown(
      buildTagDefinition({ action: { type: 'command', commandId: 'some-command' } }),
      buildContext({ executeCommand, setMoreMenuOpen })
    );
    expect(executeCommand).toHaveBeenCalledWith('some-command');
    expect(setMoreMenuOpen).toHaveBeenCalledWith(false);
  });
});

describe('selectTagFromDropdown — isDisabled path', () => {
  it('does nothing when tag is disabled', () => {
    const setMoreMenuOpen = jest.fn();
    selectTagFromDropdown(
      buildTagDefinition({ isDisabled: true }),
      buildContext({ setMoreMenuOpen })
    );
    expect(setMoreMenuOpen).not.toHaveBeenCalled();
    expect(applyCalloutMock).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 5: Create `UseTagHandlers.ts`**

```ts
import { useCallback } from 'react';

import {
  applyCallout,
  removeCalloutByKey,
  removeCheckbox,
  toggleInlineTodo,
} from '../../../../shared/editor/styling-engine/stylingEngine';
import { ACTIVE_TAG_KEY_TASK, EDITOR_COMMAND_TOGGLE_CHECKLIST } from '../constants';
import { saveCustomTags } from '../tag-storage/TagStorage';
import type { CustomTag } from '../customize-modal/interfaces';
import type { TagDefinition } from '../interfaces';
import type { AppWithCommands } from '../../../../shared/context/interfaces';
import type { TagHandlersOptions } from './interfaces';
import { selectTagFromDropdown } from './helpers';

export function useTagHandlers({
  app,
  activeTagKeys,
  canRemoveTag,
  setMoreMenuOpen,
  setCustomizeModalOpen,
  setCustomTags,
}: TagHandlersOptions) {
  const getEditor = useCallback(() => app.workspace.activeEditor?.editor, [app]);

  const executeCommand = useCallback(
    (commandId: string) => {
      (app as unknown as AppWithCommands).commands.executeCommandById(commandId); // eslint-disable-line strict-structure/no-double-cast -- Obsidian's public App doesn't expose `commands`; internal API required
    },
    [app]
  );

  const handleTodo = useCallback(() => {
    const editor = getEditor();
    if (editor && activeTagKeys.has(ACTIVE_TAG_KEY_TASK)) {
      removeCheckbox(editor);
      return;
    }
    executeCommand(EDITOR_COMMAND_TOGGLE_CHECKLIST);
  }, [getEditor, activeTagKeys, executeCommand]);

  // Uses removeCalloutByKey so clicking Important only removes the Important callout,
  // not a nested callout that happens to be innermost.
  const handleImportant = useCallback(() => {
    const editor = getEditor();
    if (!editor) return;
    if (activeTagKeys.has('Important')) {
      removeCalloutByKey(editor, 'Important');
      return;
    }
    applyCallout(editor, 'important', 'Important');
  }, [getEditor, activeTagKeys]);

  const handleQuestion = useCallback(() => {
    const editor = getEditor();
    if (!editor) return;
    if (activeTagKeys.has('Question')) {
      removeCalloutByKey(editor, 'Question');
      return;
    }
    applyCallout(editor, 'question', 'Question');
  }, [getEditor, activeTagKeys]);

  const handleFindTags = useCallback(() => {
    executeCommand('global-search:open');
    const searchInputElement = document.querySelector(
      'input[placeholder*="Search"]'
    ) as HTMLInputElement | null;
    if (searchInputElement) {
      searchInputElement.value = '#';
      searchInputElement.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }, [executeCommand]);

  const handleToDoTag = useCallback(() => {
    const editor = getEditor();
    if (!editor) return;
    toggleInlineTodo(editor);
  }, [getEditor]);

  const handleCustomTagsChange = useCallback(
    (updatedTags: CustomTag[]) => {
      saveCustomTags(updatedTags);
      setCustomTags(updatedTags);
    },
    [setCustomTags]
  );

  const handleTagDropdownSelect = useCallback(
    (tagDefinition: TagDefinition) => {
      selectTagFromDropdown(tagDefinition, {
        getEditor,
        activeTagKeys,
        canRemoveTag,
        executeCommand,
        setMoreMenuOpen,
        setCustomizeModalOpen,
      });
    },
    [getEditor, activeTagKeys, canRemoveTag, executeCommand, setMoreMenuOpen, setCustomizeModalOpen]
  );

  return {
    handleTodo,
    handleImportant,
    handleQuestion,
    handleFindTags,
    handleToDoTag,
    handleCustomTagsChange,
    handleTagDropdownSelect,
  };
}
```

- [ ] **Step 6: Create `UseTagHandlers.test.ts`**

```ts
import { renderHook } from '@testing-library/react';
import { useTagHandlers } from './UseTagHandlers';
import type { TagHandlersOptions } from './interfaces';

const applyCalloutMock = jest.fn();
const removeCalloutByKeyMock = jest.fn();
const removeCheckboxMock = jest.fn();
const toggleInlineTodoMock = jest.fn();
const saveCustomTagsMock = jest.fn();
const selectTagFromDropdownMock = jest.fn();

jest.mock('../../../../shared/editor/styling-engine/stylingEngine', () => ({
  applyCallout: (...args: unknown[]) => applyCalloutMock(...args),
  removeCalloutByKey: (...args: unknown[]) => removeCalloutByKeyMock(...args),
  removeCheckbox: (...args: unknown[]) => removeCheckboxMock(...args),
  toggleInlineTodo: (...args: unknown[]) => toggleInlineTodoMock(...args),
}));

jest.mock('../tag-storage/TagStorage', () => ({
  saveCustomTags: (...args: unknown[]) => saveCustomTagsMock(...args),
}));

jest.mock('./helpers', () => ({
  selectTagFromDropdown: (...args: unknown[]) => selectTagFromDropdownMock(...args),
}));

function buildOptions(overrides: Partial<TagHandlersOptions> = {}): TagHandlersOptions {
  const mockEditor = {};
  return {
    app: {
      workspace: { activeEditor: { editor: mockEditor } },
      commands: { executeCommandById: jest.fn() },
    } as unknown as TagHandlersOptions['app'],
    activeTagKeys: new Set(),
    canRemoveTag: false,
    setMoreMenuOpen: jest.fn(),
    setCustomizeModalOpen: jest.fn(),
    setCustomTags: jest.fn(),
    ...overrides,
  };
}

beforeEach(() => jest.clearAllMocks());

describe('useTagHandlers — initialization', () => {
  it('returns all expected handler functions', () => {
    const { result } = renderHook(() => useTagHandlers(buildOptions()));
    expect(result.current.handleTodo).toBeDefined();
    expect(result.current.handleImportant).toBeDefined();
    expect(result.current.handleQuestion).toBeDefined();
    expect(result.current.handleFindTags).toBeDefined();
    expect(result.current.handleToDoTag).toBeDefined();
    expect(result.current.handleCustomTagsChange).toBeDefined();
    expect(result.current.handleTagDropdownSelect).toBeDefined();
  });
});

describe('useTagHandlers — handleTodo', () => {
  it('executes toggle checklist command when task is not active', () => {
    const executeCommandById = jest.fn();
    const options = buildOptions({
      app: {
        workspace: { activeEditor: { editor: {} } },
        commands: { executeCommandById },
      } as unknown as TagHandlersOptions['app'],
      activeTagKeys: new Set(),
    });
    const { result } = renderHook(() => useTagHandlers(options));
    result.current.handleTodo();
    expect(executeCommandById).toHaveBeenCalledWith('editor:toggle-checklist-status');
  });

  it('calls removeCheckbox when task is already active', () => {
    const mockEditor = {};
    const options = buildOptions({
      app: {
        workspace: { activeEditor: { editor: mockEditor } },
        commands: { executeCommandById: jest.fn() },
      } as unknown as TagHandlersOptions['app'],
      activeTagKeys: new Set(['__task__']),
    });
    const { result } = renderHook(() => useTagHandlers(options));
    result.current.handleTodo();
    expect(removeCheckboxMock).toHaveBeenCalledWith(mockEditor);
  });
});

describe('useTagHandlers — handleImportant', () => {
  it('calls applyCallout with important type when Important is not active', () => {
    const mockEditor = {};
    const options = buildOptions({
      app: {
        workspace: { activeEditor: { editor: mockEditor } },
        commands: { executeCommandById: jest.fn() },
      } as unknown as TagHandlersOptions['app'],
      activeTagKeys: new Set(),
    });
    const { result } = renderHook(() => useTagHandlers(options));
    result.current.handleImportant();
    expect(applyCalloutMock).toHaveBeenCalledWith(mockEditor, 'important', 'Important');
  });

  it('calls removeCalloutByKey("Important") when Important is active', () => {
    const mockEditor = {};
    const options = buildOptions({
      app: {
        workspace: { activeEditor: { editor: mockEditor } },
        commands: { executeCommandById: jest.fn() },
      } as unknown as TagHandlersOptions['app'],
      activeTagKeys: new Set(['Important']),
    });
    const { result } = renderHook(() => useTagHandlers(options));
    result.current.handleImportant();
    expect(removeCalloutByKeyMock).toHaveBeenCalledWith(mockEditor, 'Important');
    expect(applyCalloutMock).not.toHaveBeenCalled();
  });

  it('does nothing when no active editor', () => {
    const options = buildOptions({
      app: {
        workspace: { activeEditor: {} },
        commands: { executeCommandById: jest.fn() },
      } as unknown as TagHandlersOptions['app'],
    });
    const { result } = renderHook(() => useTagHandlers(options));
    expect(() => result.current.handleImportant()).not.toThrow();
    expect(applyCalloutMock).not.toHaveBeenCalled();
  });
});

describe('useTagHandlers — handleQuestion', () => {
  it('calls applyCallout with question type when Question is not active', () => {
    const mockEditor = {};
    const options = buildOptions({
      app: {
        workspace: { activeEditor: { editor: mockEditor } },
        commands: { executeCommandById: jest.fn() },
      } as unknown as TagHandlersOptions['app'],
      activeTagKeys: new Set(),
    });
    const { result } = renderHook(() => useTagHandlers(options));
    result.current.handleQuestion();
    expect(applyCalloutMock).toHaveBeenCalledWith(mockEditor, 'question', 'Question');
  });

  it('calls removeCalloutByKey("Question") when Question is active', () => {
    const mockEditor = {};
    const options = buildOptions({
      app: {
        workspace: { activeEditor: { editor: mockEditor } },
        commands: { executeCommandById: jest.fn() },
      } as unknown as TagHandlersOptions['app'],
      activeTagKeys: new Set(['Question']),
    });
    const { result } = renderHook(() => useTagHandlers(options));
    result.current.handleQuestion();
    expect(removeCalloutByKeyMock).toHaveBeenCalledWith(mockEditor, 'Question');
  });
});

describe('useTagHandlers — handleToDoTag', () => {
  it('calls toggleInlineTodo when editor is active', () => {
    const mockEditor = {};
    const options = buildOptions({
      app: {
        workspace: { activeEditor: { editor: mockEditor } },
        commands: { executeCommandById: jest.fn() },
      } as unknown as TagHandlersOptions['app'],
    });
    const { result } = renderHook(() => useTagHandlers(options));
    result.current.handleToDoTag();
    expect(toggleInlineTodoMock).toHaveBeenCalledWith(mockEditor);
  });

  it('does nothing when no editor is active', () => {
    const options = buildOptions({
      app: {
        workspace: { activeEditor: {} },
        commands: { executeCommandById: jest.fn() },
      } as unknown as TagHandlersOptions['app'],
    });
    const { result } = renderHook(() => useTagHandlers(options));
    result.current.handleToDoTag();
    expect(toggleInlineTodoMock).not.toHaveBeenCalled();
  });
});

describe('useTagHandlers — handleCustomTagsChange', () => {
  it('saves and updates custom tags', () => {
    const setCustomTags = jest.fn();
    const options = buildOptions({ setCustomTags });
    const { result } = renderHook(() => useTagHandlers(options));
    const updatedTags = [{ label: 'Tag A', color: '#ff0000' }] as never;
    result.current.handleCustomTagsChange(updatedTags);
    expect(saveCustomTagsMock).toHaveBeenCalledWith(updatedTags);
    expect(setCustomTags).toHaveBeenCalledWith(updatedTags);
  });
});
```

- [ ] **Step 7: Run tests to confirm pass**

```
npm test -- --testPathPattern="tags/use-tag-handlers" --no-coverage
```

Expected: PASS all.

- [ ] **Step 8: Commit**

```
git add src/tabs/home/tags/use-tag-handlers/
git commit -m "feat: move useTagHandlers to tags UI layer, import from stylingEngine"
```

---

## Task 6: Update `Tags.tsx`, remove `highlight` from tags `interfaces.ts`, update remaining consumers, delete old files

**Files:**
- Modify: `src/tabs/home/tags/Tags.tsx`
- Modify: `src/tabs/home/tags/interfaces.ts`
- Modify: `src/shared/editor/enclosing-html-tags/use-active-tag-keys/useActiveTagKeys.ts`
- Modify: `src/shared/hooks/editorStateHelpers.ts`
- Modify: `src/shared/hooks/editorStateHelpers.test.ts`
- Delete: `src/shared/editor/enclosing-html-tags/use-tag-handlers/` (entire folder)

- [ ] **Step 1: Update `Tags.tsx` import**

In `src/tabs/home/tags/Tags.tsx`, replace:

```ts
import { useTagHandlers } from '../../../shared/editor/enclosing-html-tags/use-tag-handlers/UseTagHandlers';
```

with:

```ts
import { useTagHandlers } from './use-tag-handlers/UseTagHandlers';
```

- [ ] **Step 2: Remove `highlight` from `TagAction` in `src/tabs/home/tags/interfaces.ts`**

In the `TagAction` type, remove the `| { type: 'highlight' }` variant:

```ts
export type TagAction =
  | { type: 'command'; commandId: string }
  | {
      type: 'callout';
      calloutType: string;
      calloutTitle?: string;
    }
  | { type: 'task'; taskPrefix: string };
```

- [ ] **Step 3: Update `useActiveTagKeys.ts` import path**

In `src/shared/editor/enclosing-html-tags/use-active-tag-keys/useActiveTagKeys.ts`, replace:

```ts
import { detectActiveTagKeys } from '../../styling-engine/tag-apply/helpers/detect-active-tag-keys/DetectActiveTagKeys';
```

with:

```ts
import { detectActiveTagKeys } from '../../styling-engine/callout-apply/helpers/detect-active-tag-keys/DetectActiveTagKeys';
```

- [ ] **Step 4: Update `editorStateHelpers.ts` import path**

In `src/shared/hooks/editorStateHelpers.ts`, replace:

```ts
import { detectActiveTagKeys } from '../editor/styling-engine/tag-apply/helpers/detect-active-tag-keys/DetectActiveTagKeys';
```

with:

```ts
import { detectActiveTagKeys } from '../editor/styling-engine/callout-apply/helpers/detect-active-tag-keys/DetectActiveTagKeys';
```

- [ ] **Step 5: Update `editorStateHelpers.test.ts` import path**

In `src/shared/hooks/editorStateHelpers.test.ts`, replace:

```ts
'../editor/styling-engine/tag-apply/helpers/detect-active-tag-keys/DetectActiveTagKeys'
```

and:

```ts
import { detectActiveTagKeys } from '../editor/styling-engine/tag-apply/helpers/detect-active-tag-keys/DetectActiveTagKeys';
```

with the `callout-apply` paths.

- [ ] **Step 6: Update `useActiveTagKeys.test.ts` import**

In `src/shared/editor/enclosing-html-tags/use-active-tag-keys/useActiveTagKeys.test.ts`, replace:

```ts
import { ACTIVE_TAG_KEY_TASK } from '../../styling-engine/tag-apply/constants';
```

with:

```ts
import { ACTIVE_TAG_KEY_TASK } from '../../../../tabs/home/tags/constants';
```

- [ ] **Step 7: Delete old `use-tag-handlers` folder**

```
git rm -r src/shared/editor/enclosing-html-tags/use-tag-handlers/
```

- [ ] **Step 8: Verify build and all tests pass**

```
npm run build
npm test -- --no-coverage
npm run lint
```

Expected: 0 build errors, 0 test failures, 0 lint errors.

- [ ] **Step 9: Commit**

```
git add -A
git commit -m "refactor: update consumers to callout-apply paths, remove highlight TagAction, delete old use-tag-handlers"
```

---

## Task 7: Obsidian live verification and final commit

- [ ] **Step 1: Rebuild the plugin bundle**

```
npm run build
```

- [ ] **Step 2: Reload plugin in Obsidian via MCP**

Use the Obsidian DevTools MCP to: disable plugin `onenote-ribbon` → enable plugin `onenote-ribbon`.

- [ ] **Step 3: Verify nested callout checkbox behaviour**

In Obsidian, on a note with:
```
> [!important] Important
>> [!question] Question
>> body text
```

Place cursor on `>> body text`. Verify that both **Important** and **Question** checkboxes in the Tags ribbon are ticked.

- [ ] **Step 4: Verify click removes correct callout**

With cursor still on `>> body text` and both checkboxes ticked, click **Important** in the ribbon. Verify only the Important callout is removed, leaving the Question callout intact (now at depth 1).

- [ ] **Step 5: Final commit**

```
git add -A
git commit -m "chore: final verification pass — callout refactor complete"
```
