import { fireEvent } from '@testing-library/react';

import { useFormatPainter } from '../../../shared/hooks/useFormatPainter';
import { createAppWithEditor } from '../../../test-utils/mockApp';
import { renderWithApp } from '../../../test-utils/renderWithApp';
import { ClipboardGroup } from './ClipboardGroup';

jest.mock('../../../shared/hooks/useFormatPainter', () => ({
  useFormatPainter: jest.fn(),
}));

const mockedUseFormatPainter =
  useFormatPainter as jest.MockedFunction<typeof useFormatPainter>;

describe('ClipboardGroup format painter interactions (integration)', () => {
  const handleSingleClick = jest.fn();
  const handleDoubleClick = jest.fn();
  const cancel = jest.fn();

  beforeEach(() => {
    handleSingleClick.mockReset();
    handleDoubleClick.mockReset();
    cancel.mockReset();

    mockedUseFormatPainter.mockReturnValue({
      state: {
        mode: 'idle',
        copiedFormat: null,
      },
      handleSingleClick,
      handleDoubleClick,
      cancel,
    });
  });

  it('passes click detail to format painter single-click handler', () => {
    const { app } = createAppWithEditor('hello world');
    const { container } = renderWithApp(<ClipboardGroup />, app);

    const formatPainterButton = container.querySelector(
      '[data-cmd="format-painter"]',
    ) as HTMLDivElement;

    fireEvent.click(formatPainterButton, { detail: 1 });
    fireEvent.click(formatPainterButton, { detail: 2 });

    expect(handleSingleClick).toHaveBeenNthCalledWith(1, 1);
    expect(handleSingleClick).toHaveBeenNthCalledWith(2, 2);
  });

  it('forwards double click to format painter double-click handler', () => {
    const { app } = createAppWithEditor('hello world');
    const { container } = renderWithApp(<ClipboardGroup />, app);

    const formatPainterButton = container.querySelector(
      '[data-cmd="format-painter"]',
    ) as HTMLDivElement;

    fireEvent.doubleClick(formatPainterButton);

    expect(handleDoubleClick).toHaveBeenCalledTimes(1);
  });
});
