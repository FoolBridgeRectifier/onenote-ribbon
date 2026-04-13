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

/**
 * Recursively collect all `onr-*` class names used in the rendered DOM tree.
 */
function collectRenderedClassNames(element: Element): Set<string> {
  const classNames = new Set<string>();

  for (const singleClassName of element.classList) {
    if (singleClassName.startsWith('onr-')) {
      classNames.add(singleClassName);
    }
  }

  for (const childElement of Array.from(element.children)) {
    for (const childClassName of collectRenderedClassNames(childElement)) {
      classNames.add(childClassName);
    }
  }

  return classNames;
}

/**
 * Parse all `<style>` elements in `document.head` and return the set of
 * `onr-*` class names that appear in at least one CSS selector.
 */
function collectDefinedCssClassNames(): Set<string> {
  const definedClassNames = new Set<string>();
  const styleElements = document.head.querySelectorAll('style');

  for (const styleElement of Array.from(styleElements)) {
    const cssText = styleElement.textContent ?? '';

    // Match `.onr-<name>` in selectors — stop at whitespace, comma, brace,
    // colon (pseudo-class), dot (chained class), or plus/tilde (combinators).
    const selectorMatches = cssText.matchAll(/\.(onr-[a-zA-Z0-9_-]+)/g);

    for (const selectorMatch of selectorMatches) {
      definedClassNames.add(selectorMatch[1]);
    }
  }

  return definedClassNames;
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

  it('every onr-* class used in the DOM has a matching CSS rule', () => {
    const app = createMockApp();
    const { container } = renderWithApp(<HomeTabPanel />, app);

    const panelElement = container.querySelector('[data-panel="Home"]');
    if (!panelElement) {
      throw new Error('Expected Home tab panel element to exist.');
    }

    const renderedClassNames = collectRenderedClassNames(panelElement);
    const definedCssClassNames = collectDefinedCssClassNames();

    const orphanedClassNames = [...renderedClassNames]
      .filter((className) => !definedCssClassNames.has(className))
      .sort();

    expect(orphanedClassNames).toEqual([]);
  });
});
