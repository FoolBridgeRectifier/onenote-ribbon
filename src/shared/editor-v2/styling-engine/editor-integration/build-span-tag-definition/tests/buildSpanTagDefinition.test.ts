import { buildSpanTagDefinition } from '../buildSpanTagDefinition';

describe('buildSpanTagDefinition', () => {
  it('builds a span definition for color', () => {
    expect(buildSpanTagDefinition('color', '#ff0000')).toEqual({
      tagName: 'span', domain: 'html',
      openingMarkup: '<span style="color:#ff0000">', closingMarkup: '</span>',
      attributes: { color: '#ff0000' },
    });
  });

  it('builds a span definition for background', () => {
    const result = buildSpanTagDefinition('background', '#ffff00');
    expect(result.openingMarkup).toBe('<span style="background:#ffff00">');
    expect(result.attributes).toEqual({ background: '#ffff00' });
  });

  it('builds a span definition for font-family', () => {
    const result = buildSpanTagDefinition('font-family', 'Arial');
    expect(result.attributes).toEqual({ 'font-family': 'Arial' });
  });

  it('builds a span definition for font-size', () => {
    const result = buildSpanTagDefinition('font-size', '14pt');
    expect(result.openingMarkup).toBe('<span style="font-size:14pt">');
  });

  it('builds a span definition for text-align', () => {
    const result = buildSpanTagDefinition('text-align', 'center');
    expect(result.attributes).toEqual({ 'text-align': 'center' });
  });

  it('builds a span definition for margin-left (indent)', () => {
    const result = buildSpanTagDefinition('margin-left', '24px');
    expect(result.openingMarkup).toBe('<span style="margin-left:24px">');
  });

  it('handles empty value gracefully', () => {
    const result = buildSpanTagDefinition('color', '');
    expect(result.openingMarkup).toBe('<span style="color:">');
    expect(result.attributes).toEqual({ color: '' });
  });

  it('always uses domain=html and tagName=span', () => {
    const result = buildSpanTagDefinition('anything', 'any');
    expect(result.tagName).toBe('span');
    expect(result.domain).toBe('html');
  });

  it('always closes with </span>', () => {
    const result = buildSpanTagDefinition('font-size', '12pt');
    expect(result.closingMarkup).toBe('</span>');
  });
});
