# paste/tests/

Unit and edge tests for the Paste button.

## Tests

| File            | Description                                                                            |
| --------------- | -------------------------------------------------------------------------------------- |
| `paste.unit.ts` | Verifies button element exists, class, label text, and SVG icon                        |
| `paste.edge.ts` | Verifies no crash with no active editor; paste-dropdown exists with correct arrow text |

## How to run

Paste the exported string constant into `mcp__obsidian-devtools__evaluate_script` after reloading the plugin.
