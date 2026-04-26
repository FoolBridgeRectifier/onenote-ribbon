/**
 * Re-exports the legacy types/interfaces consumed by buttons so they can swap
 * import paths to the v2 adapter without touching their own code.
 */

export type { ObsidianEditor } from '../../../editor/styling-engine/interfaces/obsidian-editor/interfaces';
export type {
  HtmlTagDefinition,
  CalloutTagDefinition,
  TaskTagDefinition,
  CheckboxTagDefinition,
  FormattingDomain,
} from '../../../editor/styling-engine/interfaces/tag-definitions/interfaces';
export type { CopiedFormat as LegacyCopiedFormat } from '../../../editor/styling-engine/interfaces';
export type { RemoveAllTagsOptions } from '../../../editor/styling-engine/interfaces';
