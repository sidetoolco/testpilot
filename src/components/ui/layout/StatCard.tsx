import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: 'primary' | 'muted';
  className?: string;
}

const toneClasses = {
  primary: 'text-primary bg-primary/10',
  muted: 'text-muted bg-muted/10',
};

export function StatCard({ title, value, icon, tone = 'primary', className = '' }: StatCardProps) {
  return (
    <div className={`bg-gradient-to-br from-[#F0F7FF] to-[#F8FAFF] rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm ${className}`}>
      <div className="flex items-center space-x-3 sm:space-x-4">
        {icon && (
          <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center ${toneClasses[tone]}`}>
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-sm sm:text-lg lg:text-xl font-medium text-gray-900">{title}</h3>
          <p className={`text-2xl sm:text-3xl lg:text-4xl font-semibold mt-1 ${tone === 'primary' ? 'text-primary' : 'text-muted'}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
