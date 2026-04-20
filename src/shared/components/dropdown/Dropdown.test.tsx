
import { fireEvent, render, screen } from '@testing-library/react';
import { Dropdown } from './Dropdown';
import type { DropdownItem } from './interfaces';

function createAnchorElement(left = 120, bottom = 64): HTMLElement {
  const anchorElement = document.createElement('div');
  anchorElement.setAttribute('data-test-anchor', 'true');
  const top = 24;
  const width = 40;
  const height = 24;

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

describe('Dropdown', () => {
  afterEach(() => {
    const anchorElements = document.body.querySelectorAll('[data-test-anchor]');

    for (const anchorElement of Array.from(anchorElements)) {
      anchorElement.remove();
    }
  });

  it('renders default item layout and computed placement styles', () => {
    const anchorElement = createAnchorElement(120, 64);
    const dropdownItems: DropdownItem[] = [
      {
        label: 'Paste',
        onClick: jest.fn(),
      },
      {
        label: 'Paste Plain',
        sublabel: 'Keep text only',
        onClick: jest.fn(),
      },
    ];

    render(
      <Dropdown
        anchor={anchorElement}
        items={dropdownItems}
        onClose={() => {}}
      />,
    );

    const dropdownElement = document.body.querySelector(
      '.onr-overlay-dropdown',
    ) as HTMLDivElement | null;

    expect(dropdownElement).not.toBeNull();

    if (!dropdownElement) {
      throw new Error('Expected dropdown element to render.');
    }

    expect(dropdownElement).toMatchSnapshot('default-dropdown-open');

    const computedStyle = window.getComputedStyle(dropdownElement);
    expect(computedStyle.position).toBe('fixed');
    expect(computedStyle.top).toBe('68px');
    expect(computedStyle.left).toBe('120px');
    expect(computedStyle.zIndex).toBe('50');
  });

  it('supports custom children and passthrough HTML attributes', () => {
    const anchorElement = createAnchorElement(10, 30);

    render(
      <Dropdown
        anchor={anchorElement}
        onClose={() => {}}
        className="onr-custom-dropdown"
        data-cmd="custom-dropdown"
      >
        <div data-testid="custom-content">Custom content</div>
      </Dropdown>,
    );

    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    expect(screen.queryByText('Paste')).not.toBeInTheDocument();

    const dropdownElement = document.body.querySelector(
      '.onr-overlay-dropdown',
    ) as HTMLDivElement | null;

    if (!dropdownElement) {
      throw new Error('Expected dropdown element to render.');
    }

    expect(dropdownElement.className).toBe(
      'onr-overlay-dropdown onr-custom-dropdown',
    );
    expect(dropdownElement.getAttribute('data-cmd')).toBe('custom-dropdown');
  });

  it('calls item handler and onClose when a default item is clicked', () => {
    const anchorElement = createAnchorElement();
    const handleOptionClick = jest.fn();
    const handleClose = jest.fn();

    render(
      <Dropdown
        anchor={anchorElement}
        items={[
          {
            label: 'Paste as code',
            onClick: handleOptionClick,
          },
        ]}
        onClose={handleClose}
      />,
    );

    fireEvent.click(screen.getByText('Paste as code'));

    expect(handleOptionClick).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking outside the anchor and dropdown', () => {
    const anchorElement = createAnchorElement();
    const handleClose = jest.fn();

    render(
      <Dropdown anchor={anchorElement} items={[]} onClose={handleClose} />,
    );

    fireEvent.click(document.body);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('supports custom offsets and non-constrained left placement', () => {
    const anchorElement = createAnchorElement(-8, 48);

    render(
      <Dropdown
        anchor={anchorElement}
        onClose={() => {}}
        offsetY={2}
        offsetX={-12}
        constrainLeftToViewport={false}
      >
        <div>Offset content</div>
      </Dropdown>,
    );

    const dropdownElement = document.body.querySelector(
      '.onr-overlay-dropdown',
    ) as HTMLDivElement | null;

    if (!dropdownElement) {
      throw new Error('Expected dropdown element to render.');
    }

    const computedStyle = window.getComputedStyle(dropdownElement);
    expect(computedStyle.top).toBe('50px');
    expect(computedStyle.left).toBe('-20px');
    expect(computedStyle.zIndex).toBe('50');
  });
});
