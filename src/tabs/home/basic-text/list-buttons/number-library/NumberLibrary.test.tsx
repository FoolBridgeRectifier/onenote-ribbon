import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { NumberLibrary } from './NumberLibrary';
import { NUMBER_PRESETS } from '../constants';
import { NUMBER_LIBRARY_HEADING } from './constants';

function renderNumberLibrary(
  anchor: HTMLElement,
  activePresetId = 'none',
  onSelectPreset = jest.fn(),
  onClose = jest.fn(),
) {
  return render(
    <NumberLibrary
      anchor={anchor}
      activePresetId={activePresetId}
      onSelectPreset={onSelectPreset}
      onClose={onClose}
    />,
  );
}

describe('NumberLibrary', () => {
  let anchorElement: HTMLElement;

  beforeEach(() => {
    anchorElement = document.createElement('div');
    document.body.appendChild(anchorElement);
  });

  afterEach(() => {
    anchorElement.remove();
  });

  it('renders null when anchor is null', () => {
    const { container } = render(
      <NumberLibrary
        anchor={null}
        activePresetId="none"
        onSelectPreset={jest.fn()}
        onClose={jest.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the heading', () => {
    renderNumberLibrary(anchorElement);
    expect(screen.getByText(NUMBER_LIBRARY_HEADING)).toBeInTheDocument();
  });

  it('renders a label for every number preset', () => {
    renderNumberLibrary(anchorElement);
    NUMBER_PRESETS.forEach((preset) => {
      expect(screen.getByText(preset.label)).toBeInTheDocument();
    });
  });

  it('renders depth-level previews for presets with levels', () => {
    renderNumberLibrary(anchorElement);

    // decimal-period: depth levels should show "1.", "a.", "i.", "A."
    const decimalPeriodCell = screen.getByTestId
      ? document.querySelector('[data-cmd="number-preset-decimal-period"]')
      : document.querySelector('[data-cmd="number-preset-decimal-period"]');

    expect(
      decimalPeriodCell?.querySelector('.onr-number-library-levels'),
    ).toBeInTheDocument();
    const levelSpans = decimalPeriodCell?.querySelectorAll(
      '.onr-number-library-level',
    );
    expect(levelSpans?.length).toBe(4);
    expect(levelSpans?.[0].textContent).toBe('1.');
    expect(levelSpans?.[1].textContent).toBe('a.');
    expect(levelSpans?.[2].textContent).toBe('i.');
    expect(levelSpans?.[3].textContent).toBe('A.');
  });

  it('renders "—" for the None preset', () => {
    renderNumberLibrary(anchorElement);
    const noneCell = document.querySelector('[data-cmd="number-preset-none"]');
    expect(
      noneCell?.querySelector('.onr-number-library-levels')?.textContent,
    ).toBe('—');
  });

  it('marks the active preset cell with onr-active class', () => {
    renderNumberLibrary(anchorElement, 'decimal-period');
    const decimalCell = document.querySelector(
      '[data-cmd="number-preset-decimal-period"]',
    );
    expect(decimalCell).toHaveClass('onr-active');
  });

  it('calls onSelectPreset with the preset id when a cell is clicked', () => {
    const onSelectPreset = jest.fn();
    renderNumberLibrary(anchorElement, 'none', onSelectPreset);

    const lowerAlphaCell = document.querySelector(
      '[data-cmd="number-preset-lower-alpha-period"]',
    ) as HTMLElement;

    act(() => {
      fireEvent.click(lowerAlphaCell);
    });

    expect(onSelectPreset).toHaveBeenCalledWith('lower-alpha-period');
  });

  it('calls onClose after selecting a preset', () => {
    const onSelectPreset = jest.fn();
    const onClose = jest.fn();
    renderNumberLibrary(anchorElement, 'none', onSelectPreset, onClose);

    const decimalCell = document.querySelector(
      '[data-cmd="number-preset-decimal-period"]',
    ) as HTMLElement;

    act(() => {
      fireEvent.click(decimalCell);
    });

    expect(onClose).toHaveBeenCalled();
  });

  it('calls preventDefault on mousedown to prevent editor blur', () => {
    const onSelectPreset = jest.fn();
    renderNumberLibrary(anchorElement, 'none', onSelectPreset);

    const decimalCell = document.querySelector(
      '[data-cmd="number-preset-decimal-period"]',
    ) as HTMLElement;

    const mousedownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(mousedownEvent, 'preventDefault', {
      value: jest.fn(),
    });

    act(() => {
      decimalCell.dispatchEvent(mousedownEvent);
    });

    expect(mousedownEvent.preventDefault).toHaveBeenCalled();
  });

  it('snapshot: open state', () => {
    const { container } = renderNumberLibrary(anchorElement);
    expect(container).toMatchSnapshot();
  });
});
