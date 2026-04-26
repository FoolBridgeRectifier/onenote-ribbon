import type { TagDefinition, TextReplacement } from '../../interfaces';
import { lineBoundsAt } from '../../helpers';
import { INDENT_STEP_PX } from '../../constants';
import type { LineClassification } from './interfaces';
import { EMPTY_LINE_CLASSIFICATION } from './constants';

/** Classifies a line for the given tag and returns add/remove replacements. */
export function classifyLine(sourceText: string, offset: number, tagDefinition: TagDefinition): LineClassification {
  const bounds = lineBoundsAt(sourceText, offset);
  const lineText = sourceText.slice(bounds.lineStart, bounds.lineEnd);

  switch (tagDefinition.type) {
    case 'list':       return classifyList(lineText, bounds.lineStart);
    case 'heading':    return classifyHeading(lineText, bounds.lineStart);
    case 'quote':      return classifyQuote(lineText, bounds.lineStart);
    case 'indent':     return classifyIndent(lineText, bounds.lineStart);
    case 'checkbox':   return classifyCheckbox(lineText, bounds.lineStart);
    case 'inlineTodo': return classifyInlineTodo(lineText, bounds.lineStart);
    default:           return EMPTY_LINE_CLASSIFICATION;
  }
}

function classifyList(lineText: string, lineStart: number): LineClassification {
  const afterQuote = lineText.startsWith('> ') ? 2 : 0;
  const inListItem = /^- (?!\[ ?\])/.test(lineText.slice(afterQuote));

  if (inListItem) {
    let tabRunEnd = lineStart + afterQuote + 2;
    while (lineText[afterQuote + 2 + (tabRunEnd - (lineStart + afterQuote + 2))] === '\t') tabRunEnd++;
    return makeRemoval(lineStart + afterQuote, tabRunEnd);
  }
  const headingMatch = /^#{1,6}\s/.exec(lineText.slice(afterQuote));
  if (headingMatch) {
    return makeReplace(lineStart + afterQuote, lineStart + afterQuote + headingMatch[0].length, '- ');
  }
  return makeInsert(lineStart + afterQuote, '- ');
}

function classifyHeading(lineText: string, lineStart: number): LineClassification {
  const afterQuote = lineText.startsWith('> ') ? 2 : 0;
  const headingMatch = /^(#{1,6})\s/.exec(lineText.slice(afterQuote));
  if (headingMatch) {
    return makeRemoval(lineStart + afterQuote, lineStart + afterQuote + headingMatch[0].length);
  }
  if (/^- (?!\[ ?\])/.test(lineText.slice(afterQuote))) {
    return makeReplace(lineStart + afterQuote, lineStart + afterQuote + 2, '# ');
  }
  return makeInsert(lineStart + afterQuote, '# ');
}

function classifyQuote(lineText: string, lineStart: number): LineClassification {
  if (/^>\s*\[!/.test(lineText)) return { alreadyTagged: true, additionReplacements: [], removalReplacements: [] };
  if (lineText.startsWith('> ')) return makeRemoval(lineStart, lineStart + 2);
  return makeInsert(lineStart, '> ');
}

function classifyIndent(lineText: string, lineStart: number): LineClassification {
  // I5: inside list use \t; outside use margin-left span.
  const listMatch = /^(>\s)?-\s(?!\[ ?\])/.exec(lineText);
  if (listMatch) return makeInsert(lineStart + listMatch[0].length, '\t');

  const prefixMatch = /^(?:>\s)?(?:#{1,6}\s|-\s\[ \]\s|-\s)?/.exec(lineText);
  const prefixLength = prefixMatch ? prefixMatch[0].length : 0;
  const afterPrefix = lineText.slice(prefixLength);
  const indentSpanMatch = /^<span\s+style="margin-left:(\d+)px"\s*\/>/.exec(afterPrefix);
  const insertOffset = lineStart + prefixLength;

  if (indentSpanMatch) {
    // Toggle: decrement step. When dropping to 0, remove the span entirely.
    const currentPx = parseInt(indentSpanMatch[1], 10);
    const newPx = currentPx - INDENT_STEP_PX;
    if (newPx <= 0) {
      return makeRemoval(insertOffset, insertOffset + indentSpanMatch[0].length);
    }
    return makeReplace(insertOffset, insertOffset + indentSpanMatch[0].length, `<span style="margin-left:${newPx}px"/>`);
  }
  return makeInsert(insertOffset, `<span style="margin-left:${INDENT_STEP_PX}px"/>`);
}

function classifyCheckbox(lineText: string, lineStart: number): LineClassification {
  if (/^- \[ ?\] /.test(lineText)) {
    const matchLength = /^- \[ ?\] /.exec(lineText)![0].length;
    return makeRemoval(lineStart, lineStart + matchLength);
  }
  if (/^- /.test(lineText)) return makeReplace(lineStart, lineStart + 2, '- [ ] ');
  return makeInsert(lineStart, '- [ ] ');
}

function classifyInlineTodo(lineText: string, lineStart: number): LineClassification {
  if (lineText.startsWith('#todo ')) return makeRemoval(lineStart, lineStart + 6);
  return makeInsert(lineStart, '#todo ');
}

function makeInsert(offset: number, text: string): LineClassification {
  const replacement: TextReplacement = { fromOffset: offset, toOffset: offset, replacementText: text };
  return { alreadyTagged: false, additionReplacements: [replacement], removalReplacements: [] };
}

function makeRemoval(fromOffset: number, toOffset: number): LineClassification {
  const replacement: TextReplacement = { fromOffset, toOffset, replacementText: '' };
  return { alreadyTagged: true, additionReplacements: [], removalReplacements: [replacement] };
}

function makeReplace(fromOffset: number, toOffset: number, text: string): LineClassification {
  const replacement: TextReplacement = { fromOffset, toOffset, replacementText: text };
  return { alreadyTagged: false, additionReplacements: [replacement], removalReplacements: [] };
}
