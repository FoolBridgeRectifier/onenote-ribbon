import './BasicTextGroup.css';
import { useApp } from '../../../shared/context/AppContext';
import {
  BulletListIcon,
  ClearFormattingIcon,
  ClearInlineIcon,
  IndentIcon,
  NumberedListIcon,
  OutdentIcon,
} from '../../../assets/icons';
import { clearFormatting } from './clearFormatting';
import { FontPicker } from './font-picker/FontPicker';
import { HighlightTextColor } from './highlight-text-color/HighlightTextColor';
import { ScriptButtons } from './script-buttons/ScriptButtons';
import { AlignButton } from './align-button/AlignButton';

export function BasicTextGroup() {
  const app = useApp();

  const getEditor = () => app.workspace.activeEditor?.editor;

  const handleBold = () => {
    (app as any).commands.executeCommandById('editor:toggle-bold');
  };

  const handleItalic = () => {
    (app as any).commands.executeCommandById('editor:toggle-italic');
  };

  const handleUnderline = () => {
    const editor = getEditor();
    if (!editor) return;
    const selection = editor.getSelection();
    editor.replaceSelection(`<u>${selection}</u>`);
  };

  const handleStrikethrough = () => {
    (app as any).commands.executeCommandById('editor:toggle-strikethrough');
  };

  const handleBulletList = () => {
    (app as any).commands.executeCommandById('editor:toggle-bullet-list');
  };

  const handleNumberedList = () => {
    (app as any).commands.executeCommandById('editor:toggle-numbered-list');
  };

  const handleOutdent = () => {
    (app as any).commands.executeCommandById('editor:unindent-list');
  };

  const handleIndent = () => {
    (app as any).commands.executeCommandById('editor:indent-list');
  };

  const handleClearInline = () => {
    const editor = getEditor();
    if (!editor) return;
    const selection = editor.getSelection();
    if (!selection) return;
    const cleaned = clearFormatting(selection, { preserveHeadings: true });
    editor.replaceSelection(cleaned);
  };

  const handleClearAllFormatting = () => {
    const editor = getEditor();
    if (!editor) return;
    const selection = editor.getSelection();
    if (!selection) return;
    const cleaned = clearFormatting(selection, { preserveHeadings: false });
    editor.replaceSelection(cleaned);
  };

  return (
    <div className="onr-group">
      <div className="onr-basic-text-inner">
        {/* Row 1: Font, size, bullets, lists, indent, clear */}
        <div className="onr-basic-text-row1">
          <FontPicker />

          {/* Bullet list */}
          <div
            className="onr-btn-sm onr-format-btn"
            title="Bullet list"
            onClick={handleBulletList}
            data-cmd="bullet-list"
          >
            <BulletListIcon className="onr-icon-sm" />
            <span className="onr-list-caret">▾</span>
          </div>

          {/* Numbered list */}
          <div
            className="onr-btn-sm onr-format-btn"
            title="Numbered list"
            onClick={handleNumberedList}
            data-cmd="numbered-list"
          >
            <NumberedListIcon className="onr-icon-sm" />
            <span className="onr-list-caret">▾</span>
          </div>

          {/* Outdent */}
          <div
            className="onr-btn-sm onr-format-btn"
            title="Decrease indent"
            onClick={handleOutdent}
            data-cmd="outdent"
          >
            <OutdentIcon className="onr-icon-sm" />
          </div>

          {/* Indent */}
          <div
            className="onr-btn-sm onr-format-btn"
            title="Increase indent"
            onClick={handleIndent}
            data-cmd="indent"
          >
            <IndentIcon className="onr-icon-sm" />
          </div>

          {/* Clear formatting */}
          <div
            className="onr-btn-sm onr-format-btn"
            title="Clear formatting"
            onClick={handleClearAllFormatting}
            data-cmd="clear-all"
          >
            <ClearFormattingIcon className="onr-icon-sm" />
          </div>
        </div>

        {/* Row 2: B I U S x₂ x² | Highlight | Font color | Align | Clear inline */}
        <div className="onr-basic-text-row2">
          {/* Bold */}
          <div
            className="onr-btn-sm onr-format-btn onr-format-bold"
            title="Bold"
            onClick={handleBold}
            data-cmd="bold"
          >
            B
          </div>

          {/* Italic */}
          <div
            className="onr-btn-sm onr-format-btn onr-format-italic"
            title="Italic"
            onClick={handleItalic}
            data-cmd="italic"
          >
            I
          </div>

          {/* Underline */}
          <div
            className="onr-btn-sm onr-format-btn onr-format-underline"
            title="Underline"
            onClick={handleUnderline}
            data-cmd="underline"
          >
            U
          </div>

          {/* Strikethrough */}
          <div
            className="onr-btn-sm onr-format-btn"
            title="Strikethrough"
            onClick={handleStrikethrough}
            data-cmd="strikethrough"
          >
            <s className="onr-strikethrough-text">ab</s>
          </div>

          <ScriptButtons />

          <div className="onr-divider" />

          <HighlightTextColor />

          <div className="onr-divider" />

          <AlignButton />

          {/* Clear inline */}
          <div
            className="onr-btn-sm onr-clear-inline-btn"
            title="Clear inline formatting"
            onClick={handleClearInline}
            data-cmd="clear-inline"
          >
            <ClearInlineIcon className="onr-icon-sm" />
          </div>
        </div>
      </div>
      <div className="onr-group-name">Basic Text</div>
    </div>
  );
}
