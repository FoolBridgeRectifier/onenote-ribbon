import React from 'react';

interface Props {
  name: string;
  dataGroup: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function GroupShell({ name, dataGroup, children, style }: Props) {
  return (
    <div className="onr-group" data-group={dataGroup} style={style}>
      {children}
      <div className="onr-group-name">{name}</div>
    </div>
  );
}
