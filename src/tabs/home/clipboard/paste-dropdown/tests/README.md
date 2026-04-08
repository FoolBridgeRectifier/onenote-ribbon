# paste-dropdown/tests/

Unit and edge tests for the Paste dropdown arrow.

## Tests

| File                     | Description                                                                               |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| `paste-dropdown.unit.ts` | Verifies dropdown exists, no overlay before click, overlay appears on click, 3 menu items |
| `paste-dropdown.edge.ts` | Verifies "Paste Special" is disabled (cursor:default), outside click closes the menu      |

## How to run

Paste the exported string constant into `mcp__obsidian-devtools__evaluate_script` after reloading the plugin.
