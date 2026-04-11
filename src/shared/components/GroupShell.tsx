interface Props {
  name: string;
  dataGroup: string;
  children: React.ReactNode;
}

export function GroupShell({ name, dataGroup, children }: Props) {
  return (
    <div className="onr-group" data-group={dataGroup}>
      {children}
      <div className="onr-group-name">{name}</div>
    </div>
  );
}
