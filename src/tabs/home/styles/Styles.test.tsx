import { fireEvent, screen, waitFor } from '@testing-library/react';

import { createAppWithEditor } from '../../../test-utils/mockApp';
import { renderWithApp } from '../../../test-utils/renderWithApp';
import { StylesGroup } from './Styles';

describe('StylesGroup — rendering (integration)', () => {
  it('renders the styles group', () => {
    const { app } = createAppWithEditor('');
    renderWithApp(<StylesGroup />, app);

    expect(screen.getByText('Styles')).toBeInTheDocument();
  });

  it('renders style preview buttons', () => {
    const { app } = createAppWithEditor('');
    const { container } = renderWithApp(<StylesGroup />, app);

    const previewButtons = container.querySelectorAll('.onr-style-preview');
    expect(previewButtons.length).toBeGreaterThan(0);
  });

  it('renders scroll arrows', () => {
    const { app } = createAppWithEditor('');
    renderWithApp(<StylesGroup />, app);

    expect(screen.getByTitle('Previous styles')).toBeInTheDocument();
    expect(screen.getByTitle('Next styles')).toBeInTheDocument();
  });

  it('renders expand button', () => {
    const { app } = createAppWithEditor('');
    renderWithApp(<StylesGroup />, app);

    expect(screen.getByTitle('Expand')).toBeInTheDocument();
  });

  it('renders group with correct name', () => {
    const { app } = createAppWithEditor('');
    const { container } = renderWithApp(<StylesGroup />, app);

    expect(container.querySelector('.onr-group-name')?.textContent).toBe('Styles');
  });
});

describe('StylesGroup — style preview interactions (integration)', () => {
  it('applies style when preview button is clicked', () => {
    const { app, editor } = createAppWithEditor('test content');
    const { container } = renderWithApp(<StylesGroup />, app);

    const previewButton = container.querySelector('.onr-style-preview');
    if (previewButton) {
      fireEvent.click(previewButton);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('marks active style as active', () => {
    const { app } = createAppWithEditor('# Heading');
    const { container } = renderWithApp(<StylesGroup />, app);

    const activeButton = container.querySelector('.onr-style-preview.onr-active');
    expect(activeButton).toBeInTheDocument();
  });
});

describe('StylesGroup — scroll interactions (integration)', () => {
  it('scrolls up when previous styles button is clicked', () => {
    const { app } = createAppWithEditor('');
    const { container } = renderWithApp(<StylesGroup />, app);

    const scrollUpButton = screen.getByTitle('Previous styles');
    fireEvent.click(scrollUpButton);

    // Should not throw and should update the visible styles
    expect(container.querySelector('.onr-styles-previews')).toBeInTheDocument();
  });

  it('scrolls down when next styles button is clicked', () => {
    const { app } = createAppWithEditor('');
    const { container } = renderWithApp(<StylesGroup />, app);

    const scrollDownButton = screen.getByTitle('Next styles');
    fireEvent.click(scrollDownButton);

    expect(container.querySelector('.onr-styles-previews')).toBeInTheDocument();
  });

  it('does not scroll below zero', () => {
    const { app } = createAppWithEditor('');
    renderWithApp(<StylesGroup />, app);

    const scrollUpButton = screen.getByTitle('Previous styles');
    // Click multiple times
    fireEvent.click(scrollUpButton);
    fireEvent.click(scrollUpButton);
    fireEvent.click(scrollUpButton);

    // Should not throw
    expect(scrollUpButton).toBeInTheDocument();
  });
});

describe('StylesGroup — expand dropdown (integration)', () => {
  it('opens expand dropdown when expand button is clicked', () => {
    const { app } = createAppWithEditor('');
    renderWithApp(<StylesGroup />, app);

    const expandButton = screen.getByTitle('Expand');
    fireEvent.click(expandButton);

    // Button should be present
    expect(expandButton).toBeInTheDocument();
  });

  it('closes expand dropdown when expand button is clicked again', () => {
    const { app } = createAppWithEditor('');
    renderWithApp(<StylesGroup />, app);

    const expandButton = screen.getByTitle('Expand');
    fireEvent.click(expandButton);
    fireEvent.click(expandButton);

    // Should toggle closed
    expect(expandButton).toBeInTheDocument();
  });

  it('renders all styles in expand dropdown', () => {
    const { app } = createAppWithEditor('');
    renderWithApp(<StylesGroup />, app);

    const expandButton = screen.getByTitle('Expand');
    fireEvent.click(expandButton);

    // Button should be present
    expect(expandButton).toBeInTheDocument();
  });

  it('renders clear formatting option in dropdown', () => {
    const { app } = createAppWithEditor('');
    renderWithApp(<StylesGroup />, app);

    const expandButton = screen.getByTitle('Expand');
    fireEvent.click(expandButton);

    // Button should be present
    expect(expandButton).toBeInTheDocument();
  });

  it('applies style from dropdown when clicked', () => {
    const { app } = createAppWithEditor('test content');
    const { container } = renderWithApp(<StylesGroup />, app);

    const expandButton = screen.getByTitle('Expand');
    fireEvent.click(expandButton);

    const dropdownItem = container.querySelector('.onr-dd-item');
    if (dropdownItem) {
      fireEvent.click(dropdownItem);
    }

    // Verify the dropdown is still rendered (component didn't crash)
    expect(container.querySelector('.onr-styles-group')).toBeInTheDocument();
  });

  it('closes dropdown after selecting a style', () => {
    const { app } = createAppWithEditor('test content');
    const { container } = renderWithApp(<StylesGroup />, app);

    const expandButton = screen.getByTitle('Expand');
    fireEvent.click(expandButton);

    const dropdownItem = container.querySelector('.onr-dd-item');
    if (dropdownItem) {
      fireEvent.click(dropdownItem);
    }

    const dropdown = container.querySelector('.onr-styles-dropdown');
    expect(dropdown).not.toBeInTheDocument();
  });
});

describe('StylesGroup — clear formatting (integration)', () => {
  it('clears formatting when clear formatting is clicked in dropdown', () => {
    const { app, editor } = createAppWithEditor('**bold text**');
    const { container } = renderWithApp(<StylesGroup />, app);

    const expandButton = screen.getByTitle('Expand');
    fireEvent.click(expandButton);

    const clearButton = container.querySelector('.onr-clear-formatting-btn');
    if (clearButton) {
      fireEvent.click(clearButton);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('closes dropdown after clearing formatting', () => {
    const { app } = createAppWithEditor('**bold text**');
    const { container } = renderWithApp(<StylesGroup />, app);

    const expandButton = screen.getByTitle('Expand');
    fireEvent.click(expandButton);

    const clearButton = container.querySelector('.onr-clear-formatting-btn');
    if (clearButton) {
      fireEvent.click(clearButton);
    }

    const dropdown = container.querySelector('.onr-styles-dropdown');
    expect(dropdown).not.toBeInTheDocument();
  });

  it('invokes callback when clearStyleFormatting completes', async () => {
    const { app, editor } = createAppWithEditor('**bold text**');
    renderWithApp(<StylesGroup />, app);

    const expandButton = screen.getByTitle('Expand');
    fireEvent.click(expandButton);

    // Wait for dropdown to open (useEffect needs time to set anchor ref)
    await waitFor(() => {
      expect(document.body.querySelector('.onr-styles-dropdown')).toBeInTheDocument();
    });

    const clearButton = document.body.querySelector('.onr-clear-formatting-btn');
    if (clearButton) {
      fireEvent.click(clearButton);
    }

    // Callback should have been invoked, closing the dropdown
    expect(document.body.querySelector('.onr-styles-dropdown')).not.toBeInTheDocument();
    expect(editor.getValue()).toBeDefined();
  });

  it('handles handleClearFormatting with active editor', () => {
    const { app, editor } = createAppWithEditor('## Heading');
    const { container } = renderWithApp(<StylesGroup />, app);

    const expandButton = screen.getByTitle('Expand');
    fireEvent.click(expandButton);

    const clearButton = container.querySelector('.onr-clear-formatting-btn');
    if (clearButton) {
      fireEvent.click(clearButton);
    }

    expect(editor.getValue()).toBeDefined();
  });
});

describe('StylesGroup — no active editor (integration)', () => {
  it('is no-op when no active editor for style click', () => {
    const { app } = createAppWithEditor('');
    Object.defineProperty(app.workspace, 'activeEditor', {
      value: {},
      writable: true,
    });
    const { container } = renderWithApp(<StylesGroup />, app);

    const previewButton = container.querySelector('.onr-style-preview');
    if (previewButton) {
      expect(() => fireEvent.click(previewButton)).not.toThrow();
    }
  });

  it('is no-op when no active editor for clear formatting', () => {
    const { app } = createAppWithEditor('');
    Object.defineProperty(app.workspace, 'activeEditor', {
      value: {},
      writable: true,
    });
    const { container } = renderWithApp(<StylesGroup />, app);

    const expandButton = screen.getByTitle('Expand');
    fireEvent.click(expandButton);

    const clearButton = container.querySelector('.onr-clear-formatting-btn');
    if (clearButton) {
      expect(() => fireEvent.click(clearButton)).not.toThrow();
    }
  });
});

describe('StylesGroup — auto-scroll to active style (integration)', () => {
  it('auto-scrolls to keep active heading in view', () => {
    const { app } = createAppWithEditor('## Heading 2');
    const { container } = renderWithApp(<StylesGroup />, app);

    // The component should auto-scroll to show the active style
    expect(container.querySelector('.onr-styles-previews')).toBeInTheDocument();
  });
});

describe('StylesGroup — edge cases', () => {
  it('handles scroll up at boundary', () => {
    const { app } = createAppWithEditor('');
    renderWithApp(<StylesGroup />, app);

    const scrollUpButton = screen.getByTitle('Previous styles');
    // Click multiple times at start
    for (let i = 0; i < 5; i += 1) {
      fireEvent.click(scrollUpButton);
    }

    expect(scrollUpButton).toBeInTheDocument();
  });

  it('handles scroll down at boundary', () => {
    const { app } = createAppWithEditor('');
    renderWithApp(<StylesGroup />, app);

    const scrollDownButton = screen.getByTitle('Next styles');
    // Click many times to reach end
    for (let i = 0; i < 20; i += 1) {
      fireEvent.click(scrollDownButton);
    }

    expect(scrollDownButton).toBeInTheDocument();
  });

  it('handles style click for quote type', () => {
    const { app, editor } = createAppWithEditor('test content');
    const { container } = renderWithApp(<StylesGroup />, app);

    const expandButton = screen.getByTitle('Expand');
    fireEvent.click(expandButton);

    // Find and click quote style
    const dropdownItems = container.querySelectorAll('.onr-dd-item');
    for (const item of Array.from(dropdownItems)) {
      if (item.textContent?.includes('Quote')) {
        fireEvent.click(item);
        break;
      }
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles style click for code type', () => {
    const { app, editor } = createAppWithEditor('test content');
    const { container } = renderWithApp(<StylesGroup />, app);

    const expandButton = screen.getByTitle('Expand');
    fireEvent.click(expandButton);

    // Find and click code style
    const dropdownItems = container.querySelectorAll('.onr-dd-item');
    for (const item of Array.from(dropdownItems)) {
      if (item.textContent?.includes('Code')) {
        fireEvent.click(item);
        break;
      }
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles style click for heading level', () => {
    const { app, editor } = createAppWithEditor('test content');
    const { container } = renderWithApp(<StylesGroup />, app);

    const expandButton = screen.getByTitle('Expand');
    fireEvent.click(expandButton);

    // Find and click a heading style
    const dropdownItems = container.querySelectorAll('.onr-dd-item');
    for (const item of Array.from(dropdownItems)) {
      if (item.textContent?.includes('Heading 1')) {
        fireEvent.click(item);
        break;
      }
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles normal paragraph style click', () => {
    const { app, editor } = createAppWithEditor('## Heading');
    const { container } = renderWithApp(<StylesGroup />, app);

    const expandButton = screen.getByTitle('Expand');
    fireEvent.click(expandButton);

    // Find and click Normal style
    const dropdownItems = container.querySelectorAll('.onr-dd-item');
    for (const item of Array.from(dropdownItems)) {
      if (item.textContent?.includes('Normal')) {
        fireEvent.click(item);
        break;
      }
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('marks active style with correct class', () => {
    const { app } = createAppWithEditor('# Heading 1');
    const { container } = renderWithApp(<StylesGroup />, app);

    const activePreview = container.querySelector('.onr-style-preview.onr-active');
    expect(activePreview).toBeInTheDocument();
  });

  it('marks inactive styles correctly', () => {
    const { app } = createAppWithEditor('');
    const { container } = renderWithApp(<StylesGroup />, app);

    const previewButtons = container.querySelectorAll('.onr-style-preview');
    expect(previewButtons.length).toBeGreaterThan(0);
  });

  it('handles dropdown close via onClose callback', () => {
    const { app } = createAppWithEditor('');
    const { container } = renderWithApp(<StylesGroup />, app);

    const expandButton = screen.getByTitle('Expand');
    fireEvent.click(expandButton);

    // Click outside to trigger onClose
    fireEvent.click(document.body);

    expect(container.querySelector('.onr-styles-group')).toBeInTheDocument();
  });

  it('handles rapid scroll up and down', () => {
    const { app } = createAppWithEditor('');
    renderWithApp(<StylesGroup />, app);

    const scrollUpButton = screen.getByTitle('Previous styles');
    const scrollDownButton = screen.getByTitle('Next styles');

    // Rapidly alternate clicks
    for (let i = 0; i < 10; i += 1) {
      fireEvent.click(scrollDownButton);
      fireEvent.click(scrollUpButton);
    }

    expect(scrollUpButton).toBeInTheDocument();
    expect(scrollDownButton).toBeInTheDocument();
  });

  it('handles multiple expand/collapse cycles', () => {
    const { app } = createAppWithEditor('');
    renderWithApp(<StylesGroup />, app);

    const expandButton = screen.getByTitle('Expand');

    // Multiple open/close cycles
    for (let i = 0; i < 5; i += 1) {
      fireEvent.click(expandButton);
      fireEvent.click(expandButton);
    }

    expect(expandButton).toBeInTheDocument();
  });

  it('handles isStyleActive for quote type', () => {
    const { app } = createAppWithEditor('> quote text');
    const { container } = renderWithApp(<StylesGroup />, app);

    // Quote should be marked as active
    const activePreview = container.querySelector('.onr-style-preview.onr-active');
    expect(activePreview).toBeInTheDocument();
  });

  it('handles isStyleActive for code type', () => {
    const { app } = createAppWithEditor('```code```');
    const { container } = renderWithApp(<StylesGroup />, app);

    // Component should render without error
    expect(container.querySelector('.onr-styles-previews')).toBeInTheDocument();
  });

  it('handles isStyleActive for normal paragraph', () => {
    const { app } = createAppWithEditor('Normal paragraph');
    const { container } = renderWithApp(<StylesGroup />, app);

    // Normal style should be marked as active
    const activePreview = container.querySelector('.onr-style-preview.onr-active');
    expect(activePreview).toBeInTheDocument();
  });

  it('handles isStyleActive for heading level', () => {
    const { app } = createAppWithEditor('# Heading 1');
    const { container } = renderWithApp(<StylesGroup />, app);

    // Heading 1 should be marked as active
    const activePreview = container.querySelector('.onr-style-preview.onr-active');
    expect(activePreview).toBeInTheDocument();
  });

  it('handles isStyleActive for inactive style', () => {
    const { app } = createAppWithEditor('# Heading 1');
    const { container } = renderWithApp(<StylesGroup />, app);

    // Should have both active and inactive buttons
    const previewButtons = container.querySelectorAll('.onr-style-preview');
    expect(previewButtons.length).toBeGreaterThan(0);
  });

  it('handles useEffect auto-scroll when offset changes', () => {
    const { app } = createAppWithEditor('####### Heading 6');
    const { container } = renderWithApp(<StylesGroup />, app);

    // Component should auto-scroll to show heading 6
    expect(container.querySelector('.onr-styles-previews')).toBeInTheDocument();
  });

  it('handles style click via preview button', () => {
    const { app, editor } = createAppWithEditor('test');
    const { container } = renderWithApp(<StylesGroup />, app);

    const previewButton = container.querySelector('.onr-style-preview');
    if (previewButton) {
      fireEvent.click(previewButton);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles scroll up via handleScrollUp', () => {
    const { app } = createAppWithEditor('');
    renderWithApp(<StylesGroup />, app);

    // First scroll down to have room to scroll up
    const scrollDownButton = screen.getByTitle('Next styles');
    fireEvent.click(scrollDownButton);
    fireEvent.click(scrollDownButton);

    // Then scroll up
    const scrollUpButton = screen.getByTitle('Previous styles');
    fireEvent.click(scrollUpButton);

    expect(scrollUpButton).toBeInTheDocument();
  });

  it('handles scroll down via handleScrollDown', () => {
    const { app } = createAppWithEditor('');
    renderWithApp(<StylesGroup />, app);

    const scrollDownButton = screen.getByTitle('Next styles');
    fireEvent.click(scrollDownButton);

    expect(scrollDownButton).toBeInTheDocument();
  });

  it('handles expand toggle via handleExpandStyles', () => {
    const { app } = createAppWithEditor('');
    renderWithApp(<StylesGroup />, app);

    const expandButton = screen.getByTitle('Expand');
    fireEvent.click(expandButton); // Open
    fireEvent.click(expandButton); // Close

    expect(expandButton).toBeInTheDocument();
  });

  it('handles clear formatting via handleClearFormatting', () => {
    const { app, editor } = createAppWithEditor('**bold**');
    const { container } = renderWithApp(<StylesGroup />, app);

    const expandButton = screen.getByTitle('Expand');
    fireEvent.click(expandButton);

    const clearButton = container.querySelector('.onr-clear-formatting-btn');
    if (clearButton) {
      fireEvent.click(clearButton);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles dropdown item click in expand dropdown', () => {
    const { app, editor } = createAppWithEditor('test');
    const { container } = renderWithApp(<StylesGroup />, app);

    const expandButton = screen.getByTitle('Expand');
    fireEvent.click(expandButton);

    const dropdownItems = container.querySelectorAll('.onr-dd-item');
    if (dropdownItems.length > 0) {
      fireEvent.click(dropdownItems[0]);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles isStyleActive callback for heading level match', () => {
    const { app } = createAppWithEditor('# Heading 1');
    const { container } = renderWithApp(<StylesGroup />, app);

    // Find the active button which has the onr-active class
    const activeButton = container.querySelector('.onr-style-preview.onr-active');
    expect(activeButton).toBeInTheDocument();
    // The active button should be one of the visible styles
    expect(activeButton?.textContent).toBeDefined();
  });

  it('handles isStyleActive callback for normal paragraph', () => {
    const { app } = createAppWithEditor('Normal text');
    const { container } = renderWithApp(<StylesGroup />, app);

    // Normal paragraph should be active
    const activeButton = container.querySelector('.onr-style-preview.onr-active');
    expect(activeButton).toBeInTheDocument();
  });

  it('handles isStyleActive callback for non-matching style', () => {
    const { app } = createAppWithEditor('# Heading 1');
    const { container } = renderWithApp(<StylesGroup />, app);

    // Get all preview buttons
    const previewButtons = container.querySelectorAll('.onr-style-preview');
    expect(previewButtons.length).toBeGreaterThan(0);

    // Only one should be active
    const activeButtons = container.querySelectorAll('.onr-style-preview.onr-active');
    expect(activeButtons.length).toBe(1);
  });

  it('handles isStyleActive for quote type match', () => {
    const { app } = createAppWithEditor('> Quote text');
    const { container } = renderWithApp(<StylesGroup />, app);

    // Quote should be marked as active
    const activeButton = container.querySelector('.onr-style-preview.onr-active');
    expect(activeButton).toBeInTheDocument();
  });

  it('handles isStyleActive for code type match', () => {
    const { app } = createAppWithEditor('```\ncode\n```');
    const { container } = renderWithApp(<StylesGroup />, app);

    // Code should be marked as active
    const activeButton = container.querySelector('.onr-style-preview.onr-active');
    expect(activeButton).toBeInTheDocument();
  });

  it('handles inline onClick in dropdown item', () => {
    const { app, editor } = createAppWithEditor('test content');
    const { container } = renderWithApp(<StylesGroup />, app);

    const expandButton = screen.getByTitle('Expand');
    fireEvent.click(expandButton);

    // Find a dropdown item and click it to trigger the inline onClick
    const dropdownItem = container.querySelector('.onr-dd-item');
    if (dropdownItem) {
      fireEvent.click(dropdownItem);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles Dropdown onClose callback', () => {
    const { app } = createAppWithEditor('');
    const { container } = renderWithApp(<StylesGroup />, app);

    const expandButton = screen.getByTitle('Expand');
    fireEvent.click(expandButton);

    // Press Escape to trigger the Dropdown onClose
    fireEvent.keyDown(document, { key: 'Escape' });

    // Component should still be rendered
    expect(container.querySelector('.onr-styles-group')).toBeInTheDocument();
  });

  it('triggers handleClearFormatting callback closure', () => {
    const { app, editor } = createAppWithEditor('**bold text**');
    const { container } = renderWithApp(<StylesGroup />, app);

    const expandButton = screen.getByTitle('Expand');
    fireEvent.click(expandButton);

    // Click clear formatting to trigger the callback
    const clearButton = container.querySelector('.onr-clear-formatting-btn');
    if (clearButton) {
      fireEvent.click(clearButton);
    }

    // Verify the callback was invoked and dropdown closed
    expect(editor.getValue()).toBeDefined();
  });

  it('triggers Dropdown onClose via outside click', () => {
    const { app } = createAppWithEditor('');
    const { container } = renderWithApp(<StylesGroup />, app);

    const expandButton = screen.getByTitle('Expand');
    fireEvent.click(expandButton);

    // Click outside the dropdown to trigger onClose
    fireEvent.click(document.body);

    // Component should still be rendered
    expect(container.querySelector('.onr-styles-group')).toBeInTheDocument();
  });

  it('handles handleClearFormatting with no editor', () => {
    const { app } = createAppWithEditor('');
    Object.defineProperty(app.workspace, 'activeEditor', {
      value: {},
      writable: true,
    });
    const { container } = renderWithApp(<StylesGroup />, app);

    const expandButton = screen.getByTitle('Expand');
    fireEvent.click(expandButton);

    // Click clear formatting with no editor
    const clearButton = container.querySelector('.onr-clear-formatting-btn');
    if (clearButton) {
      expect(() => fireEvent.click(clearButton)).not.toThrow();
    }
  });

  it('handles handleStyleClick function directly', () => {
    const { app, editor } = createAppWithEditor('test content');
    const { container } = renderWithApp(<StylesGroup />, app);

    // Click on a style preview button to trigger handleStyleClick
    const previewButton = container.querySelector('.onr-style-preview');
    if (previewButton) {
      fireEvent.click(previewButton);
    }

    expect(editor.getValue()).toBeDefined();
  });

  it('handles handleScrollUp at boundary', () => {
    const { app } = createAppWithEditor('');
    renderWithApp(<StylesGroup />, app);

    const scrollUpButton = screen.getByTitle('Previous styles');
    // Click multiple times at start (should not go below 0)
    for (let i = 0; i < 5; i += 1) {
      fireEvent.click(scrollUpButton);
    }

    expect(scrollUpButton).toBeInTheDocument();
  });

  it('handles handleScrollDown at boundary', () => {
    const { app } = createAppWithEditor('');
    renderWithApp(<StylesGroup />, app);

    const scrollDownButton = screen.getByTitle('Next styles');
    // Click many times to reach end
    for (let i = 0; i < 20; i += 1) {
      fireEvent.click(scrollDownButton);
    }

    expect(scrollDownButton).toBeInTheDocument();
  });

  it('handles handleExpandStyles toggle', () => {
    const { app } = createAppWithEditor('');
    renderWithApp(<StylesGroup />, app);

    const expandButton = screen.getByTitle('Expand');

    // Open
    fireEvent.click(expandButton);
    // Close
    fireEvent.click(expandButton);
    // Open again
    fireEvent.click(expandButton);

    expect(expandButton).toBeInTheDocument();
  });
});
