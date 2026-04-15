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
      <NumberLibrary anchor={null} activePresetId="none" onSelectPreset={jest.fn()} onClose={jest.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the heading', () => {
    renderNumberLibrary(anchorElement);
    expect(screen.getByText(NUMBER_LIBRARY_HEADING)).toBeInTheDocument();
  });

  it('renders a cell for every number preset', () => {
    renderNumberLibrary(anchorElement);
    NUMBER_PRESETS.forEach((preset) => {
      expect(screen.getByText(preset.label)).toBeInTheDocument();
    });
  });

  it('marks the active preset cell with onr-active class', () => {
    renderNumberLibrary(anchorElement, 'decimal-period');
    const decimalCell = screen.getByText('1. 2. 3.').closest('[data-cmd]');
    expect(decimalCell).toHaveClass('onr-active');
  });

  it('calls onSelectPreset with the preset id when a cell is clicked', () => {
    const onSelectPreset = jest.fn();
    renderNumberLibrary(anchorElement, 'none', onSelectPreset);

    act(() => {
      fireEvent.click(screen.getByText('a. b. c.'));
    });

    expect(onSelectPreset).toHaveBeenCalledWith('lower-alpha-period');
  });

  it('calls onClose after selecting a preset', () => {
    const onSelectPreset = jest.fn();
    const onClose = jest.fn();
    renderNumberLibrary(anchorElement, 'none', onSelectPreset, onClose);

    act(() => {
      fireEvent.click(screen.getByText('1. 2. 3.'));
    });

    expect(onClose).toHaveBeenCalled();
  });

  it('calls preventDefault on mousedown to prevent editor blur', () => {
    const onSelectPreset = jest.fn();
    renderNumberLibrary(anchorElement, 'none', onSelectPreset);

    const decimalCell = screen.getByText('1. 2. 3.').closest('[data-cmd]') as HTMLElement;

    const mousedownEvent = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    Object.defineProperty(mousedownEvent, 'preventDefault', { value: jest.fn() });

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
