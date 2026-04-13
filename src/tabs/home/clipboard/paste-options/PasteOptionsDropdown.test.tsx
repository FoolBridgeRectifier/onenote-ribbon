import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { PasteOptionsDropdown } from './PasteOptionsDropdown';

function createAnchorElement(left = 88, bottom = 120): HTMLElement {
  const anchorElement = document.createElement('div');
  anchorElement.setAttribute('data-test-anchor', 'true');
  const top = 92;
  const width = 46;
  const height = 28;

  anchorElement.getBoundingClientRect = () =>
    ({
      x: left,
      y: top,
      width,
      height,
      top,
      right: left + width,
      bottom,
      left,
      toJSON: () => ({}),
    }) as DOMRect;

  document.body.appendChild(anchorElement);

  return anchorElement;
}

describe('PasteOptionsDropdown', () => {
  afterEach(() => {
    const anchorElements = document.body.querySelectorAll('[data-test-anchor]');

    for (const anchorElement of Array.from(anchorElements)) {
      anchorElement.remove();
    }
  });

  it('renders nothing when anchor is null', () => {
    render(
      <PasteOptionsDropdown anchor={null} options={[]} onClose={() => {}} />,
    );

    expect(document.body.querySelector('.onr-paste-options-panel')).toBeNull();
  });

  it('renders open state snapshot and computed styles through shared Dropdown', () => {
    const anchorElement = createAnchorElement(88, 120);

    render(
      <PasteOptionsDropdown
        anchor={anchorElement}
        options={[
          {
            icon: <span>PT</span>,
            title: 'Paste plain text',
            onClick: jest.fn(),
          },
          {
            icon: <span>CB</span>,
            title: 'Paste as code block',
            onClick: jest.fn(),
          },
        ]}
        onClose={() => {}}
      />,
    );

    const panelElement = document.body.querySelector(
      '.onr-paste-options-panel',
    ) as HTMLDivElement | null;

    expect(panelElement).not.toBeNull();

    if (!panelElement) {
      throw new Error('Expected paste options panel to render.');
    }

    expect(panelElement).toMatchSnapshot('paste-options-open');

    const computedStyle = window.getComputedStyle(panelElement);
    expect(computedStyle.position).toBe('fixed');
    expect(computedStyle.top).toBe('122px');
    expect(computedStyle.left).toBe('88px');
    expect(computedStyle.zIndex).toBe('50');
  });

  it('calls option onClick and onClose when an option is clicked', () => {
    const anchorElement = createAnchorElement();
    const handleOptionClick = jest.fn();
    const handleClose = jest.fn();

    render(
      <PasteOptionsDropdown
        anchor={anchorElement}
        options={[
          {
            icon: <span>PT</span>,
            title: 'Paste plain text',
            onClick: handleOptionClick,
          },
        ]}
        onClose={handleClose}
      />,
    );

    fireEvent.click(screen.getByTitle('Paste plain text'));

    expect(handleOptionClick).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('closes when clicking outside the panel and anchor', () => {
    const anchorElement = createAnchorElement();
    const handleClose = jest.fn();

    render(
      <PasteOptionsDropdown
        anchor={anchorElement}
        options={[]}
        onClose={handleClose}
      />,
    );

    fireEvent.click(document.body);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
