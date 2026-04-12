let hookInput = {};

try {
  const inputText = require('node:fs').readFileSync(0, 'utf8');
  hookInput = inputText ? JSON.parse(inputText) : {};
} catch {
  hookInput = {};
}

const stopHookActive = Boolean(hookInput.stop_hook_active);

if (stopHookActive) {
  process.stdout.write(JSON.stringify({ continue: true }));
  process.exit(0);
}

const hookOutput = {
  hookSpecificOutput: {
    hookEventName: 'Stop',
    decision: 'block',
    reason:
      'Before finishing, check all of the following:\n\n' +
      '1. OBSIDIAN MCP TEST — Were any visual or functionality changes made to the onenote-ribbon plugin? If yes, have I tested them in Obsidian MCP?\n\n' +
      '2. FOLDER LAYOUT — Did any new logical block get added (function, hook, utility, transformation)? If yes, is it extracted into its own file inside a correctly named subfolder (e.g. component-name/)?\n\n' +
      '3. CODE QUALITY — Do all new variable names use full, unabbreviated names? Are hard-to-understand lines commented? Are CSS styles in dedicated .css files (no inline style props unless blocked)?\n\n' +
      '4. TESTS — Does every new logical block have a tests/ subfolder with unit tests covering all param variations and return paths? Run `npm test` and confirm all tests pass.\n\n' +
      '5. REDUNDANCY — Is there any duplicate logic, copy-pasted blocks, or unnecessary abstractions in the changed code that could be simplified or removed?\n\n' +
      'If any of these are missing or untested, block and list exactly what needs to be done.',
  },
};

process.stdout.write(JSON.stringify(hookOutput));
