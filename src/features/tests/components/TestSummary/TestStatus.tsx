import { PlayCircle, CheckCircle, Clock } from 'lucide-react';

interface TestStatusProps {
  status: 'draft' | 'active' | 'complete';
}

export default function TestStatus({ status }: TestStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          icon: <PlayCircle className="h-5 w-5" />,
          text: 'Active',
          color: 'bg-blue-50 text-blue-600',
        };
      case 'complete':
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          text: 'Completed',
          color: 'bg-green-50 text-green-600',
        };
      default:
        return {
          icon: <Clock className="h-5 w-5" />,
          text: 'Draft',
          color: 'bg-gray-50 text-gray-600',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`flex items-center space-x-2 px-2 py-2 rounded-full ${config.color}`}>
      {config.icon}
      <span className="font-medium">{config.text}</span>
    </div>
  );
}
