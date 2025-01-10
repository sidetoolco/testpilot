import React from 'react';
import { Eye, Users, Target, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
}

function MetricCard({ icon, title, value, subtitle }: MetricCardProps) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-[#E3F9F3] to-[#F0FDFA] rounded-2xl p-6"
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-[#00A67E] bg-opacity-10 rounded-full flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-3xl font-semibold text-[#00A67E]">{value}</p>
        </div>
      </div>
      <div className="text-sm text-gray-500">{subtitle}</div>
    </motion.div>
  );
}

export default function InsightMetrics() {
  return (
    <div className="grid grid-cols-4 gap-6 mb-12">
      <MetricCard
        icon={<Eye className="h-6 w-6 text-[#00A67E]" />}
        title="Shelf Visibility"
        value="73%"
        subtitle="Product noticed by shoppers"
      />
      <MetricCard
        icon={<Users className="h-6 w-6 text-[#00A67E]" />}
        title="Conversion Rate"
        value="42%"
        subtitle="Selected our product"
      />
      <MetricCard
        icon={<Target className="h-6 w-6 text-[#00A67E]" />}
        title="Value Score"
        value="8.1/10"
        subtitle="Perceived value rating"
      />
      <MetricCard
        icon={<TrendingUp className="h-6 w-6 text-[#00A67E]" />}
        title="Engagement"
        value="45s"
        subtitle="Avg. time on product"
      />
    </div>
  );
}