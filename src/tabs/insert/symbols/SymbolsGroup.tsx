import { useApp } from '../../../shared/context/AppContext';
import { GroupShell } from '../../../shared/components/GroupShell';
import { RibbonButton } from '../../../shared/components/RibbonButton';

export function SymbolsGroup() {
  const app = useApp();
  const getEditor = () => app.workspace.activeEditor?.editor;

  const insertMathBlock = () => {
    const editor = getEditor();
    if (!editor) return;
    const cursor = editor.getCursor();
    editor.replaceRange('$$\n\n$$', cursor);
    editor.setCursor({ line: cursor.line + 1, ch: 0 });
  };

  const insertHorizontalRule = () => {
    const editor = getEditor();
    if (!editor) return;
    editor.replaceRange('\n---\n', editor.getCursor());
  };

  const insertFootnote = () => {
    const editor = getEditor();
    if (!editor) return;
    const cursor  = editor.getCursor();
    const lastLine = editor.lastLine();
    const endPos  = { line: lastLine, ch: editor.getLine(lastLine).length };
    editor.replaceRange('[^1]', cursor);
    editor.replaceRange('\n[^1]: ', endPos);
  };

  const insertHashTag = () => {
    const editor = getEditor();
    if (!editor) return;
    const cursor = editor.getCursor();
    editor.replaceRange('#', cursor);
    editor.setCursor({ line: cursor.line, ch: cursor.ch + 1 });
  };

  return (
    <GroupShell name="Symbols" dataGroup="Symbols">
      <div className="onr-group-buttons">
        <RibbonButton
          data-cmd="insert-math"
          className="onr-btn"
          icon={
            <svg className="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 7H5l7 5-7 5h13"/>
            </svg>
          }
          label="Math $$"
          onClick={insertMathBlock}
        />
        <RibbonButton
          data-cmd="insert-hr"
          className="onr-btn"
          icon={
            <svg className="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          }
          label="Horizontal Rule"
          onClick={insertHorizontalRule}
        />
        <RibbonButton
          data-cmd="insert-footnote"
          className="onr-btn"
          icon={
            <svg className="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 10 20 15 15 20"/>
              <path d="M4 4v7a4 4 0 0 0 4 4h12"/>
            </svg>
          }
          label="Footnote"
          onClick={insertFootnote}
        />
        <RibbonButton
          data-cmd="insert-tag"
          className="onr-btn"
          icon={
            <svg className="onr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="9" x2="20" y2="9"/>
              <line x1="4" y1="15" x2="20" y2="15"/>
              <line x1="10" y1="3" x2="8" y2="21"/>
              <line x1="16" y1="3" x2="14" y2="21"/>
            </svg>
          }
          label="#Tag"
          onClick={insertHashTag}
        />
      </div>
    </GroupShell>
  );
}
