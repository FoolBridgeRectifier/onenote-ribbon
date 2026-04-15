import { useApp } from '../../../shared/context/AppContext';
import { MathIcon, HorizontalRuleIcon, FootnoteIcon, HashTagIcon } from '../../../assets/icons';
import { GroupShell } from '../../../shared/components/group-shell/GroupShell';
import { RibbonButton } from '../../../shared/components/ribbon-button/RibbonButton';

export function SymbolsGroup() {
  const app = useApp();
  const getEditor = () => app.workspace.activeEditor?.editor;

  const handleMath = () => {
    const editor = getEditor();
    if (!editor) return;
    const sel = editor.getSelection();
    editor.replaceSelection(sel ? `$$${sel}$$` : '$$\n\n$$');
  };

  const handleHorizontalRule = () => {
    const editor = getEditor();
    if (!editor) return;
    editor.replaceRange('\n\n---\n\n', editor.getCursor());
  };

  const handleFootnote = () => {
    const editor = getEditor();
    if (!editor) return;
    editor.replaceRange('[^1]', editor.getCursor());
    const lastLine = editor.lastLine();
    const lastLineContent = editor.getLine(lastLine);
    const pos = { line: lastLine, ch: lastLineContent.length };
    editor.replaceRange('\n\n[^1]: ', pos);
  };

  const handleHashTag = () => {
    const editor = getEditor();
    if (!editor) return;
    editor.replaceRange('#tag', editor.getCursor());
  };

  return (
    <GroupShell name="Symbols">
      <div className="onr-symbols-group">
        <RibbonButton
          size="large"
          icon={<MathIcon className="onr-icon" />}
          label="Math $$"
          title="Insert math block"
          onClick={handleMath}
          data-cmd="insert-math"
        />
        <RibbonButton
          size="large"
          icon={<HorizontalRuleIcon className="onr-icon" />}
          label="Horiz. Rule"
          title="Insert horizontal rule"
          onClick={handleHorizontalRule}
          data-cmd="insert-hr"
        />
        <RibbonButton
          size="large"
          icon={<FootnoteIcon className="onr-icon" />}
          label="Footnote"
          title="Insert footnote reference"
          onClick={handleFootnote}
          data-cmd="insert-footnote"
        />
        <RibbonButton
          size="large"
          icon={<HashTagIcon className="onr-icon" />}
          label="#Tag"
          title="Insert a hashtag"
          onClick={handleHashTag}
          data-cmd="insert-hashtag"
        />
      </div>
    </GroupShell>
  );
}
