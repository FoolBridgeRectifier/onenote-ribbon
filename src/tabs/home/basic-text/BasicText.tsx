import './basic-text-group.css';
import { useApp } from '../../../shared/context/AppContext';
import { GroupShell } from '../../../shared/components/group-shell/GroupShell';
import { RibbonButton } from '../../../shared/components/ribbon-button/RibbonButton';
import { ClearFormattingIcon, ClearInlineIcon } from '../../../assets/icons';
import { useEditorState } from '../../../shared/hooks/useEditorState';
import { FontPicker } from './font-picker/FontPicker';
import { HighlightTextColor } from './highlight-text-color/HighlightTextColor';
import { ScriptButtons } from './script-buttons/ScriptButtons';
import { AlignButton } from './align-button/AlignButton';
import { ListButtons } from './list-buttons/ListButtons';
import {
  applyBold,
  applyItalic,
  applyUnderline,
  applyStrikethrough,
  applyDeleteElement,
  applyClearAllFormatting,
} from './helpers';

export function BasicTextGroup() {
  const app = useApp();
  const editorState = useEditorState(app);

  const getEditor = () => app.workspace.activeEditor?.editor;

  const handleBold = () => {
    const editor = getEditor();
    if (!editor) return;
    applyBold(editor);
  };

  const handleItalic = () => {
    const editor = getEditor();
    if (!editor) return;
    applyItalic(editor);
  };

  const handleUnderline = () => {
    const editor = getEditor();
    if (!editor) return;
    applyUnderline(editor);
  };

  const handleStrikethrough = () => {
    const editor = getEditor();
    if (!editor) return;
    applyStrikethrough(editor);
  };

  const handleDeleteElement = () => {
    const editor = getEditor();
    if (!editor) return;
    applyDeleteElement(editor);
  };

  const handleClearAllFormatting = () => {
    const editor = getEditor();
    if (!editor) return;
    applyClearAllFormatting(editor);
  };

  return (
    <GroupShell name="Basic Text">
      <div className="onr-basic-text-inner">
        {/* Row 1: Font, size, list buttons (split with caret), indent, clear */}
        <div className="onr-basic-text-row1">
          <FontPicker editorState={editorState} />

          <ListButtons editorState={editorState} />

          <RibbonButton
            className="onr-format-btn"
            icon={<ClearFormattingIcon className="onr-icon-sm" />}
            title="Clear formatting"
            onClick={handleClearAllFormatting}
            data-cmd="clear-all"
          />
        </div>

        {/* Row 2: B I U S x₂ x² | Highlight | Font color | Align | Delete element */}
        <div className="onr-basic-text-row2">
          <RibbonButton
            className="onr-format-btn onr-format-bold"
            title="Bold"
            active={editorState.bold}
            onClick={handleBold}
            data-cmd="bold"
          >
            B
          </RibbonButton>

          <RibbonButton
            className="onr-format-btn onr-format-italic"
            title="Italic"
            active={editorState.italic}
            onClick={handleItalic}
            data-cmd="italic"
          >
            I
          </RibbonButton>

          <RibbonButton
            className="onr-format-btn onr-format-underline"
            title="Underline"
            active={editorState.underline}
            onClick={handleUnderline}
            data-cmd="underline"
          >
            U
          </RibbonButton>

          <RibbonButton
            className="onr-format-btn"
            title="Strikethrough"
            active={editorState.strikethrough}
            onClick={handleStrikethrough}
            data-cmd="strikethrough"
          >
            <s className="onr-strikethrough-text">ab</s>
          </RibbonButton>

          <ScriptButtons subscript={editorState.subscript} superscript={editorState.superscript} />

          <div className="onr-divider" />

          <HighlightTextColor editorState={editorState} />

          <div className="onr-divider" />

          <AlignButton editorState={editorState} />

          <RibbonButton
            className="onr-delete-element-btn"
            icon={<ClearInlineIcon className="onr-icon-sm" />}
            title="Delete element"
            onClick={handleDeleteElement}
            data-cmd="delete-element"
          />
        </div>
      </div>
    </GroupShell>
  );
}
