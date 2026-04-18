import { CDP_REQUEST_TIMEOUT_MS, WEBSOCKET_TIMEOUT_MS } from '../constants';

import type {
  CdpPendingRequest,
  CdpProtocolResponse,
  CdpRuntimeEvaluateResponse,
  CdpTarget,
} from '../interfaces';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseProtocolResponse(rawMessage: string): CdpProtocolResponse {
  const parsedMessage = JSON.parse(rawMessage) as unknown;

  if (!isRecord(parsedMessage)) {
    return {};
  }

  const error =
    isRecord(parsedMessage.error) &&
    typeof parsedMessage.error.message === 'string'
      ? { message: parsedMessage.error.message }
      : undefined;

  return {
    error,
    id: typeof parsedMessage.id === 'number' ? parsedMessage.id : undefined,
    result: parsedMessage.result,
  };
}

export class CdpClient {
  #id = 0;
  #pending = new Map<number, CdpPendingRequest>();
  #webSocket: WebSocket;

  constructor(webSocket: WebSocket) {
    this.#webSocket = webSocket;

    webSocket.addEventListener('message', (event) => {
      const response = parseProtocolResponse(String(event.data));

      if (response.id === undefined || !this.#pending.has(response.id)) {
        return;
      }

      const pendingRequest = this.#pending.get(response.id);
      this.#pending.delete(response.id);

      if (!pendingRequest) {
        return;
      }

      clearTimeout(pendingRequest.timeoutHandle);

      if (response.error) {
        pendingRequest.reject(new Error(response.error.message));
        return;
      }

      pendingRequest.resolve(response.result);
    });
  }

  close() {
    this.#webSocket.close();
  }

  async eval<TResult = unknown>(expression: string, awaitPromise = true) {
    const result = await this.send<CdpRuntimeEvaluateResponse>(
      'Runtime.evaluate',
      {
        awaitPromise,
        expression,
        returnByValue: true,
      },
    );

    if (result.exceptionDetails) {
      const message =
        result.exceptionDetails.exception?.description ||
        result.exceptionDetails.text ||
        JSON.stringify(result.exceptionDetails);
      throw new Error(`CDP eval error: ${message}`);
    }

    return result.result?.value as TResult;
  }

  send<TResult>(method: string, params: Record<string, unknown> = {}) {
    return new Promise<TResult>((resolve, reject) => {
      const id = ++this.#id;

      const timeoutHandle = setTimeout(() => {
        this.#pending.delete(id);
        reject(new Error(`CDP request timed out: ${method}`));
      }, CDP_REQUEST_TIMEOUT_MS);

      this.#pending.set(id, { resolve, reject, timeoutHandle });
      this.#webSocket.send(JSON.stringify({ id, method, params }));
    });
  }
}

export async function fetchJson<TResult>(url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return (await response.json()) as TResult;
}

export async function connectCdp(webSocketUrl: string) {
  return new Promise<CdpClient>((resolve, reject) => {
    const webSocket = new WebSocket(webSocketUrl);
    webSocket.addEventListener('open', () => resolve(new CdpClient(webSocket)));
    webSocket.addEventListener('error', (event: Event) => {
      const possibleError = event as ErrorEvent;
      reject(
        new Error(
          `WebSocket error: ${possibleError.message || 'Unknown error'}`,
        ),
      );
    });

    setTimeout(() => {
      reject(new Error('WebSocket connection timed out'));
    }, WEBSOCKET_TIMEOUT_MS);
  });
}

export async function findMainPage(port: number) {
  const targets = await fetchJson<CdpTarget[]>(`http://localhost:${port}/json`);
  const pageTarget =
    targets.find(
      (target) =>
        target.type === 'page' &&
        target.webSocketDebuggerUrl &&
        target.url?.startsWith('app://obsidian.md'),
    ) ||
    targets.find(
      (target) =>
        target.type === 'page' &&
        target.webSocketDebuggerUrl &&
        !target.url?.startsWith('devtools://'),
    ) ||
    targets.find(
      (target) => target.type === 'page' && target.webSocketDebuggerUrl,
    );

  if (!pageTarget?.webSocketDebuggerUrl) {
    throw new Error('No page target found in CDP targets');
  }

  return pageTarget.webSocketDebuggerUrl;
}
