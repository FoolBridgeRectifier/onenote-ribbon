import React from 'react';
import { createMockApp } from '../../test-utils/mockApp';
import { renderWithApp } from '../../test-utils/renderWithApp';
import { HomeTabPanel } from './HomeTabPanel';

interface ElementSnapshotNode {
  tagName: string;
  className: string;
  dataAttributes: Record<string, string>;
  textContent: string;
  computedCss: Record<string, string>;
  children: ElementSnapshotNode[];
}

function collectComputedCss(element: Element): Record<string, string> {
  const computedStyle = window.getComputedStyle(element);
  const computedCss: Record<string, string> = {};

  // Sort property names so snapshot order stays stable across runs.
  const propertyNames = Array.from(computedStyle).sort();
  for (const propertyName of propertyNames) {
    const propertyValue = computedStyle.getPropertyValue(propertyName);

    if (propertyValue) {
      computedCss[propertyName] = propertyValue;
    }
  }

  return computedCss;
}

function collectDataAttributes(element: Element): Record<string, string> {
  const dataAttributes: Record<string, string> = {};
  const attributeNames = element.getAttributeNames().sort();

  for (const attributeName of attributeNames) {
    if (!attributeName.startsWith('data-')) {
      continue;
    }

    const attributeValue = element.getAttribute(attributeName);
    if (attributeValue !== null) {
      dataAttributes[attributeName] = attributeValue;
    }
  }

  return dataAttributes;
}

function buildElementSnapshotTree(element: Element): ElementSnapshotNode {
  // Recursively snapshot each rendered child element and its computed CSS.
  const children = Array.from(element.children).map((childElement) =>
    buildElementSnapshotTree(childElement),
  );

  return {
    tagName: element.tagName.toLowerCase(),
    className: element.getAttribute('class') ?? '',
    dataAttributes: collectDataAttributes(element),
    textContent: (element.textContent ?? '').replace(/\s+/g, ' ').trim(),
    computedCss: collectComputedCss(element),
    children,
  };
}

describe('HomeTabPanel snapshots', () => {
  it('matches DOM snapshot and recursive computed CSS snapshot for all elements', () => {
    const app = createMockApp();
    const { container } = renderWithApp(<HomeTabPanel />, app);

    const panelElement = container.querySelector('[data-panel="Home"]');
    expect(panelElement).not.toBeNull();

    if (!panelElement) {
      throw new Error('Expected Home tab panel element to exist.');
    }

    expect(panelElement).toMatchSnapshot('home-tab-panel-dom');
    expect(buildElementSnapshotTree(panelElement)).toMatchSnapshot(
      'home-tab-panel-recursive-computed-css',
    );
  });
});
