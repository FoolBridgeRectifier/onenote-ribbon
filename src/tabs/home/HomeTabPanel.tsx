import { useEffect, useState } from 'react';
import { useApp } from '../../shared/context/AppContext';
import { useEditorState } from '../../shared/hooks/useEditorState';
import { useFormatPainter } from '../../shared/hooks/useFormatPainter';
import { FormatPainterContext } from '../../shared/context/FormatPainterContext';
import { ClipboardGroup } from './clipboard/ClipboardGroup';
import { BasicTextGroup } from './basic-text/BasicTextGroup';
import { StylesGroup } from './styles/StylesGroup';
import { TagsGroup } from './tags/TagsGroup';
import { EmailGroup } from './email/EmailGroup';
import { NavigateGroup } from './navigate/NavigateGroup';

const STYLES_LIST = [
  { name: 'Normal', level: 0 },
  { name: 'Heading 1', level: 1 },
  { name: 'Heading 2', level: 2 },
  { name: 'Heading 3', level: 3 },
  { name: 'Heading 4', level: 4 },
  { name: 'Heading 5', level: 5 },
  { name: 'Heading 6', level: 6 },
  { name: 'Quote', level: 0 },
  { name: 'Code', level: 0 },
];

export function HomeTabPanel() {
  const app = useApp();
  const editorState = useEditorState(app);
  const formatPainter = useFormatPainter();
  const [stylesOffset, setStylesOffset] = useState(0);

  useEffect(() => {
    const { headLevel } = editorState;
    if (headLevel >= 1 && headLevel <= 6) {
      setStylesOffset(Math.max(0, Math.min(headLevel - 1, STYLES_LIST.length - 2)));
    }
  }, [editorState.headLevel]);

  useEffect(() => {
    const workspaceElement = document.querySelector('.workspace') ?? document.body;

    const onMouseUp = (event: Event) => {
      if (!formatPainter.isActive) return;

      const editor = app.workspace.activeEditor?.editor;
      if (!editor) return;

      const selection = editor.getSelection();
      if (!selection) return;

      formatPainter.apply(editor, selection);
      formatPainter.setIsActive(false);
    };

    workspaceElement.addEventListener('mouseup', onMouseUp, true);
    return () => workspaceElement.removeEventListener('mouseup', onMouseUp, true);
  }, [app, formatPainter]);

  return (
    <FormatPainterContext.Provider value={formatPainter}>
      <div className="onr-tab-panel" data-panel="Home">
        <ClipboardGroup />
        <BasicTextGroup editorState={editorState} />
        <StylesGroup
          editorState={editorState}
          stylesOffset={stylesOffset}
          setStylesOffset={setStylesOffset}
        />
        <TagsGroup />
        <EmailGroup />
        <NavigateGroup />
      </div>
    </FormatPainterContext.Provider>
  );
}
