# tags/

Root folder for the Tags group in the Home tab.

## Contents

| File           | Purpose                                                                        |
| -------------- | ------------------------------------------------------------------------------ |
| `TagsGroup.ts` | Orchestrator — renders the full Tags group (rows, dropdown arrow, big buttons) |
| `tags-data.ts` | `ALL_TAGS` array, `TAG_CMD_TO_DEF` lookup, `tagNotation()` function            |
| `tags.css`     | Scoped styles for the Tags group layout                                        |

## Subfolders

| Folder           | Purpose                                                                |
| ---------------- | ---------------------------------------------------------------------- |
| `tag-row/`       | `TagRow` class — renders one tag row with icon, label, check indicator |
| `tags-dropdown/` | `TagsDropdown` class — full-list overlay dropdown                      |
| `todo-tag/`      | `TodoTagButton` — big "To Do Tag" button                               |
| `find-tags/`     | `FindTagsButton` — big "Find Tags" button                              |
| `tag-apply/`     | `applyTag()` — core toggle-on/off logic for tag notations              |
| `tests/`         | Integration tests for the Tags group as a whole                        |
