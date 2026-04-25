import { toggleTag, removeAllTags } from './StylingEngine';
import type { StylingContext } from './interfaces';
import { BOLD_MD, BOLD_HTML, SUBSCRIPT_HTML, SUPERSCRIPT_HTML } from './constants';

// All tests are in TDD red state — stubs throw 'not implemented'.
// Once implemented, each test must pass exactly as written.

function selectAll(sourceText: string): StylingContext {
  return { sourceText, selectionStartOffset: 0, selectionEndOffset: sourceText.length };
}

function selectRange(sourceText: string, start: number, end: number): StylingContext {
  return { sourceText, selectionStartOffset: start, selectionEndOffset: end };
}

describe('R1 — MD exact match: remove both delimiters', () => {
  it('removes ** from **hello** when selecting the whole tag', () => {
    const result = toggleTag(selectAll('**hello**'), BOLD_MD);
    expect(result.isNoOp).toBe(false);
    // Last-to-first: remove closing ** at 7..9, then opening ** at 0..2
    expect(result.replacements).toHaveLength(2);
    expect(result.replacements[0]).toEqual({ fromOffset: 7, toOffset: 9, replacementText: '' });
    expect(result.replacements[1]).toEqual({ fromOffset: 0, toOffset: 2, replacementText: '' });
  });
});

describe('R2 — MD partial (punch-out): un-tag selection only', () => {
  it('punch-out: **hel[lo]** → **hel**[lo]', () => {
    // "lo" is at offset 5..7 inside **hello** (0..9)
    const result = toggleTag(selectRange('**hello**', 5, 7), BOLD_MD);
    expect(result.isNoOp).toBe(false);
    // Should close bold before "lo" and not re-open after:
    // replacements inject </bold close> before selection and remove the original close after selection
    expect(result.replacements.length).toBeGreaterThan(0);
  });
});

describe('R3 — MD delimiter-inclusive: selection includes the delimiters', () => {
  it('removes delimiters when selection includes ** delimiters', () => {
    // Select entire "**hello**" including delimiters
    const result = toggleTag(selectAll('**hello**'), BOLD_MD);
    const outputText = applyReplacements('**hello**', result.replacements);
    expect(outputText).toBe('hello');
  });
});

describe('R5 — HTML full: unwrap HTML tag', () => {
  it('removes <b>...</b> from selection covering entire tag', () => {
    const result = toggleTag(selectAll('<b>hello</b>'), BOLD_HTML);
    expect(result.isNoOp).toBe(false);
    const outputText = applyReplacements('<b>hello</b>', result.replacements);
    expect(outputText).toBe('hello');
  });
});

describe('R6 — HTML partial punch-out', () => {
  it('punch-out: <b>hel[lo]</b> → <b>hel</b>[lo]', () => {
    // Select "lo" at offset 6..8 inside <b>hello</b>
    const result = toggleTag(selectRange('<b>hello</b>', 6, 8), BOLD_HTML);
    expect(result.isNoOp).toBe(false);
    expect(result.replacements.length).toBeGreaterThan(0);
  });
});

describe('R9 — MD + HTML equivalent both present: remove both', () => {
  it('removes both ** and <b> when both are present', () => {
    const sourceText = '<b>**hello**</b>';
    const result = toggleTag(selectAll(sourceText), BOLD_MD);
    const outputText = applyReplacements(sourceText, result.replacements);
    expect(outputText).toBe('hello');
  });
});

describe('R10–R11 — sub/sup mutual exclusion swap', () => {
  it('R10: swaps <sub> to <sup> when toggling superscript on subscript', () => {
    const sourceText = '<sub>x</sub>';
    const result = toggleTag(selectAll(sourceText), SUPERSCRIPT_HTML);
    const outputText = applyReplacements(sourceText, result.replacements);
    expect(outputText).toBe('<sup>x</sup>');
  });

  it('R11: swaps <sup> to <sub> when toggling subscript on superscript', () => {
    const sourceText = '<sup>x</sup>';
    const result = toggleTag(selectAll(sourceText), SUBSCRIPT_HTML);
    const outputText = applyReplacements(sourceText, result.replacements);
    expect(outputText).toBe('<sub>x</sub>');
  });
});

describe('R13 — Stacked same-type: remove all duplicate layers', () => {
  it('removes all layers of <b><b>text</b></b>', () => {
    const sourceText = '<b><b>hello</b></b>';
    const result = toggleTag(selectAll(sourceText), BOLD_HTML);
    const outputText = applyReplacements(sourceText, result.replacements);
    expect(outputText).toBe('hello');
  });
});

describe('R16–R19 — Single / line-level remove', () => {
  it('R16: removes "- " prefix for list toggle on list line', () => {
    const result = toggleTag(selectAll('- item'), { kind: 'single', singleType: 'list' });
    expect(result.replacements).toHaveLength(1);
    expect(result.replacements[0]).toEqual({ fromOffset: 0, toOffset: 2, replacementText: '' });
  });

  it('R17: removes "# " prefix for heading toggle on heading line', () => {
    const result = toggleTag(selectAll('# title'), {
      kind: 'single',
      singleType: 'heading',
      headingLevel: 1,
    });
    expect(result.replacements[0]).toEqual({ fromOffset: 0, toOffset: 2, replacementText: '' });
  });

  it('R18: removes "> " prefix for quote toggle on quote line', () => {
    const result = toggleTag(selectAll('> note'), { kind: 'single', singleType: 'quote' });
    expect(result.replacements[0]).toEqual({ fromOffset: 0, toOffset: 2, replacementText: '' });
  });

  it('R19: decreases indent from 48px to 24px on second toggle', () => {
    const sourceText = '<span style="margin-left:48px"/>item';
    const result = toggleTag(selectAll(sourceText), { kind: 'single', singleType: 'indent' });
    const outputText = applyReplacements(sourceText, result.replacements);
    expect(outputText).toContain('margin-left:24px');
  });

  it('R19: removes indent span entirely when at 24px (back to 0)', () => {
    const sourceText = '<span style="margin-left:24px"/>item';
    const result = toggleTag(selectAll(sourceText), { kind: 'single', singleType: 'indent' });
    const outputText = applyReplacements(sourceText, result.replacements);
    expect(outputText).toBe('item');
  });
});

describe('removeAllTags', () => {
  it('removes bold and italic from nested **_text_**', () => {
    const sourceText = '**_hello_**';
    const result = removeAllTags(selectAll(sourceText));
    const outputText = applyReplacements(sourceText, result.replacements);
    expect(outputText).toBe('hello');
  });

  it('removes color span and bold from compounded tags', () => {
    const sourceText = '<span style="color:red"><b>hi</b></span>';
    const result = removeAllTags(selectAll(sourceText));
    const outputText = applyReplacements(sourceText, result.replacements);
    expect(outputText).toBe('hi');
  });

  it('returns isNoOp=true when no tags present in selection', () => {
    const result = removeAllTags(selectAll('plain text'));
    expect(result.isNoOp).toBe(true);
  });
});

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Apply last-to-first replacements to produce the final output string. */
function applyReplacements(
  sourceText: string,
  replacements: { fromOffset: number; toOffset: number; replacementText: string }[]
): string {
  let result = sourceText;

  // Replacements are already ordered last-to-first
  for (const replacement of replacements) {
    result =
      result.slice(0, replacement.fromOffset) +
      replacement.replacementText +
      result.slice(replacement.toOffset);
  }

  return result;
}
