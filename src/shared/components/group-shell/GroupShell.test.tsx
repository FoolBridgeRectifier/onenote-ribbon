import { render, screen } from '@testing-library/react';
import { GroupShell } from './GroupShell';

describe('GroupShell', () => {
  it('renders children and group name label', () => {
    render(
      <GroupShell name="Clipboard">
        <div data-testid="child">Content</div>
      </GroupShell>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Clipboard')).toBeInTheDocument();
  });

  it('applies onr-group class by default', () => {
    const { container } = render(
      <GroupShell name="Tags">
        <span>Inner</span>
      </GroupShell>
    );

    const outerDiv = container.firstElementChild!;
    expect(outerDiv.className).toBe('onr-group');
  });

  it('merges additional className with onr-group', () => {
    const { container } = render(
      <GroupShell name="Styles" className="custom-extra">
        <span>Inner</span>
      </GroupShell>
    );

    const outerDiv = container.firstElementChild!;
    expect(outerDiv.className).toBe('onr-group custom-extra');
  });

  it('passes through HTML attributes to the outer div', () => {
    const { container } = render(
      <GroupShell name="Navigate" data-group="nav" aria-label="Navigation">
        <span>Inner</span>
      </GroupShell>
    );

    const outerDiv = container.firstElementChild!;
    expect(outerDiv.getAttribute('data-group')).toBe('nav');
    expect(outerDiv.getAttribute('aria-label')).toBe('Navigation');
  });

  it('renders the name inside onr-group-name as the last child', () => {
    const { container } = render(
      <GroupShell name="Basic Text">
        <div>First</div>
      </GroupShell>
    );

    const outerDiv = container.firstElementChild!;
    const lastChild = outerDiv.lastElementChild!;
    expect(lastChild.className).toBe('onr-group-name');
    expect(lastChild.textContent).toBe('Basic Text');
  });
});
