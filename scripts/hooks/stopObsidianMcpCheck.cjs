let hookInput = {};

try {
  const inputText = require('node:fs').readFileSync(0, 'utf8');
  hookInput = inputText ? JSON.parse(inputText) : {};
} catch {
  hookInput = {};
}

const stopHookActive = Boolean(hookInput.stop_hook_active);

// When stop_hook_active is true, the hook is re-firing after a block — allow Claude to stop.
if (stopHookActive) {
  process.exit(0);
}

// Top-level decision/reason is required for Stop hooks (hookSpecificOutput wrapper is not used here).
const hookOutput = {
  decision: 'block',
  reason:
    'Before finishing, complete the following checks in this exact order. Do not skip, combine, reorder, or omit any step.\n\n' +
    'After each step, output a result before moving to the next step using this format:\n' +
    'Step <number> - <PASS|FAIL|N/A>: <what was checked> | Evidence: <proof>.\n' +
    'If a step is not applicable, mark it as N/A and explain why.\n\n' +
    '1. ***IMPORTANT*** - DO FIRST TO VERIFY: OBSIDIAN MCP TEST - Were any visual or functionality changes made to the onenote-ribbon plugin? If yes, test them in Obsidian MCP and report the result.\n\n' +
    '2. FOLDER LAYOUT - Did any new logical block get added (function, hook, utility, transformation)? If yes, confirm it is extracted into its own file inside a correctly named subfolder (for example: component-name/).\n\n' +
    '3. CODE QUALITY - Do all new variable names use full, unabbreviated names? Are hard-to-understand lines commented? Are CSS styles in dedicated .css files (no inline style props unless blocked)?\n\n' +
    '4. TESTS - Does every new logical block have a tests/ subfolder with unit tests covering all parameter variations and return paths? Run npm test and report the result.\n\n' +
    '5. REDUNDANCY - Is there any duplicate logic, copy-pasted blocks, or unnecessary abstractions in the changed code that could be simplified or removed?\n\n' +
    'Completion rule: output results for all 5 steps in order every time. If any step fails or is untested, block and list exactly what needs to be done.',
};

process.stdout.write(JSON.stringify(hookOutput));
