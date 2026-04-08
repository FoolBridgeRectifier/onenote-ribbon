# cut/tests/

Unit and edge tests for the Cut button.

## Tests

| File          | Description                                                                     |
| ------------- | ------------------------------------------------------------------------------- |
| `cut.unit.ts` | Verifies button exists; simulates cut with selection and checks text is removed |
| `cut.edge.ts` | Verifies cut with no selection is a no-op; verifies multi-line selection cut    |

## How to run

Paste the exported string constant into `mcp__obsidian-devtools__evaluate_script` after reloading the plugin.
