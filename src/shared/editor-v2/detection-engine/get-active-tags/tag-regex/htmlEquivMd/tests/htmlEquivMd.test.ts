import { HTML_EQUIV_MD_TAG_REGEX } from '../htmlEquivMd';
import { EMdStyleTagType } from '../../../../../interfaces';

describe('HTML_EQUIV_MD_TAG_REGEX', () => {
  const boldEntry = HTML_EQUIV_MD_TAG_REGEX.find((entry) => entry.type === EMdStyleTagType.BOLD)!;
  const italicEntry = HTML_EQUIV_MD_TAG_REGEX.find(
    (entry) => entry.type === EMdStyleTagType.ITALIC
  )!;
  const strikethroughEntry = HTML_EQUIV_MD_TAG_REGEX.find(
    (entry) => entry.type === EMdStyleTagType.STRIKETHROUGH
  )!;

  const extractFirstMatch = (inputText: string, regexPattern: RegExp): string | null =>
    inputText.match(regexPattern)?.[0] ?? null;

  const assertMatchesAgainstExpected = (
    inputText: string,
    regexPattern: RegExp,
    expectedMatches: string[]
  ) => {
    const firstMatch = extractFirstMatch(inputText, regexPattern);
    const matches = firstMatch === null ? [] : [firstMatch];

    expect(matches).toHaveLength(expectedMatches.length);

    expectedMatches.forEach((expectedString, index) => {
      expect(matches[index]).toBe(expectedString);
    });
  };

  describe('shape', () => {
    test('contains exactly 3 entries', () => {
      expect(HTML_EQUIV_MD_TAG_REGEX).toHaveLength(3);
    });
  });

  describe('BOLD', () => {
    test.each`
      caseLabel                  | regexPattern       | matchingInput   | expectedMatches   | nonMatchingInputs
      ${'open'}                  | ${boldEntry.open}  | ${'<b>'}        | ${['<b>']}        | ${['<strong>']}
      ${'open trailing spaced'}  | ${boldEntry.open}  | ${'<b   >'}     | ${['<b   >']}     | ${['<strong>']}
      ${'open fully spaced'}     | ${boldEntry.open}  | ${'<   b   >'}  | ${['<   b   >']}  | ${['<strong>']}
      ${'close'}                 | ${boldEntry.close} | ${'</b>'}       | ${['</b>']}       | ${['</strong>', '<   /   b   >']}
      ${'close trailing spaced'} | ${boldEntry.close} | ${'</b   >'}    | ${['</b   >']}    | ${['</strong>', '<   /   b   >']}
      ${'close slash spaced'}    | ${boldEntry.close} | ${'</   b   >'} | ${['</   b   >']} | ${['</strong>', '<   /   b   >']}
    `(
      'returns exact $caseLabel tag string and rejects invalid input',
      ({
        regexPattern,
        matchingInput,
        expectedMatches,
        nonMatchingInputs,
      }: {
        regexPattern: RegExp;
        matchingInput: string;
        expectedMatches: string[];
        nonMatchingInputs: string[];
      }) => {
        assertMatchesAgainstExpected(matchingInput, regexPattern, expectedMatches);

        nonMatchingInputs.forEach((inputText) => {
          assertMatchesAgainstExpected(inputText, regexPattern, []);
        });
      }
    );
  });

  describe('ITALIC', () => {
    test.each`
      caseLabel                  | regexPattern         | matchingInput   | expectedMatches   | nonMatchingInputs
      ${'open'}                  | ${italicEntry.open}  | ${'<i>'}        | ${['<i>']}        | ${['<em>']}
      ${'open trailing spaced'}  | ${italicEntry.open}  | ${'<i   >'}     | ${['<i   >']}     | ${['<em>']}
      ${'open fully spaced'}     | ${italicEntry.open}  | ${'<   i   >'}  | ${['<   i   >']}  | ${['<em>']}
      ${'close'}                 | ${italicEntry.close} | ${'</i>'}       | ${['</i>']}       | ${['</em>', '<   /   i   >']}
      ${'close trailing spaced'} | ${italicEntry.close} | ${'</i   >'}    | ${['</i   >']}    | ${['</em>', '<   /   i   >']}
      ${'close slash spaced'}    | ${italicEntry.close} | ${'</   i   >'} | ${['</   i   >']} | ${['</em>', '<   /   i   >']}
    `(
      'returns exact $caseLabel tag string and rejects invalid input',
      ({
        regexPattern,
        matchingInput,
        expectedMatches,
        nonMatchingInputs,
      }: {
        regexPattern: RegExp;
        matchingInput: string;
        expectedMatches: string[];
        nonMatchingInputs: string[];
      }) => {
        assertMatchesAgainstExpected(matchingInput, regexPattern, expectedMatches);

        nonMatchingInputs.forEach((inputText) => {
          assertMatchesAgainstExpected(inputText, regexPattern, []);
        });
      }
    );
  });

  describe('STRIKETHROUGH', () => {
    test.each`
      caseLabel                  | regexPattern                | matchingInput   | expectedMatches   | nonMatchingInputs
      ${'open'}                  | ${strikethroughEntry.open}  | ${'<s>'}        | ${['<s>']}        | ${['<strike>']}
      ${'open trailing spaced'}  | ${strikethroughEntry.open}  | ${'<s   >'}     | ${['<s   >']}     | ${['<strike>']}
      ${'open fully spaced'}     | ${strikethroughEntry.open}  | ${'<   s   >'}  | ${['<   s   >']}  | ${['<strike>']}
      ${'close'}                 | ${strikethroughEntry.close} | ${'</s>'}       | ${['</s>']}       | ${['</strike>', '<   /   s   >']}
      ${'close trailing spaced'} | ${strikethroughEntry.close} | ${'</s   >'}    | ${['</s   >']}    | ${['</strike>', '<   /   s   >']}
      ${'close slash spaced'}    | ${strikethroughEntry.close} | ${'</   s   >'} | ${['</   s   >']} | ${['</strike>', '<   /   s   >']}
    `(
      'returns exact $caseLabel tag string and rejects invalid input',
      ({
        regexPattern,
        matchingInput,
        expectedMatches,
        nonMatchingInputs,
      }: {
        regexPattern: RegExp;
        matchingInput: string;
        expectedMatches: string[];
        nonMatchingInputs: string[];
      }) => {
        assertMatchesAgainstExpected(matchingInput, regexPattern, expectedMatches);

        nonMatchingInputs.forEach((inputText) => {
          assertMatchesAgainstExpected(inputText, regexPattern, []);
        });
      }
    );
  });
});
