import { useEffect, useState } from 'react';
import { App, Editor } from 'obsidian';

export interface EditorState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  highlight: boolean;
  subscript: boolean;
  superscript: boolean;
  bulletList: boolean;
  numberedList: boolean;
  headLevel: number;
  fontFamily: string;
  fontSize: string;
}

function getEditorState(app: App): EditorState {
  const editor = app.workspace.activeEditor?.editor;
  if (!editor) {
    return {
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
      fontFamily: (app.vault as any).getConfig('fontText') ?? 'default',
      fontSize: String((app.vault as any).getConfig('baseFontSize') ?? 16),
    };
  }

  const selection = editor.getSelection();
  const content = editor.getValue();

  let bold = false;
  let italic = false;
  let underline = false;
  let strikethrough = false;
  let highlight = false;
  let subscript = false;
  let superscript = false;
  let bulletList = false;
  let numberedList = false;
  let headLevel = 0;

  if (selection) {
    bold = /\*\*[^\*]+\*\*/.test(selection) || /__[^_]+__/.test(selection);
    italic = /\*[^\*]+\*/.test(selection) || /_[^_]+_/.test(selection);
    underline = /<u>[^<]+<\/u>/.test(selection);
    strikethrough = /~~[^~]+~~/.test(selection);
    highlight = /==[^=]+==[^=]*/.test(selection);
    subscript = /<sub>[^<]+<\/sub>/.test(selection);
    superscript = /<sup>[^<]+<\/sup>/.test(selection);
  }

  const activeLineNumber = editor.getCursor().line;
  const activeLine = editor.getLine(activeLineNumber);

  if (activeLine) {
    bulletList = /^[\s]*[-*][\s]/.test(activeLine);
    numberedList = /^[\s]*\d+\.[\s]/.test(activeLine);
    const headMatch = activeLine.match(/^(#{1,6})\s/);
    if (headMatch) {
      headLevel = headMatch[1].length;
    }
  }

  return {
    bold,
    italic,
    underline,
    strikethrough,
    highlight,
    subscript,
    superscript,
    bulletList,
    numberedList,
    headLevel,
    fontFamily: (app.vault as any).getConfig('fontText') ?? 'default',
    fontSize: String((app.vault as any).getConfig('baseFontSize') ?? 16),
  };
}

export function useEditorState(app: App): EditorState {
  const [editorState, setEditorState] = useState<EditorState>(() => getEditorState(app));

  useEffect(() => {
    const updateState = () => {
      setEditorState(getEditorState(app));
    };

    const leafChangeRef = app.workspace.on('active-leaf-change', updateState);
    const editorChangeRef = app.workspace.on('editor-change', updateState);

    return () => {
      app.workspace.offref(leafChangeRef);
      app.workspace.offref(editorChangeRef);
    };
  }, [app]);

  return editorState;
}
