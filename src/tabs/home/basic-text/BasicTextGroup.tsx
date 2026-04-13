import './basic-text-group.css';
import { useApp } from '../../../shared/context/AppContext';
import { GroupShell } from '../../../shared/components/group-shell/GroupShell';
import { RibbonButton } from '../../../shared/components/ribbon-button/RibbonButton';
import {
  BulletListIcon,
  ClearFormattingIcon,
  ClearInlineIcon,
  IndentIcon,
  NumberedListIcon,
  OutdentIcon,
} from '../../../assets/icons';
import { clearFormatting } from './helpers';
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
    <GroupShell name="Basic Text">
      <div className="onr-basic-text-inner">
        {/* Row 1: Font, size, bullets, lists, indent, clear */}
        <div className="onr-basic-text-row1">
          <FontPicker />

          {/* Bullet list */}
          <RibbonButton
            className="onr-format-btn"
            title="Bullet list"
            onClick={handleBulletList}
            data-cmd="bullet-list"
          >
            <BulletListIcon className="onr-icon-sm" />
            <span className="onr-list-caret">▾</span>
          </RibbonButton>

          {/* Numbered list */}
          <RibbonButton
            className="onr-format-btn"
            title="Numbered list"
            onClick={handleNumberedList}
            data-cmd="numbered-list"
          >
            <NumberedListIcon className="onr-icon-sm" />
            <span className="onr-list-caret">▾</span>
          </RibbonButton>

          {/* Outdent */}
          <RibbonButton
            className="onr-format-btn"
            icon={<OutdentIcon className="onr-icon-sm" />}
            title="Decrease indent"
            onClick={handleOutdent}
            data-cmd="outdent"
          />

          {/* Indent */}
          <RibbonButton
            className="onr-format-btn"
            icon={<IndentIcon className="onr-icon-sm" />}
            title="Increase indent"
            onClick={handleIndent}
            data-cmd="indent"
          />

          {/* Clear formatting */}
          <RibbonButton
            className="onr-format-btn"
            icon={<ClearFormattingIcon className="onr-icon-sm" />}
            title="Clear formatting"
            onClick={handleClearAllFormatting}
            data-cmd="clear-all"
          />
        </div>

        {/* Row 2: B I U S x₂ x² | Highlight | Font color | Align | Clear inline */}
        <div className="onr-basic-text-row2">
          {/* Bold */}
          <RibbonButton
            className="onr-format-btn onr-format-bold"
            title="Bold"
            onClick={handleBold}
            data-cmd="bold"
          >
            B
          </RibbonButton>

          {/* Italic */}
          <RibbonButton
            className="onr-format-btn onr-format-italic"
            title="Italic"
            onClick={handleItalic}
            data-cmd="italic"
          >
            I
          </RibbonButton>

          {/* Underline */}
          <RibbonButton
            className="onr-format-btn onr-format-underline"
            title="Underline"
            onClick={handleUnderline}
            data-cmd="underline"
          >
            U
          </RibbonButton>

          {/* Strikethrough */}
          <RibbonButton
            className="onr-format-btn"
            title="Strikethrough"
            onClick={handleStrikethrough}
            data-cmd="strikethrough"
          >
            <s className="onr-strikethrough-text">ab</s>
          </RibbonButton>

          <ScriptButtons />

          <div className="onr-divider" />

          <HighlightTextColor />

          <div className="onr-divider" />

          <AlignButton />

          {/* Clear inline */}
          <RibbonButton
            className="onr-clear-inline-btn"
            icon={<ClearInlineIcon className="onr-icon-sm" />}
            title="Clear inline formatting"
            onClick={handleClearInline}
            data-cmd="clear-inline"
          />
        </div>
      </div>
    </GroupShell>
  );
}
