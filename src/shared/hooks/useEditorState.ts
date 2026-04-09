import { useEffect, useState } from 'react';
import { App } from 'obsidian';

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

const DEFAULT: EditorState = {
  bold: false, italic: false, underline: false,
  strikethrough: false, highlight: false,
  subscript: false, superscript: false,
  bulletList: false, numberedList: false,
  headLevel: 0, fontFamily: '', fontSize: '',
};

export function useEditorState(app: App): EditorState {
  const [state, setState] = useState<EditorState>(DEFAULT);

  useEffect(() => {
    const read = () => {
      const editor = app.workspace.activeEditor?.editor;
      if (!editor) { setState(DEFAULT); return; }

      const cursor = editor.getCursor();
      const line = editor.getLine(cursor.line);
      const lineWithoutTags = line.replace(/<[^>]+>/g, '');
      const charPosition = cursor.ch;

      const headMatch = line.match(/^(#{1,6})\s/);

      const isInsideTag = (openTag: string, closeTag: string) => {
        let position = 0;
        while (position < line.length) {
          const openIndex = line.indexOf(openTag, position);
          if (openIndex < 0) break;
          const closeIndex = line.indexOf(closeTag, openIndex);
          if (closeIndex < 0) break;
          if (charPosition > openIndex + openTag.length - 1 && charPosition < closeIndex + closeTag.length) return true;
          position = closeIndex + closeTag.length;
        }
        return false;
      };

      setState({
        bold:          /\*\*(.*?)\*\*/.test(lineWithoutTags),
        italic:        /(?<!\*)\*((?!\*).+?)\*(?!\*)/.test(lineWithoutTags) || /\*\*\*(.*?)\*\*\*/.test(lineWithoutTags),
        underline:     /<u>/.test(line),
        strikethrough: /~~(.*?)~~/.test(lineWithoutTags),
        highlight:     /==(.*?)==/.test(lineWithoutTags),
        subscript:     isInsideTag('<sub>', '</sub>'),
        superscript:   isInsideTag('<sup>', '</sup>'),
        bulletList:    /^(\s*)- /.test(line),
        numberedList:  /^(\s*)\d+\. /.test(line),
        headLevel:     headMatch ? headMatch[1].length : 0,
        fontFamily:    (app.vault as any).getConfig?.('fontText') ?? '',
        fontSize:      String((app.vault as any).getConfig?.('baseFontSize') ?? ''),
      });
    };

    const onInteract = () => requestAnimationFrame(read);
    const workspaceElement = document.querySelector('.workspace') ?? document.body;
    workspaceElement.addEventListener('click', onInteract, true);
    workspaceElement.addEventListener('keyup', onInteract, true);

    const onLeafChange = () => setTimeout(read, 150);
    const onEditorChange = () => requestAnimationFrame(read);
    const leafChangeEventRef = app.workspace.on('active-leaf-change', onLeafChange);
    const editorChangeEventRef = app.workspace.on('editor-change', onEditorChange);

    setTimeout(read, 300);

    return () => {
      workspaceElement.removeEventListener('click', onInteract, true);
      workspaceElement.removeEventListener('keyup', onInteract, true);
      app.workspace.offref(leafChangeEventRef);
      app.workspace.offref(editorChangeEventRef);
    };
  }, [app]);

  return state;
}
