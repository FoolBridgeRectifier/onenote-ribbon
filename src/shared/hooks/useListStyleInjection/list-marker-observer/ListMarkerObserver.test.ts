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

describe('createListMarkerObserver — scrollHandler and selectionHandler', () => {
  let mockScroller: HTMLElement;
  let cleanup: () => void;

  beforeEach(() => {
    jest.clearAllMocks();
    mockScroller = document.createElement('div');
    mockScroller.className = 'cm-scroller';
    document.body.appendChild(mockScroller);

    cleanup = createListMarkerObserver(null, null);
    // Clear the initial stamp call so we can track scheduleStamp calls
    mockStampAllOlSpans.mockClear();
    mockStampAllUlSpans.mockClear();
  });

  afterEach(() => {
    cleanup();
    document.body.removeChild(mockScroller);
  });

  it('calls scheduleStamp when scroll fires on a cm-scroller element', async () => {
    const converter = (_value: number, _depth: number) => '1.';
    cleanup();
    cleanup = createListMarkerObserver(converter, null);
    mockStampAllOlSpans.mockClear();

    // scrollHandler calls scheduleStamp() which queues a microtask
    mockScroller.dispatchEvent(new Event('scroll'));

    await new Promise((resolve) => setTimeout(resolve, 0));

    // scheduleStamp → queueMicrotask → stampAllOlSpans (since converter is set)
    expect(mockStampAllOlSpans).toHaveBeenCalled();
  });

  it('calls scheduleStamp when selectionchange fires on document', async () => {
    const converter = (_value: number, _depth: number) => '1.';
    cleanup();
    cleanup = createListMarkerObserver(converter, null);
    mockStampAllOlSpans.mockClear();

    // selectionHandler calls scheduleStamp()
    document.dispatchEvent(new Event('selectionchange'));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockStampAllOlSpans).toHaveBeenCalled();
  });
});

describe('createListMarkerObserver — markerClickHandler', () => {
  let mockContent: HTMLElement;
  let cleanup: () => void;

  beforeEach(() => {
    jest.clearAllMocks();
    mockContent = document.createElement('div');
    mockContent.className = 'cm-content';
    document.body.appendChild(mockContent);

    cleanup = createListMarkerObserver(null, null);
  });

  afterEach(() => {
    cleanup();
    document.body.removeChild(mockContent);
  });

  it('does nothing when mousedown target has no list-marker parent class', () => {
    const span = document.createElement('span');
    span.className = 'some-other-class';
    mockContent.appendChild(span);

    // Dispatching on child — handler fires but finds no list marker → returns early
    expect(() => {
      span.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    }).not.toThrow();
  });

  it('does nothing when OL marker is inside a HyperMD-task-line', () => {
    const taskLine = document.createElement('div');
    taskLine.className = 'HyperMD-task-line';
    const olMarker = document.createElement('span');
    olMarker.className = 'cm-formatting-list-ol';
    taskLine.appendChild(olMarker);
    mockContent.appendChild(taskLine);

    // Handler returns early at the HyperMD-task-line check
    expect(() => {
      olMarker.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    }).not.toThrow();
  });

  it('handles OL marker without CM6 editorView (returns at editorView check)', () => {
    const olMarker = document.createElement('span');
    olMarker.className = 'cm-formatting-list-ol';
    mockContent.appendChild(olMarker);

    // Handler executes but exits at editorView === undefined check (no CM6 in JSDOM)
    expect(() => {
      olMarker.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    }).not.toThrow();
  });

  it('handles UL marker without CM6 editorView', () => {
    const ulMarker = document.createElement('span');
    ulMarker.className = 'cm-formatting-list-ul';
    mockContent.appendChild(ulMarker);

    expect(() => {
      ulMarker.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    }).not.toThrow();
  });
});

describe('createListMarkerObserver — backspaceHandler', () => {
  let mockContent: HTMLElement;
  let cleanup: () => void;

  beforeEach(() => {
    jest.clearAllMocks();
    mockContent = document.createElement('div');
    mockContent.className = 'cm-content';
    document.body.appendChild(mockContent);

    cleanup = createListMarkerObserver(null, null);
  });

  afterEach(() => {
    cleanup();
    document.body.removeChild(mockContent);
    // Restore any collapsed selection to avoid leaking state between tests
    window.getSelection()?.removeAllRanges();
  });

  it('does nothing when keydown is not Backspace', () => {
    expect(() => {
      mockContent.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Delete', bubbles: true, cancelable: true })
      );
    }).not.toThrow();
  });

  it('does nothing when Backspace is pressed outside a list marker', () => {
    const regularSpan = document.createElement('span');
    regularSpan.className = 'some-other-class';
    const textNode = document.createTextNode('text');
    regularSpan.appendChild(textNode);
    mockContent.appendChild(regularSpan);

    // Collapse selection inside the regular span (not a list marker)
    const range = document.createRange();
    range.setStart(textNode, 0);
    range.collapse(true);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);

    expect(() => {
      mockContent.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true })
      );
    }).not.toThrow();
  });

  it('handles Backspace inside an OL marker and calls preventDefault', () => {
    const olMarker = document.createElement('span');
    olMarker.className = 'cm-formatting-list-ol';
    const textNode = document.createTextNode('1.');
    olMarker.appendChild(textNode);
    mockContent.appendChild(olMarker);

    // Collapse selection inside the OL marker span
    const range = document.createRange();
    range.setStart(textNode, 0);
    range.collapse(true);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);

    const event = new KeyboardEvent('keydown', {
      key: 'Backspace',
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

    mockContent.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('handles Backspace inside a UL marker and calls preventDefault', () => {
    const ulMarker = document.createElement('span');
    ulMarker.className = 'cm-formatting-list-ul';
    const textNode = document.createTextNode('•');
    ulMarker.appendChild(textNode);
    mockContent.appendChild(ulMarker);

    const range = document.createRange();
    range.setStart(textNode, 0);
    range.collapse(true);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);

    const event = new KeyboardEvent('keydown', {
      key: 'Backspace',
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

    mockContent.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('does nothing when Backspace is pressed with a non-collapsed selection', () => {
    // Covers the !selection.isCollapsed branch (returns early when selection spans multiple chars)
    const olMarker = document.createElement('span');
    olMarker.className = 'cm-formatting-list-ol';
    const textNode = document.createTextNode('1.');
    olMarker.appendChild(textNode);
    mockContent.appendChild(olMarker);

    // Create a non-collapsed range spanning both characters
    const range = document.createRange();
    range.setStart(textNode, 0);
    range.setEnd(textNode, 2);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);

    const event = new KeyboardEvent('keydown', {
      key: 'Backspace',
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

    mockContent.dispatchEvent(event);

    // Handler returns early because selection is not collapsed
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it('does nothing when Backspace anchorNode has no parentElement', () => {
    // Covers the !parentElement branch (anchorNode is a detached or non-element node)
    const detachedText = document.createTextNode('detached');

    const range = document.createRange();
    range.setStart(detachedText, 0);
    range.collapse(true);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);

    const event = new KeyboardEvent('keydown', {
      key: 'Backspace',
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

    mockContent.dispatchEvent(event);

    // parentElement is null for a detached text node → handler returns early
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });
});
