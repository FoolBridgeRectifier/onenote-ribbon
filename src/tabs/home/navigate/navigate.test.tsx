import { screen, fireEvent } from '@testing-library/react';
import { NavigateGroup } from './Navigate';
import { renderWithApp } from '../../../test-utils/renderWithApp';
import { createMockApp } from '../../../test-utils/mockApp';

// ── NavigateGroup ─────────────────────────────────────────────────────────────

describe('NavigateGroup', () => {
  it('renders the three navigation buttons', () => {
    const mockApp = createMockApp();

    renderWithApp(<NavigateGroup />, mockApp);

    expect(screen.getByTitle('Open outline panel')).toBeInTheDocument();
    expect(screen.getByTitle('Collapse all headings')).toBeInTheDocument();
    expect(screen.getByTitle('Expand all headings')).toBeInTheDocument();
  });

  it('calls executeCommandById("outline:open") when Outline is clicked', () => {
    const mockApp = createMockApp();
    const executeCommandById = jest.spyOn(mockApp.commands, 'executeCommandById');

    renderWithApp(<NavigateGroup />, mockApp);

    fireEvent.click(screen.getByTitle('Open outline panel'));

    expect(executeCommandById).toHaveBeenCalledWith('outline:open');
  });

  it('calls executeCommandById("editor:fold-all") when Fold All is clicked', () => {
    const mockApp = createMockApp();
    const executeCommandById = jest.spyOn(mockApp.commands, 'executeCommandById');

    renderWithApp(<NavigateGroup />, mockApp);

    fireEvent.click(screen.getByTitle('Collapse all headings'));

    expect(executeCommandById).toHaveBeenCalledWith('editor:fold-all');
  });

  it('calls executeCommandById("editor:unfold-all") when Unfold All is clicked', () => {
    const mockApp = createMockApp();
    const executeCommandById = jest.spyOn(mockApp.commands, 'executeCommandById');

    renderWithApp(<NavigateGroup />, mockApp);

    fireEvent.click(screen.getByTitle('Expand all headings'));

    expect(executeCommandById).toHaveBeenCalledWith('editor:unfold-all');
  });
});
