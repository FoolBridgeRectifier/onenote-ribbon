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
      'Were any visual or functionality changes made to the onenote-ribbon plugin in this response? If yes, have I tested them in Obsidian MCP? If not, remind me to test them.',
  },
};

process.stdout.write(JSON.stringify(hookOutput));
