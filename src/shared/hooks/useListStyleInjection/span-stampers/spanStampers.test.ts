import {
  stampAllOlSpans,
  stampAllUlSpans,
  clearAllListMarkers,
  extractListLineDepth,
} from './SpanStampers';
import { MARKER_SYMBOL_PADDING } from '../../constants';

// ─────────────────────────────────────────────────────────────────────────────
// Helper: builds a DOM structure with the class hierarchy needed by the stamper.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates an OL formatting span inside a cm-line and appends it to document.body.
 * Returns the span so tests can assert on it.
 */
function createOlSpan(options: {
  textContent: string;
  lineClass?: string;
  insideTaskLine?: boolean;
  existingMarker?: string;
}): HTMLSpanElement {
  const {
    textContent,
    lineClass = 'cm-line HyperMD-list-line HyperMD-list-line-1',
    insideTaskLine = false,
    existingMarker,
  } = options;

  const container = document.createElement('div');

  if (insideTaskLine) {
    container.className = 'HyperMD-task-line';
  }

  const line = document.createElement('div');
  line.className = lineClass;

  const span = document.createElement('span');
  span.className = 'cm-formatting-list-ol';
  span.textContent = textContent;

  if (existingMarker !== undefined) {
    span.setAttribute('data-onr-marker', existingMarker);
  }

  line.appendChild(span);
  container.appendChild(line);
  document.body.appendChild(container);

  return span;
}

/**
 * Creates a UL formatting span inside a cm-line and appends it to document.body.
 */
function createUlSpan(options: {
  textContent: string;
  lineClass?: string;
  insideTaskLine?: boolean;
  existingMarker?: string;
}): HTMLSpanElement {
  const {
    textContent,
    lineClass = 'cm-line HyperMD-list-line HyperMD-list-line-1',
    insideTaskLine = false,
    existingMarker,
  } = options;

  const container = document.createElement('div');

  if (insideTaskLine) {
    container.className = 'HyperMD-task-line';
  }

  const line = document.createElement('div');
  line.className = lineClass;

  const span = document.createElement('span');
  span.className = 'cm-formatting-list-ul';
  span.textContent = textContent;

  if (existingMarker !== undefined) {
    span.setAttribute('data-onr-marker', existingMarker);
  }

  line.appendChild(span);
  container.appendChild(line);
  document.body.appendChild(container);

  return span;
}

// Clean up appended DOM nodes after each test to avoid cross-test contamination.
afterEach(() => {
  document.body.innerHTML = '';
});

// ── extractListLineDepth ──────────────────────────────────────────────────────

describe('extractListLineDepth', () => {
  it('returns the depth number from the HyperMD-list-line-N class', () => {
    const line = document.createElement('div');
    line.className = 'cm-line HyperMD-list-line HyperMD-list-line-2';
    const child = document.createElement('span');
    line.appendChild(child);
    document.body.appendChild(line);

    expect(extractListLineDepth(child)).toBe(2);
  });

  it('returns null when no cm-line ancestor exists', () => {
    const orphan = document.createElement('span');
    document.body.appendChild(orphan);

    expect(extractListLineDepth(orphan)).toBeNull();
  });

  it('returns null when cm-line has no HyperMD-list-line-N class', () => {
    const line = document.createElement('div');
    line.className = 'cm-line';
    const child = document.createElement('span');
    line.appendChild(child);
    document.body.appendChild(line);

    expect(extractListLineDepth(child)).toBeNull();
  });
});

// ── stampAllOlSpans ───────────────────────────────────────────────────────────

describe('stampAllOlSpans', () => {
  const converter = (value: number, depth: number) => `${value}. (d${depth}) `;

  it('stamps a valid OL span with the converter output', () => {
    const span = createOlSpan({ textContent: '1. ' });

    stampAllOlSpans(converter);

    expect(span.getAttribute('data-onr-marker')).toBe('1. (d1) ');
  });

  it('removes data-onr-marker from a task-line OL span', () => {
    const span = createOlSpan({
      textContent: '1. ',
      insideTaskLine: true,
      existingMarker: 'old-marker',
    });

    stampAllOlSpans(converter);

    expect(span.hasAttribute('data-onr-marker')).toBe(false);
  });

  it('does not set data-onr-marker when text does not match OL_NUMBER_REGEX', () => {
    const span = createOlSpan({ textContent: 'bullet' });

    stampAllOlSpans(converter);

    expect(span.hasAttribute('data-onr-marker')).toBe(false);
  });

  it('removes existing data-onr-marker when text does not match OL_NUMBER_REGEX', () => {
    const span = createOlSpan({ textContent: 'bullet', existingMarker: 'old' });

    stampAllOlSpans(converter);

    expect(span.hasAttribute('data-onr-marker')).toBe(false);
  });

  it('removes data-onr-marker when there is no cm-line ancestor for depth extraction', () => {
    // Create a span that has a cm-line but no HyperMD-list-line-N class (depth = null)
    const span = createOlSpan({
      textContent: '1. ',
      lineClass: 'cm-line',
      existingMarker: 'stale',
    });

    stampAllOlSpans(converter);

    expect(span.hasAttribute('data-onr-marker')).toBe(false);
  });

  it('does not call setAttribute again when the marker value is already correct (idempotent)', () => {
    const span = createOlSpan({ textContent: '1. ', existingMarker: '1. (d1) ' });
    const setAttribute = jest.spyOn(span, 'setAttribute');

    stampAllOlSpans(converter);

    // Marker unchanged — setAttribute must NOT have been called
    expect(setAttribute).not.toHaveBeenCalled();
  });
});

// ── stampAllUlSpans ───────────────────────────────────────────────────────────

describe('stampAllUlSpans', () => {
  // Classic bullet levels: ●, ○, ■, □
  const levels: [string, string, string, string] = ['●', '○', '■', '□'];

  it('stamps a UL span that matches the UL_MARKER_REGEX', () => {
    // UL_MARKER_REGEX is /^[-*+]\s$/ — text must be "- " (marker + whitespace)
    const span = createUlSpan({ textContent: '- ' });

    stampAllUlSpans(levels);

    const expectedMarker = `●${MARKER_SYMBOL_PADDING}`;
    expect(span.getAttribute('data-onr-marker')).toBe(expectedMarker);
  });

  it('removes data-onr-marker from a task-line UL span', () => {
    const span = createUlSpan({
      textContent: '- ',
      insideTaskLine: true,
      existingMarker: 'old',
    });

    stampAllUlSpans(levels);

    expect(span.hasAttribute('data-onr-marker')).toBe(false);
  });

  it('removes data-onr-marker when text does not match UL_MARKER_REGEX', () => {
    const span = createUlSpan({ textContent: 'xyz', existingMarker: 'old' });

    stampAllUlSpans(levels);

    expect(span.hasAttribute('data-onr-marker')).toBe(false);
  });

  it('removes data-onr-marker when depth cannot be extracted', () => {
    // cm-line without HyperMD-list-line-N class → depth = null
    const span = createUlSpan({ textContent: '- ', lineClass: 'cm-line', existingMarker: 'old' });

    stampAllUlSpans(levels);

    expect(span.hasAttribute('data-onr-marker')).toBe(false);
  });
});

// ── clearAllListMarkers ───────────────────────────────────────────────────────

describe('clearAllListMarkers', () => {
  it('removes data-onr-marker from all OL and UL spans that have it', () => {
    const olSpan = createOlSpan({ textContent: '1. ', existingMarker: '1. ' });
    const ulSpan = createUlSpan({ textContent: '-', existingMarker: '●  ' });

    clearAllListMarkers();

    expect(olSpan.hasAttribute('data-onr-marker')).toBe(false);
    expect(ulSpan.hasAttribute('data-onr-marker')).toBe(false);
  });

  it('does nothing when no spans have data-onr-marker', () => {
    // Should not throw even when no spans are present
    expect(() => clearAllListMarkers()).not.toThrow();
  });
});
