import { renderHook } from '@testing-library/react';
import { useFormatPainterActivation } from './helpers';
import { FORMAT_PAINTER_ACTIVATE_EVENT } from '../../../shared/commands/constants';

describe('useFormatPainterActivation', () => {
  it('calls handleSingleClick(1) when the activation event fires', () => {
    const handleSingleClick = jest.fn();
    renderHook(() => useFormatPainterActivation(handleSingleClick));

    document.dispatchEvent(new CustomEvent(FORMAT_PAINTER_ACTIVATE_EVENT));

    expect(handleSingleClick).toHaveBeenCalledWith(1);
    expect(handleSingleClick).toHaveBeenCalledTimes(1);
  });

  it('calls handleSingleClick again on each subsequent event dispatch', () => {
    const handleSingleClick = jest.fn();
    renderHook(() => useFormatPainterActivation(handleSingleClick));

    document.dispatchEvent(new CustomEvent(FORMAT_PAINTER_ACTIVATE_EVENT));
    document.dispatchEvent(new CustomEvent(FORMAT_PAINTER_ACTIVATE_EVENT));

    expect(handleSingleClick).toHaveBeenCalledTimes(2);
  });

  it('removes the event listener on unmount', () => {
    const handleSingleClick = jest.fn();
    const { unmount } = renderHook(() => useFormatPainterActivation(handleSingleClick));

    unmount();
    document.dispatchEvent(new CustomEvent(FORMAT_PAINTER_ACTIVATE_EVENT));

    expect(handleSingleClick).not.toHaveBeenCalled();
  });

  it('re-registers the listener when handleSingleClick reference changes', () => {
    const firstHandler = jest.fn();
    const secondHandler = jest.fn();

    const { rerender } = renderHook(
      ({ handler }: { handler: (clickCount: number) => void }) =>
        useFormatPainterActivation(handler),
      { initialProps: { handler: firstHandler } }
    );

    rerender({ handler: secondHandler });
    document.dispatchEvent(new CustomEvent(FORMAT_PAINTER_ACTIVATE_EVENT));

    expect(firstHandler).not.toHaveBeenCalled();
    expect(secondHandler).toHaveBeenCalledWith(1);
  });
});
