import { HTML_TAG_REGEX } from '../html';
import { EHtmlStyleTagType } from '../../../../../interfaces';

describe('HTML_TAG_REGEX', () => {
  const underlineEntry = HTML_TAG_REGEX.find(
    (entry) => entry.type === EHtmlStyleTagType.UNDERLINE
  )!;
  const subscriptEntry = HTML_TAG_REGEX.find(
    (entry) => entry.type === EHtmlStyleTagType.SUBSCRIPT
  )!;
  const superscriptEntry = HTML_TAG_REGEX.find(
    (entry) => entry.type === EHtmlStyleTagType.SUPERSCRIPT
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
      expect(HTML_TAG_REGEX).toHaveLength(3);
    });
  });

  describe('UNDERLINE', () => {
    test.each`
      caseLabel               | regexPattern            | matchingInput   | expectedMatches   | nonMatchingInput
      ${'open'}               | ${underlineEntry.open}  | ${'<u>'}        | ${['<u>']}        | ${'<ul>'}
      ${'open spaced'}        | ${underlineEntry.open}  | ${'<u   >'}     | ${['<u   >']}     | ${'<ul>'}
      ${'close'}              | ${underlineEntry.close} | ${'</u>'}       | ${['</u>']}       | ${'</ul>'}
      ${'close spaced'}       | ${underlineEntry.close} | ${'</u   >'}    | ${['</u   >']}    | ${'</ul>'}
      ${'close slash spaced'} | ${underlineEntry.close} | ${'</   u   >'} | ${['</   u   >']} | ${'<   /   u   >'}
    `(
      'returns exact $caseLabel tag string and rejects invalid input',
      ({
        regexPattern,
        matchingInput,
        expectedMatches,
        nonMatchingInput,
      }: {
        regexPattern: RegExp;
        matchingInput: string;
        expectedMatches: string[];
        nonMatchingInput: string;
      }) => {
        assertMatchesAgainstExpected(matchingInput, regexPattern, expectedMatches);
        assertMatchesAgainstExpected(nonMatchingInput, regexPattern, []);
      }
    );
  });

  describe('SUBSCRIPT', () => {
    test.each`
      caseLabel               | regexPattern            | matchingInput     | expectedMatches     | nonMatchingInput
      ${'open'}               | ${subscriptEntry.open}  | ${'<sub>'}        | ${['<sub>']}        | ${'<subtext>'}
      ${'open spaced'}        | ${subscriptEntry.open}  | ${'<sub   >'}     | ${['<sub   >']}     | ${'<subtext>'}
      ${'close'}              | ${subscriptEntry.close} | ${'</sub>'}       | ${['</sub>']}       | ${'</subtext>'}
      ${'close spaced'}       | ${subscriptEntry.close} | ${'</sub   >'}    | ${['</sub   >']}    | ${'</subtext>'}
      ${'close slash spaced'} | ${subscriptEntry.close} | ${'</   sub   >'} | ${['</   sub   >']} | ${'<   /   sub   >'}
    `(
      'returns exact $caseLabel tag string and rejects invalid input',
      ({
        regexPattern,
        matchingInput,
        expectedMatches,
        nonMatchingInput,
      }: {
        regexPattern: RegExp;
        matchingInput: string;
        expectedMatches: string[];
        nonMatchingInput: string;
      }) => {
        assertMatchesAgainstExpected(matchingInput, regexPattern, expectedMatches);
        assertMatchesAgainstExpected(nonMatchingInput, regexPattern, []);
      }
    );
  });

  describe('SUPERSCRIPT', () => {
    test.each`
      caseLabel               | regexPattern              | matchingInput     | expectedMatches     | nonMatchingInput
      ${'open'}               | ${superscriptEntry.open}  | ${'<sup>'}        | ${['<sup>']}        | ${'<super>'}
      ${'open spaced'}        | ${superscriptEntry.open}  | ${'<sup   >'}     | ${['<sup   >']}     | ${'<super>'}
      ${'close'}              | ${superscriptEntry.close} | ${'</sup>'}       | ${['</sup>']}       | ${'</super>'}
      ${'close spaced'}       | ${superscriptEntry.close} | ${'</sup   >'}    | ${['</sup   >']}    | ${'</super>'}
      ${'close slash spaced'} | ${superscriptEntry.close} | ${'</   sup   >'} | ${['</   sup   >']} | ${'<   /   sup   >'}
    `(
      'returns exact $caseLabel tag string and rejects invalid input',
      ({
        regexPattern,
        matchingInput,
        expectedMatches,
        nonMatchingInput,
      }: {
        regexPattern: RegExp;
        matchingInput: string;
        expectedMatches: string[];
        nonMatchingInput: string;
      }) => {
        assertMatchesAgainstExpected(matchingInput, regexPattern, expectedMatches);
        assertMatchesAgainstExpected(nonMatchingInput, regexPattern, []);
      }
    );
  });
});
