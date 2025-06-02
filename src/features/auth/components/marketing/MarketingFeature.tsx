import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MarketingFeatureProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function MarketingFeature({
  icon: Icon,
  title,
  description,
}: MarketingFeatureProps) {
  return (
    <div className="flex items-start space-x-4">
      <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-white/90">{description}</p>
      </div>
    </div>
  );
}
