const fs = require('node:fs');
const path = require('node:path');

function getWorkspaceRoot() {
  return process.cwd();
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function buildStartupGuide(workspaceRoot) {
  const conventionsPath = path.join(workspaceRoot, 'CONVENTIONS.md');
  const designPath = path.join(workspaceRoot, 'DESIGN.md');

  const startupLines = [
    'Project startup guide for onenote-ribbon:',
    '- Read CONVENTIONS.md and DESIGN.md before editing code.',
    '- Keep styles in dedicated .css files (avoid inline style props).',
    '- Use full variable names and add tests for new logic paths.',
    '- Validate with npm run build and npm test before completion.',
  ];

  if (!fileExists(conventionsPath)) {
    startupLines.push('- Warning: CONVENTIONS.md was not found in the workspace root.');
  }

  if (!fileExists(designPath)) {
    startupLines.push('- Warning: DESIGN.md was not found in the workspace root.');
  }

  return startupLines.join('\n');
}

function main() {
  const workspaceRoot = getWorkspaceRoot();
  const additionalContext = buildStartupGuide(workspaceRoot);

  const hookOutput = {
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext,
    },
  };

  process.stdout.write(JSON.stringify(hookOutput));
}

main();
