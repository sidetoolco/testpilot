import { ReactNode } from 'react';

interface PageShellProps {
  children: ReactNode;
  className?: string;
}

export function PageShell({ children, className = '' }: PageShellProps) {
  return <div className={`max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 ${className}`}>{children}</div>;
}
