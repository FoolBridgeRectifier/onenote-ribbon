
import { fireEvent, render, screen } from '@testing-library/react';
import { ColorPicker } from '../ColorPicker';

function createAnchorElement(): HTMLElement {
  const anchorElement = document.createElement('div');
  anchorElement.setAttribute('data-test-anchor', 'true');

  anchorElement.getBoundingClientRect = () =>
    ({
      x: 100,
      y: 24,
      width: 40,
      height: 24,
      top: 24,
      right: 140,
      bottom: 48,
      left: 100,
      toJSON: () => ({}),
    }) as DOMRect;

  document.body.appendChild(anchorElement);

  return anchorElement;
}

describe('ColorPicker', () => {
  afterEach(() => {
    const anchorElements = document.body.querySelectorAll('[data-test-anchor]');

    for (const anchorElement of Array.from(anchorElements)) {
      anchorElement.remove();
    }
  });

  it('renders color swatches in a grid', () => {
    const anchorElement = createAnchorElement();

    render(
      <ColorPicker
        anchor={anchorElement}
        selectedColor={null}
        onColorSelect={jest.fn()}
        onNoColor={jest.fn()}
        onClose={jest.fn()}
      />,
    );

    const swatches = document.body.querySelectorAll('.onr-cp-swatch');

    // 20 colors in the palette
    expect(swatches.length).toBe(20);
  });

  it('calls onColorSelect and onClose when a swatch is clicked', () => {
    const anchorElement = createAnchorElement();
    const handleColorSelect = jest.fn();
    const handleClose = jest.fn();

    render(
      <ColorPicker
        anchor={anchorElement}
        selectedColor={null}
        onColorSelect={handleColorSelect}
        onNoColor={jest.fn()}
        onClose={handleClose}
      />,
    );

    const swatches = document.body.querySelectorAll('.onr-cp-swatch');
    fireEvent.click(swatches[0]);

    expect(handleColorSelect).toHaveBeenCalledWith('#000000');
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onNoColor and onClose when "No Color" is clicked', () => {
    const anchorElement = createAnchorElement();
    const handleNoColor = jest.fn();
    const handleClose = jest.fn();

    render(
      <ColorPicker
        anchor={anchorElement}
        selectedColor={null}
        onColorSelect={jest.fn()}
        onNoColor={handleNoColor}
        onClose={handleClose}
      />,
    );

    fireEvent.click(screen.getByText('Automatic / No Color'));

    expect(handleNoColor).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('shows active indicator on the selected color swatch', () => {
    const anchorElement = createAnchorElement();

    render(
      <ColorPicker
        anchor={anchorElement}
        selectedColor="#ff0000"
        onColorSelect={jest.fn()}
        onNoColor={jest.fn()}
        onClose={jest.fn()}
      />,
    );

    const activeSwatches = document.body.querySelectorAll(
      '.onr-cp-swatch-active',
    );

    expect(activeSwatches.length).toBe(1);
    expect(activeSwatches[0].getAttribute('title')).toBe('#ff0000');
  });

  it('accepts custom hex value via the input field', () => {
    const anchorElement = createAnchorElement();
    const handleColorSelect = jest.fn();
    const handleClose = jest.fn();

    render(
      <ColorPicker
        anchor={anchorElement}
        selectedColor={null}
        onColorSelect={handleColorSelect}
        onNoColor={jest.fn()}
        onClose={handleClose}
      />,
    );

    const hexInput = document.body.querySelector(
      '.onr-cp-hex-input',
    ) as HTMLInputElement;

    fireEvent.change(hexInput, { target: { value: '#abcdef' } });
    fireEvent.click(screen.getByText('Apply'));

    expect(handleColorSelect).toHaveBeenCalledWith('#abcdef');
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('rejects invalid hex values without calling onColorSelect', () => {
    const anchorElement = createAnchorElement();
    const handleColorSelect = jest.fn();

    render(
      <ColorPicker
        anchor={anchorElement}
        selectedColor={null}
        onColorSelect={handleColorSelect}
        onNoColor={jest.fn()}
        onClose={jest.fn()}
      />,
    );

    const hexInput = document.body.querySelector(
      '.onr-cp-hex-input',
    ) as HTMLInputElement;

    fireEvent.change(hexInput, { target: { value: 'not-a-color' } });
    fireEvent.click(screen.getByText('Apply'));

    expect(handleColorSelect).not.toHaveBeenCalled();
  });

  it('rejects hex values with invalid lengths (5 or 7 digits)', () => {
    const anchorElement = createAnchorElement();
    const handleColorSelect = jest.fn();

    render(
      <ColorPicker
        anchor={anchorElement}
        selectedColor={null}
        onColorSelect={handleColorSelect}
        onNoColor={jest.fn()}
        onClose={jest.fn()}
      />,
    );

    const hexInput = document.body.querySelector(
      '.onr-cp-hex-input',
    ) as HTMLInputElement;

    // 5-digit hex is not valid CSS
    fireEvent.change(hexInput, { target: { value: '#12345' } });
    fireEvent.click(screen.getByText('Apply'));
    expect(handleColorSelect).not.toHaveBeenCalled();

    // 7-digit hex is not valid CSS
    fireEvent.change(hexInput, { target: { value: '#1234567' } });
    fireEvent.click(screen.getByText('Apply'));
    expect(handleColorSelect).not.toHaveBeenCalled();
  });

  it('displays the label from props', () => {
    const anchorElement = createAnchorElement();

    render(
      <ColorPicker
        anchor={anchorElement}
        selectedColor={null}
        onColorSelect={jest.fn()}
        onNoColor={jest.fn()}
        onClose={jest.fn()}
        label="Highlight Color"
      />,
    );

    expect(screen.getByText('Highlight Color')).toBeInTheDocument();
  });
});
