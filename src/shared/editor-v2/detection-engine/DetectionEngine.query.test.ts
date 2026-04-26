import { buildTagContext, getActiveTagsAtCursor, getEnclosingTags, getTagsInRange } from './DetectionEngine';
import type { ActiveTagsResult, DetectedTag } from './interfaces';

// All tests are in TDD red state — stubs throw 'not implemented'.
// Once implemented, each test must pass exactly as written.

describe('getActiveTagsAtCursor — enclosing tags', () => {
  it('returns bold as enclosing when cursor is inside **hello**', () => {
    const context = buildTagContext('**hello**');
    const result: ActiveTagsResult = getActiveTagsAtCursor(context, { line: 0, ch: 4 });
    expect(result.enclosingTags).toHaveLength(1);
    expect(result.enclosingTags[0].type).toBe('bold');
  });

  it('returns bold when cursor is at open delimiter start (boundary inclusive)', () => {
    const context = buildTagContext('**hello**');
    // cursor at ch:0 is at the first *, which is within open.start..close.end
    const result: ActiveTagsResult = getActiveTagsAtCursor(context, { line: 0, ch: 0 });
    expect(result.enclosingTags[0].type).toBe('bold');
  });

  it('returns bold when cursor is at close delimiter end (boundary inclusive)', () => {
    const context = buildTagContext('**hello**');
    const result: ActiveTagsResult = getActiveTagsAtCursor(context, { line: 0, ch: 9 });
    expect(result.enclosingTags[0].type).toBe('bold');
  });

  it('returns nested tags: bold and italic when cursor inside *italic* inside **bold *italic* bold**', () => {
    const context = buildTagContext('**bold *italic* bold**');
    // cursor inside "italic" at ch:9
    const result: ActiveTagsResult = getActiveTagsAtCursor(context, { line: 0, ch: 9 });
    const types = result.enclosingTags.map((tag) => tag.type);
    expect(types).toContain('bold');
    expect(types).toContain('italic');
  });

  it('returns only bold when cursor is in bold portion outside italic', () => {
    const context = buildTagContext('**bold *italic* bold**');
    const result: ActiveTagsResult = getActiveTagsAtCursor(context, { line: 0, ch: 3 });
    expect(result.enclosingTags.map((tag) => tag.type)).toContain('bold');
    expect(result.enclosingTags.map((tag) => tag.type)).not.toContain('italic');
  });
});

describe('getActiveTagsAtCursor — line tags', () => {
  it.each([
    ['- item',                               3,  'list'],
    ['# Title',                              4,  'heading'],
    ['> note',                               2,  'quote'],
    ['> [!warning] Watch out',               10, 'callout'],
    ['- [ ] task',                           3,  'checkbox'],
    ['> ---',                                2,  'meetingDetails'],
    ['<span style="margin-left:24px"/>item', 5,  'indent'],
  ])('"%s" ch:%i → lineTag=%s', (input, ch, type) => {
    const result: ActiveTagsResult = getActiveTagsAtCursor(buildTagContext(input), { line: 0, ch });
    expect(result.lineTag!.type).toBe(type);
  });

  it('returns null lineTag on a plain line', () => {
    expect(getActiveTagsAtCursor(buildTagContext('plain text'), { line: 0, ch: 3 }).lineTag).toBeNull();
  });
});

describe('getEnclosingTags — selection coverage', () => {
  it('returns bold when selection is fully inside **hello**', () => {
    const context = buildTagContext('**hello**');
    // select "ell" at ch:3..ch:6 — fully inside the bold range
    const tags: DetectedTag[] = getEnclosingTags(context, { line: 0, ch: 3 }, { line: 0, ch: 6 });
    expect(tags).toHaveLength(1);
    expect(tags[0].type).toBe('bold');
  });

  it('returns bold when selection covers exactly the whole tag', () => {
    const context = buildTagContext('**hello**');
    const tags: DetectedTag[] = getEnclosingTags(context, { line: 0, ch: 0 }, { line: 0, ch: 9 });
    expect(tags[0].type).toBe('bold');
  });

  it('returns empty when selection only partially overlaps the tag', () => {
    const context = buildTagContext('**hel**lo');
    // select "llo" — starts inside bold but extends past close.end
    const tags: DetectedTag[] = getEnclosingTags(context, { line: 0, ch: 4 }, { line: 0, ch: 9 });
    expect(tags).toHaveLength(0);
  });

  it('returns empty when selection is entirely outside the tag', () => {
    const context = buildTagContext('**hello** world');
    const tags: DetectedTag[] = getEnclosingTags(context, { line: 0, ch: 10 }, { line: 0, ch: 15 });
    expect(tags).toHaveLength(0);
  });

  it('returns outer tag but not inner when selection spans only the outer range', () => {
    const context = buildTagContext('**bold *italic* bold**');
    // select the full outer bold range
    const tags: DetectedTag[] = getEnclosingTags(context, { line: 0, ch: 0 }, { line: 0, ch: 22 });
    const types = tags.map((tag) => tag.type);
    expect(types).toContain('bold');
    expect(types).not.toContain('italic');
  });

  it('returns color span (isSpan=true) when selection is inside a span tag', () => {
    const ctx = buildTagContext('<span style="color:red">hi</span>');
    // "hi" is at ch:24..ch:26 inside the color span
    expect(getEnclosingTags(ctx, { line: 0, ch: 24 }, { line: 0, ch: 26 })[0]).toMatchObject({ type: 'color', isSpan: true });
  });

  it('returns empty when selection crosses multiple lines (inline tag is single-line only)', () => {
    // **line0** is only on line 0; a selection spanning into line 1 should not return it
    const ctx = buildTagContext('**line0**\nline1');
    expect(getEnclosingTags(ctx, { line: 0, ch: 0 }, { line: 1, ch: 5 })).toHaveLength(0);
  });
});

describe('getActiveTagsAtCursor — span tag and protected-range edge cases', () => {
  it('returns color span as enclosing when cursor is inside a color span', () => {
    const result = getActiveTagsAtCursor(buildTagContext('<span style="color:red">hi</span>'), { line: 0, ch: 25 });
    expect(result.enclosingTags[0]).toMatchObject({ type: 'color', isSpan: true });
  });

  it('returns empty enclosingTags and preserves lineTag when cursor is inside wikilink on a list line', () => {
    const result = getActiveTagsAtCursor(buildTagContext('- [[link]]'), { line: 0, ch: 5 });
    expect(result.enclosingTags).toHaveLength(0);
    expect(result.lineTag!.type).toBe('list');
  });
});

describe('getEnclosingTags — zero-range (start === end)', () => {
  it('returns bold for zero-range selection inside **hello**', () => {
    const tags: DetectedTag[] = getEnclosingTags(buildTagContext('**hello**'), { line: 0, ch: 4 }, { line: 0, ch: 4 });
    expect(tags).toHaveLength(1);
    expect(tags[0].type).toBe('bold');
  });
});

describe('getTagsInRange — tags fully within range', () => {
  it('returns bold when tag is fully inside range', () => {
    expect(getTagsInRange(buildTagContext('**hi** world'), 0, 12).map((t) => t.type)).toContain('bold');
  });

  it('partial overlap: returns empty when tag straddles range boundary', () => {
    expect(getTagsInRange(buildTagContext('**hi**'), 0, 4)).toHaveLength(0);
  });

  it('boundary-exact: returns tag when range matches tag exactly', () => {
    expect(getTagsInRange(buildTagContext('**hi**'), 0, 6)).toHaveLength(1);
  });

  it('zero-range: returns no tags when startCh === endCh', () => {
    expect(getTagsInRange(buildTagContext('**hi**'), 3, 3)).toHaveLength(0);
  });

  it('empty-result: returns empty when no tags fall within range', () => {
    expect(getTagsInRange(buildTagContext('plain **hi**'), 0, 4)).toHaveLength(0);
  });
});

describe('getActiveTagsAtCursor — insertionFormat', () => {
  it('insertionFormat is markdown when cursor is inside bold MD tag', () => {
    expect(getActiveTagsAtCursor(buildTagContext('**hello**'), { line: 0, ch: 4 }).insertionFormat).toBe('markdown');
  });

  it('insertionFormat is html when cursor is inside an HTML span', () => {
    expect(getActiveTagsAtCursor(buildTagContext('<span style="color:red">hi</span>'), { line: 0, ch: 25 }).insertionFormat).toBe('html');
  });
});
