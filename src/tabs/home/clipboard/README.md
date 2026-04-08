# clipboard/

Orchestrates the Clipboard group: Paste, Paste Dropdown, Cut, Copy, and Format Painter buttons.

## Structure

| File / Folder       | Purpose                                                                 |
| ------------------- | ----------------------------------------------------------------------- |
| `ClipboardGroup.ts` | Orchestrator — creates the group container and delegates to sub-modules |
| `clipboard.css`     | Group-level layout rules (big Paste column + stacked small buttons)     |
| `tests/`            | Integration test for the full Clipboard group                           |
| `paste/`            | Big Paste button module                                                 |
| `paste-dropdown/`   | Paste dropdown arrow module                                             |
| `cut/`              | Cut button module                                                       |
| `copy/`             | Copy button module                                                      |
| `format-painter/`   | Format Painter button module                                            |

## Layout

```
[ Paste (big) ]   [ Cut         ]
[ ▾ (dropdown) ]  [ Copy        ]
                  [ Format Painter ]
```
