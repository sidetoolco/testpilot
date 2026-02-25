import { ReactNode } from 'react';

interface SectionCardProps {
  children: ReactNode;
  className?: string;
}

export function SectionCard({ children, className = '' }: SectionCardProps) {
  return <section className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 ${className}`}>{children}</section>;
}
