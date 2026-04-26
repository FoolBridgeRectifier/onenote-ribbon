import type { App } from 'obsidian';
import { createMockApp } from '../../../test-utils/mockApp';
import { MockEditor } from '../../../test-utils/MockEditor';
import { deriveEditorState, buildDefaultState } from '../editorStateHelpers';
import { buildTagContext } from '../../editor-v2/detection-engine/DetectionEngine';

function buildAppWithSource(sourceText: string, cursorLine: number, cursorCh: number) {
  const editor = new MockEditor();
  editor.setValue(sourceText);
  editor.setCursor({ line: cursorLine, ch: cursorCh });
  return createMockApp(editor) as unknown as App;
}

describe('buildDefaultState', () => {
  it('returns flat default state when vault config has no overrides', () => {
    const app = createMockApp(new MockEditor()) as unknown as App;
    const state = buildDefaultState(app);

    expect(state.bold).toBe(false);
    expect(state.italic).toBe(false);
    expect(state.headLevel).toBe(0);
    expect(state.textAlign).toBe('left');
    expect(state.fontColor).toBeNull();
    expect(state.activeTagKeys.size).toBe(0);
  });

  it('returns default state with no editor open', () => {
    const app = createMockApp() as unknown as App;
    const state = deriveEditorState(app, null, null);

    expect(state.bold).toBe(false);
    expect(state.activeTagKeys.size).toBe(0);
  });
});

describe('deriveEditorState', () => {
  it('detects bold (markdown) at the cursor', () => {
    const app = buildAppWithSource('**bold**', 0, 4);
    const state = deriveEditorState(app, null, null);

    expect(state.bold).toBe(true);
  });

  it('detects italic (markdown) at the cursor', () => {
    const app = buildAppWithSource('*italic*', 0, 4);
    const state = deriveEditorState(app, null, null);

    expect(state.italic).toBe(true);
  });

  it('detects strikethrough (markdown) at the cursor', () => {
    const app = buildAppWithSource('~~struck~~', 0, 4);
    const state = deriveEditorState(app, null, null);

    expect(state.strikethrough).toBe(true);
  });

  it('detects highlight (markdown) at the cursor', () => {
    const app = buildAppWithSource('==marked==', 0, 4);
    const state = deriveEditorState(app, null, null);

    expect(state.highlight).toBe(true);
  });

  it('detects HTML bold (<b>) at the cursor', () => {
    const app = buildAppWithSource('<b>bold</b>', 0, 5);
    const state = deriveEditorState(app, null, null);

    expect(state.bold).toBe(true);
  });

  it('detects HTML underline (<u>) at the cursor', () => {
    const app = buildAppWithSource('<u>under</u>', 0, 5);
    const state = deriveEditorState(app, null, null);

    expect(state.underline).toBe(true);
  });

  it('detects subscript (<sub>) at the cursor', () => {
    const app = buildAppWithSource('<sub>sub</sub>', 0, 6);
    const state = deriveEditorState(app, null, null);

    expect(state.subscript).toBe(true);
  });

  it('detects superscript (<sup>) at the cursor', () => {
    const app = buildAppWithSource('<sup>sup</sup>', 0, 6);
    const state = deriveEditorState(app, null, null);

    expect(state.superscript).toBe(true);
  });

  it('detects bullet-list lines via line prefix', () => {
    const app = buildAppWithSource('- item one', 0, 4);
    const state = deriveEditorState(app, null, null);

    expect(state.bulletList).toBe(true);
    expect(state.numberedList).toBe(false);
  });

  it('detects numbered-list lines via line prefix', () => {
    const app = buildAppWithSource('1. item one', 0, 4);
    const state = deriveEditorState(app, null, null);

    expect(state.numberedList).toBe(true);
    expect(state.bulletList).toBe(false);
  });

  it('detects heading level via "#" prefix', () => {
    const app = buildAppWithSource('### Heading', 0, 5);
    const state = deriveEditorState(app, null, null);

    expect(state.headLevel).toBe(3);
  });

  it('extracts font color from a span at the cursor', () => {
    const app = buildAppWithSource('<span style="color: red">text</span>', 0, 27);
    const state = deriveEditorState(app, null, null);

    expect(state.fontColor).toBe('red');
  });

  it('extracts highlight color from a background span and sets highlight true', () => {
    const app = buildAppWithSource('<span style="background: yellow">x</span>', 0, 34);
    const state = deriveEditorState(app, null, null);

    expect(state.highlightColor).toBe('yellow');
    expect(state.highlight).toBe(true);
  });

  it('reuses cached TagContext when source text has not changed', () => {
    const app = buildAppWithSource('**bold**', 0, 4);
    const sourceText = '**bold**';
    const cachedContext = buildTagContext(sourceText);

    const state = deriveEditorState(app, cachedContext, sourceText);

    expect(state.bold).toBe(true);
  });

  it('rebuilds TagContext when cached source text differs', () => {
    const app = buildAppWithSource('*italic*', 0, 4);
    const cachedContext = buildTagContext('**bold**');

    const state = deriveEditorState(app, cachedContext, '**bold**');

    expect(state.italic).toBe(true);
    expect(state.bold).toBe(false);
  });

  it('detects legacy <div text-align> on the cursor line', () => {
    const app = buildAppWithSource('<div style="text-align:right">aligned</div>', 0, 35);
    const state = deriveEditorState(app, null, null);

    expect(state.textAlign).toBe('right');
  });
});
