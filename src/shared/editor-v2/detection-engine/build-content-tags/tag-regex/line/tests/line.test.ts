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
    test('contains exactly 7 entries', () => {
      expect(LINE_TAG_REGEX).toHaveLength(7);
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
      content                                    | expectedMatches
      ${'> [!note] Title'}                       | ${['> [!note]']}
      ${'>[!info] Title\n> continuation'}        | ${['>[!info]', '>']}
      ${'>[!info] Title\n>> [!warning]'}         | ${['>[!info]', '>> [!warning]']}
      ${'>[!info] Title\n>> [!warning]\n>'}      | ${['>[!info]', '>> [!warning]', '>']}
      ${'>[!info] Title\n> body\n>> [!warning]'} | ${['>[!info]', '>', '>> [!warning]']}
      ${'> [!note] Title\n>> just a quote'}      | ${['> [!note]']}
      ${'> just a quote'}                        | ${[]}
      ${'> q1\n> q2'}                            | ${[]}
      ${'> [!note]Title'}                        | ${[]}
      ${'>> [!warning]'}                         | ${[]}
      ${'> \n[!note] Title'}                     | ${[]}
    `(
      'open matches $content',
      ({ content, expectedMatches }: { content: string; expectedMatches: string[] }) => {
        assertMatches(content, calloutEntry.open, expectedMatches);
      }
    );

    describe('titleRegex', () => {
      test.each`
        content                                   | expectedTitle
        ${'> [!note] My Title'}                   | ${'My Title'}
        ${'> [!note] <b>Title</b>'}               | ${'Title'}
        ${'> [!note] <span>Title</span>'}         | ${'Title'}
        ${'> [!note] ==Title=='}                  | ${'Title'}
        ${'> [!note] **Title**'}                  | ${'Title'}
        ${'> [!note] *Title*'}                    | ${'Title'}
        ${'> [!note] ~~Title~~'}                  | ${'Title'}
        ${'> [!note] My Title\n>'}                | ${'My Title'}
        ${'>> [!tip] Nested'}                     | ${'Nested'}
        ${'> [!note] My Title\n>> [!tip] Nested'} | ${'Nested'}
        ${'>> [!tip] Nested\n>>\n>>'}             | ${'Nested'}
        ${'> [!warning]'}                         | ${undefined}
      `(
        '$content → title=$expectedTitle',
        ({ content, expectedTitle }: { content: string; expectedTitle: string | undefined }) => {
          expect(content.match(calloutEntry.titleRegex!)?.[1]?.trim() || undefined).toBe(
            expectedTitle
          );
        }
      );
    });
  });

  describe('CHECKBOX', () => {
    test.each`
      content               | expectedMatches
      ${'- [ ] item'}       | ${['- [ ] ']}
      ${'- [x] item'}       | ${['- [x] ']}
      ${'- [X] item'}       | ${['- [X] ']}
      ${'text\n- [x] item'} | ${['- [x] ']}
      ${'- item'}           | ${[]}
      ${'- [] item'}        | ${[]}
      ${'-[x] item'}        | ${[]}
      ${'- [^] item'}       | ${[]}
    `(
      'open matches $content',
      ({ content, expectedMatches }: { content: string; expectedMatches: string[] }) => {
        assertMatches(content, checkboxEntry.open, expectedMatches);
      }
    );

    describe('titleRegex', () => {
      test.each`
        content                      | expectedTitle
        ${'- [x] Task text'}         | ${'Task text'}
        ${'- [ ] Buy milk'}          | ${'Buy milk'}
        ${'- [ ] Buy milk:'}         | ${'Buy milk'}
        ${'- [x] <b>Task text</b>'}  | ${'Task text'}
        ${'- [x] <span>Task</span>'} | ${'Task'}
        ${'- [x] ==Task text=='}     | ${'Task text'}
        ${'- [x] **Task text**'}     | ${'Task text'}
        ${'- [x] *Task text*'}       | ${'Task text'}
        ${'- [x] ~~Task text~~'}     | ${'Task text'}
        ${'- [ ] '}                  | ${undefined}
      `(
        '$content → title=$expectedTitle',
        ({ content, expectedTitle }: { content: string; expectedTitle: string | undefined }) => {
          expect(content.match(checkboxEntry.titleRegex!)?.[1]?.trim() || undefined).toBe(
            expectedTitle
          );
        }
      );
    });
  });

  describe('LIST', () => {
    test.each`
      content         | expectedMatches
      ${'- item'}     | ${['- ']}
      ${'- '}         | ${['- ']}
      ${'- \n- '}     | ${['- ', '- ']}
      ${'- \n\t\t- '} | ${['- ', '- ']}
      ${'- [ ] item'} | ${[]}
      ${'- [x] item'} | ${[]}
    `(
      'open matches $content',
      ({ content, expectedMatches }: { content: string; expectedMatches: string[] }) => {
        assertMatches(content, listEntry.open, expectedMatches);
      }
    );
  });

  describe('HEADING', () => {
    test.each`
      content                    | expectedMatches
      ${'# h1'}                  | ${['# ']}
      ${'## h2'}                 | ${['## ']}
      ${'###### h6'}             | ${['###### ']}
      ${'text\n## h2'}           | ${['## ']}
      ${'####### not a heading'} | ${[]}
      ${'#nospace'}              | ${[]}
    `(
      'open matches $content',
      ({ content, expectedMatches }: { content: string; expectedMatches: string[] }) => {
        assertMatches(content, headingEntry.open, expectedMatches);
      }
    );

    describe('titleRegex', () => {
      test.each`
        content                     | expectedTitle
        ${'# Heading One'}          | ${'Heading One'}
        ${'## My Section'}          | ${'My Section'}
        ${'###### Deep'}            | ${'Deep'}
        ${'# <b>Heading</b>'}       | ${'Heading'}
        ${'# <span>Heading</span>'} | ${'Heading'}
        ${'# ==Heading=='}          | ${'Heading'}
        ${'# **Heading**'}          | ${'Heading'}
        ${'# *Heading*'}            | ${'Heading'}
        ${'# ~~Heading~~'}          | ${'Heading'}
        ${'# '}                     | ${undefined}
      `(
        '$content → title=$expectedTitle',
        ({ content, expectedTitle }: { content: string; expectedTitle: string | undefined }) => {
          expect(content.match(headingEntry.titleRegex!)?.[1]?.trim() || undefined).toBe(
            expectedTitle
          );
        }
      );
    });
  });

  describe('QUOTE', () => {
    test.each`
      content                                             | expectedMatches
      ${'>quote'}                                         | ${['>']}
      ${'>> nested quote'}                                | ${['>>']}
      ${'> [!note]\n> nested quote >> wrong quote'}       | ${[]}
      ${'> [!note]\n>> nested quote'}                     | ${['>>']}
      ${'> [!note]\n>> [!warning]\n>>'}                   | ${[]}
      ${'\nonly text / empty \n>> [!tip] Nested callout'} | ${['>>']}
      ${'> [!note]\n>> [!tip] Nested'}                    | ${[]}
      ${'> q1\n> q2'}                                     | ${['>', '>']}
      ${'>> q1\n>>> q2'}                                  | ${['>>', '>>>']}
      ${'> [!note]\n> nested quote'}                      | ${[]}
      ${'>  [!note] two spaces'}                          | ${[]}
      ${'> [!note]'}                                      | ${[]}
    `(
      'open matches $content',
      ({ content, expectedMatches }: { content: string; expectedMatches: string[] }) => {
        assertMatches(content, quoteEntry.open, expectedMatches);
      }
    );
  });

  describe('INDENT', () => {
    test.each`
      content                                             | expectedMatches
      ${'content\n\tindented'}                            | ${['\t']}
      ${'content\n\tindented\t'}                          | ${['\t']}
      ${'content\n\tindented\n\tgg'}                      | ${['\t', '\t']}
      ${'content\n    indented'}                          | ${['    ']}
      ${'----\n\tindented'}                               | ${['\t']}
      ${'content\n---\n\tindented'}                       | ${['\t']}
      ${'\tindented at start'}                            | ${[]}
      ${'\n\n\tindented after blank'}                     | ${[]}
      ${'---\n\tindented'}                                | ${[]}
      ${'---\n---\n\tindented'}                           | ${[]}
      ${'---\n-----\n\tindented'}                         | ${[]}
      ${'---\nkey: value\nkey: value\n-----\n\tindented'} | ${[]}
    `(
      'open matches $content',
      ({ content, expectedMatches }: { content: string; expectedMatches: string[] }) => {
        assertMatches(content, indentEntry.open, expectedMatches);
      }
    );
  });
});
