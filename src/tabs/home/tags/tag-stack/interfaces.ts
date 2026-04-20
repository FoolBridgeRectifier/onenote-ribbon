export interface TagStackProps {
  activeTagKeys: Set<string>;
  handleTodo: () => void;
  handleImportant: () => void;
  handleQuestion: () => void;
}
