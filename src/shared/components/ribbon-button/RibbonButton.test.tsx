import React, { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RibbonButton } from './RibbonButton';

describe('RibbonButton', () => {
  it('renders with onr-btn-sm class by default (small size)', () => {
    const { container } = render(<RibbonButton onClick={() => {}} />);

    expect(container.firstElementChild!.className).toBe('onr-btn-sm');
  });

  it('renders with onr-btn class when size is large', () => {
    const { container } = render(
      <RibbonButton size="large" onClick={() => {}} />,
    );

    expect(container.firstElementChild!.className).toBe('onr-btn');
  });

  it('renders icon and label with onr-btn-label-sm for small size', () => {
    render(
      <RibbonButton
        icon={<svg data-testid="icon" />}
        label="Cut"
        onClick={() => {}}
      />,
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();

    const labelSpan = screen.getByText('Cut');
    expect(labelSpan.className).toBe('onr-btn-label-sm');
  });

  it('renders label with onr-btn-label for large size', () => {
    render(
      <RibbonButton
        size="large"
        icon={<svg data-testid="icon" />}
        label="Paste"
        onClick={() => {}}
      />,
    );

    const labelSpan = screen.getByText('Paste');
    expect(labelSpan.className).toBe('onr-btn-label');
  });

  it('renders icon without label when label is omitted', () => {
    const { container } = render(
      <RibbonButton icon={<svg data-testid="icon" />} onClick={() => {}} />,
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(container.querySelector('.onr-btn-label-sm')).toBeNull();
  });

  it('renders children instead of icon+label when children are provided', () => {
    render(
      <RibbonButton
        icon={<svg data-testid="should-not-render" />}
        label="Ignored"
        onClick={() => {}}
      >
        <span data-testid="custom-child">Custom</span>
      </RibbonButton>,
    );

    expect(screen.getByTestId('custom-child')).toBeInTheDocument();
    expect(screen.queryByTestId('should-not-render')).not.toBeInTheDocument();
    expect(screen.queryByText('Ignored')).not.toBeInTheDocument();
  });

  it('appends onr-active class when active is true', () => {
    const { container } = render(
      <RibbonButton active={true} onClick={() => {}} />,
    );

    expect(container.firstElementChild!.className).toBe(
      'onr-btn-sm onr-active',
    );
  });

  it('does not add onr-active class when active is false', () => {
    const { container } = render(
      <RibbonButton active={false} onClick={() => {}} />,
    );

    expect(container.firstElementChild!.className).toBe('onr-btn-sm');
  });

  it('merges additional className after base and active classes', () => {
    const { container } = render(
      <RibbonButton
        active={true}
        className="onr-format-btn onr-format-bold"
        onClick={() => {}}
      />,
    );

    expect(container.firstElementChild!.className).toBe(
      'onr-btn-sm onr-active onr-format-btn onr-format-bold',
    );
  });

  it('passes through HTML attributes (title, data-cmd)', () => {
    const { container } = render(
      <RibbonButton title="Bold" data-cmd="bold" onClick={() => {}} />,
    );

    const element = container.firstElementChild!;
    expect(element.getAttribute('title')).toBe('Bold');
    expect(element.getAttribute('data-cmd')).toBe('bold');
  });

  it('calls preventDefault and stopPropagation on mouseDown', () => {
    const { container } = render(<RibbonButton onClick={() => {}} />);

    const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true });
    const preventDefaultSpy = jest.spyOn(mouseDownEvent, 'preventDefault');
    const stopPropagationSpy = jest.spyOn(mouseDownEvent, 'stopPropagation');
    container.firstElementChild!.dispatchEvent(mouseDownEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  it('fires onClick when clicked', () => {
    const handleClick = jest.fn();
    const { container } = render(<RibbonButton onClick={handleClick} />);

    fireEvent.click(container.firstElementChild!);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('forwards ref to the outer div', () => {
    const ref = createRef<HTMLDivElement>();
    render(<RibbonButton ref={ref} onClick={() => {}} data-testid="btn" />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current!.getAttribute('data-testid')).toBe('btn');
  });
});
