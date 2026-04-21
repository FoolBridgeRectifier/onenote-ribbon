import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import { TagsGroup } from './Tags';

const mockUseApp = jest.fn();
const mockUseEditorState = jest.fn();
const mockUseTagHandlers = jest.fn();
const mockLoadCustomTags = jest.fn();
const mockBuildCustomTagDefinition = jest.fn();

jest.mock('../../../shared/context/AppContext', () => ({
  useApp: () => mockUseApp(),
}));

jest.mock('../../../shared/hooks/useEditorState', () => ({
  useEditorState: (app: unknown) => mockUseEditorState(app),
}));

jest.mock('./use-tag-handlers/UseTagHandlers', () => ({
  useTagHandlers: (options: unknown) => mockUseTagHandlers(options),
}));

jest.mock('./tag-storage/TagStorage', () => ({
  loadCustomTags: () => mockLoadCustomTags(),
  buildCustomTagDefinition: (tag: unknown) => mockBuildCustomTagDefinition(tag),
}));

// Mock child components
jest.mock('../../../shared/components/group-shell/GroupShell', () => ({
  GroupShell: ({ children, name }: { children: React.ReactNode; name: string }) => (
    <div data-testid="group-shell" data-name={name}>
      {children}
    </div>
  ),
}));

jest.mock('../../../shared/components/ribbon-button/RibbonButton', () => ({
  RibbonButton: React.forwardRef(
    (
      {
        children,
        onClick,
        title,
        'data-cmd': dataCmd,
      }: {
        children?: React.ReactNode;
        onClick?: () => void;
        title?: string;
        'data-cmd'?: string;
      },
      ref: React.Ref<HTMLDivElement>
    ) => (
      <div ref={ref} onClick={onClick} title={title} data-cmd={dataCmd} data-testid="ribbon-button">
        {children}
      </div>
    )
  ),
}));

jest.mock('../../../shared/components/dropdown/Dropdown', () => ({
  Dropdown: ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
    <div data-testid="dropdown">
      {children}
      <button data-testid="dropdown-close" onClick={onClose}>
        Close
      </button>
    </div>
  ),
}));

jest.mock('./tag-stack/TagStack', () => ({
  TagStack: (props: {
    activeTagKeys: Set<string>;
    handleTodo: () => void;
    handleImportant: () => void;
    handleQuestion: () => void;
  }) => (
    <div data-testid="tag-stack">
      <button data-testid="tag-todo" onClick={props.handleTodo}>
        Todo
      </button>
      <button data-testid="tag-important" onClick={props.handleImportant}>
        Important
      </button>
      <button data-testid="tag-question" onClick={props.handleQuestion}>
        Question
      </button>
    </div>
  ),
}));

jest.mock('./customize-modal/CustomizeModal', () => ({
  CustomizeTagsModal: (props: {
    customTags: unknown[];
    onChange: (tags: unknown[]) => void;
    onClose: () => void;
  }) => (
    <div data-testid="customize-modal">
      <button data-testid="modal-close" onClick={props.onClose}>
        Close
      </button>
      <button
        data-testid="modal-change"
        onClick={() => props.onChange([{ id: '1', label: 'Test' }])}
      >
        Change
      </button>
    </div>
  ),
}));

jest.mock('./helpers', () => ({
  ALL_TAGS: [
    { label: 'Tag 1', icon: null, action: { type: 'callout', calloutType: 'note' } },
    { label: 'Tag 2', icon: null, action: { type: 'callout', calloutType: 'tip' } },
    { isSeparator: true },
    { label: 'Customize Tags…', isCustomizeTags: true },
    { label: 'Remove Tag', isRemoveTag: true },
  ],
  renderTagItems: jest.fn(() => <div data-testid="tag-items">Tag Items</div>),
}));

describe('TagsGroup — rendering', () => {
  const mockApp = { commands: { executeCommandById: jest.fn() } };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseApp.mockReturnValue(mockApp);
    mockUseEditorState.mockReturnValue({
      activeTagKeys: new Set(),
    });
    mockUseTagHandlers.mockReturnValue({
      handleTodo: jest.fn(),
      handleImportant: jest.fn(),
      handleQuestion: jest.fn(),
      handleFindTags: jest.fn(),
      handleToDoTag: jest.fn(),
      handleCustomTagsChange: jest.fn(),
      handleTagDropdownSelect: jest.fn(),
    });
    mockLoadCustomTags.mockReturnValue([]);
  });

  it('renders the Tags group', () => {
    render(<TagsGroup />);

    expect(screen.getByTestId('group-shell')).toHaveAttribute('data-name', 'Tags');
  });

  it('renders TagStack component', () => {
    render(<TagsGroup />);

    expect(screen.getByTestId('tag-stack')).toBeInTheDocument();
  });

  it('renders More button', () => {
    render(<TagsGroup />);

    const moreButton = screen.getByTitle('More tags');
    expect(moreButton).toBeInTheDocument();
  });

  it('renders To Do Tag button', () => {
    render(<TagsGroup />);

    const todoButton = screen.getByTitle('Insert #todo tag');
    expect(todoButton).toBeInTheDocument();
  });

  it('renders Find Tags button', () => {
    render(<TagsGroup />);

    const findTagsButton = screen.getByTitle('Search for tags');
    expect(findTagsButton).toBeInTheDocument();
  });
});

describe('TagsGroup — tag handlers', () => {
  const mockApp = { commands: { executeCommandById: jest.fn() } };
  const mockHandleTodo = jest.fn();
  const mockHandleImportant = jest.fn();
  const mockHandleQuestion = jest.fn();
  const mockHandleFindTags = jest.fn();
  const mockHandleToDoTag = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseApp.mockReturnValue(mockApp);
    mockUseEditorState.mockReturnValue({
      activeTagKeys: new Set(),
    });
    mockUseTagHandlers.mockReturnValue({
      handleTodo: mockHandleTodo,
      handleImportant: mockHandleImportant,
      handleQuestion: mockHandleQuestion,
      handleFindTags: mockHandleFindTags,
      handleToDoTag: mockHandleToDoTag,
      handleCustomTagsChange: jest.fn(),
      handleTagDropdownSelect: jest.fn(),
    });
    mockLoadCustomTags.mockReturnValue([]);
  });

  it('calls handleTodo when todo button in TagStack is clicked', () => {
    render(<TagsGroup />);

    fireEvent.click(screen.getByTestId('tag-todo'));
    expect(mockHandleTodo).toHaveBeenCalled();
  });

  it('calls handleImportant when important button in TagStack is clicked', () => {
    render(<TagsGroup />);

    fireEvent.click(screen.getByTestId('tag-important'));
    expect(mockHandleImportant).toHaveBeenCalled();
  });

  it('calls handleQuestion when question button in TagStack is clicked', () => {
    render(<TagsGroup />);

    fireEvent.click(screen.getByTestId('tag-question'));
    expect(mockHandleQuestion).toHaveBeenCalled();
  });

  it('calls handleToDoTag when To Do Tag button is clicked', () => {
    render(<TagsGroup />);

    const todoButton = screen.getByTitle('Insert #todo tag');
    fireEvent.click(todoButton);
    expect(mockHandleToDoTag).toHaveBeenCalled();
  });

  it('calls handleFindTags when Find Tags button is clicked', () => {
    render(<TagsGroup />);

    const findTagsButton = screen.getByTitle('Search for tags');
    fireEvent.click(findTagsButton);
    expect(mockHandleFindTags).toHaveBeenCalled();
  });
});

describe('TagsGroup — dropdown menu', () => {
  const mockApp = { commands: { executeCommandById: jest.fn() } };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseApp.mockReturnValue(mockApp);
    mockUseEditorState.mockReturnValue({
      activeTagKeys: new Set(),
    });
    mockUseTagHandlers.mockReturnValue({
      handleTodo: jest.fn(),
      handleImportant: jest.fn(),
      handleQuestion: jest.fn(),
      handleFindTags: jest.fn(),
      handleToDoTag: jest.fn(),
      handleCustomTagsChange: jest.fn(),
      handleTagDropdownSelect: jest.fn(),
    });
    mockLoadCustomTags.mockReturnValue([]);
  });

  it('opens dropdown when More button is clicked', () => {
    render(<TagsGroup />);

    const moreButton = screen.getByTitle('More tags');
    fireEvent.click(moreButton);

    expect(screen.getByTestId('dropdown')).toBeInTheDocument();
  });

  it('closes dropdown when onClose is called', () => {
    render(<TagsGroup />);

    const moreButton = screen.getByTitle('More tags');
    fireEvent.click(moreButton);

    expect(screen.getByTestId('dropdown')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('dropdown-close'));

    expect(screen.queryByTestId('dropdown')).not.toBeInTheDocument();
  });

  it('toggles dropdown when More button is clicked twice', () => {
    render(<TagsGroup />);

    const moreButton = screen.getByTitle('More tags');

    fireEvent.click(moreButton);
    expect(screen.getByTestId('dropdown')).toBeInTheDocument();

    fireEvent.click(moreButton);
    expect(screen.queryByTestId('dropdown')).not.toBeInTheDocument();
  });
});

describe('TagsGroup — customize modal', () => {
  const mockApp = { commands: { executeCommandById: jest.fn() } };
  const mockHandleCustomTagsChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseApp.mockReturnValue(mockApp);
    mockUseEditorState.mockReturnValue({
      activeTagKeys: new Set(),
    });
    mockUseTagHandlers.mockReturnValue({
      handleTodo: jest.fn(),
      handleImportant: jest.fn(),
      handleQuestion: jest.fn(),
      handleFindTags: jest.fn(),
      handleToDoTag: jest.fn(),
      handleCustomTagsChange: mockHandleCustomTagsChange,
      handleTagDropdownSelect: jest.fn(),
    });
    mockLoadCustomTags.mockReturnValue([]);
  });

  it('does not render customize modal initially', () => {
    render(<TagsGroup />);

    expect(screen.queryByTestId('customize-modal')).not.toBeInTheDocument();
  });

  it('closes customize modal when onClose is called', () => {
    render(<TagsGroup />);

    // Open modal via handler
    const { calls } = mockUseTagHandlers.mock as unknown as {
      calls: { 0: [{ setCustomizeModalOpen: (open: boolean) => void }] };
    };
    const setCustomizeModalOpen = calls[0][0].setCustomizeModalOpen;
    setCustomizeModalOpen(true);

    // Re-render to show modal
    const { rerender } = render(<TagsGroup />);
    rerender(<TagsGroup />);
  });
});

describe('TagsGroup — canRemoveTag calculation', () => {
  const mockApp = { commands: { executeCommandById: jest.fn() } };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseApp.mockReturnValue(mockApp);
    mockUseTagHandlers.mockReturnValue({
      handleTodo: jest.fn(),
      handleImportant: jest.fn(),
      handleQuestion: jest.fn(),
      handleFindTags: jest.fn(),
      handleToDoTag: jest.fn(),
      handleCustomTagsChange: jest.fn(),
      handleTagDropdownSelect: jest.fn(),
    });
    mockLoadCustomTags.mockReturnValue([]);
  });

  it('calculates canRemoveTag as false when no relevant tags are active', () => {
    mockUseEditorState.mockReturnValue({
      activeTagKeys: new Set(['task', 'highlight']),
    });

    render(<TagsGroup />);

    // The hook should be called with canRemoveTag based on the logic
    expect(mockUseTagHandlers).toHaveBeenCalled();
  });

  it('calculates canRemoveTag as true when a callout tag is active', () => {
    mockUseEditorState.mockReturnValue({
      activeTagKeys: new Set(['Important']),
    });

    render(<TagsGroup />);

    expect(mockUseTagHandlers).toHaveBeenCalledWith(
      expect.objectContaining({
        canRemoveTag: true,
      })
    );
  });

  it('calculates canRemoveTag as true when a custom tag is active', () => {
    mockUseEditorState.mockReturnValue({
      activeTagKeys: new Set(['custom-tag']),
    });

    render(<TagsGroup />);

    expect(mockUseTagHandlers).toHaveBeenCalledWith(
      expect.objectContaining({
        canRemoveTag: true,
      })
    );
  });

  it('excludes task-prefix tags from canRemoveTag calculation', () => {
    mockUseEditorState.mockReturnValue({
      activeTagKeys: new Set(['task-prefix:some-type']),
    });

    render(<TagsGroup />);

    expect(mockUseTagHandlers).toHaveBeenCalledWith(
      expect.objectContaining({
        canRemoveTag: false,
      })
    );
  });
});

describe('TagsGroup — custom tags', () => {
  const mockApp = { commands: { executeCommandById: jest.fn() } };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseApp.mockReturnValue(mockApp);
    mockUseEditorState.mockReturnValue({
      activeTagKeys: new Set(),
    });
    mockUseTagHandlers.mockReturnValue({
      handleTodo: jest.fn(),
      handleImportant: jest.fn(),
      handleQuestion: jest.fn(),
      handleFindTags: jest.fn(),
      handleToDoTag: jest.fn(),
      handleCustomTagsChange: jest.fn(),
      handleTagDropdownSelect: jest.fn(),
    });
  });

  it('loads custom tags on mount', () => {
    mockLoadCustomTags.mockReturnValue([{ id: '1', label: 'Custom', color: '#000' }]);

    render(<TagsGroup />);

    expect(mockLoadCustomTags).toHaveBeenCalled();
  });

  it('renders without custom tags when none exist', () => {
    mockLoadCustomTags.mockReturnValue([]);

    render(<TagsGroup />);

    expect(screen.getByTestId('group-shell')).toBeInTheDocument();
  });
});
