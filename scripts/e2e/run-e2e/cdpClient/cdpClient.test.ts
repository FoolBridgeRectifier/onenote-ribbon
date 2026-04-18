/** @jest-environment node */

import { CdpClient } from './cdpClient';

class MockWebSocket {
  private listeners: Record<string, Array<(event: { data: string }) => void>> =
    {};

  addEventListener(
    eventName: string,
    listener: (event: { data: string }) => void,
  ) {
    this.listeners[eventName] = this.listeners[eventName] ?? [];
    this.listeners[eventName].push(listener);
  }

  close() {
    // no-op for test double
  }

  emitMessage(payload: unknown) {
    const messageListeners = this.listeners.message ?? [];

    for (const listener of messageListeners) {
      listener({ data: JSON.stringify(payload) });
    }
  }

  send(_message: string) {
    // no-op for test double
  }
}

describe('CdpClient', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('resolves a request when protocol response arrives', async () => {
    const mockWebSocket = new MockWebSocket();
    const cdpClient = new CdpClient(mockWebSocket as unknown as WebSocket);

    const pendingResult = cdpClient.send<{ ok: boolean }>('Runtime.evaluate', {
      expression: '1 + 1',
    });

    mockWebSocket.emitMessage({ id: 1, result: { ok: true } });

    await expect(pendingResult).resolves.toEqual({ ok: true });
  });

  it('rejects request when response never arrives', async () => {
    const mockWebSocket = new MockWebSocket();
    const cdpClient = new CdpClient(mockWebSocket as unknown as WebSocket);

    const pendingResult = cdpClient.send('Runtime.evaluate', {
      expression: 'window.app',
    });
    const rejectionExpectation = expect(pendingResult).rejects.toThrow(
      'CDP request timed out: Runtime.evaluate',
    );

    await jest.advanceTimersByTimeAsync(10001);

    await rejectionExpectation;
  });
});
