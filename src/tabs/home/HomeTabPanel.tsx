import { useEffect } from 'react';
import { useApp } from '../../shared/context/AppContext';
import { useFormatPainter } from '../../shared/hooks/useFormatPainter';
import { FormatPainterContext } from '../../shared/context/FormatPainterContext';
import { ClipboardGroup } from './clipboard/ClipboardGroup';
import { BasicTextGroup } from './basic-text/BasicTextGroup';
import { StylesGroup } from './styles/StylesGroup';
import { TagsGroup } from './tags/TagsGroup';
import { EmailGroup } from './email/EmailGroup';
import { NavigateGroup } from './navigate/NavigateGroup';

export function HomeTabPanel() {
  const app = useApp();
  const formatPainter = useFormatPainter();

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
        <BasicTextGroup />
        <StylesGroup />
        <TagsGroup />
        <EmailGroup />
        <NavigateGroup />
      </div>
    </FormatPainterContext.Provider>
  );
}
