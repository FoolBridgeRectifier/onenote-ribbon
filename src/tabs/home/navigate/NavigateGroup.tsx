import { useApp } from '../../../shared/context/AppContext';
import { GroupShell } from '../../../shared/components/GroupShell';
import { RibbonButton } from '../../../shared/components/RibbonButton';

export function NavigateGroup() {
  const app = useApp();
  const executeCommand = (id: string) => (app as any).commands.executeCommandById(id);

  return (
    <GroupShell name="Navigate" dataGroup="Navigate">
      <RibbonButton label="📋 Outline"   data-cmd="outline"    onClick={() => executeCommand('outline:open')} />
      <RibbonButton label="⊟ Fold All"   data-cmd="fold-all"   onClick={() => executeCommand('editor:fold-all')} />
      <RibbonButton label="⊞ Unfold All" data-cmd="unfold-all" onClick={() => executeCommand('editor:unfold-all')} />
    </GroupShell>
  );
}
