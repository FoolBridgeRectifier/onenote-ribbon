import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BulletLibrary } from './BulletLibrary';
import { BULLET_PRESETS } from '../constants';
import { BULLET_LIBRARY_HEADING } from './constants';

function renderBulletLibrary(
  anchor: HTMLElement,
  activePresetId = 'none',
  onSelectPreset = jest.fn(),
  onClose = jest.fn(),
) {
  return render(
    <BulletLibrary
      anchor={anchor}
      activePresetId={activePresetId}
      onSelectPreset={onSelectPreset}
      onClose={onClose}
    />,
  );
}

describe('BulletLibrary', () => {
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
      <BulletLibrary anchor={null} activePresetId="none" onSelectPreset={jest.fn()} onClose={jest.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the heading', () => {
    renderBulletLibrary(anchorElement);
    expect(screen.getByText(BULLET_LIBRARY_HEADING)).toBeInTheDocument();
  });

  it('renders a cell for every bullet preset', () => {
    renderBulletLibrary(anchorElement);
    BULLET_PRESETS.forEach((preset) => {
      expect(screen.getByText(preset.label)).toBeInTheDocument();
    });
  });

  it('renders the em-dash fallback for the None preset instead of level symbols', () => {
    renderBulletLibrary(anchorElement);

    // Scope the assertion to the None cell specifically — em dash also appears in other presets.
    const noneCell = screen.getByText('None').closest('[data-cmd="bullet-preset-none"]');
    expect(noneCell).not.toBeNull();

    // The None cell should contain the "—" fallback span.
    expect(noneCell!.querySelector('.onr-bullet-library-levels')).toHaveTextContent('—');

    // No individual level spans (.onr-bullet-library-level) should exist inside the None cell.
    expect(noneCell!.querySelectorAll('.onr-bullet-library-level')).toHaveLength(0);
  });

  it('marks the active preset cell with onr-active class', () => {
    renderBulletLibrary(anchorElement, 'classic');
    const classicCell = screen.getByText('Classic').closest('[data-cmd]');
    expect(classicCell).toHaveClass('onr-active');
  });

  it('calls onSelectPreset with the preset id when a cell is clicked', () => {
    const onSelectPreset = jest.fn();
    renderBulletLibrary(anchorElement, 'none', onSelectPreset);

    act(() => {
      fireEvent.click(screen.getByText('Diamond'));
    });

    expect(onSelectPreset).toHaveBeenCalledWith('diamond');
  });

  it('calls onClose after selecting a preset', () => {
    const onSelectPreset = jest.fn();
    const onClose = jest.fn();
    renderBulletLibrary(anchorElement, 'none', onSelectPreset, onClose);

    act(() => {
      fireEvent.click(screen.getByText('Classic'));
    });

    expect(onClose).toHaveBeenCalled();
  });

  it('shows level symbols for presets that have levels', () => {
    renderBulletLibrary(anchorElement);
    // Classic has ● as the L1 symbol
    const classicLevelSymbol = screen.getAllByText('●')[0];
    expect(classicLevelSymbol).toBeInTheDocument();
  });

  it('calls preventDefault on mousedown to prevent editor blur', () => {
    const onSelectPreset = jest.fn();
    renderBulletLibrary(anchorElement, 'none', onSelectPreset);

    const classicCell = screen.getByText('Classic').closest('[data-cmd]') as HTMLElement;

    const mousedownEvent = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    Object.defineProperty(mousedownEvent, 'preventDefault', { value: jest.fn() });

    act(() => {
      classicCell.dispatchEvent(mousedownEvent);
    });

    expect(mousedownEvent.preventDefault).toHaveBeenCalled();
  });

  it('snapshot: open state', () => {
    const { container } = renderBulletLibrary(anchorElement);
    expect(container).toMatchSnapshot();
  });
});
