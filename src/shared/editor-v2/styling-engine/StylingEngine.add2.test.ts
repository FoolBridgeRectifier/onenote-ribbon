import { toggleTag } from './StylingEngine';
import { BOLD_MD } from './constants';
import { selectAll, applyReplacements } from './helpers';

// All tests in TDD red state — stubs throw 'not implemented'.

describe('A14 — heading add', () => {
  it('prepends a heading prefix when toggling heading tag', () => {
    const result = toggleTag(selectAll('title'), { type: 'heading' });
    expect(result.replacements[0].fromOffset).toBe(0);
    expect(result.replacements[0].toOffset).toBe(0);
    expect(result.replacements[0].replacementText).toMatch(/^#+\s/);
  });
});

describe('A10 — embed, mdLink, and #todo punch-outs', () => {
  it('embed ![[...]] punch-out: 4 replacements (2 non-protected segments)', () => {
    expect(toggleTag(selectAll('before ![[img.png]] after'), BOLD_MD).replacements).toHaveLength(4);
  });

  it('mdLink [text](url) punch-out: 4 replacements', () => {
    expect(toggleTag(selectAll('before [text](https://x.com) after'), BOLD_MD).replacements).toHaveLength(4);
  });

  it('#todo punch-out: surrounding text wrapped, #todo token skipped', () => {
    expect(applyReplacements('before #todo after', toggleTag(selectAll('before #todo after'), BOLD_MD).replacements))
      .toBe('**before** #todo **after**');
  });
});
