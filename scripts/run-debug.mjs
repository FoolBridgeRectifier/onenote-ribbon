#!/usr/bin/env node

import { execFileSync, spawn } from "child_process";
import fs from "fs";
import path from "path";
import { platform } from "os";

const currentPlatform = platform();
const DEBUG_PORT = 9222;

function resolveWindowsObsidianExecutable() {
  const localAppDataPath = process.env.LOCALAPPDATA;
  const programFilesPath = process.env.ProgramFiles;
  const programFilesX86Path = process.env["ProgramFiles(x86)"];

  const candidatePaths = [
    localAppDataPath
      ? path.join(localAppDataPath, "Programs", "Obsidian", "Obsidian.exe")
      : null,
    localAppDataPath
      ? path.join(localAppDataPath, "Obsidian", "Obsidian.exe")
      : null,
    programFilesPath
      ? path.join(programFilesPath, "Obsidian", "Obsidian.exe")
      : null,
    programFilesX86Path
      ? path.join(programFilesX86Path, "Obsidian", "Obsidian.exe")
      : null,
  ].filter(Boolean);

  for (const candidatePath of candidatePaths) {
    if (fs.existsSync(candidatePath)) {
      return candidatePath;
    }
  }

  try {
    const whereOutput = execFileSync("where", ["Obsidian.exe"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    const firstMatch = whereOutput
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line.length > 0);

    if (firstMatch && fs.existsSync(firstMatch)) {
      return firstMatch;
    }
  } catch {
    // Ignore lookup errors and show a consolidated message below.
  }

  return null;
}

let command;
let args;

if (currentPlatform === "win32") {
  const windowsObsidianExecutablePath = resolveWindowsObsidianExecutable();

  if (!windowsObsidianExecutablePath) {
    const debugPortArgument = `--remote-debugging-port=${DEBUG_PORT}`;
    console.error("Failed to find Obsidian.exe.");
    console.error("Install path was not found in common directories and PATH.");
    console.error(`You can launch manually with: <Obsidian.exe> ${debugPortArgument}`);
    process.exit(1);
  }

  command = windowsObsidianExecutablePath;
  args = [`--remote-debugging-port=${DEBUG_PORT}`];
} else if (currentPlatform === "darwin") {
  command = "open";
  args = ["-a", "Obsidian", "--args", `--remote-debugging-port=${DEBUG_PORT}`];
} else {
  command = "obsidian";
  args = [`--remote-debugging-port=${DEBUG_PORT}`];
}

const obsidian = spawn(command, args, {
  stdio: "inherit",
  shell: false,
  detached: currentPlatform === "win32",
});

if (currentPlatform === "win32") {
  obsidian.unref();
}

obsidian.on("error", (error) => {
  console.error("Failed to start Obsidian:", error.message);
  process.exit(1);
});

obsidian.on("exit", (code) => {
  process.exit(code || 0);
});
