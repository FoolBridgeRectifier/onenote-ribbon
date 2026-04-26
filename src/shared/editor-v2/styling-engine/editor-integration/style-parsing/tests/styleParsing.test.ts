import {
  extractStylePropertyFromOpeningTag,
  extractAllStyleProperties,
} from '../styleParsing';

describe('extractStylePropertyFromOpeningTag', () => {
  it('returns null when no style attribute is present', () => {
    expect(extractStylePropertyFromOpeningTag('<span>')).toBeNull();
  });

  it('returns null when style attribute is empty / unparseable', () => {
    expect(extractStylePropertyFromOpeningTag('<span style="">')).toBeNull();
  });

  it('returns first property/value pair from a single-property style', () => {
    expect(
      extractStylePropertyFromOpeningTag('<span style="color:red;">'),
    ).toEqual({ propertyName: 'color', propertyValue: 'red' });
  });

  it('returns first property/value pair from a multi-property style', () => {
    expect(
      extractStylePropertyFromOpeningTag('<span style="color:red;font-size:12pt">'),
    ).toEqual({ propertyName: 'color', propertyValue: 'red;font-size:12pt' });
  });

  it('trims whitespace around property name and value', () => {
    expect(
      extractStylePropertyFromOpeningTag('<span style="  color  :  red  ;">'),
    ).toEqual({ propertyName: 'color', propertyValue: 'red' });
  });
});

describe('extractAllStyleProperties', () => {
  it('returns empty array when no style attribute is present', () => {
    expect(extractAllStyleProperties('<span>')).toEqual([]);
  });

  it('returns single-element array for a single-property style', () => {
    expect(extractAllStyleProperties('<span style="color:red;">')).toEqual([
      { propertyName: 'color', propertyValue: 'red' },
    ]);
  });

  it('returns all properties from a multi-property style', () => {
    expect(
      extractAllStyleProperties(
        '<span style="display:inline-block;width:100%;text-align:center">',
      ),
    ).toEqual([
      { propertyName: 'display', propertyValue: 'inline-block' },
      { propertyName: 'width', propertyValue: '100%' },
      { propertyName: 'text-align', propertyValue: 'center' },
    ]);
  });

  it('skips empty declarations between semicolons', () => {
    expect(
      extractAllStyleProperties('<span style="color:red;;font-size:12pt;">'),
    ).toEqual([
      { propertyName: 'color', propertyValue: 'red' },
      { propertyName: 'font-size', propertyValue: '12pt' },
    ]);
  });

  it('skips declarations missing a colon', () => {
    expect(
      extractAllStyleProperties('<span style="bogus;color:red">'),
    ).toEqual([{ propertyName: 'color', propertyValue: 'red' }]);
  });

  it('skips declarations with empty name or empty value', () => {
    expect(
      extractAllStyleProperties('<span style=":red;color:;font-size:12pt">'),
    ).toEqual([{ propertyName: 'font-size', propertyValue: '12pt' }]);
  });

  it('trims whitespace around each property name and value', () => {
    expect(
      extractAllStyleProperties('<span style="  color : red ; font-size : 12pt ">'),
    ).toEqual([
      { propertyName: 'color', propertyValue: 'red' },
      { propertyName: 'font-size', propertyValue: '12pt' },
    ]);
  });
});
