const fs = require('fs');
const path = require('path');

const {
  discoverSkillNames,
  discoverAllAgentNames,
  discoverMcpServerNames,
} = require('./session-start/discoverContext.cjs');

function getWorkspaceRoot() {
  return process.cwd();
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function readTextFileIfExists(filePath) {
  try {
    if (!fileExists(filePath)) {
      return null;
    }

    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

function buildStartupGuide(workspaceRoot) {
  const conventionsPath = path.join(workspaceRoot, 'CONVENTIONS.md');
  const designPath = path.join(workspaceRoot, 'DESIGN.md');

  const startupLines = [
    'Project startup guide for onenote-ribbon:',
    '- The full CONVENTIONS.md and DESIGN.md contents are loaded below.',
    '- Keep styles in dedicated .css files (avoid inline style props).',
    '- Use full variable names and add tests for new logic paths.',
    '- CRITICAL INSTRUCTION: Before answering or taking action, you MUST think step-by-step and document your internal reasoning in detail. Explore all edge cases, consider alternative approaches, and explain your chosen strategy comprehensively before writing any code.',
    '- Validate with npm run build and npm test before completion.',
  ];

  const conventionsContent = readTextFileIfExists(conventionsPath);
  const designContent = readTextFileIfExists(designPath);

  if (conventionsContent) {
    startupLines.push('');
    startupLines.push('CONVENTIONS.md (full content):');
    startupLines.push(conventionsContent);
  } else {
    startupLines.push('- Warning: CONVENTIONS.md was not found or could not be read from the workspace root.');
  }

  if (designContent) {
    startupLines.push('');
    startupLines.push('DESIGN.md (full content):');
    startupLines.push(designContent);
  } else {
    startupLines.push('- Warning: DESIGN.md was not found or could not be read from the workspace root.');
  }

  const skillNames = discoverSkillNames();
  if (skillNames.length > 0) {
    startupLines.push('');
    startupLines.push('Available skills: ' + skillNames.join(', '));
  }

  const allAgentNames = discoverAllAgentNames();
  if (allAgentNames.length > 0) {
    startupLines.push('Available agents: ' + allAgentNames.join(', '));
  }

  const mcpServerNames = discoverMcpServerNames();
  if (mcpServerNames.length > 0) {
    startupLines.push('Available MCP servers: ' + mcpServerNames.join(', '));
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
