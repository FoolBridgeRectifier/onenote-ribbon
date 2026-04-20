/** @jest-environment node */

import { pollUntil, sleep } from './polling';

describe('polling utilities', () => {
  describe('sleep', () => {
    it('resolves after specified milliseconds', async () => {
      const start = Date.now();
      await sleep(100);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(100);
      expect(elapsed).toBeLessThan(200);
    });
  });

  describe('pollUntil', () => {
    it('returns value when callback returns truthy immediately', async () => {
      const result = await pollUntil(() => 'success', { timeout: 1000 });
      expect(result).toBe('success');
    });

    it('retries until callback returns truthy', async () => {
      let attempt = 0;
      const result = await pollUntil(
        () => {
          attempt += 1;
          return attempt >= 3 ? 'success' : null;
        },
        { timeout: 1000, interval: 50 },
      );

      expect(result).toBe('success');
      expect(attempt).toBe(3);
    });

    it('throws on timeout when callback never returns truthy', async () => {
      await expect(
        pollUntil(() => null, {
          timeout: 100,
          interval: 25,
          label: 'test-label',
        }),
      ).rejects.toThrow('Timeout waiting for: test-label');
    });

    it('handles async callback that eventually returns value', async () => {
      let attempt = 0;
      const result = await pollUntil(
        async () => {
          attempt += 1;
          return attempt >= 2 ? 'async-success' : null;
        },
        { timeout: 1000, interval: 50 },
      );

      expect(result).toBe('async-success');
    });

    it('catches exceptions and continues polling', async () => {
      let attempt = 0;
      const result = await pollUntil(
        () => {
          attempt += 1;
          if (attempt < 2) {
            throw new Error('temporary error');
          }
          return 'recovered';
        },
        { timeout: 1000, interval: 50 },
      );

      expect(result).toBe('recovered');
    });
  });
});
