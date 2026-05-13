import { ELineTagType, EMdStyleTagType } from '../../../../../interfaces';
import type { TMatchRecord } from '../../../interfaces';
import { propagateCalloutTitles } from '../propagateCalloutTitles';

const makeCallout = (line: number, title?: string): TMatchRecord => ({
  type: ELineTagType.CALLOUT,
  isHTML: false,
  open: { start: { line, ch: 0 }, end: { line, ch: 5 } },
  ...(title !== undefined ? { title: [title] } : {}),
});

const makeNonCallout = (): TMatchRecord => ({
  type: EMdStyleTagType.BOLD,
  isHTML: false,
  open: { start: { line: 0, ch: 0 }, end: { line: 0, ch: 2 } },
});

describe('propagateCalloutTitles', () => {
  test('non-CALLOUT records are skipped and returned unchanged', () => {
    const bold = makeNonCallout();
    const result = propagateCalloutTitles('', [bold]);
    expect(result).toEqual([bold]);
  });

  test('CALLOUT record without the open key is skipped', () => {
    const calloutNoOpen: TMatchRecord = { type: ELineTagType.CALLOUT, isHTML: false };
    const result = propagateCalloutTitles('> [!note]', [calloutNoOpen]);
    // No modification — skipped by the guard.
    expect(result).toEqual([calloutNoOpen]);
  });

  test('CALLOUT record with open=undefined is skipped', () => {
    const calloutUndefinedOpen: TMatchRecord = {
      type: ELineTagType.CALLOUT,
      isHTML: false,
      open: undefined,
    };
    const result = propagateCalloutTitles('> [!note]', [calloutUndefinedOpen]);
    expect(result).toEqual([calloutUndefinedOpen]);
  });

  test('single opener: title is preserved unchanged', () => {
    const content = '> [!note] My Note';
    const callout = makeCallout(0, 'My Note');

    const result = propagateCalloutTitles(content, [callout]);

    expect(result[0].title).toEqual(['My Note']);
  });

  test('continuation without own title inherits parent title', () => {
    // Line 0: opener with title; line 1: continuation (no title).
    const content = '> [!note] My Note\n> continuation';
    const opener = makeCallout(0, 'My Note');
    const continuation = makeCallout(1); // no title

    const result = propagateCalloutTitles(content, [opener, continuation]);

    expect(result[0].title).toEqual(['My Note']);
    expect(result[1].title).toEqual(['My Note']);
  });

  test('continuation at depth 1 with empty title: title becomes undefined', () => {
    // No title set and stack has nothing at depth 1.
    const content = '> continuation';
    const continuationOnly = makeCallout(0); // no title, empty stack

    const result = propagateCalloutTitles(content, [continuationOnly]);

    expect(result[0].title).toBeUndefined();
  });

  test('nested callout at depth 2 inherits chain [outerTitle, innerTitle]', () => {
    // Line 0: depth-1 opener; line 1: depth-2 opener.
    const content = '> [!outer] Outer\n>> [!inner] Inner';
    const outerCallout = makeCallout(0, 'Outer');
    const innerCallout = makeCallout(1, 'Inner');

    const result = propagateCalloutTitles(content, [outerCallout, innerCallout]);

    expect(result[0].title).toEqual(['Outer']);
    expect(result[1].title).toEqual(['Outer', 'Inner']);
  });

  test('ascending to shallower depth clears deeper titles', () => {
    // Line 0: depth-1 opener; line 1: depth-2 opener; line 2: depth-1 continuation.
    const content = '> [!outer] Outer\n>> [!inner] Inner\n> back-to-depth1';
    const outerCallout = makeCallout(0, 'Outer');
    const innerCallout = makeCallout(1, 'Inner');
    const backToDepth1 = makeCallout(2); // no own title, depth-1 continuation

    const result = propagateCalloutTitles(content, [outerCallout, innerCallout, backToDepth1]);

    expect(result[2].title).toEqual(['Outer']);
  });

  test('line index out of range defaults depth to 1 (optional chain fallback)', () => {
    // Content has 1 line, but callout is on line 5 → lines[5] is undefined → depth = 1.
    const content = '> [!note] Note';
    const calloutOnMissingLine = makeCallout(5, 'Orphan');

    const result = propagateCalloutTitles(content, [calloutOnMissingLine]);

    // Depth defaults to 1; titleStack[0] = 'Orphan'; chain = ['Orphan'].
    expect(result[0].title).toEqual(['Orphan']);
  });

  test('returns empty array for empty input', () => {
    expect(propagateCalloutTitles('', [])).toEqual([]);
  });
});
