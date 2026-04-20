/** @jest-environment node */

import {
  RIBBON_READY_TIMEOUT_MS,
  WORKSPACE_READY_TIMEOUT_MS,
} from '../constants';
import { pollUntil, sleep } from '../polling/polling';
import {
  dismissTrustModal,
  waitForWorkspaceAndRibbon,
} from './workspaceSetup';

import type { CdpClient } from '../cdpClient/cdpClient';

jest.mock('../polling/polling', () => ({
  pollUntil: jest.fn(),
  sleep: jest.fn(),
}));

const mockedPollUntil = pollUntil as jest.MockedFunction<typeof pollUntil>;
const mockedSleep = sleep as jest.MockedFunction<typeof sleep>;

function createCdpClient(
  evalImplementation: (expression: string) => Promise<unknown>,
) {
  return {
    eval: jest.fn((expression: string) => evalImplementation(expression)),
  } as unknown as CdpClient;
}

describe('workspaceSetup', () => {
  beforeEach(() => {
    mockedPollUntil.mockReset();
    mockedSleep.mockReset();
    mockedSleep.mockResolvedValue(undefined);
  });

  it('dismissTrustModal waits after a successful click by default', async () => {
    const cdpClient = createCdpClient(async () => true);

    const trustButtonClicked = await dismissTrustModal(cdpClient);

    expect(trustButtonClicked).toBe(true);
    expect(mockedSleep).toHaveBeenCalledTimes(1);
  });

  it('dismissTrustModal does not wait when no trust modal button is found', async () => {
    const cdpClient = createCdpClient(async () => false);

    const trustButtonClicked = await dismissTrustModal(cdpClient);

    expect(trustButtonClicked).toBe(false);
    expect(mockedSleep).not.toHaveBeenCalled();
  });

  it('waitForWorkspaceAndRibbon dismisses trust modal while polling readiness', async () => {
    mockedPollUntil.mockImplementation(async (predicate) => {
      for (let attemptIndex = 0; attemptIndex < 6; attemptIndex += 1) {
        const predicateResult = await predicate();

        if (predicateResult) {
          return predicateResult;
        }
      }

      throw new Error('Predicate did not resolve truthy in mocked pollUntil');
    });

    const workspaceResponses = [false, true];
    const ribbonResponses = [false, true];

    const cdpClient = createCdpClient(async (expression) => {
      if (expression === '!!app?.workspace') {
        return workspaceResponses.shift() ?? true;
      }

      if (expression.includes('[data-panel]')) {
        return ribbonResponses.shift() ?? true;
      }

      return false;
    });

    await waitForWorkspaceAndRibbon(cdpClient);

    const evalMock = cdpClient.eval as jest.MockedFunction<CdpClient['eval']>;
    const callExpressions = evalMock.mock.calls.map(([expression]) =>
      String(expression),
    );

    expect(callExpressions[0]).toContain('querySelectorAll');
    expect(callExpressions).toContain('!!app?.workspace');
    expect(
      callExpressions.some((expression) => expression.includes('[data-panel]')),
    ).toBe(true);

    expect(mockedPollUntil).toHaveBeenNthCalledWith(
      1,
      expect.any(Function),
      expect.objectContaining({
        label: 'app.workspace',
        timeout: WORKSPACE_READY_TIMEOUT_MS,
      }),
    );
    expect(mockedPollUntil).toHaveBeenNthCalledWith(
      2,
      expect.any(Function),
      expect.objectContaining({
        label: expect.stringContaining('ribbon DOM'),
        timeout: RIBBON_READY_TIMEOUT_MS,
      }),
    );
  });
});
