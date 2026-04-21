import { useRef, useState } from 'react';
import './align-button.css';
import { AlignLeftIcon, AlignCenterIcon, AlignRightIcon } from '../../../../assets/icons';
import { useApp } from '../../../../shared/context/AppContext';
import { RibbonButton } from '../../../../shared/components/ribbon-button/RibbonButton';
import { Dropdown } from '../../../../shared/components/dropdown/Dropdown';
import { convertMarkdownTokensToHtml } from '../../../../shared/editor/styling-engine/markdown-to-html-conversion/MarkdownToHtmlConversion';
import type { AlignButtonProps, TextAlign } from './interfaces';
import {
  ALIGNMENT_OPTIONS,
  ALIGN_SPAN_PATTERN,
  LEGACY_ALIGN_DIV_PATTERN,
  LEGACY_ALIGN_INLINE_BLOCK_SPAN_PATTERN,
  LEGACY_ALIGN_BLOCK_SPAN_PATTERN,
  HEADING_PREFIX_PATTERN,
} from './constants';

/**
 * Tries to match the line against both the new span pattern and the
 * legacy div pattern. Returns the match (with identical capture groups)
 * or null if neither matches.
 */
export function matchAlignWrapper(lineText: string): RegExpMatchArray | null {
  return (
    lineText.match(ALIGN_SPAN_PATTERN) ??
    lineText.match(LEGACY_ALIGN_INLINE_BLOCK_SPAN_PATTERN) ??
    lineText.match(LEGACY_ALIGN_BLOCK_SPAN_PATTERN) ??
    lineText.match(LEGACY_ALIGN_DIV_PATTERN)
  );
}

export function getAlignIcon(alignment: TextAlign) {
  if (alignment === 'center') return <AlignCenterIcon className="onr-icon-sm" />;
  if (alignment === 'right') return <AlignRightIcon className="onr-icon-sm" />;
  return <AlignLeftIcon className="onr-icon-sm" />;
}

/**
 * Splits a line into its heading prefix (e.g., "## ") and the remaining content.
 * Preserves the heading prefix outside any alignment wrapper to avoid breaking
 * markdown heading syntax.
 */
export function splitHeadingPrefix(lineText: string): { prefix: string; content: string } {
  const headingMatch = lineText.match(HEADING_PREFIX_PATTERN);

  if (headingMatch) {
    return { prefix: headingMatch[1], content: lineText.slice(headingMatch[1].length) };
  }

  return { prefix: '', content: lineText };
}

export function applyAlignment(
  editor:
    | {
        getCursor: () => { line: number };
        getLine: (line: number) => string;
        setLine: (line: number, text: string) => void;
      }
    | undefined,
  alignment: TextAlign
) {
  if (!editor) return;

  const cursor = editor.getCursor();
  const lineText = editor.getLine(cursor.line);
  const alignMatch = matchAlignWrapper(lineText);

  if (alignment === 'left') {
    // Left alignment means unwrap the span/div if present
    if (alignMatch) {
      const headingPrefix = alignMatch[1] ?? '';
      editor.setLine(cursor.line, headingPrefix + alignMatch[3]);
    }
    return;
  }

  if (alignMatch) {
    // Already wrapped — replace the alignment value, preserve heading prefix.
    // Re-convert inner content to catch any markdown tokens that may remain.
    const headingPrefix = alignMatch[1] ?? '';
    const convertedContent = convertMarkdownTokensToHtml(alignMatch[3]);
    editor.setLine(
      cursor.line,
      `${headingPrefix}<span style="display:inline-block;width:100%;vertical-align:top;text-align: ${alignment}">${convertedContent}</span>`
    );
  } else {
    // Not yet wrapped — extract heading prefix so it stays outside the span.
    // Markdown tokens don't render inside HTML blocks, so convert to HTML equivalents.
    const { prefix, content } = splitHeadingPrefix(lineText);
    const convertedContent = convertMarkdownTokensToHtml(content);
    editor.setLine(
      cursor.line,
      `${prefix}<span style="display:inline-block;width:100%;vertical-align:top;text-align: ${alignment}">${convertedContent}</span>`
    );
  }
}

export function AlignButton({ editorState }: AlignButtonProps) {
  const app = useApp();
  const anchorRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getEditor = () => app.workspace.activeEditor?.editor;

  const currentAlignment = editorState.textAlign as TextAlign;

  const handleAlignSelect = (alignment: TextAlign) => {
    const editor = getEditor();
    if (!editor) return;

    applyAlignment(editor, alignment);
    setDropdownOpen(false);
  };

  return (
    <>
      <RibbonButton
        ref={anchorRef}
        className="onr-align-btn"
        title="Align"
        active={currentAlignment !== 'left'}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        data-cmd="align"
      >
        {getAlignIcon(currentAlignment)}
        <span className="onr-align-caret">▾</span>
      </RibbonButton>

      {dropdownOpen && anchorRef.current && (
        <Dropdown
          anchor={anchorRef.current}
          onClose={() => setDropdownOpen(false)}
          className="onr-align-dropdown"
        >
          {ALIGNMENT_OPTIONS.map((option) => (
            <div
              key={option.value}
              className={`onr-dd-item${currentAlignment === option.value ? ' onr-dd-item-active' : ''}`}
              onClick={() => handleAlignSelect(option.value)}
            >
              <span className="onr-dd-icon">{getAlignIcon(option.value)}</span>
              <span className="onr-dd-label">{option.label}</span>
            </div>
          ))}
        </Dropdown>
      )}
    </>
  );
}
