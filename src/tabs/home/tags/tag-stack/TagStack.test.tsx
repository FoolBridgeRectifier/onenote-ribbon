import { fireEvent, screen, render } from '@testing-library/react';
import { TagStack } from './TagStack';
import { ACTIVE_TAG_KEY_TASK } from '../constants';

describe('TagStack', () => {
  const mockHandleTodo = jest.fn();
  const mockHandleImportant = jest.fn();
  const mockHandleQuestion = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all tag buttons', () => {
    render(
      <TagStack
        activeTagKeys={new Set()}
        handleTodo={mockHandleTodo}
        handleImportant={mockHandleImportant}
        handleQuestion={mockHandleQuestion}
      />
    );

    expect(screen.getByTitle('Toggle to-do')).toBeInTheDocument();
    expect(screen.getByTitle('Mark as important')).toBeInTheDocument();
    expect(screen.getByTitle('Mark as question')).toBeInTheDocument();
  });

  it('renders tag labels', () => {
    render(
      <TagStack
        activeTagKeys={new Set()}
        handleTodo={mockHandleTodo}
        handleImportant={mockHandleImportant}
        handleQuestion={mockHandleQuestion}
      />
    );

    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('Important')).toBeInTheDocument();
    expect(screen.getByText('Question')).toBeInTheDocument();
  });

  it('calls handleTodo when To Do button is clicked', () => {
    render(
      <TagStack
        activeTagKeys={new Set()}
        handleTodo={mockHandleTodo}
        handleImportant={mockHandleImportant}
        handleQuestion={mockHandleQuestion}
      />
    );

    const todoButton = screen.getByTitle('Toggle to-do');
    fireEvent.click(todoButton);

    expect(mockHandleTodo).toHaveBeenCalledTimes(1);
  });

  it('calls handleImportant when Important button is clicked', () => {
    render(
      <TagStack
        activeTagKeys={new Set()}
        handleTodo={mockHandleTodo}
        handleImportant={mockHandleImportant}
        handleQuestion={mockHandleQuestion}
      />
    );

    const importantButton = screen.getByTitle('Mark as important');
    fireEvent.click(importantButton);

    expect(mockHandleImportant).toHaveBeenCalledTimes(1);
  });

  it('calls handleQuestion when Question button is clicked', () => {
    render(
      <TagStack
        activeTagKeys={new Set()}
        handleTodo={mockHandleTodo}
        handleImportant={mockHandleImportant}
        handleQuestion={mockHandleQuestion}
      />
    );

    const questionButton = screen.getByTitle('Mark as question');
    fireEvent.click(questionButton);

    expect(mockHandleQuestion).toHaveBeenCalledTimes(1);
  });

  it('shows unchecked checkbox when task is not active', () => {
    const { container } = render(
      <TagStack
        activeTagKeys={new Set()}
        handleTodo={mockHandleTodo}
        handleImportant={mockHandleImportant}
        handleQuestion={mockHandleQuestion}
      />
    );

    const checkbox = container.querySelector('[data-cmd="todo"] .onr-tag-cb');
    expect(checkbox).not.toHaveClass('onr-tag-cb--checked');
  });

  it('shows checked checkbox when task is active', () => {
    const { container } = render(
      <TagStack
        activeTagKeys={new Set([ACTIVE_TAG_KEY_TASK])}
        handleTodo={mockHandleTodo}
        handleImportant={mockHandleImportant}
        handleQuestion={mockHandleQuestion}
      />
    );

    const checkbox = container.querySelector('[data-cmd="todo"] .onr-tag-cb');
    expect(checkbox).toHaveClass('onr-tag-cb--checked');
  });

  it('shows unchecked checkbox when Important is not active', () => {
    const { container } = render(
      <TagStack
        activeTagKeys={new Set()}
        handleTodo={mockHandleTodo}
        handleImportant={mockHandleImportant}
        handleQuestion={mockHandleQuestion}
      />
    );

    const checkbox = container.querySelector('[data-cmd="important"] .onr-tag-cb');
    expect(checkbox).not.toHaveClass('onr-tag-cb--checked');
  });

  it('shows checked checkbox when Important is active', () => {
    const { container } = render(
      <TagStack
        activeTagKeys={new Set(['Important'])}
        handleTodo={mockHandleTodo}
        handleImportant={mockHandleImportant}
        handleQuestion={mockHandleQuestion}
      />
    );

    const checkbox = container.querySelector('[data-cmd="important"] .onr-tag-cb');
    expect(checkbox).toHaveClass('onr-tag-cb--checked');
  });

  it('shows unchecked checkbox when Question is not active', () => {
    const { container } = render(
      <TagStack
        activeTagKeys={new Set()}
        handleTodo={mockHandleTodo}
        handleImportant={mockHandleImportant}
        handleQuestion={mockHandleQuestion}
      />
    );

    const checkbox = container.querySelector('[data-cmd="question"] .onr-tag-cb');
    expect(checkbox).not.toHaveClass('onr-tag-cb--checked');
  });

  it('shows checked checkbox when Question is active', () => {
    const { container } = render(
      <TagStack
        activeTagKeys={new Set(['Question'])}
        handleTodo={mockHandleTodo}
        handleImportant={mockHandleImportant}
        handleQuestion={mockHandleQuestion}
      />
    );

    const checkbox = container.querySelector('[data-cmd="question"] .onr-tag-cb');
    expect(checkbox).toHaveClass('onr-tag-cb--checked');
  });

  it('handles multiple active tags', () => {
    const { container } = render(
      <TagStack
        activeTagKeys={new Set([ACTIVE_TAG_KEY_TASK, 'Important', 'Question'])}
        handleTodo={mockHandleTodo}
        handleImportant={mockHandleImportant}
        handleQuestion={mockHandleQuestion}
      />
    );

    const todoCheckbox = container.querySelector('[data-cmd="todo"] .onr-tag-cb');
    const importantCheckbox = container.querySelector('[data-cmd="important"] .onr-tag-cb');
    const questionCheckbox = container.querySelector('[data-cmd="question"] .onr-tag-cb');

    expect(todoCheckbox).toHaveClass('onr-tag-cb--checked');
    expect(importantCheckbox).toHaveClass('onr-tag-cb--checked');
    expect(questionCheckbox).toHaveClass('onr-tag-cb--checked');
  });

  it('has correct data-cmd attributes', () => {
    const { container } = render(
      <TagStack
        activeTagKeys={new Set()}
        handleTodo={mockHandleTodo}
        handleImportant={mockHandleImportant}
        handleQuestion={mockHandleQuestion}
      />
    );

    expect(container.querySelector('[data-cmd="todo"]')).toBeInTheDocument();
    expect(container.querySelector('[data-cmd="important"]')).toBeInTheDocument();
    expect(container.querySelector('[data-cmd="question"]')).toBeInTheDocument();
  });

  it('has aria-hidden on checkboxes', () => {
    const { container } = render(
      <TagStack
        activeTagKeys={new Set()}
        handleTodo={mockHandleTodo}
        handleImportant={mockHandleImportant}
        handleQuestion={mockHandleQuestion}
      />
    );

    const checkboxes = container.querySelectorAll('.onr-tag-cb');
    checkboxes.forEach((checkbox: Element) => {
      expect(checkbox).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
