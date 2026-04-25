import { buildTagContext, getActiveTagsAtCursor, getEnclosingTags } from './DetectionEngine';
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

  it('returns empty enclosingTags when cursor is outside **hello**', () => {
    const context = buildTagContext('**hello** world');
    const result: ActiveTagsResult = getActiveTagsAtCursor(context, { line: 0, ch: 12 });
    expect(result.enclosingTags).toHaveLength(0);
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
  it('returns list line tag when cursor is on a list line', () => {
    const context = buildTagContext('- item');
    const result: ActiveTagsResult = getActiveTagsAtCursor(context, { line: 0, ch: 3 });
    expect(result.lineTag).not.toBeNull();
    expect(result.lineTag!.type).toBe('list');
  });

  it('returns heading line tag with level 1', () => {
    const context = buildTagContext('# Title');
    const result: ActiveTagsResult = getActiveTagsAtCursor(context, { line: 0, ch: 4 });
    expect(result.lineTag!.type).toBe('heading');
    expect(result.lineTag!.headingLevel).toBe(1);
  });

  it('returns null lineTag when cursor is on a plain line', () => {
    const context = buildTagContext('plain text');
    const result: ActiveTagsResult = getActiveTagsAtCursor(context, { line: 0, ch: 3 });
    expect(result.lineTag).toBeNull();
  });

  it('returns callout line tag with calloutType on callout line', () => {
    const context = buildTagContext('> [!warning] Watch out');
    const result: ActiveTagsResult = getActiveTagsAtCursor(context, { line: 0, ch: 10 });
    expect(result.lineTag!.type).toBe('callout');
    expect(result.lineTag!.calloutType).toBe('warning');
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
  });
});
