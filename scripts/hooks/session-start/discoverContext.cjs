'use strict';

const fs = require('fs');
const path = require('path');
const { SKILLS_PLUGIN_CACHE, GLOBAL_AGENTS_FILE_EXCLUSIONS, discoverPluginCacheAgentNames, discoverGlobalAgentNames } = require('./helpers.cjs');

const MCP_CONFIG_PATH = 'C:/Users/Dragus/AppData/Roaming/Code/User/mcp.json';

/**
 * Recursively walks a directory up to maxDepth, invoking visitor(fullPath, fileName)
 * for every file encountered. Silently skips unreadable entries.
 *
 * @param {string} directory - Absolute path to start walking from
 * @param {number} maxDepth - Maximum recursion depth (0 = only direct children)
 * @param {(fullPath: string, fileName: string) => void} visitor
 * @param {number} [currentDepth=0] - Internal recursion counter
 */
function walkDirectory(directory, maxDepth, visitor, currentDepth = 0) {
  if (currentDepth > maxDepth) return;

  let entries;
  try {
    entries = fs.readdirSync(directory);
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(directory, entry);

    let stat;
    try {
      stat = fs.statSync(fullPath);
    } catch {
      continue;
    }

    if (stat.isDirectory()) {
      walkDirectory(fullPath, maxDepth, visitor, currentDepth + 1);
    } else {
      visitor(fullPath, entry);
    }
  }
}

/**
 * Discovers skill names from the skills plugin cache by locating all SKILL.md files.
 * Prefers the `name` frontmatter field; falls back to the parent folder name.
 *
 * @returns {string[]} Sorted list of skill names
 */
function discoverSkillNames() {
  const skillNames = new Set();

  walkDirectory(SKILLS_PLUGIN_CACHE, 6, (fullPath, fileName) => {
    if (fileName !== 'SKILL.md') return;

    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

      if (frontmatterMatch) {
        const nameMatch = frontmatterMatch[1].match(/^name:\s*(.+)$/m);
        if (nameMatch) {
          skillNames.add(nameMatch[1].trim());
          return;
        }
      }

      // Fall back to parent folder name when frontmatter has no name field
      const parentFolder = path.dirname(fullPath).split(/[\\/]/).pop();
      skillNames.add(parentFolder);
    } catch {
      // Skip unreadable files
    }
  });

  return Array.from(skillNames).sort();
}

/**
 * Returns a deduplicated, sorted list of all agent names from both the plugin cache
 * and the global ~/.claude/agents directory.
 *
 * @returns {string[]} Combined sorted list of all agent names
 */
function discoverAllAgentNames() {
  const pluginCacheNames = discoverPluginCacheAgentNames();
  const globalNames = discoverGlobalAgentNames();
  return Array.from(new Set([...pluginCacheNames, ...globalNames])).sort();
}

/**
 * Reads MCP server names from the VS Code user-level mcp.json config file.
 *
 * @returns {string[]} Sorted list of MCP server names, or [] if the file is missing/invalid
 */
function discoverMcpServerNames() {
  try {
    const rawConfig = fs.readFileSync(MCP_CONFIG_PATH, 'utf8');
    const config = JSON.parse(rawConfig);
    const servers = config.servers || {};
    return Object.keys(servers).sort();
  } catch {
    return [];
  }
}

module.exports = {
  walkDirectory,
  discoverSkillNames,
  discoverPluginCacheAgentNames,
  discoverGlobalAgentNames,
  discoverAllAgentNames,
  discoverMcpServerNames,
  // Exported for testing only
  GLOBAL_AGENTS_FILE_EXCLUSIONS,
};
