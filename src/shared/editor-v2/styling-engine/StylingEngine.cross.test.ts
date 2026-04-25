import { toggleTag, copyFormat } from './StylingEngine';
import type { StylingContext } from './interfaces';
import { BOLD_MD, ITALIC_MD, SUBSCRIPT_HTML, SUPERSCRIPT_HTML } from './constants';

// All tests are in TDD red state — stubs throw 'not implemented'.
// Once implemented, each test must pass exactly as written.

function selectAll(sourceText: string): StylingContext {
  return { sourceText, selectionStartOffset: 0, selectionEndOffset: sourceText.length };
}

function selectRange(sourceText: string, start: number, end: number): StylingContext {
  return { sourceText, selectionStartOffset: start, selectionEndOffset: end };
}

// ─── Cross-Type Interactions ───────────────────────────────────────────────────

describe('X1 — MD + HTML equivalent both present: treat as tagged', () => {
  it('goes to remove path when MD and HTML equivalent both exist', () => {
    // <b>**hello**</b> — both bold forms present; toggling bold should remove both
    const sourceText = '<b>**hello**</b>';
    const result = toggleTag(selectAll(sourceText), BOLD_MD);
    expect(result.isNoOp).toBe(false);
    const outputText = applyReplacements(sourceText, result.replacements);
    expect(outputText).toBe('hello');
  });
});

describe('X2 — MD tag inside HTML context: upgrade to HTML', () => {
  it('upgrades ** to <b> when toggling bold inside <i>text</i>', () => {
    const sourceText = '<i>hello</i>';
    const result = toggleTag(selectRange(sourceText, 3, 8), BOLD_MD);
    const outputText = applyReplacements(sourceText, result.replacements);
    // Must produce <i><b>hello</b></i>, not <i>**hello**</i>  (invariant I2)
    expect(outputText).toBe('<i><b>hello</b></i>');
  });

  it('does not insert MD ** inside any HTML context (invariant I2)', () => {
    const sourceText = '<b>text</b>';
    const result = toggleTag(selectRange(sourceText, 3, 7), ITALIC_MD);
    const outputText = applyReplacements(sourceText, result.replacements);
    expect(outputText).not.toContain('*text*');
    expect(outputText).toContain('<i>');
  });
});

describe('X3 — sub/sup mutual exclusion swap', () => {
  it('swaps <sub> to <sup> when toggling sup on subscript text', () => {
    const sourceText = '<sub>hello</sub>';
    const result = toggleTag(selectAll(sourceText), SUPERSCRIPT_HTML);
    const outputText = applyReplacements(sourceText, result.replacements);
    expect(outputText).toBe('<sup>hello</sup>');
  });

  it('swaps <sup> to <sub> when toggling sub on superscript text', () => {
    const sourceText = '<sup>hello</sup>';
    const result = toggleTag(selectAll(sourceText), SUBSCRIPT_HTML);
    const outputText = applyReplacements(sourceText, result.replacements);
    expect(outputText).toBe('<sub>hello</sub>');
  });
});

describe('X4–X5 — Heading/list mutual swap', () => {
  it('X4: replaces "- " with "# " when toggling heading on list line', () => {
    const result = toggleTag(selectAll('- item'), {
      kind: 'single',
      singleType: 'heading',
      headingLevel: 1,
    });
    const outputText = applyReplacements('- item', result.replacements);
    expect(outputText).toBe('# item');
  });

  it('X5: replaces "# " with "- " when toggling list on heading line', () => {
    const result = toggleTag(selectAll('# title'), { kind: 'single', singleType: 'list' });
    const outputText = applyReplacements('# title', result.replacements);
    expect(outputText).toBe('- title');
  });
});

describe('X12 — Code span content is inert', () => {
  it('returns isNoOp=true when selection is entirely inside code span', () => {
    const sourceText = '`hello`';
    // Select "hello" inside the backticks
    const result = toggleTag(selectRange(sourceText, 1, 6), BOLD_MD);
    expect(result.isNoOp).toBe(true);
  });
});

// ─── Invariants ───────────────────────────────────────────────────────────────

describe('I1 — No stacked active tags', () => {
  it('routes to remove path instead of re-wrapping when bold already active', () => {
    // Select "hello" where it is already fully bold
    const result = toggleTag(selectRange('**hello**', 2, 7), BOLD_MD);
    // Since "hello" is inside bold, this should be a remove (punch-out), not a double-wrap
    const outputText = applyReplacements('**hello**', result.replacements);
    expect(outputText).not.toMatch(/\*\*.*\*\*.*\*\*.*\*\*/);
  });
});

describe('I5–I6 — Indent uses tab inside list; removes with list', () => {
  it('I5: uses \\t instead of margin-left span when indenting inside list item', () => {
    const result = toggleTag(selectAll('- item'), { kind: 'single', singleType: 'indent' });
    const insertedText = result.replacements.find((rep) => rep.replacementText.includes('\t'));
    expect(insertedText).toBeDefined();
  });

  it('I6: removes all leading \\t when list marker is removed', () => {
    const sourceText = '- \t\titem';
    const result = toggleTag(selectAll(sourceText), { kind: 'single', singleType: 'list' });
    const outputText = applyReplacements(sourceText, result.replacements);
    expect(outputText).toBe('item');
  });
});

// ─── copyFormat ───────────────────────────────────────────────────────────────

describe('copyFormat', () => {
  it('captures bold MD tag at cursor', () => {
    const format = copyFormat(selectRange('**hello**', 4, 4));
    expect(
      format.tagDefinitions.some(
        (tag) => tag.kind === 'md-closing' && tag.openingDelimiter === '**'
      )
    ).toBe(true);
  });

  it('captures domain as markdown in plain context', () => {
    const format = copyFormat(selectAll('**hello**'));
    expect(format.domain).toBe('markdown');
  });

  it('captures domain as html when inside HTML context', () => {
    const format = copyFormat(selectRange('<b>hello</b>', 3, 8));
    expect(format.domain).toBe('html');
  });

  it('captures line tag when cursor is on list line', () => {
    const format = copyFormat(selectRange('- item', 3, 3));
    expect(format.lineTagDefinition).toBeDefined();
    expect(format.lineTagDefinition!.kind).toBe('single');
  });

  it('returns empty tagDefinitions on plain text', () => {
    const format = copyFormat(selectAll('plain'));
    expect(format.tagDefinitions).toHaveLength(0);
    expect(format.lineTagDefinition).toBeUndefined();
  });
});

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Apply last-to-first replacements to produce the final output string. */
function applyReplacements(
  sourceText: string,
  replacements: { fromOffset: number; toOffset: number; replacementText: string }[]
): string {
  let result = sourceText;

  for (const replacement of replacements) {
    result =
      result.slice(0, replacement.fromOffset) +
      replacement.replacementText +
      result.slice(replacement.toOffset);
  }

  return result;
}
