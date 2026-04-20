import { levelClass } from '../LevelClass';
import type { StyleEntry } from '../../interfaces';

const normal: StyleEntry     = { name: 'Normal',    level: 0 };
const heading1: StyleEntry   = { name: 'Heading 1', level: 1 };
const heading2: StyleEntry   = { name: 'Heading 2', level: 2 };
const heading3: StyleEntry   = { name: 'Heading 3', level: 3 };
const heading4: StyleEntry   = { name: 'Heading 4', level: 4 };
const heading5: StyleEntry   = { name: 'Heading 5', level: 5 };
const heading6: StyleEntry   = { name: 'Heading 6', level: 6 };
const quote: StyleEntry      = { name: 'Quote',     level: 0, type: 'quote' };
const code: StyleEntry       = { name: 'Code',      level: 0, type: 'code' };
const unknown: StyleEntry    = { name: 'Unknown',   level: 99 };

describe('levelClass', () => {
  it('returns onr-style-normal for level 0 with no type', () => {
    expect(levelClass(normal)).toBe('onr-style-normal');
  });

  it('returns onr-style-h1 for level 1', () => {
    expect(levelClass(heading1)).toBe('onr-style-h1');
  });

  it('returns onr-style-h2 for level 2', () => {
    expect(levelClass(heading2)).toBe('onr-style-h2');
  });

  it('returns onr-style-h3 for level 3', () => {
    expect(levelClass(heading3)).toBe('onr-style-h3');
  });

  it('returns onr-style-h4 for level 4', () => {
    expect(levelClass(heading4)).toBe('onr-style-h4');
  });

  it('returns onr-style-h5 for level 5', () => {
    expect(levelClass(heading5)).toBe('onr-style-h5');
  });

  it('returns onr-style-h6 for level 6', () => {
    expect(levelClass(heading6)).toBe('onr-style-h6');
  });

  it('returns onr-style-quote when type is quote', () => {
    expect(levelClass(quote)).toBe('onr-style-quote');
  });

  it('returns onr-style-code when type is code', () => {
    expect(levelClass(code)).toBe('onr-style-code');
  });

  it('returns empty string for an unrecognised level', () => {
    expect(levelClass(unknown)).toBe('');
  });
});
