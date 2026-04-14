import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BulletLibrary } from './BulletLibrary';
import { BULLET_PRESETS } from '../constants';

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
    expect(screen.getByText('Bullet Library')).toBeInTheDocument();
  });

  it('renders a cell for every bullet preset', () => {
    renderBulletLibrary(anchorElement);
    BULLET_PRESETS.forEach((preset) => {
      expect(screen.getByText(preset.label)).toBeInTheDocument();
    });
  });

  it('renders the None cell', () => {
    renderBulletLibrary(anchorElement);
    expect(screen.getByText('None')).toBeInTheDocument();
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

  it('snapshot: open state', () => {
    const { container } = renderBulletLibrary(anchorElement);
    expect(container).toMatchSnapshot();
  });
});
