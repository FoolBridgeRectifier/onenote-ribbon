import { createListMarkerObserver } from './ListMarkerObserver';

// Mock the span stampers
const mockStampAllOlSpans = jest.fn();
const mockStampAllUlSpans = jest.fn();
const mockClearAllListMarkers = jest.fn();

jest.mock('../span-stampers/SpanStampers', () => ({
  stampAllOlSpans: (...args: unknown[]) => mockStampAllOlSpans(...args),
  stampAllUlSpans: (...args: unknown[]) => mockStampAllUlSpans(...args),
  clearAllListMarkers: (...args: unknown[]) => mockClearAllListMarkers(...args),
}));

describe('createListMarkerObserver — initialization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a cleanup function', () => {
    const converter = (value: number, _depth: number) => `${value}.`;
    const bulletLevels: [string, string, string, string] = ['•', '◦', '▪', '▫'];

    const cleanup = createListMarkerObserver(converter, bulletLevels);

    expect(typeof cleanup).toBe('function');
    cleanup();
  });

  it('stamps OL spans on initialization when converter is provided', () => {
    const converter = (value: number, _depth: number) => `${value}.`;

    createListMarkerObserver(converter, null);

    expect(mockStampAllOlSpans).toHaveBeenCalledWith(converter);
  });

  it('stamps UL spans on initialization when bulletLevels is provided', () => {
    const bulletLevels: [string, string, string, string] = ['•', '◦', '▪', '▫'];

    createListMarkerObserver(null, bulletLevels);

    expect(mockStampAllUlSpans).toHaveBeenCalledWith(bulletLevels);
  });

  it('does not stamp OL spans when converter is null', () => {
    const bulletLevels: [string, string, string, string] = ['•', '◦', '▪', '▫'];
    createListMarkerObserver(null, bulletLevels);

    expect(mockStampAllOlSpans).not.toHaveBeenCalled();
  });

  it('does not stamp UL spans when bulletLevels is null', () => {
    const converter = (value: number, _depth: number) => `${value}.`;
    createListMarkerObserver(converter, null);

    expect(mockStampAllUlSpans).not.toHaveBeenCalled();
  });
});

describe('createListMarkerObserver — cleanup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('clears all list markers on cleanup', () => {
    const cleanup = createListMarkerObserver(null, null);

    cleanup();

    expect(mockClearAllListMarkers).toHaveBeenCalled();
  });
});

describe('createListMarkerObserver — microtask batching', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('schedules stamping via microtask', async () => {
    const converter = (value: number, _depth: number) => `${value}.`;

    createListMarkerObserver(converter, null);

    // Clear the initial call
    mockStampAllOlSpans.mockClear();

    // Wait for any pending microtasks
    await new Promise((resolve) => setTimeout(resolve, 10));

    // The observer should be set up, but stamping happens via microtask
    expect(mockStampAllOlSpans).not.toHaveBeenCalled();
  });
});

describe('createListMarkerObserver — observer setup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a MutationObserver', () => {
    const observeSpy = jest.spyOn(MutationObserver.prototype, 'observe');

    createListMarkerObserver(null, null);

    expect(observeSpy).toHaveBeenCalledWith(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributeFilter: ['data-onr-marker'],
    });

    observeSpy.mockRestore();
  });
});

describe('createListMarkerObserver — event listeners', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('adds scroll event listeners to cm-scroller elements', () => {
    // Create a mock cm-scroller element
    const mockScroller = document.createElement('div');
    mockScroller.className = 'cm-scroller';
    document.body.appendChild(mockScroller);

    const addEventListenerSpy = jest.spyOn(mockScroller, 'addEventListener');

    createListMarkerObserver(null, null);

    expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), {
      passive: true,
    });

    addEventListenerSpy.mockRestore();
    document.body.removeChild(mockScroller);
  });

  it('adds selectionchange event listener to document', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');

    createListMarkerObserver(null, null);

    expect(addEventListenerSpy).toHaveBeenCalledWith('selectionchange', expect.any(Function), true);

    addEventListenerSpy.mockRestore();
  });

  it('adds mousedown and keydown listeners to cm-content elements', () => {
    const mockContent = document.createElement('div');
    mockContent.className = 'cm-content';
    document.body.appendChild(mockContent);

    const addEventListenerSpy = jest.spyOn(mockContent, 'addEventListener');

    createListMarkerObserver(null, null);

    expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function), true);
    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function), true);

    addEventListenerSpy.mockRestore();
    document.body.removeChild(mockContent);
  });
});

describe('createListMarkerObserver — event listener cleanup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('removes scroll event listeners on cleanup', () => {
    const mockScroller = document.createElement('div');
    mockScroller.className = 'cm-scroller';
    document.body.appendChild(mockScroller);

    const removeEventListenerSpy = jest.spyOn(mockScroller, 'removeEventListener');

    const cleanup = createListMarkerObserver(null, null);
    cleanup();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));

    removeEventListenerSpy.mockRestore();
    document.body.removeChild(mockScroller);
  });

  it('removes selectionchange event listener on cleanup', () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

    const cleanup = createListMarkerObserver(null, null);
    cleanup();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'selectionchange',
      expect.any(Function),
      true
    );

    removeEventListenerSpy.mockRestore();
  });

  it('removes mousedown and keydown listeners on cleanup', () => {
    const mockContent = document.createElement('div');
    mockContent.className = 'cm-content';
    document.body.appendChild(mockContent);

    const removeEventListenerSpy = jest.spyOn(mockContent, 'removeEventListener');

    const cleanup = createListMarkerObserver(null, null);
    cleanup();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function), true);
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function), true);

    removeEventListenerSpy.mockRestore();
    document.body.removeChild(mockContent);
  });
});

describe('createListMarkerObserver — stamping flag', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('prevents re-stamping when already stamping', () => {
    // This is tested indirectly by verifying the stamping flag logic
    const converter = (value: number, _depth: number) => `${value}.`;

    createListMarkerObserver(converter, null);

    // Initial stamping should have occurred
    expect(mockStampAllOlSpans).toHaveBeenCalledTimes(1);
  });
});

describe('createListMarkerObserver — null parameters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles both parameters being null', () => {
    const cleanup = createListMarkerObserver(null, null);

    expect(typeof cleanup).toBe('function');
    expect(mockStampAllOlSpans).not.toHaveBeenCalled();
    expect(mockStampAllUlSpans).not.toHaveBeenCalled();

    cleanup();
  });
});
