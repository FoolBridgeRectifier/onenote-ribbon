import './align-button.css';
import { AlignLeftIcon } from '../../../../assets/icons';
import { RibbonButton } from '../../../../shared/components/ribbon-button/RibbonButton';

export function AlignButton() {
  const handleAlignButtonClick = () => {
    // Alignment menu behavior is not implemented yet.
  };

  return (
    <RibbonButton
      className="onr-align-btn"
      title="Align"
      onClick={handleAlignButtonClick}
      data-cmd="align"
    >
      <AlignLeftIcon className="onr-icon-sm" />
      <span className="onr-align-caret">▾</span>
    </RibbonButton>
  );
}
