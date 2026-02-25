import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, actions, className = '' }: PageHeaderProps) {
  return (
    <div className={`flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${className}`}>
      <div>
        <h1 className="text-3xl sm:text-4xl font-normal text-gray-900">{title}</h1>
        {subtitle && <p className="mt-2 text-sm sm:text-base text-gray-600">{subtitle}</p>}
      </div>
      {actions && <div className="w-full sm:w-auto">{actions}</div>}
    </div>
  );
}
