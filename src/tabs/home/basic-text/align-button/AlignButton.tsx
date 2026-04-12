import "./AlignButton.css";
import { AlignLeftIcon } from "../../../../assets/icons";

export function AlignButton() {
  return (
    <div
      className="onr-btn-sm onr-align-btn"
      title="Align"
      onClick={() => {}}
      data-cmd="align"
    >
      <AlignLeftIcon className="onr-icon-sm" />
      <span className="onr-align-caret">▾</span>
    </div>
  );
}
