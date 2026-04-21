import type { HtmlTagDefinition, StylingResult, StylingContext, ObsidianEditor, TagDefinition, InlineTodoTagDefinition } from '../../interfaces';
import { toggleInlineTodoTag } from '../../callout-apply/helpers/toggle-inline-todo-tag/ToggleInlineTodoTag';
import { isObsidianEditor } from '../helpers';
import { toggleHtmlTag } from './toggle-html-tag/helpers';

export function toggleTag(context: StylingContext, tagDefinition: HtmlTagDefinition): StylingResult;
export function toggleTag(editor: ObsidianEditor, tagDefinition: InlineTodoTagDefinition): void;
export function toggleTag(
  input: StylingContext | ObsidianEditor,
  tagDefinition: TagDefinition
): StylingResult | void {
  if (isObsidianEditor(input)) {
    if (tagDefinition.kind === 'inline-todo') {
      // ObsidianEditor is structurally compatible; toggleInlineTodoTag accepts ObsidianEditor directly
      toggleInlineTodoTag(input);
      return;
    }
    return;
  }
  return toggleHtmlTag(input, tagDefinition as HtmlTagDefinition);
}
