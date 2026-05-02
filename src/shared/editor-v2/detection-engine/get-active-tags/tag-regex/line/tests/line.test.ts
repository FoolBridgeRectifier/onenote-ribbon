import { LINE_TAG_REGEX } from '../line';
import { ELineTagType } from '../../../../../interfaces';

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
      caseLabel                                     | inputText                             | expectedMatches                             | allMatches
      ${'single-depth callout'}                     | ${'> [!note] Title'}                  | ${['> [!note] Title']}                      | ${false}
      ${'continuation callout'}                     | ${'>[!info] Title\n> continuation'}   | ${['>[!info] Title', '>']}                  | ${true}
      ${'double continuation callout'}              | ${'>[!info] Title\n>> [!warning]'}    | ${['>[!info] Title', '>> [!warning]']}      | ${true}
      ${'double continuation with separate indent'} | ${'>[!info] Title\n>> [!warning]\n>'} | ${['>[!info] Title', '>> [!warning]', '>']} | ${true}
    `(
      'open matches $caseLabel',
      ({
        inputText,
        expectedMatches,
        allMatches,
      }: {
        inputText: string;
        expectedMatches: string[];
        allMatches: boolean;
      }) => {
        assertMatchesAgainstExpected(inputText, calloutEntry.open, expectedMatches, allMatches);
      }
    );

    test.each`
      caseLabel                        | inputText                             | expectedMatches
      ${'basic quote'}                 | ${'> just a quote'}                   | ${[]}
      ${'broken title'}                | ${'> [!note]Title'}                   | ${[]}
      ${'quote inside callout'}        | ${'> [!note] Title\n>> just a quote'} | ${['> [!note] Title']}
      ${'broken double-depth callout'} | ${'>> [!warning]'}                    | ${[]}
    `(
      'should not match $caseLabel',
      ({ inputText, expectedMatches }: { inputText: string; expectedMatches: string[] }) => {
        assertMatchesAgainstExpected(inputText, calloutEntry.open, expectedMatches);
      }
    );
  });

  describe('CHECKBOX', () => {
    test.each`
      caseLabel        | inputText       | expectedMatches
      ${'unchecked'}   | ${'- [ ] item'} | ${['- [ ] ']}
      ${'checked (x)'} | ${'- [x] item'} | ${['- [x] ']}
      ${'checked (X)'} | ${'- [X] item'} | ${['- [X] ']}
    `(
      'open matches $caseLabel',
      ({ inputText, expectedMatches }: { inputText: string; expectedMatches: string[] }) => {
        assertMatchesAgainstExpected(inputText, checkboxEntry.open, expectedMatches);
      }
    );

    test.each`
      caseLabel                    | inputText       | expectedMatches
      ${'plain list item'}         | ${'- item'}     | ${[]}
      ${'empty brackets'}          | ${'- [] item'}  | ${[]}
      ${'no space before bracket'} | ${'-[x] item'}  | ${[]}
      ${'no space before bracket'} | ${'- [^] item'} | ${[]}
    `(
      'open does not match $caseLabel',
      ({ inputText, expectedMatches }: { inputText: string; expectedMatches: string[] }) => {
        assertMatchesAgainstExpected(inputText, checkboxEntry.open, expectedMatches);
      }
    );
  });

  describe('LIST', () => {
    test.each`
      caseLabel                 | inputText       | expectedMatches | allMatches
      ${'basic list'}           | ${'- item'}     | ${['- ']}       | ${false}
      ${'list with empty line'} | ${'- '}         | ${['- ']}       | ${false}
      ${'multi line list'}      | ${'- \n- '}     | ${['- ', '- ']} | ${true}
      ${'list with indent'}     | ${'- \n\t\t- '} | ${['- ', '- ']} | ${true}
    `(
      'open does match $caseLabel',
      ({
        inputText,
        expectedMatches,
        allMatches,
      }: {
        inputText: string;
        expectedMatches: string[];
        allMatches: boolean;
      }) => {
        assertMatchesAgainstExpected(inputText, listEntry.open, expectedMatches, allMatches);
      }
    );

    test.each`
      caseLabel               | inputText
      ${'unchecked checkbox'} | ${'- [ ] item'}
      ${'checked checkbox'}   | ${'- [x] item'}
    `('open does not match $caseLabel', ({ inputText }: { inputText: string }) => {
      assertMatchesAgainstExpected(inputText, listEntry.open, []);
    });
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
      caseLabel                                        | inputText                       | expectedMatches  | allMatches
      ${'plain blockquote'}                            | ${'>quote'}                     | ${['>']}         | ${false}
      ${'nested blockquote'}                           | ${'>> nested quote'}            | ${['>>']}        | ${false}
      ${'depth-2+ quote inside callout still matches'} | ${'> [!note]\n>> nested quote'} | ${['>>']}        | ${false}
      ${'two consecutive plain quotes both match'}     | ${'> q1\n> q2'}                 | ${['>', '>']}    | ${true}
      ${'depth-2+ and depth-3 quotes both match'}      | ${'>> q1\n>>> q2'}              | ${['>>', '>>>']} | ${true}
    `(
      'open matches $caseLabel',
      ({
        inputText,
        expectedMatches,
        allMatches,
      }: {
        inputText: string;
        expectedMatches: string[];
        allMatches: boolean;
      }) => {
        assertMatchesAgainstExpected(inputText, quoteEntry.open, expectedMatches, allMatches);
      }
    );

    test.each`
      caseLabel    | inputText                      | expectedMatches
      ${'callout'} | ${'> [!note]\n> nested quote'} | ${[]}
    `(
      'open does not matches $caseLabel',
      ({ inputText, expectedMatches }: { inputText: string; expectedMatches: string[] }) => {
        assertMatchesAgainstExpected(inputText, quoteEntry.open, expectedMatches);
      }
    );

    test('QUOTE does not match a callout string — `(?![ \\t]?\\[!)` correctly excludes `> [!type]`', () => {
      assertMatchesAgainstExpected('> [!note]', quoteEntry.open, []);
    });
  });

  describe('INDENT', () => {
    test.each`
      caseLabel                                                         | inputText                      | expectedMatches | allMatches
      ${'tab-indented line preceded by content'}                        | ${'content\n\tindented'}       | ${['\t']}       | ${false}
      ${'tab-indented line preceded by content'}                        | ${'content\n\tindented\t'}     | ${['\t']}       | ${false}
      ${'tab-indented line after tab line'}                             | ${'content\n\tindented\n\tgg'} | ${['\t', '\t']} | ${true}
      ${'4-space indented line preceded by content'}                    | ${'content\n    indented'}     | ${['    ']}     | ${false}
      ${'after ---- at document start (4 dashes, not a --- delimiter)'} | ${'----\n\tindented'}          | ${['\t']}       | ${false}
      ${'after mid-document --- (horizontal rule, not frontmatter)'}    | ${'content\n---\n\tindented'}  | ${['\t']}       | ${false}
    `(
      'open matches $caseLabel',
      ({
        inputText,
        expectedMatches,
        allMatches,
      }: {
        inputText: string;
        expectedMatches: string[];
        allMatches: boolean;
      }) => {
        assertMatchesAgainstExpected(inputText, indentEntry.open, expectedMatches, allMatches);
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
