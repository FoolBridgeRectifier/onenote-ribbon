import './insert-tab-panel.css';
import { BlankLineGroup } from './blank-line/BlankLineGroup';
import { TablesGroup } from './tables/TablesGroup';
import { FilesGroup } from './files/FilesGroup';
import { ImagesGroup } from './images/ImagesGroup';
import { LinksGroup } from './links/LinksGroup';
import { TimestampGroup } from './timestamp/TimestampGroup';
import { BlocksGroup } from './blocks/BlocksGroup';
import { SymbolsGroup } from './symbols/SymbolsGroup';

export function InsertTabPanel() {
  return (
    <div className="onr-tab-panel" data-panel="Insert">
      <BlankLineGroup />
      <TablesGroup />
      <FilesGroup />
      <ImagesGroup />
      <LinksGroup />
      <TimestampGroup />
      <BlocksGroup />
      <SymbolsGroup />
    </div>
  );
}
