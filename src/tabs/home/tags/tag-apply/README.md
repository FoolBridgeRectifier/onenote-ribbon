# tag-apply/

Core toggle logic for applying or removing tag notations in the editor.

## Files

| File          | Purpose                                                                            |
| ------------- | ---------------------------------------------------------------------------------- |
| `applyTag.ts` | `applyTag(cmd, editor)` — toggle-on/off for single-line and multiline callout tags |

## Logic Summary

- `tag-highlight` delegates to `toggleInline(editor, "==")`.
- `tag-todo`, `tag-todo-p1`, `tag-todo-p2` delegate to `toggleLinePrefix(editor, prefix)`.
- All other tags: if line already starts with the notation prefix, toggle it OFF (removing the header line and stripping the continuation prefix); otherwise insert at cursor.
