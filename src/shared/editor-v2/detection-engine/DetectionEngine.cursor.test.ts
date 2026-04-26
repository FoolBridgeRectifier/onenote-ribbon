import { buildTagContext, getActiveTagsAtCursor, getEnclosingTags } from './DetectionEngine';
import type { DetectedTag } from './interfaces';

// All tests in TDD red state -- stubs throw 'not implemented'.

describe('getActiveTagsAtCursor -- MD delimiter boundaries', () => {
  // **hello**: open ch:0..2, content ch:2..7, close ch:7..9
  it.each<[string, number, string | null]>([
    ['**hello**',    0, 'bold'],    // open delimiter start
    ['**hello**',    1, 'bold'],    // inside opening **
    ['**hello**',    7, 'bold'],    // first char of closing **
    ['**hello** x', 10, null],      // past end of tag
    ['*hello*',      1, 'italic'],  // single-char * delimiter
  ])('%s ch:%i -> %s', (input, ch, expected) => {
    const result = getActiveTagsAtCursor(buildTagContext(input), { line: 0, ch });
    if (expected) expect(result.enclosingTags[0].type).toBe(expected);
    else expect(result.enclosingTags).toHaveLength(0);
  });
});

describe('getActiveTagsAtCursor -- HTML tag cursor positions', () => {
  // <b>hello</b> x : open ch:0..3, content ch:3..8, close ch:8..12, space ch:12, x ch:13
  it.each<[number, boolean]>([[0, true], [5, true], [8, true], [13, false]])(
    'ch:%i in "<b>hello</b> x" -> hasBold=%s', (ch, hasBold) => {
      const result = getActiveTagsAtCursor(buildTagContext('<b>hello</b> x'), { line: 0, ch });
      if (hasBold) expect(result.enclosingTags[0]).toMatchObject({ type: 'bold', isHTML: true });
      else expect(result.enclosingTags).toHaveLength(0);
    }
  );

  it('ch:8 inside <b><i>text</i></b> -> both bold and italic', () => {
    const types = getActiveTagsAtCursor(buildTagContext('<b><i>text</i></b>'), { line: 0, ch: 8 }).enclosingTags.map((t) => t.type);
    expect(types).toContain('bold');
    expect(types).toContain('italic');
  });
});

describe('getActiveTagsAtCursor -- cursor between adjacent tags', () => {
  // "**a** **b**": first bold ch:0..5, gap at ch:5, second bold ch:6..11
  it.each<[number, number]>([
    [4, 1],  // last char of closing ** in **a**
    [5, 0],  // gap between the two bold tags
    [6, 1],  // first char of opening ** in **b**
  ])('ch:%i in "**a** **b**" -> %i enclosing bold(s)', (ch, count) => {
    expect(getActiveTagsAtCursor(buildTagContext('**a** **b**'), { line: 0, ch }).enclosingTags.filter((t) => t.type === 'bold')).toHaveLength(count);
  });
});

describe('getActiveTagsAtCursor -- cursor on line with prefix tag and inline tag', () => {
  // Tests that lineTag and enclosingTags are both returned for all prefix types.
  it.each<[string, number, string, boolean]>([
    ['- **item**',     5, 'list',     true],   // cursor inside bold on list line
    ['> **text**',     5, 'quote',    true],   // cursor inside bold on quote line
    ['# **title**',    5, 'heading',  true],   // cursor inside bold on heading line
    ['- [ ] **task**', 8, 'checkbox', true],   // cursor inside bold on checkbox line
    ['- **item**',     1, 'list',     false],  // cursor on prefix only -- no inline tag
  ])('"%s" ch:%i -> lineTag=%s enclosingBold=%s', (input, ch, lineType, hasBold) => {
    const result = getActiveTagsAtCursor(buildTagContext(input), { line: 0, ch });
    expect(result.lineTag!.type).toBe(lineType);
    expect(result.enclosingTags.some((t) => t.type === 'bold')).toBe(hasBold);
  });
});

describe('getActiveTagsAtCursor -- cursor in multi-line document', () => {
  it.each<[number, string | null]>([[0, null], [1, 'bold']])(
    'line:%i in plain/bold/more -> enclosingBold=%s', (line, expected) => {
      const result = getActiveTagsAtCursor(buildTagContext('plain\n**bold**\nmore'), { line, ch: 3 });
      if (expected) expect(result.enclosingTags[0].type).toBe(expected);
      else { expect(result.enclosingTags).toHaveLength(0); expect(result.lineTag).toBeNull(); }
    }
  );

  it.each<[number, string]>([[0, 'list'], [1, 'heading'], [2, 'quote']])(
    'line:%i in "- list / # heading / > quote" -> lineTag.type=%s', (line, type) => {
      expect(getActiveTagsAtCursor(buildTagContext('- list\n# heading\n> quote'), { line, ch: 3 }).lineTag!.type).toBe(type);
    }
  );
});

describe('getActiveTagsAtCursor -- cursor inside inert zone', () => {
  it.each<[string, number]>([
    ['```\n**bold**\n```', 1],
    ['$$\n**bold**\n$$',   1],
    ['\t**bold**',         0],
  ])('%s: cursor inside -> empty + null lineTag', (input, lineNum) => {
    const result = getActiveTagsAtCursor(buildTagContext(input), { line: lineNum, ch: 4 });
    expect(result.enclosingTags).toHaveLength(0);
    expect(result.lineTag).toBeNull();
  });

  it('bold tag before fenced block is detected normally', () => {
    expect(getActiveTagsAtCursor(buildTagContext('**ok**\n```\n**ignored**\n```'), { line: 0, ch: 3 }).enclosingTags[0].type).toBe('bold');
  });
});

describe('getActiveTagsAtCursor -- cursor adjacent to protected range', () => {
  it.each<[string, number]>([
    ['before [[Page]] after',       10],  // wikilink
    ['before ![[img.png]] after',   10],  // embed
    ['[text](https://x.com) end',    4],  // mdLink
    ['text [^ref] end',              7],  // footnote ref
    ['text #todo buy milk',          6],  // inline todo token
    ['before `code` after',          9],  // inline code tick
  ])('cursor inside protected range "%s" -> empty enclosingTags', (input, ch) => {
    expect(getActiveTagsAtCursor(buildTagContext(input), { line: 0, ch }).enclosingTags).toHaveLength(0);
  });

  it('bold enclosing [[wikilink]] still returns bold when cursor is inside', () => {
    const types = getActiveTagsAtCursor(buildTagContext('**before [[Page]] after**'), { line: 0, ch: 12 }).enclosingTags.map((t) => t.type);
    expect(types).toContain('bold');
  });
});

describe('getEnclosingTags -- additional cursor-related coverage', () => {
  it('zero-width selection inside **hello** -> bold', () => {
    const tags: DetectedTag[] = getEnclosingTags(buildTagContext('**hello**'), { line: 0, ch: 4 }, { line: 0, ch: 4 });
    expect(tags[0].type).toBe('bold');
  });

  it('selection crossing open boundary -> empty', () => {
    // "x **hello**": bold opens at ch:2; selection ch:0..ch:6 starts outside the tag
    expect(getEnclosingTags(buildTagContext('x **hello**'), { line: 0, ch: 0 }, { line: 0, ch: 6 })).toHaveLength(0);
  });

  it('selection inside <b>hello</b> -> bold with isHTML=true', () => {
    expect(getEnclosingTags(buildTagContext('<b>hello</b>'), { line: 0, ch: 3 }, { line: 0, ch: 7 })[0]).toMatchObject({ type: 'bold', isHTML: true });
  });

  it('selection inside <b><i>text</i></b> -> both bold and italic', () => {
    // "text" at ch:6..ch:10 inside <i> inside <b>
    const types = getEnclosingTags(buildTagContext('<b><i>text</i></b>'), { line: 0, ch: 6 }, { line: 0, ch: 10 }).map((t) => t.type);
    expect(types).toContain('bold');
    expect(types).toContain('italic');
  });

  it('selection inside color span -> span tag with isSpan=true', () => {
    // "hi" is at ch:24..ch:26 inside <span style="color:red">
    expect(getEnclosingTags(buildTagContext('<span style="color:red">hi</span>'), { line: 0, ch: 24 }, { line: 0, ch: 26 })[0]).toMatchObject({ type: 'color', isSpan: true });
  });

  it('multi-line selection -> does not return single-line inline tag', () => {
    // **line0** is on line 0 only; selection spanning into line 1 should not return it
    expect(getEnclosingTags(buildTagContext('**line0**\nline1'), { line: 0, ch: 0 }, { line: 1, ch: 5 })).toHaveLength(0);
  });

  it('selection crossing close boundary (starts inside, ends outside) -> empty', () => {
    // **hello** x: selection ch:5..10 starts inside content but ends past close.end (ch:9)
    expect(getEnclosingTags(buildTagContext('**hello** x'), { line: 0, ch: 5 }, { line: 0, ch: 10 })).toHaveLength(0);
  });

  it('zero-width at open.end (ch:2) inside **hello** -> bold', () => {
    expect(getEnclosingTags(buildTagContext('**hello**'), { line: 0, ch: 2 }, { line: 0, ch: 2 })[0].type).toBe('bold');
  });

  it('zero-width at close.start (ch:7) inside **hello** -> bold', () => {
    expect(getEnclosingTags(buildTagContext('**hello**'), { line: 0, ch: 7 }, { line: 0, ch: 7 })[0].type).toBe('bold');
  });
});