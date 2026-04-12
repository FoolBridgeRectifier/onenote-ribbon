const fs = require('node:fs');
const path = require('node:path');

const projectGuidePath = path.join(process.cwd(), '.claude', 'project-guide.md');

try {
  const projectGuideContents = fs.readFileSync(projectGuidePath, 'utf8');

  const hookOutput = {
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: `Read and follow .claude/project-guide.md for this session.\n\n${projectGuideContents}`,
    },
  };

  process.stdout.write(JSON.stringify(hookOutput));
} catch (error) {
  const hookOutput = {
    systemMessage: `Unable to load .claude/project-guide.md at session start: ${error.message}`,
  };

  process.stdout.write(JSON.stringify(hookOutput));
}
