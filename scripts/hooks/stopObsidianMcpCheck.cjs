const fs = require('node:fs');

let hookInput = {};
try {
  const inputText = fs.readFileSync(0, 'utf8');
  hookInput = inputText ? JSON.parse(inputText) : {};
} catch {
  hookInput = {};
}

const stopHookActive = Boolean(hookInput.stop_hook_active);

// When stop_hook_active is true, the hook is re-firing after a block — allow Claude to stop.
if (stopHookActive) {
  process.exit(0);
}

/**
 * Check if the checklist has already been completed in the current session.
 * We look at the transcript to see if the "Step 1 - PASS/FAIL/N/A" pattern exists.
 */
function isChecklistCompleted(transcriptPath, currentResponse) {
  // 1. Check current response first (most recent)
  if (currentResponse && /Step 1 - (PASS|FAIL|N\/A):/.test(currentResponse) && /Step 5 - (PASS|FAIL|N\/A):/.test(currentResponse)) {
    return true;
  }

  // 2. Check full transcript
  if (transcriptPath && fs.existsSync(transcriptPath)) {
    try {
      const transcript = JSON.parse(fs.readFileSync(transcriptPath, 'utf8'));
      // Search from newest to oldest messages
      for (let i = transcript.length - 1; i >= 0; i--) {
        const message = transcript[i];
        if (message.role === 'model' && message.content) {
          const content = typeof message.content === 'string' ? message.content : JSON.stringify(message.content);
          if (/Step 1 - (PASS|FAIL|N\/A):/.test(content) && /Step 5 - (PASS|FAIL|N\/A):/.test(content)) {
            return true;
          }
        }
      }
    } catch (e) {
      // Fallback to blocking if transcript parsing fails
    }
  }

  return false;
}

if (isChecklistCompleted(hookInput.transcript_path, hookInput.prompt_response)) {
  process.exit(0);
}

// VS Code Stop hook format: decision must be nested inside hookSpecificOutput.
// Claude CLI used top-level { decision, reason } but VS Code requires the hookSpecificOutput wrapper.
const hookOutput = {
  hookSpecificOutput: {
    hookEventName: 'Stop',
    decision: 'block',
    reason:
      'Before finishing, complete the following checks in this exact order. Do not skip, combine, reorder, or omit any step.\n\n' +
      'After each step, output a result before moving to the next step using this format:\n' +
      'Step <number> - <PASS|FAIL|N/A>: <what was checked> | Evidence: <proof>.\n' +
      'If a step is not applicable, mark it as N/A and explain why.\n' +
      'You must always print all 5 steps in order, even if every step is N/A.\n\n' +
      '1. ***IMPORTANT*** - DO FIRST TO VERIFY: OBSIDIAN MCP TEST - Were any visual or functionality changes made to the onenote-ribbon plugin? If yes, test them in Obsidian MCP and report the result. (this is NOT e2e test, but direct qa using obsidian mcp)\n\n' +
      '2. FOLDER LAYOUT - Did any new logical block get added (function, hook, utility, transformation)? If yes, confirm it is extracted into its own file inside a correctly named subfolder (for example: component-name/).\n\n' +
      '3. CODE QUALITY - Do all new variable names use full, unabbreviated names? Are hard-to-understand lines commented? Are CSS styles in dedicated .css files (no inline style props unless blocked)?\n\n' +
      '4. TESTS - Does every new logical block have a tests/ subfolder with unit tests covering all parameter variations and return paths? Run npm test and report the result.\n\n' +
      '5. REDUNDANCY - Is there any duplicate logic, copy-pasted blocks, or unnecessary abstractions in the changed code that could be simplified or removed?\n\n' +
      'Completion rule: always output results for all 5 steps in order every time, including when all results are N/A. If any step fails or is untested, block and list exactly what needs to be done.',
  },
};

process.stdout.write(JSON.stringify(hookOutput));
