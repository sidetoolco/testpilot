import React from 'react';
import { Users, MessageSquare, Clock } from 'lucide-react';
import MarketingFeature from './MarketingFeature';

export default function MarketingPanel() {
  const features = [
    {
      icon: Users,
      title: 'Test with Real Shoppers',
      description: 'Test your products with 1.2 million real shoppers'
    },
    {
      icon: MessageSquare,
      title: 'Valuable Insights',
      description: 'Hear valuable customer insights in the "voice of the shopper"'
    },
    {
      icon: Clock,
      title: 'Fast Results',
      description: 'Get results and analysis in 72 hours or less!'
    }
  ];

  return (
    <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url("https://i.imghippo.com/files/nib7214OVM.png")'
        }}
      />
      
      {/* Green Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00A67E]/95 to-[#008F6B]/95" />
      
      {/* Content Layer */}
      <div className="relative h-full flex items-center justify-center p-12">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-lg text-white">
          <h2 className="text-3xl font-bold mb-6">
            Why choose TestPilot?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            The smart way to test your products
          </p>
          <div className="space-y-6">
            {features.map((feature, index) => (
              <MarketingFeature key={index} {...feature} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}