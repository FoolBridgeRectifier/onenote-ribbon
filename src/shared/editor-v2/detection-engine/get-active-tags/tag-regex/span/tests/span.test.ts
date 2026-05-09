import { SPAN_TAG_REGEX } from '../span';
import { ESpanStyleTagType } from '../../../../../interfaces';
import { assertMatches, extractCapturedGroup } from '../../tests/testUtils';

describe('SPAN_TAG_REGEX', () => {
  const alignEntry = SPAN_TAG_REGEX.find((entry) => entry.type === ESpanStyleTagType.ALIGN)!;
  const colorEntry = SPAN_TAG_REGEX.find((entry) => entry.type === ESpanStyleTagType.COLOR)!;
  const fontSizeEntry = SPAN_TAG_REGEX.find((entry) => entry.type === ESpanStyleTagType.FONT_SIZE)!;
  const fontFamilyEntry = SPAN_TAG_REGEX.find(
    (entry) => entry.type === ESpanStyleTagType.FONT_FAMILY
  )!;
  const highlightEntry = SPAN_TAG_REGEX.find(
    (entry) => entry.type === ESpanStyleTagType.HIGHLIGHT
  )!;
  const genericEntry = SPAN_TAG_REGEX.find((entry) => entry.type === ESpanStyleTagType.GENERIC)!;

  describe('shape', () => {
    test('contains exactly 6 entries', () => {
      expect(SPAN_TAG_REGEX).toHaveLength(6);
    });
  });

  describe('ordering', () => {
    test('ALIGN appears before COLOR to avoid false match on multi-property spans', () => {
      const alignIndex = SPAN_TAG_REGEX.findIndex(
        (entry) => entry.type === ESpanStyleTagType.ALIGN
      );
      const colorIndex = SPAN_TAG_REGEX.findIndex(
        (entry) => entry.type === ESpanStyleTagType.COLOR
      );
      expect(alignIndex).toBeLessThan(colorIndex);
    });
  });

  describe('ALIGN', () => {
    test.each`
      content                                          | expectedMatches                                      | capturedStyle
      ${'<span style="text-align: center;">'}          | ${['<span style="text-align: center;">']}            | ${'text-align: center;'}
      ${'<span style="text-align: center;" >'}         | ${['<span style="text-align: center;" >']}           | ${'text-align: center;'}
      ${'<span style="text-align: center;"   >'}       | ${['<span style="text-align: center;"   >']}         | ${'text-align: center;'}
      ${'<span style="color: red;">'}                  | ${[]}                                                | ${null}
    `('open matches $content', ({ content, expectedMatches, capturedStyle }: { content: string; expectedMatches: string[]; capturedStyle: string | null }) => {
      assertMatches(content, alignEntry.open, expectedMatches);
      if (capturedStyle !== null) {
        expect(extractCapturedGroup(content, alignEntry.open, 1)).toBe(capturedStyle);
      }
    });

    test.each`
      content                                                         | expectedMatches
      ${'<span style="text-align: center;">hello</span>'}             | ${['</span>']}
      ${'<span style="text-align: center;"   >hello</span   >'}       | ${['</span   >']}
      ${'<span style="color: red;">hello</span>'}                     | ${['</span>']}
      ${'<span style="text-align: center;">hello<   /   span   >'}    | ${[]}
    `('close matches $content', ({ content, expectedMatches }: { content: string; expectedMatches: string[] }) => {
      assertMatches(content, alignEntry.close, expectedMatches);
    });
  });

  describe('COLOR', () => {
    test.each`
      content                                       | expectedMatches                                 | capturedStyle
      ${'<span style="color: red;">'}               | ${['<span style="color: red;">']}               | ${'color: red;'}
      ${'<span style="color: red;" >'}              | ${['<span style="color: red;" >']}              | ${'color: red;'}
      ${'<span style="color: red;"   >'}            | ${['<span style="color: red;"   >']}            | ${'color: red;'}
      ${'<span style="font-size: 12px;">'}          | ${[]}                                           | ${null}
      ${'<span style="background-color: red;">'}    | ${[]}                                           | ${null}
    `('open matches $content', ({ content, expectedMatches, capturedStyle }: { content: string; expectedMatches: string[]; capturedStyle: string | null }) => {
      assertMatches(content, colorEntry.open, expectedMatches);
      if (capturedStyle !== null) {
        expect(extractCapturedGroup(content, colorEntry.open, 1)).toBe(capturedStyle);
      }
    });

    test.each`
      content                                               | expectedMatches
      ${'<span style="color: red;">hello</span>'}           | ${['</span>']}
      ${'<span style="color: red;"   >hello</span   >'}     | ${['</span   >']}
    `('close matches $content', ({ content, expectedMatches }: { content: string; expectedMatches: string[] }) => {
      assertMatches(content, colorEntry.close, expectedMatches);
    });
  });

  describe('FONT_SIZE', () => {
    test.each`
      content                                    | expectedMatches                                   | capturedStyle
      ${'<span style="font-size: 14px;">'}       | ${['<span style="font-size: 14px;">']}            | ${'font-size: 14px;'}
      ${'<span style="font-size: 14px;" >'}      | ${['<span style="font-size: 14px;" >']}           | ${'font-size: 14px;'}
      ${'<span style="font-size: 14px;"   >'}    | ${['<span style="font-size: 14px;"   >']}         | ${'font-size: 14px;'}
      ${'<span style="color: blue;">'}           | ${[]}                                             | ${null}
    `('open matches $content', ({ content, expectedMatches, capturedStyle }: { content: string; expectedMatches: string[]; capturedStyle: string | null }) => {
      assertMatches(content, fontSizeEntry.open, expectedMatches);
      if (capturedStyle !== null) {
        expect(extractCapturedGroup(content, fontSizeEntry.open, 1)).toBe(capturedStyle);
      }
    });
  });

  describe('FONT_FAMILY', () => {
    test.each`
      content                                       | expectedMatches                                      | capturedStyle
      ${'<span style="font-family: Arial;">'}       | ${['<span style="font-family: Arial;">']}            | ${'font-family: Arial;'}
      ${'<span style="font-family: Arial;" >'}      | ${['<span style="font-family: Arial;" >']}           | ${'font-family: Arial;'}
      ${'<span style="font-family: Arial;"   >'}    | ${['<span style="font-family: Arial;"   >']}         | ${'font-family: Arial;'}
      ${'<span style="color: blue;">'}              | ${[]}                                                | ${null}
    `('open matches $content', ({ content, expectedMatches, capturedStyle }: { content: string; expectedMatches: string[]; capturedStyle: string | null }) => {
      assertMatches(content, fontFamilyEntry.open, expectedMatches);
      if (capturedStyle !== null) {
        expect(extractCapturedGroup(content, fontFamilyEntry.open, 1)).toBe(capturedStyle);
      }
    });
  });

  describe('HIGHLIGHT', () => {
    test.each`
      content                                         | expectedMatches                                       | capturedStyle
      ${'<span style="background: yellow;">'}         | ${['<span style="background: yellow;">']}             | ${'background: yellow;'}
      ${'<span style="background: yellow;" >'}        | ${['<span style="background: yellow;" >']}            | ${'background: yellow;'}
      ${'<span style="background: yellow;"   >'}      | ${['<span style="background: yellow;"   >']}          | ${'background: yellow;'}
      ${'<span style="color: blue;">'}                | ${[]}                                                 | ${null}
    `('open matches $content', ({ content, expectedMatches, capturedStyle }: { content: string; expectedMatches: string[]; capturedStyle: string | null }) => {
      assertMatches(content, highlightEntry.open, expectedMatches);
      if (capturedStyle !== null) {
        expect(extractCapturedGroup(content, highlightEntry.open, 1)).toBe(capturedStyle);
      }
    });
  });

  describe('GENERIC', () => {
    test('GENERIC entry exists', () => {
      expect(genericEntry).toBeDefined();
    });

    test.each`
      content                                              | expectedMatches
      ${'<span>'}                                          | ${['<span>']}
      ${'<span style="margin-left: 1em;">'}               | ${['<span style="margin-left: 1em;">']}
      ${'<span style="color: red;">'}                      | ${['<span style="color: red;">']}
      ${'<span  >'}                                        | ${['<span  >']}
      ${'<span/>'}                                         | ${[]}
      ${'<span />'}                                        | ${[]}
    `('open matches $content → $expectedMatches', ({ content, expectedMatches }: { content: string; expectedMatches: string[] }) => {
      assertMatches(content, genericEntry.open, expectedMatches);
    });

    test.each`
      content                                         | expectedMatches
      ${'<span style="color: red;">hello</span>'}     | ${['</span>']}
      ${'<span>hello</span>'}                         | ${['</span>']}
    `('close matches $content', ({ content, expectedMatches }: { content: string; expectedMatches: string[] }) => {
      assertMatches(content, genericEntry.close, expectedMatches);
    });

    test('GENERIC appears last in the array (after all specific entries)', () => {
      const genericIndex = SPAN_TAG_REGEX.findIndex(
        (entry) => entry.type === ESpanStyleTagType.GENERIC
      );
      expect(genericIndex).toBe(SPAN_TAG_REGEX.length - 1);
    });
  });
});
