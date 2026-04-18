import {
  DEFAULT_POLL_INTERVAL_MS,
  DEFAULT_POLL_TIMEOUT_MS,
} from '../constants';

import type { PollOptions } from '../../interfaces';

export async function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function pollUntil<T>(
  callback: () => Promise<T | null | undefined> | T | null | undefined,
  pollOptions: PollOptions = {},
) {
  const timeout = pollOptions.timeout ?? DEFAULT_POLL_TIMEOUT_MS;
  const interval = pollOptions.interval ?? DEFAULT_POLL_INTERVAL_MS;
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    try {
      const value = await callback();

      if (value) {
        return value;
      }
    } catch {
      // Keep polling until timeout.
    }

    await sleep(interval);
  }

  throw new Error(`Timeout waiting for: ${pollOptions.label ?? ''}`);
}
