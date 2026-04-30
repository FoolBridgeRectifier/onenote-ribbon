import { LINE_TAG_REGEX } from '../line';
import { ELineTagType } from '../../../../interfaces';

describe('LINE_TAG_REGEX', () => {
  const calloutEntry = LINE_TAG_REGEX.find((entry) => entry.type === ELineTagType.CALLOUT)!;
  const checkboxEntry = LINE_TAG_REGEX.find((entry) => entry.type === ELineTagType.CHECKBOX)!;
  const listEntry = LINE_TAG_REGEX.find((entry) => entry.type === ELineTagType.LIST)!;
  const headingEntry = LINE_TAG_REGEX.find((entry) => entry.type === ELineTagType.HEADING)!;
  const quoteEntry = LINE_TAG_REGEX.find((entry) => entry.type === ELineTagType.QUOTE)!;
  const indentEntry = LINE_TAG_REGEX.find((entry) => entry.type === ELineTagType.INDENT)!;

  const extractFirstMatch = (inputText: string, regexPattern: RegExp): string | null =>
    inputText.match(regexPattern)?.[0] ?? null;

  const extractAllMatches = (inputText: string, regexPattern: RegExp): string[] => {
    const globalRegexFlags = regexPattern.flags.includes('g')
      ? regexPattern.flags
      : `${regexPattern.flags}g`;

    const globalRegexPattern = new RegExp(regexPattern.source, globalRegexFlags);

    return Array.from(inputText.matchAll(globalRegexPattern), (match) => match[0]);
  };

  const assertMatchesAgainstExpected = (
    inputText: string,
    regexPattern: RegExp,
    expectedMatches: string[],
    shouldCollectAllMatches: boolean = false
  ) => {
    let matches: string[];

    if (shouldCollectAllMatches) {
      matches = extractAllMatches(inputText, regexPattern);
    } else {
      const firstMatch = extractFirstMatch(inputText, regexPattern);
      matches = firstMatch === null ? [] : [firstMatch];
    }

    expect(matches).toHaveLength(expectedMatches.length);

    expectedMatches.forEach((expectedString, index) => {
      expect(matches[index]).toBe(expectedString);
    });
  };

  describe('shape', () => {
    test('contains exactly 6 entries', () => {
      expect(LINE_TAG_REGEX).toHaveLength(6);
    });
  });

  describe('ordering', () => {
    test('CALLOUT appears before QUOTE so >[!type] is tried first', () => {
      const calloutIndex = LINE_TAG_REGEX.findIndex((entry) => entry.type === ELineTagType.CALLOUT);
      const quoteIndex = LINE_TAG_REGEX.findIndex((entry) => entry.type === ELineTagType.QUOTE);
      expect(calloutIndex).toBeLessThan(quoteIndex);
    });

    test('CHECKBOX appears before LIST so - [ ] is tried first', () => {
      const checkboxIndex = LINE_TAG_REGEX.findIndex(
        (entry) => entry.type === ELineTagType.CHECKBOX
      );
      const listIndex = LINE_TAG_REGEX.findIndex((entry) => entry.type === ELineTagType.LIST);
      expect(checkboxIndex).toBeLessThan(listIndex);
    });
  });

  describe('CALLOUT', () => {
    test.each`
      caseLabel                 | inputText            | expectedMatches
      ${'single-depth callout'} | ${'> [!note] Title'} | ${['> [!note]']}
      ${'double-depth callout'} | ${'>> [!warning]'}   | ${['>> [!warning]']}
    `(
      'open matches $caseLabel',
      ({ inputText, expectedMatches }: { inputText: string; expectedMatches: string[] }) => {
        assertMatchesAgainstExpected(inputText, calloutEntry.open, expectedMatches);
      }
    );

    test('open matches callout marker and does not capture continuation line', () => {
      const expectedMatches = ['>[!info]'];
      assertMatchesAgainstExpected(
        '>[!info] Title\n> continuation',
        calloutEntry.open,
        expectedMatches,
        true
      );
    });

    test('open does not match plain blockquote', () => {
      const expectedMatches: string[] = [];
      assertMatchesAgainstExpected('> just a quote', calloutEntry.open, expectedMatches);
    });
  });

  describe('CHECKBOX', () => {
    test.each`
      caseLabel             | inputText       | expectedMatches
      ${'unchecked'}        | ${'- [ ] item'} | ${['- [ ] ']}
      ${'checked (x)'}      | ${'- [x] item'} | ${['- [x] ']}
      ${'checked (X)'}      | ${'- [X] item'} | ${['- [X] ']}
    `(
      'open matches $caseLabel',
      ({ inputText, expectedMatches }: { inputText: string; expectedMatches: string[] }) => {
        assertMatchesAgainstExpected(inputText, checkboxEntry.open, expectedMatches);
      }
    );

    test.each`
      caseLabel                   | inputText        | expectedMatches
      ${'plain list item'}        | ${'- item'}      | ${[]}
      ${'empty brackets'}         | ${'- [] item'}   | ${[]}
      ${'no space before bracket'}| ${'-[x] item'}   | ${[]}
    `(
      'open does not match $caseLabel',
      ({ inputText, expectedMatches }: { inputText: string; expectedMatches: string[] }) => {
        assertMatchesAgainstExpected(inputText, checkboxEntry.open, expectedMatches);
      }
    );
  });

  describe('LIST', () => {
    test('open matches plain list item', () => {
      const expectedMatches = ['- '];
      assertMatchesAgainstExpected('- item', listEntry.open, expectedMatches);
    });

    test.each`
      caseLabel             | inputText
      ${'unchecked checkbox'} | ${'- [ ] item'}
      ${'checked checkbox'}   | ${'- [x] item'}
    `(
      'open does not match $caseLabel',
      ({ inputText }: { inputText: string }) => {
        assertMatchesAgainstExpected(inputText, listEntry.open, []);
      }
    );
  });

  describe('HEADING', () => {
    test.each`
      caseLabel | inputText      | expectedMatches
      ${'h1'}   | ${'# h1'}      | ${['# ']}
      ${'h2'}   | ${'## h2'}     | ${['## ']}
      ${'h6'}   | ${'###### h6'} | ${['###### ']}
    `(
      'open matches $caseLabel',
      ({ inputText, expectedMatches }: { inputText: string; expectedMatches: string[] }) => {
        assertMatchesAgainstExpected(inputText, headingEntry.open, expectedMatches);
      }
    );

    test.each`
      caseLabel                     | inputText                  | expectedMatches
      ${'7+ hashes'}                | ${'####### not a heading'} | ${[]}
      ${'# without trailing space'} | ${'#nospace'}              | ${[]}
    `(
      'open does not match $caseLabel',
      ({ inputText, expectedMatches }: { inputText: string; expectedMatches: string[] }) => {
        assertMatchesAgainstExpected(inputText, headingEntry.open, expectedMatches);
      }
    );
  });

  describe('QUOTE', () => {
    test.each`
      caseLabel              | inputText            | expectedMatches
      ${'plain blockquote'}  | ${'> quote'}         | ${['> ']}
      ${'nested blockquote'} | ${'>> nested quote'} | ${['>> ']}
    `(
      'open matches $caseLabel',
      ({ inputText, expectedMatches }: { inputText: string; expectedMatches: string[] }) => {
        assertMatchesAgainstExpected(inputText, quoteEntry.open, expectedMatches);
      }
    );

    test('regex alone can match a callout string — disambiguation relies on CALLOUT being ordered first', () => {
      // The QUOTE pattern has `(?!\[!)` but with optional `[ \t]?` the lookahead sees ` [` not `[!`,
      // so the regex still matches. Correct exclusion is achieved by the engine testing CALLOUT before QUOTE.
      const expectedMatches = ['>'];
      assertMatchesAgainstExpected('> [!note]', quoteEntry.open, expectedMatches);
    });
  });

  describe('INDENT', () => {
    test.each`
      caseLabel                                                         | inputText                     | expectedMatches
      ${'tab-indented line preceded by content'}                        | ${'content\n\tindented'}      | ${['\t']}
      ${'4-space indented line preceded by content'}                    | ${'content\n    indented'}    | ${['    ']}
      ${'after ---- at document start (4 dashes, not a --- delimiter)'} | ${'----\n\tindented'}         | ${['\t']}
      ${'after mid-document --- (horizontal rule, not frontmatter)'}    | ${'content\n---\n\tindented'} | ${['\t']}
    `(
      'open matches $caseLabel',
      ({ inputText, expectedMatches }: { inputText: string; expectedMatches: string[] }) => {
        assertMatchesAgainstExpected(inputText, indentEntry.open, expectedMatches);
      }
    );

    test.each`
      caseLabel                                               | inputText                                           | expectedMatches
      ${'at document start (no preceding content line)'}      | ${'\tindented at start'}                            | ${[]}
      ${'after blank line'}                                   | ${'\n\n\tindented after blank'}                     | ${[]}
      ${'directly after opening --- at document start'}       | ${'---\n\tindented'}                                | ${[]}
      ${'after ---/--- block at document start'}              | ${'---\n---\n\tindented'}                           | ${[]}
      ${'after ---/----- block at document start'}            | ${'---\n-----\n\tindented'}                         | ${[]}
      ${'after full meeting-details block at document start'} | ${'---\nkey: value\nkey: value\n-----\n\tindented'} | ${[]}
    `(
      'open does not match $caseLabel',
      ({ inputText, expectedMatches }: { inputText: string; expectedMatches: string[] }) => {
        assertMatchesAgainstExpected(inputText, indentEntry.open, expectedMatches);
      }
    );
  });
});
