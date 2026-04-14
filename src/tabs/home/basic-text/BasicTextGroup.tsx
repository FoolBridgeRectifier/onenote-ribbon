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
import {
  toggleTagInEditor,
  removeAllTagsInEditor,
} from '../../../shared/editor/styling-engine/editorIntegration';
import {
  UNDERLINE_TAG,
  BOLD_MD_TAG,
  ITALIC_MD_TAG,
  STRIKETHROUGH_MD_TAG,
} from '../../../shared/editor/styling-engine/constants';
import { useEditorState } from '../../../shared/hooks/useEditorState';
import { FontPicker } from './font-picker/FontPicker';
import { HighlightTextColor } from './highlight-text-color/HighlightTextColor';
import { ScriptButtons } from './script-buttons/ScriptButtons';
import { AlignButton } from './align-button/AlignButton';

export function BasicTextGroup() {
  const app = useApp();
  const editorState = useEditorState(app);

  const getEditor = () => app.workspace.activeEditor?.editor;

  const handleBold = () => {
    const editor = getEditor();
    if (!editor) return;
    toggleTagInEditor(editor, BOLD_MD_TAG);
  };

  const handleItalic = () => {
    const editor = getEditor();
    if (!editor) return;
    toggleTagInEditor(editor, ITALIC_MD_TAG);
  };

  const handleUnderline = () => {
    const editor = getEditor();
    if (!editor) return;
    toggleTagInEditor(editor, UNDERLINE_TAG);
  };

  const handleStrikethrough = () => {
    const editor = getEditor();
    if (!editor) return;
    toggleTagInEditor(editor, STRIKETHROUGH_MD_TAG);
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

  const handleDeleteElement = () => {
    const editor = getEditor();
    if (!editor) return;
    editor.replaceSelection('');
  };

  const handleClearAllFormatting = () => {
    const editor = getEditor();
    if (!editor) return;
    removeAllTagsInEditor(editor, { preserveLinePrefix: false });
  };

  return (
    <GroupShell name="Basic Text">
      <div className="onr-basic-text-inner">
        {/* Row 1: Font, size, bullets, lists, indent, clear */}
        <div className="onr-basic-text-row1">
          <FontPicker editorState={editorState} />

          {/* Bullet list */}
          <RibbonButton
            className="onr-format-btn"
            title="Bullet list"
            active={editorState.bulletList}
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
            active={editorState.numberedList}
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

        {/* Row 2: B I U S x₂ x² | Highlight | Font color | Align | Delete element */}
        <div className="onr-basic-text-row2">
          {/* Bold */}
          <RibbonButton
            className="onr-format-btn onr-format-bold"
            title="Bold"
            active={editorState.bold}
            onClick={handleBold}
            data-cmd="bold"
          >
            B
          </RibbonButton>

          {/* Italic */}
          <RibbonButton
            className="onr-format-btn onr-format-italic"
            title="Italic"
            active={editorState.italic}
            onClick={handleItalic}
            data-cmd="italic"
          >
            I
          </RibbonButton>

          {/* Underline */}
          <RibbonButton
            className="onr-format-btn onr-format-underline"
            title="Underline"
            active={editorState.underline}
            onClick={handleUnderline}
            data-cmd="underline"
          >
            U
          </RibbonButton>

          {/* Strikethrough */}
          <RibbonButton
            className="onr-format-btn"
            title="Strikethrough"
            active={editorState.strikethrough}
            onClick={handleStrikethrough}
            data-cmd="strikethrough"
          >
            <s className="onr-strikethrough-text">ab</s>
          </RibbonButton>

          <ScriptButtons
            subscript={editorState.subscript}
            superscript={editorState.superscript}
          />

          <div className="onr-divider" />

          <HighlightTextColor editorState={editorState} />

          <div className="onr-divider" />

          <AlignButton editorState={editorState} />

          {/* Delete element */}
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
