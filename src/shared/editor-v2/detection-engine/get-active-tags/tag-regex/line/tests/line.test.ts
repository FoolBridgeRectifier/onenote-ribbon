import { LINE_TAG_REGEX } from '../line';
import { ELineTagType } from '../../../../../interfaces';
import { assertMatches } from '../../tests/testUtils';

describe('LINE_TAG_REGEX', () => {
  const calloutEntry = LINE_TAG_REGEX.find((entry) => entry.type === ELineTagType.CALLOUT)!;
  const checkboxEntry = LINE_TAG_REGEX.find((entry) => entry.type === ELineTagType.CHECKBOX)!;
  const listEntry = LINE_TAG_REGEX.find((entry) => entry.type === ELineTagType.LIST)!;
  const headingEntry = LINE_TAG_REGEX.find((entry) => entry.type === ELineTagType.HEADING)!;
  const quoteEntry = LINE_TAG_REGEX.find((entry) => entry.type === ELineTagType.QUOTE)!;
  const indentEntry = LINE_TAG_REGEX.find((entry) => entry.type === ELineTagType.INDENT)!;

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
      content                                | expectedMatches                             | allMatches
      ${'> [!note] Title'}                   | ${['> [!note] Title']}                      | ${false}
      ${'>[!info] Title\n> continuation'}    | ${['>[!info] Title', '>']}                  | ${true}
      ${'>[!info] Title\n>> [!warning]'}     | ${['>[!info] Title', '>> [!warning]']}      | ${true}
      ${'>[!info] Title\n>> [!warning]\n>'}  | ${['>[!info] Title', '>> [!warning]', '>']} | ${true}
      ${'> [!note] Title\n>> just a quote'}  | ${['> [!note] Title']}                      | ${false}
      ${'> just a quote'}                    | ${[]}                                       | ${false}
      ${'> [!note]Title'}                    | ${[]}                                       | ${false}
      ${'>> [!warning]'}                     | ${[]}                                       | ${false}
      ${'> \n[!note] Title'}                 | ${[]}                                       | ${false}
    `('open matches $content', ({ content, expectedMatches, allMatches }: { content: string; expectedMatches: string[]; allMatches: boolean }) => {
      assertMatches(content, calloutEntry.open, expectedMatches, allMatches);
    });
  });

  describe('CHECKBOX', () => {
    test.each`
      content               | expectedMatches  | allMatches
      ${'- [ ] item'}       | ${['- [ ] ']}    | ${false}
      ${'- [x] item'}       | ${['- [x] ']}    | ${false}
      ${'- [X] item'}       | ${['- [X] ']}    | ${false}
      ${'text\n- [x] item'} | ${['- [x] ']}    | ${true}
      ${'- item'}           | ${[]}            | ${false}
      ${'- [] item'}        | ${[]}            | ${false}
      ${'-[x] item'}        | ${[]}            | ${false}
      ${'- [^] item'}       | ${[]}            | ${false}
    `('open matches $content', ({ content, expectedMatches, allMatches }: { content: string; expectedMatches: string[]; allMatches: boolean }) => {
      assertMatches(content, checkboxEntry.open, expectedMatches, allMatches);
    });
  });

  describe('LIST', () => {
    test.each`
      content          | expectedMatches       | allMatches
      ${'- item'}      | ${['- ']}             | ${false}
      ${'- '}          | ${['- ']}             | ${false}
      ${'- \n- '}      | ${['- ', '- ']}       | ${true}
      ${'- \n\t\t- '}  | ${['- ', '- ']}       | ${true}
      ${'- [ ] item'}  | ${[]}                 | ${false}
      ${'- [x] item'}  | ${[]}                 | ${false}
    `('open matches $content', ({ content, expectedMatches, allMatches }: { content: string; expectedMatches: string[]; allMatches: boolean }) => {
      assertMatches(content, listEntry.open, expectedMatches, allMatches);
    });
  });

  describe('HEADING', () => {
    test.each`
      content                    | expectedMatches  | allMatches
      ${'# h1'}                  | ${['# ']}        | ${false}
      ${'## h2'}                 | ${['## ']}       | ${false}
      ${'###### h6'}             | ${['###### ']}   | ${false}
      ${'text\n## h2'}           | ${['## ']}       | ${true}
      ${'####### not a heading'} | ${[]}            | ${false}
      ${'#nospace'}              | ${[]}            | ${false}
    `('open matches $content', ({ content, expectedMatches, allMatches }: { content: string; expectedMatches: string[]; allMatches: boolean }) => {
      assertMatches(content, headingEntry.open, expectedMatches, allMatches);
    });
  });

  describe('QUOTE', () => {
    test.each`
      content                                  | expectedMatches    | allMatches
      ${'>quote'}                              | ${['>']}           | ${false}
      ${'>> nested quote'}                     | ${['>>']}          | ${false}
      ${'> [!note]\n>> nested quote'}          | ${['>>']}          | ${false}
      ${'>> [!tip] Nested callout'}            | ${['>>']}          | ${false}
      ${'> [!note]\n>> [!tip] Nested'}         | ${['>>']}          | ${false}
      ${'> q1\n> q2'}                          | ${['>', '>']}      | ${true}
      ${'>> q1\n>>> q2'}                       | ${['>>', '>>>']}   | ${true}
      ${'> [!note]\n> nested quote'}           | ${[]}              | ${false}
      ${'>  [!note] two spaces'}               | ${[]}              | ${false}
      ${'> [!note]'}                           | ${[]}              | ${false}
    `('open matches $content', ({ content, expectedMatches, allMatches }: { content: string; expectedMatches: string[]; allMatches: boolean }) => {
      assertMatches(content, quoteEntry.open, expectedMatches, allMatches);
    });
  });

  describe('INDENT', () => {
    test.each`
      content                                              | expectedMatches    | allMatches
      ${'content\n\tindented'}                             | ${['\t']}          | ${false}
      ${'content\n\tindented\t'}                           | ${['\t']}          | ${false}
      ${'content\n\tindented\n\tgg'}                       | ${['\t', '\t']}    | ${true}
      ${'content\n    indented'}                           | ${['    ']}        | ${false}
      ${'----\n\tindented'}                                | ${['\t']}          | ${false}
      ${'content\n---\n\tindented'}                        | ${['\t']}          | ${false}
      ${'\tindented at start'}                             | ${[]}              | ${false}
      ${'\n\n\tindented after blank'}                      | ${[]}              | ${false}
      ${'---\n\tindented'}                                 | ${[]}              | ${false}
      ${'---\n---\n\tindented'}                            | ${[]}              | ${false}
      ${'---\n-----\n\tindented'}                          | ${[]}              | ${false}
      ${'---\nkey: value\nkey: value\n-----\n\tindented'}  | ${[]}              | ${false}
    `('open matches $content', ({ content, expectedMatches, allMatches }: { content: string; expectedMatches: string[]; allMatches: boolean }) => {
      assertMatches(content, indentEntry.open, expectedMatches, allMatches);
    });
  });
});
