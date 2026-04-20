import { RibbonButton } from '../../../../shared/components/ribbon-button/RibbonButton';
import { TodoTagIcon, ImportantTagIcon, QuestionTagIcon } from '../../../../assets/icons';
import { ACTIVE_TAG_KEY_TASK } from '../constants';
import type { TagStackProps } from './interfaces';

export function TagStack({
  activeTagKeys,
  handleTodo,
  handleImportant,
  handleQuestion,
}: TagStackProps) {
  return (
    <div className="onr-tags-stack">
      <RibbonButton
        className="onr-tag-row"
        onClick={handleTodo}
        data-cmd="todo"
        title="Toggle to-do"
      >
        <TodoTagIcon className="onr-tag-icon" />
        <span className="onr-tag-label">To Do</span>
        {/* Visual-only checkbox: indicates whether cursor is on a task line */}
        <span
          className={
            activeTagKeys.has(ACTIVE_TAG_KEY_TASK) ? 'onr-tag-cb onr-tag-cb--checked' : 'onr-tag-cb'
          }
          aria-hidden="true"
        />
      </RibbonButton>

      <RibbonButton
        className="onr-tag-row"
        onClick={handleImportant}
        data-cmd="important"
        title="Mark as important"
      >
        <ImportantTagIcon className="onr-tag-icon" />
        <span className="onr-tag-label">Important</span>
        <span
          className={
            activeTagKeys.has('Important') ? 'onr-tag-cb onr-tag-cb--checked' : 'onr-tag-cb'
          }
          aria-hidden="true"
        />
      </RibbonButton>

      <RibbonButton
        className="onr-tag-row"
        onClick={handleQuestion}
        data-cmd="question"
        title="Mark as question"
      >
        <QuestionTagIcon className="onr-tag-icon" />
        <span className="onr-tag-label">Question</span>
        <span
          className={
            activeTagKeys.has('Question') ? 'onr-tag-cb onr-tag-cb--checked' : 'onr-tag-cb'
          }
          aria-hidden="true"
        />
      </RibbonButton>
    </div>
  );
}
