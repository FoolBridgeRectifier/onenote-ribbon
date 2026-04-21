import { render, screen, fireEvent } from '@testing-library/react';

import { TagDropdownItem } from './TagDropdownItem';
import type { TagDropdownItemProps } from './interfaces';

describe('TagDropdownItem — rendering', () => {
  const createMockProps = (
    overrides: Partial<TagDropdownItemProps> = {}
  ): TagDropdownItemProps => ({
    tagDefinition: {
      label: 'Test Tag',
      swatchColor: '#ff0000',
      icon: <span data-testid="tag-icon">Icon</span>,
      action: { type: 'callout', calloutType: 'note' },
    },
    isDisabled: false,
    isChecked: false,
    onSelect: jest.fn(),
    ...overrides,
  });

  it('renders the tag label', () => {
    const props = createMockProps();
    render(<TagDropdownItem {...props} />);

    expect(screen.getByText('Test Tag')).toBeInTheDocument();
  });

  it('renders the tag icon', () => {
    const props = createMockProps();
    render(<TagDropdownItem {...props} />);

    expect(screen.getByTestId('tag-icon')).toBeInTheDocument();
  });

  it('generates data-cmd attribute from label', () => {
    const props = createMockProps();
    const { container } = render(<TagDropdownItem {...props} />);

    const item = container.querySelector('[data-cmd="tag-test-tag"]');
    expect(item).toBeInTheDocument();
  });

  it('handles labels with special characters in data-cmd', () => {
    const props = createMockProps({
      tagDefinition: {
        label: 'Test Tag 123!',
        swatchColor: '#ff0000',
        icon: null,
        action: { type: 'callout', calloutType: 'note' },
      },
    });
    const { container } = render(<TagDropdownItem {...props} />);

    // The data-cmd should be generated from the label (lowercase, hyphenated)
    const item = container.querySelector('[data-cmd]');
    expect(item).toBeInTheDocument();
    expect(item?.getAttribute('data-cmd')).toMatch(/^tag-/);
  });

  it('sets title attribute from label', () => {
    const props = createMockProps();
    render(<TagDropdownItem {...props} />);

    expect(screen.getByTitle('Test Tag')).toBeInTheDocument();
  });
});

describe('TagDropdownItem — disabled state', () => {
  const createMockProps = (
    overrides: Partial<TagDropdownItemProps> = {}
  ): TagDropdownItemProps => ({
    tagDefinition: {
      label: 'Test Tag',
      swatchColor: '#ff0000',
      icon: null,
      action: { type: 'callout', calloutType: 'note' },
    },
    isDisabled: false,
    isChecked: false,
    onSelect: jest.fn(),
    ...overrides,
  });

  it('applies disabled class when isDisabled is true', () => {
    const props = createMockProps({ isDisabled: true });
    const { container } = render(<TagDropdownItem {...props} />);

    const item = container.querySelector('.onr-tags-dd-item--disabled');
    expect(item).toBeInTheDocument();
  });

  it('does not apply disabled class when isDisabled is false', () => {
    const props = createMockProps({ isDisabled: false });
    const { container } = render(<TagDropdownItem {...props} />);

    const item = container.querySelector('.onr-tags-dd-item--disabled');
    expect(item).not.toBeInTheDocument();
  });

  it('applies base class when not disabled', () => {
    const props = createMockProps({ isDisabled: false });
    const { container } = render(<TagDropdownItem {...props} />);

    const item = container.querySelector('.onr-tags-dd-item');
    expect(item).toBeInTheDocument();
  });
});

describe('TagDropdownItem — checked state', () => {
  const createMockProps = (
    overrides: Partial<TagDropdownItemProps> = {}
  ): TagDropdownItemProps => ({
    tagDefinition: {
      label: 'Test Tag',
      swatchColor: '#ff0000',
      icon: null,
      action: { type: 'callout', calloutType: 'note' },
    },
    isDisabled: false,
    isChecked: false,
    onSelect: jest.fn(),
    ...overrides,
  });

  it('shows checked checkbox when isChecked is true', () => {
    const props = createMockProps({ isChecked: true });
    const { container } = render(<TagDropdownItem {...props} />);

    const checkbox = container.querySelector('.onr-tags-dd-cb--checked');
    expect(checkbox).toBeInTheDocument();
  });

  it('shows unchecked checkbox when isChecked is false', () => {
    const props = createMockProps({ isChecked: false });
    const { container } = render(<TagDropdownItem {...props} />);

    const checkbox = container.querySelector('.onr-tags-dd-cb');
    const checkedCheckbox = container.querySelector('.onr-tags-dd-cb--checked');
    expect(checkbox).toBeInTheDocument();
    expect(checkedCheckbox).not.toBeInTheDocument();
  });

  it('sets aria-hidden on checkbox', () => {
    const props = createMockProps({ isChecked: true });
    const { container } = render(<TagDropdownItem {...props} />);

    const checkbox = container.querySelector('.onr-tags-dd-cb');
    expect(checkbox).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('TagDropdownItem — onSelect callback', () => {
  const createMockProps = (
    overrides: Partial<TagDropdownItemProps> = {}
  ): TagDropdownItemProps => ({
    tagDefinition: {
      label: 'Test Tag',
      swatchColor: '#ff0000',
      icon: null,
      action: { type: 'callout', calloutType: 'note' },
    },
    isDisabled: false,
    isChecked: false,
    onSelect: jest.fn(),
    ...overrides,
  });

  it('calls onSelect when clicked', () => {
    const onSelect = jest.fn();
    const props = createMockProps({ onSelect });
    render(<TagDropdownItem {...props} />);

    const item = screen.getByText('Test Tag').parentElement;
    if (item) {
      fireEvent.click(item);
    }

    expect(onSelect).toHaveBeenCalledWith(props.tagDefinition);
  });

  it('calls onSelect with tag definition', () => {
    const onSelect = jest.fn();
    const tagDefinition = {
      label: 'Custom Tag',
      swatchColor: '#00ff00',
      icon: <span>Custom</span>,
      action: { type: 'callout' as const, calloutType: 'tip' as const },
    };
    const props = createMockProps({ onSelect, tagDefinition });
    render(<TagDropdownItem {...props} />);

    const item = screen.getByText('Custom Tag').parentElement;
    if (item) {
      fireEvent.click(item);
    }

    expect(onSelect).toHaveBeenCalledWith(tagDefinition);
  });
});

describe('TagDropdownItem — customize tags item', () => {
  const createMockProps = (
    overrides: Partial<TagDropdownItemProps> = {}
  ): TagDropdownItemProps => ({
    tagDefinition: {
      label: 'Customize Tags…',
      swatchColor: '#000000',
      icon: null,
      action: { type: 'callout', calloutType: 'note' },
      isCustomizeTags: true,
    },
    isDisabled: false,
    isChecked: false,
    onSelect: jest.fn(),
    ...overrides,
  });

  it('does not show checkbox for customize tags item', () => {
    const props = createMockProps();
    const { container } = render(<TagDropdownItem {...props} />);

    const checkbox = container.querySelector('.onr-tags-dd-cb');
    expect(checkbox).not.toBeInTheDocument();
  });

  it('renders customize tags label', () => {
    const props = createMockProps();
    render(<TagDropdownItem {...props} />);

    expect(screen.getByText('Customize Tags…')).toBeInTheDocument();
  });
});

describe('TagDropdownItem — remove tag item', () => {
  const createMockProps = (
    overrides: Partial<TagDropdownItemProps> = {}
  ): TagDropdownItemProps => ({
    tagDefinition: {
      label: 'Remove Tag',
      swatchColor: '#000000',
      icon: null,
      action: { type: 'callout', calloutType: 'note' },
      isRemoveTag: true,
    },
    isDisabled: false,
    isChecked: false,
    onSelect: jest.fn(),
    ...overrides,
  });

  it('does not show checkbox for remove tag item', () => {
    const props = createMockProps();
    const { container } = render(<TagDropdownItem {...props} />);

    const checkbox = container.querySelector('.onr-tags-dd-cb');
    expect(checkbox).not.toBeInTheDocument();
  });

  it('renders remove tag label', () => {
    const props = createMockProps();
    render(<TagDropdownItem {...props} />);

    expect(screen.getByText('Remove Tag')).toBeInTheDocument();
  });
});

describe('TagDropdownItem — regular tag item', () => {
  const createMockProps = (
    overrides: Partial<TagDropdownItemProps> = {}
  ): TagDropdownItemProps => ({
    tagDefinition: {
      label: 'Regular Tag',
      swatchColor: '#0000ff',
      icon: <span data-testid="icon">★</span>,
      action: { type: 'callout', calloutType: 'note' },
    },
    isDisabled: false,
    isChecked: false,
    onSelect: jest.fn(),
    ...overrides,
  });

  it('shows checkbox for regular tag items', () => {
    const props = createMockProps();
    const { container } = render(<TagDropdownItem {...props} />);

    const checkbox = container.querySelector('.onr-tags-dd-cb');
    expect(checkbox).toBeInTheDocument();
  });

  it('renders icon for regular tag items', () => {
    const props = createMockProps();
    render(<TagDropdownItem {...props} />);

    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});

describe('TagDropdownItem — data-cmd generation edge cases', () => {
  const createMockProps = (
    overrides: Partial<TagDropdownItemProps> = {}
  ): TagDropdownItemProps => ({
    tagDefinition: {
      label: 'Test',
      swatchColor: '#000',
      icon: null,
      action: { type: 'callout', calloutType: 'note' },
    },
    isDisabled: false,
    isChecked: false,
    onSelect: jest.fn(),
    ...overrides,
  });

  it('handles single word labels', () => {
    const props = createMockProps({
      tagDefinition: {
        label: 'Important',
        swatchColor: '#000',
        icon: null,
        action: { type: 'callout', calloutType: 'note' },
      },
    });
    const { container } = render(<TagDropdownItem {...props} />);

    const item = container.querySelector('[data-cmd="tag-important"]');
    expect(item).toBeInTheDocument();
  });

  it('handles labels with multiple spaces', () => {
    const props = createMockProps({
      tagDefinition: {
        label: 'Tag   With   Spaces',
        swatchColor: '#000',
        icon: null,
        action: { type: 'callout', calloutType: 'note' },
      },
    });
    const { container } = render(<TagDropdownItem {...props} />);

    const item = container.querySelector('[data-cmd="tag-tag-with-spaces"]');
    expect(item).toBeInTheDocument();
  });

  it('handles labels with mixed case', () => {
    const props = createMockProps({
      tagDefinition: {
        label: 'MiXeD CaSe TaG',
        swatchColor: '#000',
        icon: null,
        action: { type: 'callout', calloutType: 'note' },
      },
    });
    const { container } = render(<TagDropdownItem {...props} />);

    const item = container.querySelector('[data-cmd="tag-mixed-case-tag"]');
    expect(item).toBeInTheDocument();
  });

  it('handles labels with numbers', () => {
    const props = createMockProps({
      tagDefinition: {
        label: 'Tag 123 Test',
        swatchColor: '#000',
        icon: null,
        action: { type: 'callout', calloutType: 'note' },
      },
    });
    const { container } = render(<TagDropdownItem {...props} />);

    const item = container.querySelector('[data-cmd="tag-tag-123-test"]');
    expect(item).toBeInTheDocument();
  });
});
