#!/usr/bin/env node
/** @jest-environment node */

import { runE2e } from './run-e2e/runE2e';

runE2e().catch((error) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`\nFatal error: ${errorMessage}`);
  process.exit(1);
});
