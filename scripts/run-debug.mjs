#!/usr/bin/env node

import { spawn } from "child_process";
import { platform } from "os";

const currentPlatform = platform();
const DEBUG_PORT = 9222;

let command;
let args;

if (currentPlatform === "win32") {
  command = "obsidian.exe";
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
  shell: true,
});

obsidian.on("error", (error) => {
  console.error("Failed to start Obsidian:", error.message);
  process.exit(1);
});

obsidian.on("exit", (code) => {
  process.exit(code || 0);
});
