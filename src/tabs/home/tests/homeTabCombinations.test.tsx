import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppContext } from '../../../shared/context/AppContext';
import type { EditorState } from '../../../shared/hooks/useEditorState';

// ── Mutable mock state ──────────────────────────────────────────────────────

const defaultEditorState: EditorState = {
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  highlight: false,
  subscript: false,
  superscript: false,
  bulletList: false,
  numberedList: false,
  headLevel: 0,
  fontFamily: 'default',
  fontSize: '16',
  textAlign: 'left',
  fontColor: null,
  highlightColor: null,
};

let mockEditorState: EditorState = { ...defaultEditorState };

jest.mock('../../../shared/hooks/useEditorState', () => ({
  useEditorState: () => mockEditorState,
}));

// ── Mock Obsidian App ───────────────────────────────────────────────────────

const mockEditor = {
  getValue: () => 'test content',
  getCursor: () => ({ line: 0, ch: 0 }),
  getLine: () => 'test content',
  getSelection: () => '',
  setSelection: jest.fn(),
  setCursor: jest.fn(),
  transaction: jest.fn(),
  setLine: jest.fn(),
  replaceSelection: jest.fn(),
  replaceRange: jest.fn(),
};

const mockApp = {
  workspace: {
    activeEditor: { editor: mockEditor },
    on: jest.fn(() => ({ id: 'test' })),
    offref: jest.fn(),
  },
  vault: {
    getConfig: () => 'default',
  },
  commands: {
    executeCommandById: jest.fn(),
  },
} as any;

function renderWithMockApp(component: React.ReactElement) {
  return render(
    <AppContext.Provider value={mockApp}>{component}</AppContext.Provider>,
  );
}

// ── Imports after mocks ─────────────────────────────────────────────────────

import { BasicTextGroup } from '../basic-text/BasicTextGroup';
import { StylesGroup } from '../styles/StylesGroup';
import { TagsGroup } from '../tags/TagsGroup';

// ── Helpers ─────────────────────────────────────────────────────────────────

function queryByCmd(
  container: HTMLElement,
  command: string,
): HTMLElement | null {
  return container.querySelector(`[data-cmd="${command}"]`);
}

function getByCmd(container: HTMLElement, command: string): HTMLElement {
  const element = queryByCmd(container, command);

  if (!element) {
    throw new Error(`No element found with data-cmd="${command}"`);
  }

  return element;
}

function resetEditorState(overrides: Partial<EditorState> = {}): void {
  mockEditorState = { ...defaultEditorState, ...overrides };
}

// ── Tests ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  resetEditorState();
  jest.clearAllMocks();
});

// ═══════════════════════════════════════════════════════════════════════════
// BasicTextGroup — Individual button rendering and data-cmd
// ═══════════════════════════════════════════════════════════════════════════

describe('BasicTextGroup button rendering', () => {
  const BASIC_COMMANDS = [
    'bold',
    'italic',
    'underline',
    'strikethrough',
    'subscript',
    'superscript',
    'bullet-list',
    'numbered-list',
    'outdent',
    'indent',
    'clear-all',
    'delete-element',
    'highlight',
    'font-color',
    'align',
    'font-family',
    'font-size',
  ];

  it.each(BASIC_COMMANDS)('renders a button with data-cmd="%s"', (command) => {
    const { container } = renderWithMockApp(<BasicTextGroup />);
    expect(queryByCmd(container, command)).not.toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Active state toggling for inline formatting buttons
// ═══════════════════════════════════════════════════════════════════════════

describe('Inline formatting — active states', () => {
  const INLINE_BUTTONS: Array<{
    command: string;
    stateField: keyof EditorState;
  }> = [
    { command: 'bold', stateField: 'bold' },
    { command: 'italic', stateField: 'italic' },
    { command: 'underline', stateField: 'underline' },
    { command: 'strikethrough', stateField: 'strikethrough' },
    { command: 'subscript', stateField: 'subscript' },
    { command: 'superscript', stateField: 'superscript' },
    { command: 'bullet-list', stateField: 'bulletList' },
    { command: 'numbered-list', stateField: 'numberedList' },
  ];

  describe.each(INLINE_BUTTONS)(
    '$command button',
    ({ command, stateField }) => {
      it('has onr-active class when editorState field is true', () => {
        resetEditorState({ [stateField]: true });
        const { container } = renderWithMockApp(<BasicTextGroup />);
        const button = getByCmd(container, command);
        expect(button.classList.contains('onr-active')).toBe(true);
      });

      it('does NOT have onr-active class when editorState field is false', () => {
        resetEditorState({ [stateField]: false });
        const { container } = renderWithMockApp(<BasicTextGroup />);
        const button = getByCmd(container, command);
        expect(button.classList.contains('onr-active')).toBe(false);
      });
    },
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// Highlight button active state
// ═══════════════════════════════════════════════════════════════════════════

describe('Highlight button — active state', () => {
  it('has onr-active when editorState.highlight is true', () => {
    resetEditorState({ highlight: true });
    const { container } = renderWithMockApp(<BasicTextGroup />);
    const button = getByCmd(container, 'highlight');
    expect(button.classList.contains('onr-active')).toBe(true);
  });

  it('has onr-active when editorState.highlightColor is non-null', () => {
    resetEditorState({ highlightColor: '#ff0000' });
    const { container } = renderWithMockApp(<BasicTextGroup />);
    const button = getByCmd(container, 'highlight');
    expect(button.classList.contains('onr-active')).toBe(true);
  });

  it('does NOT have onr-active when highlight=false and highlightColor=null', () => {
    resetEditorState({ highlight: false, highlightColor: null });
    const { container } = renderWithMockApp(<BasicTextGroup />);
    const button = getByCmd(container, 'highlight');
    expect(button.classList.contains('onr-active')).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Font color button active state
// ═══════════════════════════════════════════════════════════════════════════

describe('Font color button — active state', () => {
  it('has onr-active when editorState.fontColor is non-null', () => {
    resetEditorState({ fontColor: '#00ff00' });
    const { container } = renderWithMockApp(<BasicTextGroup />);
    const button = getByCmd(container, 'font-color');
    expect(button.classList.contains('onr-active')).toBe(true);
  });

  it('does NOT have onr-active when editorState.fontColor is null', () => {
    resetEditorState({ fontColor: null });
    const { container } = renderWithMockApp(<BasicTextGroup />);
    const button = getByCmd(container, 'font-color');
    expect(button.classList.contains('onr-active')).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Align button active state
// ═══════════════════════════════════════════════════════════════════════════

describe('Align button — active state', () => {
  it('has onr-active when textAlign is "center"', () => {
    resetEditorState({ textAlign: 'center' });
    const { container } = renderWithMockApp(<BasicTextGroup />);
    const button = getByCmd(container, 'align');
    expect(button.classList.contains('onr-active')).toBe(true);
  });

  it('has onr-active when textAlign is "right"', () => {
    resetEditorState({ textAlign: 'right' });
    const { container } = renderWithMockApp(<BasicTextGroup />);
    const button = getByCmd(container, 'align');
    expect(button.classList.contains('onr-active')).toBe(true);
  });

  it('does NOT have onr-active when textAlign is "left"', () => {
    resetEditorState({ textAlign: 'left' });
    const { container } = renderWithMockApp(<BasicTextGroup />);
    const button = getByCmd(container, 'align');
    expect(button.classList.contains('onr-active')).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Combination states — multiple buttons active simultaneously
// ═══════════════════════════════════════════════════════════════════════════

describe('Combination states', () => {
  it('Bold + Italic + Underline all active → all three have onr-active', () => {
    resetEditorState({ bold: true, italic: true, underline: true });
    const { container } = renderWithMockApp(<BasicTextGroup />);

    expect(getByCmd(container, 'bold').classList.contains('onr-active')).toBe(
      true,
    );
    expect(getByCmd(container, 'italic').classList.contains('onr-active')).toBe(
      true,
    );
    expect(
      getByCmd(container, 'underline').classList.contains('onr-active'),
    ).toBe(true);
  });

  it('All fields false → no buttons have onr-active', () => {
    resetEditorState();
    const { container } = renderWithMockApp(<BasicTextGroup />);

    const allButtons = container.querySelectorAll('[data-cmd]');

    for (const button of Array.from(allButtons)) {
      expect(button.classList.contains('onr-active')).toBe(false);
    }
  });

  it('Bold + highlight → only bold and highlight have onr-active', () => {
    resetEditorState({ bold: true, highlight: true });
    const { container } = renderWithMockApp(<BasicTextGroup />);

    expect(getByCmd(container, 'bold').classList.contains('onr-active')).toBe(
      true,
    );
    expect(
      getByCmd(container, 'highlight').classList.contains('onr-active'),
    ).toBe(true);

    expect(getByCmd(container, 'italic').classList.contains('onr-active')).toBe(
      false,
    );
    expect(
      getByCmd(container, 'underline').classList.contains('onr-active'),
    ).toBe(false);
    expect(
      getByCmd(container, 'strikethrough').classList.contains('onr-active'),
    ).toBe(false);
    expect(
      getByCmd(container, 'subscript').classList.contains('onr-active'),
    ).toBe(false);
    expect(
      getByCmd(container, 'superscript').classList.contains('onr-active'),
    ).toBe(false);
  });

  it('Subscript + Superscript both active at once', () => {
    resetEditorState({ subscript: true, superscript: true });
    const { container } = renderWithMockApp(<BasicTextGroup />);

    expect(
      getByCmd(container, 'subscript').classList.contains('onr-active'),
    ).toBe(true);
    expect(
      getByCmd(container, 'superscript').classList.contains('onr-active'),
    ).toBe(true);
  });

  it('Bullet list + Bold + fontColor → three buttons active', () => {
    resetEditorState({ bulletList: true, bold: true, fontColor: '#000' });
    const { container } = renderWithMockApp(<BasicTextGroup />);

    expect(
      getByCmd(container, 'bullet-list').classList.contains('onr-active'),
    ).toBe(true);
    expect(getByCmd(container, 'bold').classList.contains('onr-active')).toBe(
      true,
    );
    expect(
      getByCmd(container, 'font-color').classList.contains('onr-active'),
    ).toBe(true);

    expect(getByCmd(container, 'italic').classList.contains('onr-active')).toBe(
      false,
    );
    expect(
      getByCmd(container, 'numbered-list').classList.contains('onr-active'),
    ).toBe(false);
  });

  it('Center align + Italic + highlightColor → three buttons active', () => {
    resetEditorState({
      textAlign: 'center',
      italic: true,
      highlightColor: '#ffcc00',
    });
    const { container } = renderWithMockApp(<BasicTextGroup />);

    expect(getByCmd(container, 'align').classList.contains('onr-active')).toBe(
      true,
    );
    expect(getByCmd(container, 'italic').classList.contains('onr-active')).toBe(
      true,
    );
    expect(
      getByCmd(container, 'highlight').classList.contains('onr-active'),
    ).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Font picker display values
// ═══════════════════════════════════════════════════════════════════════════

describe('FontPicker display', () => {
  it('shows "Font" when fontFamily is "default"', () => {
    resetEditorState({ fontFamily: 'default' });
    const { container } = renderWithMockApp(<BasicTextGroup />);

    const fontButton = getByCmd(container, 'font-family');
    const label = fontButton.querySelector('.onr-picker-label');

    expect(label).not.toBeNull();
    expect(label!.textContent).toBe('Font');
  });

  it('shows "Arial" when fontFamily is "Arial"', () => {
    resetEditorState({ fontFamily: 'Arial' });
    const { container } = renderWithMockApp(<BasicTextGroup />);

    const fontButton = getByCmd(container, 'font-family');
    const label = fontButton.querySelector('.onr-picker-label');

    expect(label).not.toBeNull();
    expect(label!.textContent).toBe('Arial');
  });

  it('shows "Times New Roman" when fontFamily is "Times New Roman"', () => {
    resetEditorState({ fontFamily: 'Times New Roman' });
    const { container } = renderWithMockApp(<BasicTextGroup />);

    const fontButton = getByCmd(container, 'font-family');
    const label = fontButton.querySelector('.onr-picker-label');

    expect(label!.textContent).toBe('Times New Roman');
  });

  it('shows "24" when fontSize is "24"', () => {
    resetEditorState({ fontSize: '24' });
    const { container } = renderWithMockApp(<BasicTextGroup />);

    const sizeButton = getByCmd(container, 'font-size');
    const label = sizeButton.querySelector('.onr-picker-label');

    expect(label).not.toBeNull();
    expect(label!.textContent).toBe('24');
  });

  it('shows "16" when fontSize is "16" (default)', () => {
    resetEditorState({ fontSize: '16' });
    const { container } = renderWithMockApp(<BasicTextGroup />);

    const sizeButton = getByCmd(container, 'font-size');
    const label = sizeButton.querySelector('.onr-picker-label');

    expect(label!.textContent).toBe('16');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Font picker dropdown interaction
// ═══════════════════════════════════════════════════════════════════════════

describe('FontPicker dropdown', () => {
  it('opens font dropdown on click and shows font list', async () => {
    const user = userEvent.setup();
    resetEditorState();
    renderWithMockApp(<BasicTextGroup />);

    const fontButton = screen.getByTitle('Font family');
    await user.click(fontButton);

    // The dropdown renders to body via portal — check document.body
    const dropdownItems = document.body.querySelectorAll('.onr-dd-item');
    expect(dropdownItems.length).toBeGreaterThan(0);

    // Verify known fonts appear
    const itemTexts = Array.from(dropdownItems).map((item) => item.textContent);
    expect(itemTexts).toContain('Arial');
    expect(itemTexts).toContain('Courier New');
  });

  it('opens size dropdown on click and shows size list', async () => {
    const user = userEvent.setup();
    resetEditorState();
    renderWithMockApp(<BasicTextGroup />);

    const sizeButton = screen.getByTitle('Font size');
    await user.click(sizeButton);

    const dropdownItems = document.body.querySelectorAll('.onr-dd-item');
    expect(dropdownItems.length).toBeGreaterThan(0);

    const itemTexts = Array.from(dropdownItems).map((item) => item.textContent);
    expect(itemTexts).toContain('12');
    expect(itemTexts).toContain('24');
    expect(itemTexts).toContain('72');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Align dropdown interaction
// ═══════════════════════════════════════════════════════════════════════════

describe('Align dropdown', () => {
  it('opens dropdown with three alignment options on click', async () => {
    const user = userEvent.setup();
    resetEditorState();
    renderWithMockApp(<BasicTextGroup />);

    const alignButton = screen.getByTitle('Align');
    await user.click(alignButton);

    const dropdownItems = document.body.querySelectorAll('.onr-dd-item');
    const itemTexts = Array.from(dropdownItems).map((item) =>
      item.textContent?.trim(),
    );

    expect(itemTexts).toContain('Align Left');
    expect(itemTexts).toContain('Align Center');
    expect(itemTexts).toContain('Align Right');
  });

  it('marks the current alignment as active in the dropdown', async () => {
    const user = userEvent.setup();
    resetEditorState({ textAlign: 'center' });
    renderWithMockApp(<BasicTextGroup />);

    const alignButton = screen.getByTitle('Align');
    await user.click(alignButton);

    const activeItems = document.body.querySelectorAll('.onr-dd-item-active');
    expect(activeItems.length).toBe(1);
    expect(activeItems[0].textContent?.trim()).toContain('Align Center');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// StylesGroup — heading level active states
// ═══════════════════════════════════════════════════════════════════════════

describe('StylesGroup active states', () => {
  it('renders style buttons with data-cmd attributes', () => {
    resetEditorState({ headLevel: 0 });
    const { container } = renderWithMockApp(<StylesGroup />);

    // The styles group shows 2 visible styles by default (offset=0 → Normal, Heading 1)
    const normalButton = queryByCmd(container, 'style-normal');
    const heading1Button = queryByCmd(container, 'style-heading-1');

    expect(normalButton).not.toBeNull();
    expect(heading1Button).not.toBeNull();
  });

  it('"Normal" style is active when headLevel=0', () => {
    resetEditorState({ headLevel: 0 });
    const { container } = renderWithMockApp(<StylesGroup />);

    const normalButton = getByCmd(container, 'style-normal');
    expect(normalButton.classList.contains('onr-active')).toBe(true);
  });

  it('"Heading 1" is active when headLevel=1', () => {
    resetEditorState({ headLevel: 1 });
    const { container } = renderWithMockApp(<StylesGroup />);

    const heading1Button = getByCmd(container, 'style-heading-1');
    expect(heading1Button.classList.contains('onr-active')).toBe(true);
  });

  it('"Normal" is NOT active when headLevel=1', () => {
    resetEditorState({ headLevel: 1 });
    const { container } = renderWithMockApp(<StylesGroup />);

    const normalButton = getByCmd(container, 'style-normal');
    expect(normalButton.classList.contains('onr-active')).toBe(false);
  });

  it('scroll arrows and expand button render', () => {
    resetEditorState();
    const { container } = renderWithMockApp(<StylesGroup />);

    expect(queryByCmd(container, 'styles-prev')).not.toBeNull();
    expect(queryByCmd(container, 'styles-next')).not.toBeNull();
    expect(queryByCmd(container, 'styles-expand')).not.toBeNull();
  });

  it('expand dropdown shows all styles', async () => {
    const user = userEvent.setup();
    resetEditorState();
    renderWithMockApp(<StylesGroup />);

    const expandButton = screen.getByTitle('Expand');
    await user.click(expandButton);

    const dropdownItems = document.body.querySelectorAll('.onr-dd-item');
    const itemTexts = Array.from(dropdownItems).map((item) =>
      item.textContent?.trim(),
    );

    expect(itemTexts).toContain('Normal');
    expect(itemTexts).toContain('Heading 1');
    expect(itemTexts).toContain('Heading 2');
    expect(itemTexts).toContain('Heading 3');
    expect(itemTexts).toContain('Heading 4');
    expect(itemTexts).toContain('Heading 5');
    expect(itemTexts).toContain('Heading 6');
    expect(itemTexts).toContain('Quote');
    expect(itemTexts).toContain('Code');
  });

  it('expand dropdown marks active heading', async () => {
    const user = userEvent.setup();
    resetEditorState({ headLevel: 2 });
    renderWithMockApp(<StylesGroup />);

    const expandButton = screen.getByTitle('Expand');
    await user.click(expandButton);

    const activeItems = document.body.querySelectorAll('.onr-dd-item-active');
    expect(activeItems.length).toBe(1);
    expect(activeItems[0].textContent?.trim()).toBe('Heading 2');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// TagsGroup — button rendering
// ═══════════════════════════════════════════════════════════════════════════

describe('TagsGroup button rendering', () => {
  const TAG_COMMANDS = [
    'todo',
    'important',
    'question',
    'more-tags',
    'todo-tag',
    'find-tags',
  ];

  it.each(TAG_COMMANDS)('renders a button with data-cmd="%s"', (command) => {
    const { container } = renderWithMockApp(<TagsGroup />);
    expect(queryByCmd(container, command)).not.toBeNull();
  });

  it('more-tags dropdown shows Quote and Code options', async () => {
    const user = userEvent.setup();
    renderWithMockApp(<TagsGroup />);

    const moreButton = screen.getByTitle('More tags');
    await user.click(moreButton);

    const dropdownItems = document.body.querySelectorAll('.onr-dd-item');
    const itemTexts = Array.from(dropdownItems).map((item) =>
      item.textContent?.trim(),
    );

    expect(itemTexts).toContain('Quote');
    expect(itemTexts).toContain('Code');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Buttons without active state never gain onr-active
// ═══════════════════════════════════════════════════════════════════════════

describe('Non-active buttons', () => {
  const ALWAYS_INACTIVE_COMMANDS = [
    'outdent',
    'indent',
    'clear-all',
    'delete-element',
  ];

  it.each(ALWAYS_INACTIVE_COMMANDS)(
    '%s button never has onr-active class regardless of state',
    (command) => {
      // Even with many state fields true, these commands have no active prop
      resetEditorState({
        bold: true,
        italic: true,
        underline: true,
        bulletList: true,
        highlight: true,
      });
      const { container } = renderWithMockApp(<BasicTextGroup />);
      const button = getByCmd(container, command);
      expect(button.classList.contains('onr-active')).toBe(false);
    },
  );
});
