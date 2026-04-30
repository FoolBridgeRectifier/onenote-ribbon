import { ESpecialTagType } from '../../../interfaces';
import { getActiveTags } from '../getActiveTags';

describe('getActiveTags', () => {
  test('does not emit empty CODE close matches when no backticks exist', () => {
    const detections = getActiveTags('first\nsecond\nthird', null);

    const emptyCodeCloseDetections = detections.filter(
      (detection) =>
        detection.type === ESpecialTagType.CODE &&
        detection.role === 'close' &&
        detection.match.length === 0
    );

    expect(emptyCodeCloseDetections).toHaveLength(0);
  });

  test('does not classify callout marker [!note] as wikilink', () => {
    const detections = getActiveTags('>[!note]\nbody', null);

    const wikilinkDetections = detections.filter(
      (detection) => detection.type === ESpecialTagType.WIKILINK
    );

    expect(wikilinkDetections).toHaveLength(0);
  });

  test('still classifies a real wikilink', () => {
    const detections = getActiveTags('[[Hamlet]]', null);

    const wikilinkDetections = detections.filter(
      (detection) => detection.type === ESpecialTagType.WIKILINK
    );

    expect(wikilinkDetections).toHaveLength(1);
    expect(wikilinkDetections[0]?.match).toBe('[[Hamlet]]');
  });

  test('returns location, matched text, and entire matched line', () => {
    const content = 'prefix [[Hamlet]] suffix';
    const detections = getActiveTags(content, null);

    const wikilinkDetection = detections.find(
      (detection) => detection.type === ESpecialTagType.WIKILINK
    );

    expect(wikilinkDetection?.match).toBe('[[Hamlet]]');
    expect(wikilinkDetection?.line).toBe(content);
    expect(wikilinkDetection?.location).toEqual({
      index: 7,
      lineNumber: 1,
      columnNumber: 8,
    });
  });
});
