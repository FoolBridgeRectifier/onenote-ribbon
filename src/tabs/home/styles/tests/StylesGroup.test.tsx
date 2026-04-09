/**
 * Integration tests for StylesGroup (§5)
 *
 * §5.1 Styles Scroll: scroll up/down, clamp to [0, length-2]
 * §5.2 Style Cards: clicking a card applies/removes the style prefix
 * §5.3 Styles Dropdown: opens with all styles + Clear Formatting
 * §5.4 Active state: card marked onr-active when editorState.headLevel matches
 */
import React, { useState } from "react";
import { screen, fireEvent, within, act } from "@testing-library/react";
import { render } from "@testing-library/react";
import { renderWithApp } from "../../../../test-utils/renderWithApp";
import {
  createMockApp,
  createAppWithEditor,
} from "../../../../test-utils/mockApp";
import { StylesGroup } from "../StylesGroup";
import { EditorState } from "../../../../shared/hooks/useEditorState";
import { STYLES_LIST } from "../styles-data";
import { AppContext } from "../../../../shared/context/AppContext";

const DEFAULT_ES: EditorState = {
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
  fontFamily: "",
  fontSize: "",
};

/** Renders StylesGroup with controlled offset state so scroll tests work. */
function StylesWrapper({
  app,
  editorState = DEFAULT_ES,
  initialOffset = 0,
}: {
  app: ReturnType<typeof createMockApp>;
  editorState?: EditorState;
  initialOffset?: number;
}) {
  const [offset, setOffset] = useState(initialOffset);
  return (
    <AppContext.Provider value={app as any}>
      <StylesGroup
        editorState={editorState}
        stylesOffset={offset}
        setStylesOffset={setOffset}
      />
    </AppContext.Provider>
  );
}

describe("StylesGroup — §5 Styles (integration)", () => {
  // §5.1 — Scroll down increments offset
  it("§5.1 scroll-down button increments stylesOffset", () => {
    const app = createMockApp();
    const { container } = render(<StylesWrapper app={app} initialOffset={0} />);
    fireEvent.click(
      container.querySelector('[data-cmd="styles-scroll-down"]')!,
    );
    // After click, offset should be 1 → shows STYLES_LIST[1] and [2]
    expect(screen.getByText(STYLES_LIST[1].label)).toBeInTheDocument();
    expect(screen.getByText(STYLES_LIST[2].label)).toBeInTheDocument();
  });

  // §5.1 — Scroll up decrements offset
  it("§5.1 scroll-up button decrements stylesOffset", () => {
    const app = createMockApp();
    const { container } = render(<StylesWrapper app={app} initialOffset={2} />);
    fireEvent.click(container.querySelector('[data-cmd="styles-scroll-up"]')!);
    // offset: 2 → 1
    expect(screen.getByText(STYLES_LIST[1].label)).toBeInTheDocument();
  });

  // §5.1 — Scroll up clamps at 0 (cannot go below 0)
  it("§5.1 scroll-up clamps at 0", () => {
    const app = createMockApp();
    const { container } = render(<StylesWrapper app={app} initialOffset={0} />);
    fireEvent.click(container.querySelector('[data-cmd="styles-scroll-up"]')!);
    // Still at 0 → shows STYLES_LIST[0] and [1]
    expect(screen.getByText(STYLES_LIST[0].label)).toBeInTheDocument();
    expect(screen.getByText(STYLES_LIST[1].label)).toBeInTheDocument();
  });

  // §5.1 — Scroll down clamps at STYLES_LIST.length - 2 = 9
  it("§5.1 scroll-down clamps at STYLES_LIST.length - 2", () => {
    const maxOffset = STYLES_LIST.length - 2; // 9
    const app = createMockApp();
    const { container } = render(
      <StylesWrapper app={app} initialOffset={maxOffset} />,
    );
    fireEvent.click(
      container.querySelector('[data-cmd="styles-scroll-down"]')!,
    );
    // Still at max → shows STYLES_LIST[9] and [10]
    expect(screen.getByText(STYLES_LIST[maxOffset].label)).toBeInTheDocument();
    expect(
      screen.getByText(STYLES_LIST[maxOffset + 1].label),
    ).toBeInTheDocument();
  });

  // §5.1 — Initial offset=0 shows first two styles
  it("§5.1 initial offset 0 shows Heading 1 and Heading 2", () => {
    const app = createMockApp();
    render(<StylesWrapper app={app} initialOffset={0} />);
    expect(screen.getByText("Heading 1")).toBeInTheDocument();
    expect(screen.getByText("Heading 2")).toBeInTheDocument();
  });

  // §5.2 — Clicking style card applies heading prefix to line
  it("§5.2 clicking Heading 1 card sets '# ' prefix on the line", () => {
    const { app, editor } = createAppWithEditor("My title");
    editor.setCursor({ line: 0, ch: 0 });
    render(<StylesWrapper app={app} initialOffset={0} />);
    fireEvent.click(screen.getByText("Heading 1"));
    expect(editor.getValue()).toBe("# My title");
  });

  // §5.2 — Clicking style card again (toggle off) removes prefix
  it("§5.2 clicking Heading 1 again removes '# ' prefix (toggle off)", () => {
    const { app, editor } = createAppWithEditor("# My title");
    editor.setCursor({ line: 0, ch: 0 });
    render(<StylesWrapper app={app} initialOffset={0} />);
    fireEvent.click(screen.getByText("Heading 1"));
    expect(editor.getValue()).toBe("My title");
  });

  // §5.2 — Applying a style replaces an existing heading prefix
  it("§5.2 applying Heading 2 when Heading 1 active replaces '# ' with '## '", () => {
    const { app, editor } = createAppWithEditor("# Title");
    editor.setCursor({ line: 0, ch: 0 });
    render(<StylesWrapper app={app} initialOffset={0} />);
    fireEvent.click(screen.getByText("Heading 2"));
    expect(editor.getValue()).toBe("## Title");
  });

  // §5.2 — Code style (has suffix): applies prefix (the toggle uses prefix+stripped logic)
  it("§5.2 Code style applies code prefix to line", () => {
    const { app, editor } = createAppWithEditor("Hello");
    editor.setCursor({ line: 0, ch: 0 });
    // Code is at index 9, so scroll to offset 8 or 9
    render(<StylesWrapper app={app} initialOffset={9} />);
    // STYLES_LIST[9] = Code, STYLES_LIST[10] = Normal
    fireEvent.click(screen.getByText("Code"));
    // Code prefix is "```\n" — line becomes "```\nHello"
    expect(editor.getValue()).toContain("```");
  });

  // §5.2 — Normal style (empty prefix) strips existing heading
  it("§5.2 Normal style strips heading prefix from line", () => {
    const { app, editor } = createAppWithEditor("# Title");
    editor.setCursor({ line: 0, ch: 0 });
    render(<StylesWrapper app={app} initialOffset={9} />);
    fireEvent.click(screen.getByText("Normal"));
    expect(editor.getValue()).toBe("Title");
  });

  // §5.2 — No editor: clicking style card is no-op
  it("§5.2 clicking style card is no-op when no active editor", () => {
    const app = createMockApp();
    render(<StylesWrapper app={app} initialOffset={0} />);
    expect(() => fireEvent.click(screen.getByText("Heading 1"))).not.toThrow();
  });

  // §5.3 — Styles dropdown opens
  it("§5.3 styles-dropdown button opens the dropdown", () => {
    const { app } = createAppWithEditor("Hello");
    const { container } = render(<StylesWrapper app={app} initialOffset={0} />);
    fireEvent.click(container.querySelector('[data-cmd="styles-dropdown"]')!);
    // All style labels should appear in the dropdown
    expect(screen.getAllByText("Heading 1").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Citation").length).toBeGreaterThan(0);
  });

  // §5.3 — Styles dropdown contains Clear Formatting item
  it("§5.3 styles dropdown contains Clear Formatting option", async () => {
    const { app } = createAppWithEditor("Hello");
    const { container } = render(<StylesWrapper app={app} initialOffset={0} />);
    await act(async () => {
      fireEvent.click(container.querySelector('[data-cmd="styles-dropdown"]')!);
    });
    expect(screen.getByText(/Clear Formatting/)).toBeInTheDocument();
  });

  // §5.3 — Selecting style from dropdown applies it
  it("§5.3 selecting Heading 3 from dropdown applies '### ' prefix", () => {
    const { app, editor } = createAppWithEditor("My section");
    editor.setCursor({ line: 0, ch: 0 });
    const { container } = render(<StylesWrapper app={app} initialOffset={0} />);
    fireEvent.click(container.querySelector('[data-cmd="styles-dropdown"]')!);
    fireEvent.click(screen.getAllByText("Heading 3")[0]);
    expect(editor.getValue()).toBe("### My section");
  });

  // §5.3 — Clear Formatting from dropdown strips all formatting
  it("§5.3 Clear Formatting from dropdown strips heading and inline markers", async () => {
    const { app, editor } = createAppWithEditor("## **bold heading**");
    editor.setCursor({ line: 0, ch: 0 });
    const { container } = render(<StylesWrapper app={app} initialOffset={0} />);
    await act(async () => {
      fireEvent.click(container.querySelector('[data-cmd="styles-dropdown"]')!);
    });
    fireEvent.click(screen.getByText(/Clear Formatting/));
    expect(editor.getValue()).toBe("bold heading");
  });

  // §5.4 — Active state: Normal card gets onr-active when headLevel === 0
  it("§5.4 Normal card has onr-active class when headLevel is 0", () => {
    const app = createMockApp();
    const { container } = render(
      <StylesWrapper
        app={app}
        initialOffset={9}
        editorState={{ ...DEFAULT_ES, headLevel: 0 }}
      />,
    );
    const normalCard = container.querySelector(
      '[data-cmd="styles-preview-1"]',
    ) as HTMLElement;
    expect(normalCard?.className).toContain("onr-active");
  });

  // §5.4 — Active state: Heading 1 card has onr-active when headLevel === 1
  it("§5.4 Heading 1 card has onr-active class when headLevel is 1", () => {
    const app = createMockApp();
    const { container } = render(
      <StylesWrapper
        app={app}
        initialOffset={0}
        editorState={{ ...DEFAULT_ES, headLevel: 1 }}
      />,
    );
    const h1Card = container.querySelector(
      '[data-cmd="styles-preview-0"]',
    ) as HTMLElement;
    expect(h1Card?.className).toContain("onr-active");
  });

  // §5.4 — Active state: Heading 2 card has onr-active when headLevel === 2
  it("§5.4 Heading 2 card has onr-active class when headLevel is 2", () => {
    const app = createMockApp();
    const { container } = render(
      <StylesWrapper
        app={app}
        initialOffset={0}
        editorState={{ ...DEFAULT_ES, headLevel: 2 }}
      />,
    );
    const h2Card = container.querySelector(
      '[data-cmd="styles-preview-1"]',
    ) as HTMLElement;
    expect(h2Card?.className).toContain("onr-active");
  });

  // §5.4 — No card is active when headLevel doesn't match visible cards
  it("§5.4 no card is active when headLevel does not match current view", () => {
    const app = createMockApp();
    const { container } = render(
      <StylesWrapper
        app={app}
        initialOffset={0}
        editorState={{ ...DEFAULT_ES, headLevel: 5 }} // H5, but offset=0 shows H1+H2
      />,
    );
    const cards = container.querySelectorAll(".onr-active");
    expect(cards.length).toBe(0);
  });
});
