import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function CRTWrapper({ children }: Props) {
  return <div className="crt-wrapper">{children}</div>;
}
