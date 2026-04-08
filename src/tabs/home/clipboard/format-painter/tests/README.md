# format-painter/tests/

Unit and edge tests for the Format Painter button.

## Tests

| File                     | Description                                                                                                 |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `format-painter.unit.ts` | Verifies button exists; activates on click, sets `_onrFPActive`, captures bold; deactivates on second click |
| `format-painter.edge.ts` | Verifies heading prefix capture from H2 line; applies heading prefix when format painter is applied         |

## How to run

Paste the exported string constant into `mcp__obsidian-devtools__evaluate_script` after reloading the plugin.
